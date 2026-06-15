// Hand-authored compiled output (mirrors what tsup would emit). Quartz loads
// dist/ at runtime; keep it in sync with ../src when editing.

// src/components/ExplorerTweaks.tsx
var keepFolderState = `
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
var ExplorerTweaks_default = () => {
  const ExplorerTweaks = () => null;
  ExplorerTweaks.afterDOMLoaded = keepFolderState;
  return ExplorerTweaks;
};

export { ExplorerTweaks_default as ExplorerTweaks };
