import { useEffect, useCallback, useRef } from 'react'
import { usePuck } from '@puckeditor/core'
import type { Data } from '@puckeditor/core'

const MESSAGE_TYPE = 'livskompass:prop-update'

interface PropUpdateMessage {
  type: typeof MESSAGE_TYPE
  componentId: string
  propName: string
  value: unknown
}

/**
 * Send a prop update from the iframe block to the parent frame.
 * Called from `useInlineEdit` inside block components rendered in the Puck iframe.
 */
export function sendPropUpdate(componentId: string, propName: string, value: unknown): void {
  if (typeof window === 'undefined') return
  const targetOrigin = window.location.origin || '*'
  window.parent.postMessage(
    { type: MESSAGE_TYPE, componentId, propName, value } satisfies PropUpdateMessage,
    targetOrigin,
  )
}

/**
 * Find a component by ID in the Puck data (root content + all zones)
 * and return a patched copy of the data with the prop updated.
 */
function patchPuckData(data: Data, componentId: string, propName: string, value: unknown): Data | null {
  // Check root content
  const rootIdx = data.content.findIndex((item) => item.props?.id === componentId)
  if (rootIdx !== -1) {
    const newContent = [...data.content]
    newContent[rootIdx] = {
      ...newContent[rootIdx],
      props: { ...newContent[rootIdx].props, [propName]: value },
    }
    return { ...data, content: newContent }
  }

  // Check all zones
  for (const [zoneName, zoneContent] of Object.entries(data.zones || {})) {
    const idx = zoneContent.findIndex((item) => item.props?.id === componentId)
    if (idx !== -1) {
      const newZoneContent = [...zoneContent]
      newZoneContent[idx] = {
        ...newZoneContent[idx],
        props: { ...newZoneContent[idx].props, [propName]: value },
      }
      return {
        ...data,
        zones: { ...data.zones, [zoneName]: newZoneContent },
      }
    }
  }

  return null
}

/**
 * React hook for the parent frame (builder components).
 * Listens for postMessage prop updates from iframe blocks
 * and dispatches them to Puck state.
 * Uses a ref for appState.data to avoid re-registering the listener on every data change.
 */
export function usePropUpdateListener(): void {
  const { appState, dispatch } = usePuck()
  const dataRef = useRef(appState.data)
  dataRef.current = appState.data

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      // Validate origin — only accept messages from same origin
      if (event.origin !== window.location.origin) return

      const msg = event.data as PropUpdateMessage
      if (!msg || msg.type !== MESSAGE_TYPE) return

      const patched = patchPuckData(dataRef.current, msg.componentId, msg.propName, msg.value)
      if (patched) {
        dispatch({ type: 'setData', data: patched })
      }
    },
    [dispatch],
  )

  useEffect(() => {
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [handleMessage])
}
