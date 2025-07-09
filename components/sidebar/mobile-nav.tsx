"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"

import { Menu, LogOut, BookOpen, LayoutDashboard, User, Bot, PencilRuler, Trophy, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"
import { useStudentsStore } from "@/store/studentStore"
import { logout, updateUserPresence } from "@/store/user/userThunk"
import { useAppDispatch, useAppSelector } from "@/store/store"
import { clearActiveProfile } from "@/store/user/userSlice"

const navigation = [
	{
		title: 'Dashboard',
		url: '/overview',
		icon: LayoutDashboard,
	},
	{
		title: 'Subjects',
		url: '/subject',
		icon: BookOpen,
	},
	{
		title: 'My Courses',
		url: '/courses',
		icon: GraduationCap,
	},
	{
		title: 'Achievements',
		url: '/achievement',
		icon: Trophy,
	},
	{
		title: 'Quizzes & Exercises',
		url: '/quizz',
		icon: PencilRuler,
	},
	{
		title: 'AI Assistant',
		url: '/ai',
		icon: Bot,
	},
	{
		title: 'Profile',
		url: '/settings',
		icon: User,
	},
];

export function MobileNav({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const dispatch = useAppDispatch();
  const { user, uid, activeProfile } = useAppSelector((state) => state.user);
  const [open, setOpen] = React.useState(false)
  const [activeItem, setActiveItem] = React.useState("Dashboard")
  const route = useRouter();
  // const { currentUser, uid, logout, updateUserPresence } = useStudentsStore();

  const handleLogout = async () => {
    if (uid) {
      await updateUserPresence({ uid, onlineStatus: false });
    }
    dispatch(clearActiveProfile());
    const result = await dispatch(logout());
    if (logout.fulfilled.match(result)) {
      setOpen(false);
      route.push('/login');
      toast.success('Logged out successfully');
    } else {
      toast.error('Failed to logout');
    }
  };

  return (
    <div className={cn("md:hidden", className)} {...props}>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9 p-0">
            <Menu className="h-9 w-9" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 bg-white border-r border-gray-200">
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Image
                  src="/images/logo.png"
                  alt="Logo"
                  width={100}
                  height={40}
                  className="object-contain"
                />
              </div>
            </div>
            <div className="flex-1 p-4">
              <div className="flex flex-col space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.title}
                    href={item.url}
                    onClick={() => {
                      setActiveItem(item.title);
                      setOpen(false);
                    }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeItem === item.title
                        ? 'bg-[#7372B7] text-white shadow-sm'
                        : 'text-[#71839B] hover:bg-gray-50 hover:text-[#7372B7]'
                    }`}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
            <div className="p-4 border-t border-gray-100">
              <div className="flex items-center">
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/images/picture.png" alt="Avatar" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-[#324054]">{activeProfile?.firstName || activeProfile?.lastName ? `${activeProfile.firstName || ''} ${activeProfile.lastName || ''}`.trim() : ''}</span>
                    <span className="text-xs text-[#71839B]">{user?.email}</span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-8 text-sm text-[#71839B] font-medium transition-colors hover:text-[#7372B7] flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

export default MobileNav; 