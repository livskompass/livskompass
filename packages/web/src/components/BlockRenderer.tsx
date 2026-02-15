import { Render } from '@puckeditor/core'
import { puckConfig } from '@livskompass/shared'

interface BlockRendererProps {
  data: string
}

export default function BlockRenderer({ data }: BlockRendererProps) {
  try {
    const parsed = JSON.parse(data)
    return <Render config={puckConfig} data={parsed} />
  } catch {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-500">
        Could not load page content.
      </div>
    )
  }
}
