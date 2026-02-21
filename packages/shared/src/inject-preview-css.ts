import { fontUrl, fonts, colors } from './design-tokens'

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

  // Set body background to surface-primary (warm cream)
  iframeDoc.body.style.backgroundColor = colors.stone[50]
  iframeDoc.body.style.fontFamily = fonts.body
  iframeDoc.body.style.color = colors.stone[800]

  // Load Instrument Serif + Inter fonts
  const fontsLink = iframeDoc.createElement('link')
  fontsLink.rel = 'stylesheet'
  fontsLink.href = fontUrl
  iframeDoc.head.appendChild(fontsLink)

  // Inject font-display + text utilities for Puck preview parity
  const extraCSS = iframeDoc.createElement('style')
  extraCSS.textContent = `
    .font-display { font-family: ${fonts.display}; }
    .text-display {
      font-family: ${fonts.display};
      font-size: clamp(3rem, 1.5rem + 4.444vw, 6rem);
      line-height: 1.1;
      letter-spacing: -0.025em;
      font-weight: 400;
    }
    .text-h1 {
      font-family: ${fonts.display};
      font-size: clamp(2.25rem, 1.625rem + 2.083vw, 3.5rem);
      line-height: 1.1;
      letter-spacing: -0.025em;
      font-weight: 400;
    }
    .text-h2 {
      font-family: ${fonts.display};
      font-size: clamp(1.75rem, 1.417rem + 1.111vw, 2.5rem);
      line-height: 1.2;
      letter-spacing: -0.02em;
      font-weight: 400;
    }
    .text-h3 {
      font-family: ${fonts.body};
      font-size: clamp(1.375rem, 1.208rem + 0.556vw, 1.75rem);
      line-height: 1.25;
      letter-spacing: -0.015em;
      font-weight: 600;
    }
    .text-h4 {
      font-family: ${fonts.body};
      font-size: clamp(1.125rem, 1.042rem + 0.278vw, 1.3125rem);
      line-height: 1.3;
      letter-spacing: -0.01em;
      font-weight: 600;
    }
    .text-body-lg { font-size: clamp(1.0625rem, 1rem + 0.278vw, 1.1875rem); line-height: 1.6; }
    .text-body-sm { font-size: 0.9375rem; line-height: 1.6; }
    .text-caption { font-size: 0.8125rem; line-height: 1.5; font-weight: 500; }
    .text-overline {
      font-size: 0.75rem;
      line-height: 1.5;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .reveal { opacity: 1 !important; transform: none !important; transition: none !important; }
    .reveal-visible { opacity: 1 !important; transform: none !important; }
    .reveal-stagger-1, .reveal-stagger-2, .reveal-stagger-3,
    .reveal-stagger-4, .reveal-stagger-5 { transition-delay: 0ms !important; }
  `
  iframeDoc.head.appendChild(extraCSS)
}
