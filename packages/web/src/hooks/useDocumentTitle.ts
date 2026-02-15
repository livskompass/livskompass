import { useEffect } from 'react'

const SITE_NAME = 'Livskompass'

export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - ACT & Mindfulness`
  }, [title])
}
