'use client';
import React, { useEffect, useState } from 'react';
import {
	Bot,
	Camera,
	ChevronDown,
	Eye,
	EyeOff,
	Lock,
	Mail,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useStudentsStore } from '@/store/studentStore';
import { uploadFile } from "@/lib/function";
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { changeUserPassword, updateProfile, } from '@/store/user/userThunk';
import { setActiveProfile } from '@/store/user/userSlice';
import { serverTimestamp } from 'firebase/firestore';

interface FormData {
	name: string;
	email: string;
	currentGradeLevel: string;
	mayenneDeClasse: string;
	oldPassword: string;
	newPassword: string;
	confirmPassword: string;
}

const ProfileMain = () => {
	const dispatch = useAppDispatch();
	const { currentUser,  } = useStudentsStore();
	const { user, activeProfile, uid } = useAppSelector(state => state.user);
	const [formData, setFormData] = useState<FormData>({
		name: '',
		email: '',
		currentGradeLevel: '',
		mayenneDeClasse: '',
		oldPassword: '',
		newPassword: '',
		confirmPassword: '',
	});
	const [selectedImage, setSelectedImage] = useState<string | null>(null);

	const millisNow = Date.now();
	const millisEnd = (user?.plan?.currentPeriodEnd ?? 0) * 1000;
	const daysRemaining = millisEnd > millisNow
	? Math.ceil((millisEnd - millisNow) / (1000 * 60 * 60 * 24))
	: 0;

	useEffect(() => {
		if (user) {
			setFormData(prev => ({
				...prev,
				email: user.email ?? prev.email,
			}));
		}
		if(activeProfile){
			const fullName = `${activeProfile.firstName ?? ''} ${activeProfile.lastName ?? ''}`.trim();
			setFormData(prev => ({
				...prev,
				name: fullName,
				currentGradeLevel:
					activeProfile.grade ?? prev.currentGradeLevel,
				mayenneDeClasse: activeProfile.mayenneDeClasse ?? prev.mayenneDeClasse,
			}));
			setSelectedImage(activeProfile?.avatar ?? null);
		}
	}, [user,activeProfile]);

	const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			try {
				const storagePath = `profileImages/${file.name}`;
				const downloadURL = await uploadFile(file, storagePath, (progress: number) => {
					console.log(`Upload progress: ${progress}%`);
				});
				if (downloadURL) {
					setSelectedImage(downloadURL as string);
					// Mettre à jour l'image de profil dans le store
					// await dispatch(updateUserProfile({ profileImage: downloadURL as string }));
					await dispatch(updateProfile({ uid: uid, profileId: activeProfile.id, updates: { avatar: downloadURL as string } }));
					dispatch(setActiveProfile({
					...activeProfile,
					avatar: downloadURL,
					updatedAt: serverTimestamp(),
					}));
				}
			} catch (error) {
				console.error('Error uploading image:', error);
				toast.error('Failed to upload image');
			}
		}
	};

	const [showPasswords, setShowPasswords] = useState({
		old: false,
		new: false,
		confirm: false,
	});

	const handleInputChange = (field: keyof FormData, value: string) => {
		setFormData(prev => ({
			...prev,
			[field]: value,
		}));
	};

	const togglePasswordVisibility = (field: 'old' | 'new' | 'confirm') => {
		setShowPasswords(prev => ({
			...prev,
			[field]: !prev[field],
		}));
	};

	const handleSaveChanges = async () => {
		const {
			name,
			email,
			currentGradeLevel,
			mayenneDeClasse,
			oldPassword,
			newPassword,
			confirmPassword,
		} = formData;

		try {
			// 1. Toujours mettre à jour le profil
			// await dispatch(updateUserProfile({
			// 	name,
			// 	email,
			// 	grade: currentGradeLevel,
			// 	mayenneDeClasse,
			// }));
			const [firstName, ...rest] = name.trim().split(' ');
			const lastName = rest.join(' ');
			await dispatch(updateProfile({
			uid: uid,
			profileId: activeProfile.id,
			updates: {
				firstName,
				lastName,
				grade: currentGradeLevel,
				mayenneDeClasse,
			},
			}));
			// Update Redux + cookie manually
			dispatch(setActiveProfile({
				...activeProfile,
				firstName,
				lastName,
				grade: currentGradeLevel,
				mayenneDeClasse,
				updatedAt: serverTimestamp(),
			}));

			// 2. Conditionnellement changer le mot de passe
			const allPasswordsFilled =
				oldPassword.trim() && newPassword.trim() && confirmPassword.trim();
			if (allPasswordsFilled) {
				dispatch(
					changeUserPassword({
						oldPassword,
						newPassword,
						confirmPassword,
					}));
			}
		} catch (error) {
			console.error('Error updating profile:', error);
			toast.error(error instanceof Error ? error.message : 'Failed to update profile');
		}
	};

	/* const handleLogout = async () => {
		if (uid) {
			await updateUserPresence({ uid, onlineStatus: false });
		}
		const result = await logout();
		if (result.success) {
			toast.success('Logged out successfully');
		} else {
			toast.error(result.error || 'Failed to logout');
		}
	}; */

	const handleForgotPassword = () => {
		console.log('Forgot password clicked');
	};

	return (
		<div className='w-full'>
			{/* Current Plan Summary */}
			<div className='flex flex-col md:flex-row items-center w-full gap-8 mb-8'>
				<div className='relative w-30 h-30 lg:w-36 lg:h-36 rounded-full bg-[#7B61FF] shrink-0'>
					<div className='relative w-full h-full rounded-full overflow-hidden'>
						<Image
							src={selectedImage || '/images/picture.png'}
							alt='avatar'
							fill
							className='object-cover rounded-full'
						/>
					</div>

					<label
						htmlFor='avatarUpload'
						className='absolute bottom-3 right-1 bg-[#E6E6E6] p-1.5 rounded-full cursor-pointer z-10'
					>
						<Camera className='w-4 h-4 text-black' />
					</label>

					<Input
						id='avatarUpload'
						type='file'
						accept='image/*'
						onChange={handleImageUpload}
						className='hidden'
					/>
				</div>
				{activeProfile?.isParent && (
				<div className='bg-white w-full shadow-[0px_2px_30px_0px_#0000000D] rounded-lg'>
					<div className='flex items-center justify-between bg-[#F5F5F5] p-2 border border-[#ECECEC] border-[1.18px] rounded-t-lg'>
						<p className='text-[20.72px] font-semibold text-[#2C2C2C]'>
							Current Plan Summary
						</p>
						<Button className='bg-[#7372B7] text-[#FFFFFFFC] text-[14.8px] font-bold px-12 py-[14px]'>
							Upgrade
						</Button>
					</div>
					<div className='text-sm space-y-3 p-3 border border-[#CCCCCC] rounded-b-lg'>
						<div className='flex justify-between'>
							<div>
								<p className='text-[#696969] font-medium text-[10px] leading-[100%] tracking-[0] capitalize mb-1'>
									PLAN NAME
								</p>
								<p className='font-semibold text-[18px] leading-[100%] tracking-[0] text-[#2C2C2C]'>
									{user?.plan?.name}
								</p>
							</div>
							<div>
								<p className='text-[#110c0c] font-medium text-[10px] leading-[100%] tracking-[0] capitalize mb-1'>
									BILLING CYCLE
								</p>
								<p className='font-semibold text-[18px] leading-[100%] tracking-[0] text-[#2C2C2C]'>
									Monthly
								</p>
							</div>
							<div>
								<p className='text-[#696969] font-medium text-[10px] leading-[100%] tracking-[0] capitalize mb-1'>
									PLAN COST
								</p>
								<p className='font-semibold text-[18px] leading-[100%] tracking-[0] text-[#2C2C2C]'>
									€ {user?.plan?.amount}
								</p>
							</div>
						</div>
						<div>
							<p className='text-[#696969] text-sm font-medium'>
								Validity:{' '}
								<span className='text-[#2C2C2C] font-medium text-[14.8px]'>
									{`${daysRemaining} Days Remaining`}
								</span>
							</p>
						</div>
						<div className='w-full bg-[#F5F5F5] h-[20px] rounded-[5.92px]'>
							<div className='bg-[#7372B7] h-[20px] rounded-[5.92px] w-[80%]' />
						</div>
					</div>
				</div>
				)}
			</div>

			{/* Form Section */}
			<div className='space-y-5'>
				<div className='grid grid-cols-2 gap-6'>
					<div>
						<Label
							htmlFor='name'
							className='font-semibold text-[16.8px] leading-[150%] tracking-[0] text-[#000000] inline-block'
						>
							Name
						</Label>
						<Input
							id='name'
							type='text'
							value={formData.name}
							onChange={e =>
								handleInputChange('name', e.target.value)
							}
							className='px-5 py-[27px] bg-[#F5F5F5] mt-2 border-none font-medium !text-[18px] leading-[100%] tracking-[0px] text-[#1A1A1A] focus:outline-none rounded-[10px] placeholder:text-[#9B9B9B]'
						/>
					</div>
					<div>
						<Label
							htmlFor='email'
							className='font-semibold text-[16.8px] leading-[150%] tracking-[0] text-[#000000] inline-block'
						>
							Email
						</Label>
						<div className='relative'>
							<Mail className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1A1A1A]' />
							<Input
								id='email'
								type='email'
								value={formData.email}
								onChange={e =>
									handleInputChange('email', e.target.value)
								}
								readOnly
								className='px-10 py-[27px] bg-[#F5F5F5] mt-2 border-none font-medium !text-[18px] leading-[100%] tracking-[0px] text-[#1A1A1A] focus:outline-none rounded-[10px] placeholder:text-[#9B9B9B]'
							/>
						</div>
					</div>
				</div>

				<div className='relative'>
					<Label
						htmlFor='grade'
						className='font-semibold text-[16.8px] leading-[150%] tracking-[0] text-[#000000] inline-block'
					>
						Current Grade Level
					</Label>
					<select
						id='grade'
						value={formData.currentGradeLevel}
						onChange={e =>
							handleInputChange(
								'currentGradeLevel',
								e.target.value
							)
						}
						className='w-full px-5 py-[20px] bg-[#F5F5F5] mt-2 border-none font-medium text-[18px] leading-[100%] text-[#1A1A1A] focus:outline-none rounded-[10px] appearance-none'
					>
						<option value='' disabled hidden>
							Select Grade Level
						</option>
						<option value='Grade 01'>Grade 01</option>
						<option value='Grade 02'>Grade 02</option>
						<option value='Grade 03'>Grade 03</option>
					</select>

					{/* Chevron icons container */}
					<div className='pointer-events-none absolute top-[70%] right-4 -translate-y-1/2 flex flex-col items-center gap-[2px] text-gray-500'>
						<ChevronDown className='w-5 h-5' />
					</div>
				</div>

				<div>
					<Label
						htmlFor='moyenne'
						className='font-semibold text-[16.8px] leading-[150%] tracking-[0] text-[#000000] inline-block'
					>
						Moyenne de classe
					</Label>
					<Input
						id='moyenne'
						type='text'
						value={formData.mayenneDeClasse}
						onChange={e =>
							handleInputChange('mayenneDeClasse', e.target.value)
						}
						className='px-5 py-[27px] bg-[#F5F5F5] mt-2 border-none font-medium !text-[18px] leading-[100%] tracking-[0px] text-[#1A1A1A] focus:outline-none rounded-[10px] placeholder:text-[#9B9B9B]'
					/>
				</div>

				{/* Change Password */}
				{activeProfile?.isParent && (
				<div className='pt-2'>
					<h3 className='text-[25px] font-bold text-black mb-5'>
						Change Password
					</h3>
					<div className='space-y-4'>
						<div>
							<Label
								htmlFor='oldPassword'
								className='font-semibold text-[16.8px] leading-[150%] tracking-[0] text-[#000000] inline-block'
							>
								Old Password
							</Label>
							<div className='relative'>
								<Lock className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9B9B9B]' />
								<Input
									id='oldPassword'
									type={
										showPasswords.old ? 'text' : 'password'
									}
									value={formData.oldPassword}
									onChange={e =>
										handleInputChange(
											'oldPassword',
											e.target.value
										)
									}
									placeholder='Enter password'
									className='px-10 py-[27px] bg-[#F5F5F5] mt-2 border-none font-medium !text-[18px] leading-[100%] tracking-[0px] text-[#1A1A1A] focus:outline-none rounded-[10px] placeholder:text-[#9B9B9B]'
								/>
								<Button
									type='button'
									variant='ghost'
									size='sm'
									className='absolute right-0 top-0 h-full px-3'
									onClick={() =>
										togglePasswordVisibility('old')
									}
								>
									{showPasswords.old ? (
										<EyeOff className='w-4 h-4 text-[#9B9B9B]' />
									) : (
										<Eye className='w-4 h-4 text-[#9B9B9B]' />
									)}
								</Button>
							</div>
							<div className='mt-2 text-right'>
								<Button
									variant='link'
									className='text-[#7372B7] text-sm'
									onClick={handleForgotPassword}
								>
									Forgot password?
								</Button>
							</div>
						</div>

						<div className='grid grid-cols-2 gap-6'>
							<div>
								<Label
									htmlFor='newPassword'
									className='font-semibold text-[16.8px] leading-[150%] tracking-[0] text-[#000000] inline-block'
								>
									New Password
								</Label>
								<div className='relative'>
									<Lock className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9B9B9B]' />
									<Input
										id='newPassword'
										type={
											showPasswords.new
												? 'text'
												: 'password'
										}
										value={formData.newPassword}
										onChange={e =>
											handleInputChange(
												'newPassword',
												e.target.value
											)
										}
										placeholder='Enter password'
										className='px-10 py-[27px] bg-[#F5F5F5] mt-2 border-none font-medium !text-[18px] leading-[100%] tracking-[0px] text-[#1A1A1A] focus:outline-none rounded-[10px] placeholder:text-[#9B9B9B]'
									/>
									<Button
										type='button'
										variant='ghost'
										size='sm'
										className='absolute right-0 top-0 h-full px-3'
										onClick={() =>
											togglePasswordVisibility('new')
										}
									>
										{showPasswords.new ? (
											<EyeOff className='w-4 h-4 text-[#9B9B9B]' />
										) : (
											<Eye className='w-4 h-4 text-[#9B9B9B]' />
										)}
									</Button>
								</div>
							</div>
							<div>
								<Label
									htmlFor='confirmPassword'
									className='font-semibold text-[16.8px] leading-[150%] tracking-[0] text-[#000000] inline-block'
								>
									Confirm Password
								</Label>
								<div className='relative'>
									<Lock className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9B9B9B]' />
									<Input
										id='confirmPassword'
										type={
											showPasswords.confirm
												? 'text'
												: 'password'
										}
										value={formData.confirmPassword}
										onChange={e =>
											handleInputChange(
												'confirmPassword',
												e.target.value
											)
										}
										placeholder='Enter password'
										className='px-10 py-[27px] bg-[#F5F5F5] mt-2 border-none font-medium !text-[18px] leading-[100%] tracking-[0px] text-[#1A1A1A] focus:outline-none rounded-[10px] placeholder:text-[#9B9B9B]'
									/>
									<Button
										type='button'
										variant='ghost'
										size='sm'
										className='absolute right-0 top-0 h-full px-3'
										onClick={() =>
											togglePasswordVisibility('confirm')
										}
									>
										{showPasswords.confirm ? (
											<EyeOff className='w-4 h-4 text-[#9B9B9B]' />
										) : (
											<Eye className='w-4 h-4 text-[#9B9B9B]' />
										)}
									</Button>
								</div>
							</div>
						</div>
					</div>
				</div>)}

				{/* Save Changes */}
				<div className='pt-4'>
					<Button
						onClick={handleSaveChanges}
						className='bg-[#7272B8] hover:bg-purple-700 px-12 py-5 rounded-[10px]'
					>
						Save Changes
					</Button>
				</div>
			</div>

			{/* Floating Bot Icon */}
			<div className='fixed bottom-6 right-6'>
				<Button className='bg-[#7272B8] p-4 w-12 h-12 rounded-full'>
					<Bot className='w-8 h-8' />
				</Button>
			</div>
		</div>
	);
};

export default ProfileMain;
