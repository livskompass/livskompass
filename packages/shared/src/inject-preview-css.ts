import { fontUrl } from './design-tokens'

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

  // Set body background to neutral-50 (warm off-white)
  iframeDoc.body.style.backgroundColor = '#FAFAF7'
  iframeDoc.body.style.fontFamily = "'Inter', system-ui, sans-serif"

  // Load Fraunces + Inter fonts
  const fontsLink = iframeDoc.createElement('link')
  fontsLink.rel = 'stylesheet'
  fontsLink.href = fontUrl
  iframeDoc.head.appendChild(fontsLink)

  // Inject font-heading utility
  const extraCSS = iframeDoc.createElement('style')
  extraCSS.textContent = `.font-heading { font-family: 'Fraunces', Georgia, serif; }`
  iframeDoc.head.appendChild(extraCSS)
}
