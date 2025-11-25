import { SidebarInset, SidebarProvider } from '@workspace/ui/components/sidebar';
import { useSidebarConfig } from '@workspace/ui/providers/sidebar.provider';
import type * as React from 'react';
import { AppSidebar } from '@/components/layouts/app-sidebar';
import { SiteFooter } from '@/components/layouts/site-footer';
import { SiteHeader } from '@/components/layouts/site-header';

interface BaseLayoutProps {
	children: React.ReactNode;
	title?: string;
	description?: string;
}

export function BaseLayout({ children, title, description }: Readonly<BaseLayoutProps>) {
	const { config } = useSidebarConfig();

	return (
		<SidebarProvider
			className={config.collapsible === 'none' ? 'sidebar-none-mode' : ''}
			style={
				{
					'--sidebar-width': '16rem',
					'--sidebar-width-icon': '3rem',
					'--header-height': 'calc(var(--spacing) * 14)',
				} as React.CSSProperties
			}
		>
			<AppSidebar collapsible={config.collapsible} side={config.side} variant={config.variant} />
			<SidebarInset>
				<SiteHeader />
				<div className="flex flex-1 flex-col">
					<div className="@container/main flex flex-1 flex-col gap-2">
						<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
							{title && (
								<div className="px-4 lg:px-6">
									<div className="flex flex-col gap-2">
										<h1 className="text-2xl font-bold tracking-tight">{title}</h1>
										{description && <p className="text-muted-foreground">{description}</p>}
									</div>
								</div>
							)}
							{children}
						</div>
					</div>
				</div>
				<SiteFooter />
			</SidebarInset>
		</SidebarProvider>
	);
}
