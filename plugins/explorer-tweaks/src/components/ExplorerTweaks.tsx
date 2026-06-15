import type { QuartzComponent, QuartzComponentConstructor } from "@quartz-community/types";

// The remote quartz-community/explorer force-opens every folder whose path is a
// prefix of the page you're viewing, on each SPA navigation — so opening any
// post (e.g. via a Featured link) re-expands its parent folder in the tree.
// There's no option to disable that, so this script runs after the explorer's
// own nav handler and re-collapses folders that aren't open in the *saved*
// state (the manual open/closed choices the explorer persists to localStorage)
// or open by default. Folders you opened yourself are left alone; only the
// active-page auto-expansion is undone. Deferred to requestAnimationFrame so it
// lands before paint (no open→close flicker).
const keepFolderState = `
(() => {
  function restore() {
    const explorer = document.querySelector(".explorer");
    if (!explorer) return;
    const defaultOpen = explorer.dataset.collapsed === "open";
    let saved = [];
    try {
      saved = JSON.parse(localStorage.getItem("fileTree") || "[]");
    } catch (e) {}
    const openByPath = new Map(saved.map((e) => [e.path, !e.collapsed]));
    document
      .querySelectorAll(".explorer .folder-container[data-folderpath]")
      .forEach((fc) => {
        const path = fc.getAttribute("data-folderpath");
        const outer = fc.nextElementSibling;
        if (!outer || !outer.classList || !outer.classList.contains("folder-outer")) return;
        const shouldBeOpen = openByPath.has(path) ? openByPath.get(path) : defaultOpen;
        if (!shouldBeOpen) outer.classList.remove("open");
      });
  }
  document.addEventListener("nav", () => requestAnimationFrame(restore));
  requestAnimationFrame(restore);
})();
`;

export default (() => {
  const ExplorerTweaks: QuartzComponent = () => null;
  ExplorerTweaks.afterDOMLoaded = keepFolderState;
  return ExplorerTweaks;
}) satisfies QuartzComponentConstructor;
