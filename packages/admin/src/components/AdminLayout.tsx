import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { logout, setAuthToken, getMe } from '../lib/api'
import {
  LayoutDashboard,
  FileText,
  Newspaper,
  GraduationCap,
  Ticket,
  ShoppingBag,
  Image,
  Mail,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react'
import { cn } from '../lib/utils'
import { Button } from './ui/button'
import { Separator } from './ui/separator'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Pages', href: '/sidor', icon: FileText },
  { name: 'Posts', href: '/nyheter', icon: Newspaper },
  { name: 'Courses', href: '/utbildningar', icon: GraduationCap },
  { name: 'Bookings', href: '/bokningar', icon: Ticket },
  { name: 'Products', href: '/material', icon: ShoppingBag },
  { name: 'Media', href: '/media', icon: Image },
  { name: 'Messages', href: '/meddelanden', icon: Mail },
  { name: 'Users', href: '/anvandare', icon: Users, adminOnly: true },
  { name: 'Settings', href: '/installningar', icon: Settings },
]

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: meData } = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
  })

  const currentUser = meData?.user
  const isAdmin = currentUser?.role === 'admin'

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      setAuthToken(null)
      queryClient.clear()
      navigate('/login')
    },
  })

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 bg-gray-950 flex flex-col transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static",
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-gray-800">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <span className="text-lg font-semibold text-white tracking-tight">
              Livskompass
            </span>
          </Link>
          <button
            className="lg:hidden text-gray-400 hover:text-white transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation
            .filter((item) => !item.adminOnly || isAdmin)
            .map((item) => {
              const isActive = location.pathname === item.href ||
                (item.href !== '/dashboard' && location.pathname.startsWith(item.href))
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                    isActive
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-400 hover:bg-gray-900 hover:text-gray-200'
                  )}
                >
                  <item.icon className={cn(
                    "h-[18px] w-[18px] shrink-0",
                    isActive ? 'text-primary-400' : 'text-gray-500 group-hover:text-gray-400'
                  )} />
                  {item.name}
                  {isActive && (
                    <ChevronRight className="ml-auto h-4 w-4 text-gray-600" />
                  )}
                </Link>
              )
            })}
        </nav>

        <Separator className="bg-gray-800" />

        {/* User / Logout */}
        <div className="p-3">
          {currentUser && (
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              {currentUser.avatar_url ? (
                <img
                  src={currentUser.avatar_url}
                  alt=""
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                  <span className="text-gray-300 text-sm font-medium">
                    {currentUser.name?.[0] || currentUser.email[0].toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-200 truncate">
                  {currentUser.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {currentUser.email}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={() => logoutMutation.mutate()}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-400 hover:bg-gray-900 hover:text-gray-200 rounded-lg text-sm font-medium transition-all duration-150"
          >
            <LogOut className="h-[18px] w-[18px] text-gray-500" />
            Log out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden bg-white border-b border-gray-200 h-14 flex items-center px-4 sticky top-0 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="mr-3"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">L</span>
            </div>
            <span className="font-semibold text-gray-900">Livskompass</span>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
