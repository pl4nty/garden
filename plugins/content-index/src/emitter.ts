import path from "node:path";
import fs from "node:fs/promises";
import type { Root } from "hast";
import type {
  GlobalConfiguration,
  QuartzEmitterPlugin,
  BuildCtx,
  FilePath,
  FullSlug,
  QuartzPluginData,
  ProcessedContent,
  SimpleSlug,
} from "@quartz-community/types";
import { joinSegments } from "@quartz-community/types";
import { simplifySlug, escapeHTML } from "@quartz-community/utils";
import { getDate } from "@quartz-community/utils/sort";
import { toHtml } from "hast-util-to-html";

export type ContentIndexMap = Map<FullSlug, ContentDetails>;
export type ContentDetails = {
  slug: FullSlug;
  filePath: FilePath;
  title: string;
  links: SimpleSlug[];
  tags: string[];
  content: string;
  richContent?: string;
  date?: Date;
  modifiedDate?: Date;
  description?: string;
};

interface Options {
  enableSiteMap: boolean;
  enableRSS: boolean;
  rssLimit?: number;
  rssFullHtml: boolean;
  rssSlug: string;
  includeEmptyFiles: boolean;
  rssRecentNotesText?: string;
  rssLastFewNotesText?: (count: number) => string;
  rssAuthorName?: string;
  rssAuthorEmail?: string;
}

const defaultOptions: Options = {
  enableSiteMap: true,
  enableRSS: true,
  rssLimit: 10,
  rssFullHtml: true,
  rssSlug: "index",
  includeEmptyFiles: true,
  rssRecentNotesText: "Recent notes",
  rssLastFewNotesText: (count) => `Last ${count} notes`,
  rssAuthorName: "Tom Plant",
  rssAuthorEmail: "tom@tplant.com.au",
};

const write = async (args: {
  ctx: BuildCtx;
  content: string;
  slug: FullSlug;
  ext: string;
}): Promise<FilePath> => {
  const pathToPage = joinSegments(args.ctx.argv.output, args.slug + args.ext) as FilePath;
  const dir = path.dirname(pathToPage);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(pathToPage, args.content);
  return pathToPage;
};

function formatDate(d: Date, locale: string = "en-GB"): string {
  return d.toLocaleDateString(locale, { year: "numeric", month: "short", day: "2-digit" });
}

function generateSiteMap(cfg: GlobalConfiguration, idx: ContentIndexMap): string {
  const base = cfg.baseUrl ?? "";
  const createURLEntry = (slug: SimpleSlug, content: ContentDetails): string => `<url>
    <loc>https://${joinSegments(base, encodeURI(slug))}</loc>
    ${content.date && `<lastmod>${content.date.toISOString()}</lastmod>`}
  </url>`;
  const urls = Array.from(idx)
    .map(([slug, content]) => createURLEntry(simplifySlug(slug) as SimpleSlug, content))
    .join("");
  return `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls}</urlset>`;
}

function generateAtomFeed(
  cfg: GlobalConfiguration,
  idx: ContentIndexMap,
  options: Options,
  limit?: number,
): string {
  const base = cfg.baseUrl ?? "";
  const pageTitle = cfg.pageTitle ?? "";
  const locale = cfg.locale ?? "en-GB";
  const recentNotesText = options.rssRecentNotesText ?? "Recent notes";
  const lastFewNotesText =
    options.rssLastFewNotesText ?? ((count: number) => `Last ${count} notes`);
  const authorName = options.rssAuthorName ?? "";
  const authorEmail = options.rssAuthorEmail ?? "";

  const createEntry = (slug: SimpleSlug, content: ContentDetails): string => {
    const published = content.date;
    const updated = content.modifiedDate ?? content.date;
    return `<entry>
    <title>${escapeHTML(content.title)}</title>
    <link href="https://${joinSegments(base, encodeURI(slug))}" />
    <link rel="alternate" type="text/markdown" href="https://${joinSegments(base, encodeURI(slug))}.html.md" />
    <summary>${escapeHTML(content.description ?? "")}</summary>
    <published>${published?.toISOString()}</published>
    <updated>${updated?.toISOString()}</updated>
    <publishedTime>${formatDate(published!, locale)}</publishedTime>
    <updatedTime>${formatDate(updated!, locale)}</updatedTime>
    ${content.tags.map((el) => `<category term="${escapeHTML(el)}" label="${escapeHTML(el)}" />`).join("\n    ")}
    <author>
      <name>${escapeHTML(authorName)}</name>
      <email>${escapeHTML(authorEmail)}</email>
    </author>
    <content type="html"><![CDATA[${content.richContent ?? content.description ?? ""}]]></content>
  </entry>`;
  };

  const entries = Array.from(idx)
    .sort(([_, f1], [__, f2]) => {
      if (f1.date && f2.date) {
        return f2.date.getTime() - f1.date.getTime();
      } else if (f1.date && !f2.date) {
        return -1;
      } else if (!f1.date && f2.date) {
        return 1;
      }
      return f1.title.localeCompare(f2.title);
    })
    .map(([slug, content]) => createEntry(simplifySlug(slug) as SimpleSlug, content))
    .slice(0, limit ?? idx.size)
    .join("\n");

  const subtitle = `${limit ? lastFewNotesText(limit) : recentNotesText} on ${escapeHTML(pageTitle)}`;
  const feedUpdated =
    idx.get("index" as FullSlug)?.date?.toISOString() ?? new Date().toISOString();

  return `<?xml version="1.0" encoding="UTF-8" ?>
<?xml-stylesheet href="/static/rss.xsl" type="text/xsl" ?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeHTML(pageTitle)}</title>
  <subtitle>${subtitle}</subtitle>
  <link href="https://${base}" />
  <link rel="alternate" type="text/html" href="https://${base}" />
  <id>https://${base}</id>
  <updated>${feedUpdated}</updated>
  <contributor>
    <name>${escapeHTML(authorName)}</name>
    <email>${escapeHTML(authorEmail)}</email>
  </contributor>
  <logo>https://${base}/static/icon.png</logo>
  <icon>https://${base}/static/icon.png</icon>
  ${entries}
</feed>`;
}

