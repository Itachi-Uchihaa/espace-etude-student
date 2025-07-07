'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
	LogOut,
	BookOpen,
	LayoutDashboard,
	GraduationCap,
	Trophy,
	PencilRuler,
	Bot,
	HelpCircle,
	User,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import Image from 'next/image';
import { useStudentsStore } from '@/store/studentStore';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { logout, updateUserPresence } from '@/store/user/userThunk';


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
const navigationBottom = [
	{
		title: 'Help & Support',
		url: '/support',
		icon: HelpCircle,
	},
];

export function MainSidebar() {
	const dispatch = useAppDispatch();
	const { uid, user } = useAppSelector(state => state.user);
	// const { currentUser, uid, updateUserPresence, logout } = useStudentsStore();
	const pathname = usePathname();
	const route = useRouter();
	const [hasMounted, setHasMounted] = useState(false);

	useEffect(() => {
		setHasMounted(true);
	}, []);

	const handleLogout = async () => {
		if(uid){
			await dispatch(updateUserPresence({ uid, onlineStatus: false }));
		}
		const result = await dispatch(logout());
		if (logout.fulfilled.match(result)) {
			route.push('/login');
			toast.success('Logged out successfully');
		} else {
			toast.error('Failed to logout');
		}
	};

	useEffect(() => {
		if (uid) {
		dispatch(updateUserPresence({ uid, onlineStatus: true }));
		}
	}, [uid, dispatch]);

	if (!hasMounted) return null;

	return (
		<div className='h-full bg-white border-r border-gray-200 relative'>
			{/* Logo Section */}
			<div className='p-4 border-b border-gray-100'>
				<div className='flex items-center gap-3'>
					<Image
						src='/images/logo.png'
						alt='Logo'
						width={138.5}
						height={55.23}
					/>
				</div>
			</div>

			{/* Navigation */}
			<nav className='p-4'>
				<div className='space-y-2'>
					{navigation.map(item => (
						<Link
							key={item.title}
							href={item.url}
							className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium  text-[#71839B] ${
								pathname === item.url
									? 'bg-[#7372B7] text-white border'
									: 'text-[#71839B] hover:bg-gray-50 hover:text-[#7372B7]'
							}`}
						>
							<item.icon className='h-5 w-5 flex-shrink-0' />
							{item.title}
						</Link>
					))}
				</div>
			</nav>

			{/* User Profile Section */}
			<div className='absolute bottom-0 left-0 right-0 p-4 space-y-2'>
				<div className='space-y-2'>
					{navigationBottom.map(item => (
						<Link
							key={item.title}
							href={item.url}
							className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium  text-[#71839B] ${
								pathname === item.url
									? 'bg-[#7372B7] text-white border'
									: 'text-[#71839B] hover:bg-gray-50 hover:text-[#7372B7]'
							}`}
						>
							<item.icon className='h-5 w-5 flex-shrink-0' />
							{item.title}
						</Link>
					))}
				</div>
				<button
					onClick={handleLogout}
					className=' text-sm text-[#71839B] px-3 font-medium transition-colors cursor-pointer hover:text-[#7372B7] flex items-center gap-2'
				>
					<LogOut className='h-5 w-5 flex-shrink-0' />
					Logout
				</button>
				<div className='flex items-center'>
					<div className='flex items-center gap-4'>
						<Avatar>
							<AvatarImage
								src={user?.profileImage || '/images/picture.png'}
								alt='Avatar'
							/>
							<AvatarFallback>CN</AvatarFallback>
						</Avatar>
						<div className='flex flex-col'>
							<span className='text-sm font-medium text-[#324054]'>
								{user?.name}
							</span>
							<span className='text-xs text-[#71839B]'>
								{user?.email}
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}