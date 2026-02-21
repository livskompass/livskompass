import PuckRenderer from './PuckRenderer'

interface BlockRendererProps {
  data: string
}

export default function BlockRenderer({ data }: BlockRendererProps) {
  try {
    const parsed = JSON.parse(data)
    return <PuckRenderer data={parsed} />
  } catch {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-500">
        Kunde inte ladda sidinnehåll.
      </div>
    )
  }
}