export const ContentIndex: QuartzEmitterPlugin<Partial<Options>> = (opts) => {
  const options = { ...defaultOptions, ...opts };
  const emitAll = async (ctx: BuildCtx, content: ProcessedContent[]): Promise<FilePath[]> => {
    const cfg = ctx.cfg.configuration;
    const linkIndex: ContentIndexMap = new Map();
    for (const [tree, file] of content) {
      const data = (file.data as Record<string, unknown>) ?? {};
      if (data.unlisted === true) continue;

      // Skip pages with noindex: true frontmatter
      const frontmatter = (data.frontmatter as Record<string, unknown> | undefined) ?? {};
      if (frontmatter.noindex === true) continue;

      const slug = data.slug as FullSlug;
      const date = getDate(data as QuartzPluginData) ?? new Date();

      // Extract separate created/modified dates when available
      const dates = data.dates as { created?: Date; modified?: Date; published?: Date } | undefined;
      const publishedDate = dates?.created ?? date;
      const modifiedDate = dates?.modified ?? date;

      const text = data.text as string | undefined;
      if (options.includeEmptyFiles || (text && text !== "")) {
        const isEncrypted = data.encrypted === true;
        linkIndex.set(slug, {
          slug,
          filePath: data.relativePath as FilePath,
          title: (frontmatter.title as string) ?? "",
          links: (data.links as SimpleSlug[] | undefined) ?? [],
          tags: (frontmatter.tags as string[] | undefined) ?? [],
          content: text ?? "",
          richContent:
            options.rssFullHtml && !isEncrypted
              ? escapeHTML(toHtml(tree as Root, { allowDangerousHtml: true }))
              : undefined,
          date: publishedDate,
          modifiedDate: modifiedDate,
          description: (data.description as string | undefined) ?? "",
        });
      }
    }

    const outputs: FilePath[] = [];
    if (options.enableSiteMap) {
      outputs.push(
        await write({
          ctx,
          content: generateSiteMap(cfg, linkIndex),
          slug: "sitemap" as FullSlug,
          ext: ".xml",
        }),
      );
    }

    if (options.enableRSS) {
      outputs.push(
        await write({
          ctx,
          content: generateAtomFeed(cfg, linkIndex, options, options.rssLimit),
          slug: (options.rssSlug ?? "index") as FullSlug,
          ext: ".xml",
        }),
      );
    }

    const fp = joinSegments("static", "contentIndex") as unknown as FullSlug;
    const simplifiedIndex = Object.fromEntries(
      Array.from(linkIndex).map(([slug, content]) => {
        delete content.description;
        delete content.date;
        return [slug, content];
      }),
    );

    outputs.push(
      await write({
        ctx,
        content: JSON.stringify(simplifiedIndex),
        slug: fp,
        ext: ".json",
      }),
    );

    return outputs;
  };

  return {
    name: "ContentIndex",
    emit: (ctx, content) => emitAll(ctx, content),
    partialEmit: (ctx, content) => emitAll(ctx, content),
  };
};
