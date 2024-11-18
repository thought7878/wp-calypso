import { useTranslate } from 'i18n-calypso';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutBody from 'calypso/a8c-for-agencies/components/layout/body';
import LayoutHeader, {
	LayoutHeaderBreadcrumb as Breadcrumb,
	LayoutHeaderActions as Actions,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import { A4A_MIGRATIONS_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { TaskSteps, TaskStepItem } from 'calypso/a8c-for-agencies/components/task-steps';
import { getMigrationInfo } from './migration-info';

const SelfMigrationTool = ( { type }: { type: 'pressable' | 'wpcom' } ) => {
	const translate = useTranslate();

	const stepInfo = getMigrationInfo( type, translate );

	const { pageTitle, heading, pageHeading, pageSubheading, steps, sessionStorageKey } = stepInfo;

	const stepsWithCompletion = steps.map( ( step ) => {
		return {
			...step,
			isCompleted: false,
		};
	} ) as TaskStepItem[];

	return (
		<Layout className="self-migration-tool" title={ pageTitle } wide>
			<LayoutTop>
				<LayoutHeader>
					<Breadcrumb
						hideOnMobile
						items={ [
							{
								label: translate( 'Migrations' ),
								href: A4A_MIGRATIONS_LINK,
							},
							{
								label: heading,
							},
						] }
					/>
					<Actions useColumnAlignment>
						<MobileSidebarNavigation />
					</Actions>
				</LayoutHeader>
			</LayoutTop>

			<LayoutBody>
				<TaskSteps
					heading={ pageHeading }
					subheading={ pageSubheading }
					steps={ stepsWithCompletion }
					sessionStorageKey={ sessionStorageKey }
				/>
			</LayoutBody>
		</Layout>
	);
};

export default SelfMigrationTool;
