import { PageFrame, PageFrameProps } from "./types"
import HeaderConstructor from "../Header"

const Header = HeaderConstructor()

/**
 * The frame for tplant.com.au: a site header across the top, one main column
 * and a rail beside it, each as a landmark element.
 *
 * It takes the same slots as the default frame, with other names for two of
 * them: `left` components make up the site header (title, nav, toolbar) and
 * `right` components make up the rail (table of contents, backlinks, graph).
 *
 * The header and rail do not carry the `sidebar` class. The search and graph
 * scripts look for `.sidebar` to change its inline z-index while a dialog is
 * open, and that fights the sticky header; without the class they leave the
 * stacking order to quartz/styles/custom.scss.
 */
export const GardenFrame: PageFrame = {
  name: "garden",
  render({
    componentData,
    header,
    beforeBody,
    pageBody: Content,
    afterBody,
    left,
    right,
    footer: Footer,
  }: PageFrameProps) {
    return (
      <>
        {/* data-router-ignore: the SPA router would scroll to #main without moving focus */}
        <a class="skip-link" href="#main" data-router-ignore>
          Skip to content
        </a>
        <header class="site-header">
          {left.map((BodyComponent) => (
            <BodyComponent {...componentData} />
          ))}
        </header>
        <main id="main" class="center" tabindex={-1}>
          <div class="page-header">
            <Header {...componentData}>
              {header.map((HeaderComponent) => (
                <HeaderComponent {...componentData} />
              ))}
            </Header>
            <div class="popover-hint">
              {beforeBody.map((BodyComponent) => (
                <BodyComponent {...componentData} />
              ))}
            </div>
          </div>
          <Content {...componentData} />
          <hr />
          <div class="page-footer">
            {afterBody.map((BodyComponent) => (
              <BodyComponent {...componentData} />
            ))}
          </div>
        </main>
        <aside class="rail" aria-label="On this page">
          {right.map((BodyComponent) => (
            <BodyComponent {...componentData} />
          ))}
        </aside>
        <Footer {...componentData} />
      </>
    )
  },
}
