import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { type LoginRequestSchema, zLoginRequestSchema } from '@workspace/schema';
import { Button, ErrorMessage, Input, Label, Separator, toast } from '@workspace/ui/components';
import { EyeIcon, EyeOffIcon, KeyRound, LoaderCircle, MailSearchIcon, User } from 'lucide-react';
import { useCallback, useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { signIn } from '@/lib/http';

export const Route = createFileRoute('/(auth-pages)/login')({
	component: LoginForm,
});

function LoginForm() {
	const {
		register,
		handleSubmit,
		setValue,
		formState: { errors },
	} = useForm<LoginRequestSchema>({
		resolver: zodResolver(zLoginRequestSchema),
		mode: 'onSubmit',
		reValidateMode: 'onBlur',
		defaultValues: {
			email: '',
			password: '',
		},
	});

	const [showPassword, setShowPassword] = useState<boolean>(false);

	const { mutate, isPending } = useMutation({
		mutationFn: async (data: { email: string; password: string }) => signIn(data),
		onSuccess: (_data, _variables, _onMutateResult, _context) => {
			// context.client.removeQueries({ queryKey: authQueryOptions().queryKey });
			redirect({ to: '/' });
		},
		onError: ({ message }) => {
			toast.error(message || 'An error occurred while signing in.', {
				position: 'top-right',
			});
		},
	});

	const onSubmit: SubmitHandler<LoginRequestSchema> = useCallback(
		data => {
			if (!isPending) {
				mutate({ email: data.email, password: data.password });
			}
		},
		[isPending, mutate],
	);

	return (
		<div className="flex flex-col gap-6">
			<form onSubmit={handleSubmit(onSubmit)}>
				<div className="flex flex-col gap-6">
					<div className="flex flex-col items-center gap-2">
						<div className="flex items-center justify-center rounded-md">
							<Link aria-label="Trang chủ" className="flex justify-center gap-5 text-center" to="/">
								<User size={50} />
							</Link>
						</div>
						<span className="sr-only">Miền Trung Tech</span>
						<h1 className="text-xl font-bold">Miền Trung Tech - Admin</h1>
					</div>

					<div className="relative mt-6 mb-4">
						<div className="absolute inset-0 flex items-center">
							<Separator />
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-background text-muted-foreground px-2">Đăng nhập</span>
						</div>
					</div>

					<div className="flex flex-col gap-10">
						<div className="grid gap-3">
							<Label htmlFor="email">
								<MailSearchIcon size={18} />
								Email
							</Label>
							<Input
								placeholder="hello@example.com"
								readOnly={isPending}
								required
								type="email"
								{...register('email')}
								onBlur={event => {
									setValue('email', event.target.value?.trim() || '', {
										shouldValidate: true,
										shouldDirty: true,
									});
								}}
							/>
							{errors.email && <ErrorMessage message={errors.email.message} />}
						</div>

						<div className="relative">
							<div className="grid gap-3">
								<Label htmlFor="password">
									<KeyRound size={18} />
									Mật Khẩu
								</Label>
								<Input
									placeholder="Nhập mật khẩu"
									readOnly={isPending}
									required
									type={showPassword ? 'text' : 'password'}
									{...register('password')}
								/>
								<button
									aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
									className="absolute mt-9 right-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
									onClick={() => setShowPassword(!showPassword)}
									type="button"
								>
									{showPassword ? <EyeOffIcon /> : <EyeIcon />}
								</button>

								{errors.password && <ErrorMessage message={errors.password.message} />}
							</div>
						</div>

						<Button className="mt-2 w-full cursor-pointer" disabled={isPending} size="lg" type="submit">
							{isPending && <LoaderCircle className="animate-spin" />}
							{isPending ? 'Đang đăng nhập...' : 'Đăng nhập'}
						</Button>
					</div>

					<Separator className="mt-5" />

					<div className="text-muted-foreground dark:text-muted-foreground text-center text-sm italic">
						<p className="mt-4">Tổng Cục Hậu Cần - Kỹ Thuật</p>
						<p className="mt-2">Trường Trung Cấp Kỹ Thuật Miền Trung</p>
					</div>
				</div>
			</form>
		</div>
	);
}
