import { Render } from '@puckeditor/core'
import { puckConfig } from '@livskompass/shared'

interface BlockRendererProps {
  data: string
}

export default function BlockRenderer({ data }: BlockRendererProps) {
  try {
    const parsed = JSON.parse(data)
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Render config={puckConfig} data={parsed} />
      </div>
    )
  } catch {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-500">
        Could not load page content.
      </div>
    )
  }
}
