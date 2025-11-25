import { Link } from '@tanstack/react-router';
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@workspace/ui/components/sidebar';
import { Calendar, CheckSquare, Mail, MessageCircle, Users } from 'lucide-react';
import type * as React from 'react';
import { Logo } from '@/components/layouts/logo';
import { NavMain } from '@/components/layouts/nav-main';
import { NavUser } from '@/components/layouts/nav-user';
import { SidebarNotification } from '@/components/layouts/sidebar-notification';

const data = {
	user: {
		name: 'ShadcnStore',
		email: 'store@example.com',
		avatar: '',
	},
	navGroups: [
		{
			label: 'Apps',
			items: [
				{
					title: 'Mail',
					url: '/mail',
					icon: Mail,
				},
				{
					title: 'Tasks',
					url: '/tasks',
					icon: CheckSquare,
				},
				{
					title: 'Chat',
					url: '/chat',
					icon: MessageCircle,
				},
				{
					title: 'Calendar',
					url: '/calendar',
					icon: Calendar,
				},
				{
					title: 'Users',
					url: '/users',
					icon: Users,
				},
			],
		},
		{
			label: 'Pages',
			items: [
				{
					title: 'User Settings',
					url: '/settings/user',
				},
				{
					title: 'Account Settings',
					url: '/settings/account',
				},
				{
					title: 'Plans & Billing',
					url: '/settings/billing',
				},
				{
					title: 'Appearance',
					url: '/settings/appearance',
				},
				{
					title: 'Notifications',
					url: '/settings/notifications',
				},
				{
					title: 'Connections',
					url: '/settings/connections',
				},
			],
		},
	],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton asChild size="lg">
							<Link to="/dashboard">
								<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
									<Logo className="text-current" size={24} />
								</div>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-medium">ShadcnStore</span>
									<span className="truncate text-xs">Admin Dashboard</span>
								</div>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				{data.navGroups.map(group => (
					<NavMain items={group.items} key={group.label} label={group.label} />
				))}
			</SidebarContent>
			<SidebarFooter>
				<SidebarNotification />
				<NavUser user={data.user} />
			</SidebarFooter>
		</Sidebar>
	);
}
