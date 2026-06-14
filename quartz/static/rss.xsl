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
          :root{--light:#fff;--lightgray:#f8f8f8;--gray:#b0b0b0;--darkgray:#666;--dark:#303030;--secondary:#2e7d32;--tertiary:#388e3c;--highlight:#2e7d3226;--bodyFont:"Titillium Web",system-ui,sans-serif;--headerFont:"Raleway",system-ui,sans-serif;--codeFont:"Fira Code",monospace}
          @media(prefers-color-scheme:dark){:root{--light:#101010;--lightgray:#181818;--gray:#7a8882;--darkgray:darkgray;--dark:#e0f0e9;--secondary:#66bb6a;--tertiary:#81c784}}
          body{max-width:768px;margin:0 auto;background:var(--light);color:var(--darkgray);font-family:var(--bodyFont)}
          h1,h2,h3{font-family:var(--headerFont);color:var(--dark)}
          a{color:var(--secondary);text-decoration:none}
          code{font-family:var(--codeFont);background:var(--lightgray);border-radius:4px;padding:.1em .3em}
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
