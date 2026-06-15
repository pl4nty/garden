import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
  QuartzPluginData,
} from "@quartz-community/types";
import { getDate, formatDate, resolveRelative } from "@quartz-community/utils";
import style from "./styles/featured.scss";

export interface FeaturedOptions {
  // Heading shown above the list.
  title: string;
  // Ordered list of post slugs to feature (e.g. "posts/my-post").
  posts: string[];
  // Folder slug the posts live in; drives the "see N more" count and link.
  folder: string;
  // Whether to render the "See N more →" link.
  showMore: boolean;
}

const defaultOptions: FeaturedOptions = {
  title: "Featured",
  posts: [],
  folder: "posts",
  showMore: true,
};

export default ((opts?: Partial<FeaturedOptions>) => {
  const options: FeaturedOptions = { ...defaultOptions, ...opts };
  const folderPrefix = options.folder.endsWith("/") ? options.folder : `${options.folder}/`;

  const Featured: QuartzComponent = ({
    fileData,
    allFiles,
    cfg,
    displayClass,
  }: QuartzComponentProps) => {
    // Homepage only — the component sits in a slot shared by every content page,
    // so bail out everywhere except the site index.
    if (fileData.slug !== "index") return null;

    const locale = cfg.locale || "en-US";
    const cfgDefaultDateType = (cfg as Record<string, unknown>).defaultDateType as
      | string
      | undefined;

    // Resolve the configured slugs to their files, preserving config order and
    // silently dropping any that don't exist (e.g. an unpublished draft).
    const bySlug = new Map(allFiles.map((f) => [f.slug, f]));
    const featured = options.posts
      .map((slug) => bySlug.get(slug as QuartzPluginData["slug"]))
      .filter((f): f is QuartzPluginData => Boolean(f));

    if (featured.length === 0) return null;

    // "See N more" counts the published posts in the folder that aren't shown
    // here, excluding the folder's own index page.
    const totalInFolder = allFiles.filter(
      (f) =>
        f.slug &&
        f.slug.startsWith(folderPrefix) &&
        f.slug !== `${folderPrefix}index` &&
        !f.slug.endsWith("/index"),
    ).length;
    const moreCount = Math.max(totalInFolder - featured.length, 0);
    const folderHref = resolveRelative(fileData.slug, `${folderPrefix}index` as QuartzPluginData["slug"]);

    return (
      <div class={`featured ${displayClass ?? ""}`}>
        <h2 class="featured-title">{options.title}</h2>
        <ul class="featured-list">
          {featured.map((f) => {
            const href = resolveRelative(fileData.slug, f.slug!);
            const title = f.frontmatter?.title ?? f.slug;
            const data: QuartzPluginData = {
              ...f,
              defaultDateType: (f.defaultDateType ?? cfgDefaultDateType) as QuartzPluginData["defaultDateType"],
            };
            const date = data.defaultDateType ? getDate(data) : undefined;
            return (
              <li class="featured-item" key={f.slug}>
                <a href={href} class="featured-link">
                  {title}
                </a>
                {date && (
                  <time class="featured-date" datetime={date.toISOString()}>
                    {formatDate(date, locale)}
                  </time>
                )}
              </li>
            );
          })}
        </ul>
        {options.showMore && moreCount > 0 && (
          <a class="featured-more" href={folderHref}>
            See {moreCount} more →
          </a>
        )}
      </div>
    );
  };

  Featured.css = style;
  return Featured;
}) satisfies QuartzComponentConstructor;
