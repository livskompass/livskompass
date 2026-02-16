/**
 * Inject CSS into Puck editor iframe, filtering out admin-specific rules
 * so the preview matches the public frontend.
 */
export function injectPreviewCSS(iframeDoc: Document) {
  let cssText = ''
  Array.from(document.styleSheets).forEach((sheet) => {
    try {
      Array.from(sheet.cssRules).forEach((rule) => {
        const ruleText = rule.cssText
        // Skip admin-specific rules that shouldn't appear in the preview
        if (
          ruleText.startsWith('body') ||
          ruleText.includes('[class*="Puck') ||
          ruleText.includes('[class*="Sidebar') ||
          ruleText.includes('[class*="PuckLayout') ||
          ruleText.includes('[class*="Nav_') ||
          ruleText.includes('[class*="SidebarSection') ||
          ruleText.includes('.ProseMirror')
        ) return
        cssText += ruleText + '\n'
      })
    } catch {
      // Cross-origin stylesheet - inject as link
      if (sheet.href) {
        const link = iframeDoc.createElement('link')
        link.rel = 'stylesheet'
        link.href = sheet.href
        iframeDoc.head.appendChild(link)
      }
    }
  })
  if (cssText) {
    const style = iframeDoc.createElement('style')
    style.textContent = cssText
    iframeDoc.head.appendChild(style)
  }
  // Reset body background to white (admin has bg-gray-100)
  iframeDoc.body.style.backgroundColor = 'white'
  // Google Fonts
  const fontLink = iframeDoc.createElement('link')
  fontLink.rel = 'stylesheet'
  fontLink.href =
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
  iframeDoc.head.appendChild(fontLink)
  iframeDoc.body.style.fontFamily = "'Inter', system-ui, sans-serif"
}
