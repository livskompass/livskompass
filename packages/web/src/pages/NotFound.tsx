import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export default function NotFound() {
  useDocumentTitle('Sidan hittades inte')
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
      <h2 className="text-3xl font-bold text-gray-900 mb-4">
        Sidan hittades inte
      </h2>
      <p className="text-gray-600 mb-8">
        Sidan du letar efter finns inte eller har flyttats.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          to="/"
          className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
        >
          Till startsidan
        </Link>
        <Link
          to="/kontakt"
          className="inline-block border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
        >
          Kontakta oss
        </Link>
      </div>
    </div>
  )
}
