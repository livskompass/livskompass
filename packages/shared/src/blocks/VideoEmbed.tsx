export interface VideoEmbedProps {
  url: string
  aspectRatio: '16:9' | '4:3' | '1:1'
  caption: string
}

const ratioMap = { '16:9': 'aspect-video', '4:3': 'aspect-[4/3]', '1:1': 'aspect-square' }

function getEmbedUrl(url: string): string {
  if (!url) return ''
  if (url.includes('youtube.com/watch')) {
    try {
      const videoId = new URL(url).searchParams.get('v')
      if (videoId) return `https://www.youtube.com/embed/${videoId}`
    } catch { /* ignore */ }
  } else if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0]
    if (videoId) return `https://www.youtube.com/embed/${videoId}`
  } else if (url.includes('vimeo.com/')) {
    const videoId = url.split('vimeo.com/')[1]?.split('?')[0]
    if (videoId) return `https://player.vimeo.com/video/${videoId}`
  }
  return url
}

export function VideoEmbed({
  url = '',
  aspectRatio = '16:9',
  caption = '',
}: VideoEmbedProps) {
  const embedUrl = getEmbedUrl(url)
  const ratio = ratioMap[aspectRatio] || 'aspect-video'

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <figure>
        {embedUrl ? (
          <div className={`${ratio} w-full rounded-xl overflow-hidden bg-neutral-100`}>
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={caption || 'Video'}
            />
          </div>
        ) : (
          <div className={`${ratio} w-full rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-400`}>
            Klistra in en video-URL
          </div>
        )}
        {caption && <figcaption className="text-sm text-neutral-500 mt-2 text-center">{caption}</figcaption>}
      </figure>
    </div>
  )
}
