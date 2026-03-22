import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useUIStrings } from '@livskompass/shared'
import { Button } from '../components/ui/button'
import { Home, Mail } from 'lucide-react'

export default function NotFound() {
  const strings = useUIStrings()
  useDocumentTitle(strings.notFound.pageTitle)
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <p className="font-display text-display sm:text-[8rem] leading-none text-faint mb-4 select-none">404</p>
      <h1 className="text-h2 text-foreground-strong mb-4">
        {strings.notFound.heading}
      </h1>
      <p className="text-muted mb-10 text-body-lg">
        {strings.notFound.message}
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button size="lg" asChild>
          <Link to="/">
            <Home className="mr-2 h-4 w-4" />
            {strings.notFound.toHomepage}
          </Link>
        </Button>
        <Button variant="outline" size="lg" asChild>
          <Link to="/kontakt">
            <Mail className="mr-2 h-4 w-4" />
            {strings.notFound.contactUs}
          </Link>
        </Button>
      </div>
    </div>
  )
}
