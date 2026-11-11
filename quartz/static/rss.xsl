<xsl:stylesheet version="3.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes" />
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <title>Atom - <xsl:value-of select="/atom:feed/atom:title" /></title>
        <link rel="icon" href="/static/icon.png" />
        <style type="text/css">
          @font-face{font-family:"Atkinson Hyperlegible Next";font-weight:200 800;font-display:swap;src:url("/static/fonts/atkinson-hyperlegible-next-v5.3.0-latin-normal.woff2") format("woff2")}
          @font-face{font-family:"Rubik";font-weight:300 900;font-display:swap;src:url("/static/fonts/rubik-v5.3.0-latin-normal.woff2") format("woff2")}
          :root{--light:#f0f1ed;--lightgray:#c8cec6;--gray:#56635a;--darkgray:#1b2b22;--dark:#1b2b22;--secondary:#1f9140;--tertiary:#ff48b0;--tint:#e1eae1;--bodyFont:"Atkinson Hyperlegible Next",system-ui,sans-serif;--headerFont:"Rubik",system-ui,sans-serif;--codeFont:"Fira Code",monospace}
          @media(prefers-color-scheme:dark){:root{--light:#151515;--lightgray:#343834;--gray:#9ba19b;--darkgray:#e6e7e1;--dark:#f2f2ec;--secondary:#4ccb7a;--tertiary:#ff6ec4;--tint:#19221c}}
          body{max-width:768px;margin:0 auto;background:var(--light);color:var(--darkgray);font-family:var(--bodyFont);line-height:1.6}
          h1,h2,h3{font-family:var(--headerFont);color:var(--dark)}
          a{color:var(--dark);text-decoration:underline;text-decoration-color:var(--tertiary);text-decoration-thickness:2px;text-underline-offset:.2em}
          hr{height:2px;border:0;background:var(--secondary)}
          code{font-family:var(--codeFont);background:var(--tint);padding:.1em .3em}
          section{margin:30px 15px}hgroup{margin-bottom:2rem}
        </style>
      </head>
      <body>
        <xsl:apply-templates select="atom:feed" />
        <hr />
        <main xmlns="http://www.w3.org/1999/xhtml">
          <hgroup style="border-bottom:1px solid var(--lightgray);">
            <h2>Recent Items</h2>
            <p>
              <xsl:value-of select="atom:feed/atom:subtitle" />
            </p>
          </hgroup>
          <ul class="section-ul" xmlns="http://www.w3.org/1999/xhtml">
            <xsl:apply-templates select="atom:feed/atom:entry" />
          </ul>
        </main>
      </body>
    </html>
  </xsl:template>

  <xsl:template match="atom:feed">
    <div class="rss" xmlns="http://www.w3.org/1999/xhtml">
      <h1 class="article-title">
        <xsl:value-of select="atom:title" />
      </h1>
      <p>You have stumbled upon the <a
          href="https://www.ietf.org/rfc/rfc4287.txt" target="_blank"
          class="anchor-like"><span class="indicator-hook" />atom feed</a> of my working notes, one of many paths to this digital garden. Much of these notes/writings are written for my own
      consumption.</p>

      <p>Visit <a href="https://aboutfeeds.com/">About
      Feeds</a> to get started with newsreaders and subscribing. It's free. </p>

      <blockquote
        class="callout tip" data-callout="tip">
        <div class="callout-title" dir="auto">
          <div class="callout-icon" dir="auto"></div>
          <div class="callout-title-inner" dir="auto">
            <p dir="auto">subscribe</p>
          </div>
        </div>
        <div class="callout-content" dir="auto">
          <p dir="auto">On most slash-command supported interface, you can use the following <code>/feed
      subscribe <xsl:value-of select="atom:link[@rel='alternate']/@href" />/index.xml</code></p>
        </div>
      </blockquote>
    </div>
  </xsl:template>

  <xsl:template match="atom:entry">
    <li class="section-li">
      <a target="_blank" data-list="true" class="note-link">
        <xsl:attribute name="href">
          <xsl:value-of select="atom:link/@href" />
        </xsl:attribute>
        <div class="note-grid">
          <div class="meta">
            <xsl:value-of select="atom:publishedTime" />
          </div>
          <div class="desc">
            <xsl:value-of select="atom:title" />
          </div>
          <menu class="tag-highlights">
            <xsl:for-each select="atom:category">
              <li class="tag">
                <xsl:value-of select="@term" />
              </li>
            </xsl:for-each>
          </menu>
        </div>
      </a>
    </li>
  </xsl:template>

</xsl:stylesheet>
