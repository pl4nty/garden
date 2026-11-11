declare module "*.scss" {
  const content: string
  export default content
}

interface Window {
  // Quartz: runs the callback before the next SPA navigation replaces the page
  addCleanup(fn: () => void): void
}
