import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { Button } from '../components/ui/button'
import { Home, Mail } from 'lucide-react'

export default function NotFound() {
  useDocumentTitle('Sidan hittades inte')
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <p className="font-display text-6xl sm:text-[8rem] leading-none text-stone-300 mb-4 select-none">404</p>
      <h1 className="text-h2 text-stone-900 mb-4">
        Sidan hittades inte
      </h1>
      <p className="text-stone-500 mb-10 text-lg">
        Sidan du letar efter finns inte eller har flyttats.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button size="lg" asChild>
          <Link to="/">
            <Home className="mr-2 h-4 w-4" />
            Till startsidan
          </Link>
        </Button>
        <Button variant="outline" size="lg" asChild>
          <Link to="/kontakt">
            <Mail className="mr-2 h-4 w-4" />
            Kontakta oss
          </Link>
        </Button>
      </div>
    </div>
  )
}
