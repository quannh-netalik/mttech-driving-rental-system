import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@workspace/ui/components';
import { useLayout } from '@workspace/ui/providers';
// import { AppTitle } from './app-title'
// import { sidebarData } from './data/sidebar-data';
// import { NavGroup } from './nav-group';
// import { NavUser } from './nav-user';
import { TeamSwitcher } from '../team-switcher';
import { sidebarData } from './sidebar.config';

/**
 * Render the application's sidebar composed of a header, navigational groups, footer, and rail.
 *
 * Uses layout state to set the sidebar's collapsible behavior and populates header and content from sidebar configuration.
 *
 * @returns The rendered sidebar element configured from layout state and sidebar data
 */
export function AppSidebar() {
	const { collapsible } = useLayout();
	return (
		<Sidebar collapsible={collapsible}>
			<SidebarHeader>
				<TeamSwitcher teams={sidebarData.teams} />

				{/* Replace <TeamSwitch /> with the following <AppTitle />
         /* if you want to use the normal app title instead of TeamSwitch dropdown */}
				{/* <AppTitle /> */}
			</SidebarHeader>
			<SidebarContent>
				{sidebarData.navGroups.map(props => (
					<NavGroup key={props.title} {...props} />
				))}
			</SidebarContent>
			<SidebarFooter>{/* <NavUser user={sidebarData.user} /> */}</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}