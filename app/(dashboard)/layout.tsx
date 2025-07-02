import { MainSidebar } from "@/components/sidebar/main-sidebar"
import { MobileNav } from "@/components/sidebar/mobile-nav"
import Image from "next/image"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Header */}
      <div className="md:hidden border-b border-gray-100">
        <div className="flex h-14 items-center px-4 bg-white shadow-sm">
          <div className="flex items-center justify-start w-1/3">
            <MobileNav />
          </div>     
          <div className="flex items-center justify-center w-1/3">
            <Image src="/images/logo.png" alt="Logo" width={70} height={70} />
          </div>
          <div className="w-1/3" />
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-3.5rem)] md:h-screen">
        {/* Sidebar - Hidden on mobile */}
        <div className="hidden md:block md:w-64 md:flex-shrink-0">
          <MainSidebar />
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto md:rounded-lg md:m-2">
          <div className="relative p-4 md:p-6 lg:p-8">
            {children}
            {/* Drawer portal target */}
            <div id="drawer-portal" />
          </div>
        </main>
      </div>
    </div>
  )
}