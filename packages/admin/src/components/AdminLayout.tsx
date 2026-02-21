import { useState, useEffect } from 'react'
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
  ChevronsLeft,
  ChevronsRight,
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
  const [collapsed, setCollapsed] = useState(() =>
    localStorage.getItem('sidebar_collapsed') === 'true'
  )
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Auto-collapse sidebar on editor pages for maximum editing space
  const isEditorPage = /\/(sidor|nyheter|utbildningar|material)\/.+/.test(location.pathname)
  useEffect(() => {
    if (isEditorPage) setCollapsed(true)
  }, [isEditorPage])

  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', String(collapsed))
  }, [collapsed])

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
    <div className="min-h-screen flex bg-stone-50">
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
          "fixed inset-y-0 left-0 z-30 bg-stone-950 flex flex-col transform transition-all duration-200 ease-in-out lg:translate-x-0 lg:static",
          collapsed ? 'w-16' : 'w-64',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className={cn(
          "flex items-center justify-between h-16 border-b border-stone-800",
          collapsed ? 'px-3' : 'px-5'
        )}>
          <Link to="/dashboard" className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 bg-forest-600 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            {!collapsed && (
              <span className="text-lg font-semibold text-white tracking-tight truncate">
                Livskompass
              </span>
            )}
          </Link>
          <button
            className="lg:hidden text-stone-400 hover:text-white transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className={cn(
          "flex-1 py-4 space-y-1 overflow-y-auto",
          collapsed ? 'px-2' : 'px-3'
        )}>
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
                  title={collapsed ? item.name : undefined}
                  className={cn(
                    "group flex items-center rounded-lg text-sm font-medium transition-all duration-150",
                    collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5',
                    isActive
                      ? 'bg-stone-800 text-white'
                      : 'text-stone-400 hover:bg-stone-900 hover:text-stone-200'
                  )}
                >
                  <item.icon className={cn(
                    "h-[18px] w-[18px] shrink-0",
                    isActive ? 'text-forest-400' : 'text-stone-500 group-hover:text-stone-400'
                  )} />
                  {!collapsed && (
                    <>
                      {item.name}
                      {isActive && (
                        <ChevronRight className="ml-auto h-4 w-4 text-stone-600" />
                      )}
                    </>
                  )}
                </Link>
              )
            })}
        </nav>

        <Separator className="bg-stone-800" />

        {/* User / Logout */}
        <div className={cn("p-3", collapsed && 'px-2')}>
          {currentUser && !collapsed && (
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              {currentUser.avatar_url ? (
                <img
                  src={currentUser.avatar_url}
                  alt=""
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-stone-700 flex items-center justify-center">
                  <span className="text-stone-300 text-sm font-medium">
                    {currentUser.name?.[0] || currentUser.email[0].toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-stone-200 truncate">
                  {currentUser.name || 'User'}
                </p>
                <p className="text-xs text-stone-500 truncate">
                  {currentUser.email}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={() => logoutMutation.mutate()}
            title={collapsed ? 'Log out' : undefined}
            className={cn(
              "w-full flex items-center text-stone-400 hover:bg-stone-900 hover:text-stone-200 rounded-lg text-sm font-medium transition-all duration-150",
              collapsed ? 'justify-center py-2.5' : 'gap-3 px-3 py-2.5'
            )}
          >
            <LogOut className="h-[18px] w-[18px] text-stone-500" />
            {!collapsed && 'Log out'}
          </button>

          {/* Collapse toggle (desktop only) */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "hidden lg:flex w-full items-center text-stone-500 hover:bg-stone-900 hover:text-stone-300 rounded-lg text-sm font-medium transition-all duration-150 mt-1",
              collapsed ? 'justify-center py-2.5' : 'gap-3 px-3 py-2.5'
            )}
          >
            {collapsed ? (
              <ChevronsRight className="h-[18px] w-[18px]" />
            ) : (
              <>
                <ChevronsLeft className="h-[18px] w-[18px]" />
                Collapse
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden bg-white border-b border-stone-200 h-14 flex items-center px-4 sticky top-0 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="mr-3"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-forest-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">L</span>
            </div>
            <span className="font-semibold text-stone-900">Livskompass</span>
          </div>
        </header>

        <main className={cn(
          "flex-1 overflow-auto",
          isEditorPage ? 'p-2' : 'p-4 md:p-6 lg:p-8'
        )}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
