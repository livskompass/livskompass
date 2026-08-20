import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Home } from 'lucide-react'

/**
 * Catch-all 404 for admin sub-paths under the protected layout.
 * Renders inside AdminLayout chrome via the trailing `<Route path="*" />`
 * in App.tsx, so the sidebar/topbar stay visible while the user recovers.
 */
export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <p className="text-6xl font-semibold text-zinc-300 select-none">404</p>
      <h1 className="mt-4 text-xl font-semibold text-zinc-800">Page not found</h1>
      <p className="mt-2 text-sm text-zinc-500 max-w-md">
        The admin route you tried to open does not exist. It may have been renamed or removed.
      </p>
      <Button asChild className="mt-6">
        <Link to="/dashboard">
          <Home className="mr-2 h-4 w-4" />
          Back to dashboard
        </Link>
      </Button>
    </div>
  )
}
