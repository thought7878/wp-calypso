import page from '@automattic/calypso-router';
import { useDesktopBreakpoint } from '@automattic/viewport-react';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { ReactNode, useMemo, useState } from 'react';
import { initialDataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/constants';
import ItemsDataViews from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews';
import { DataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews/interfaces';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutBody from 'calypso/a8c-for-agencies/components/layout/body';
import LayoutHeader, {
	LayoutHeaderActions as Actions,
	LayoutHeaderTitle as Title,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import PagePlaceholder from 'calypso/a8c-for-agencies/components/page-placeholder';
import { A4A_TEAM_INVITE_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { useDispatch, useSelector } from 'calypso/state';
import { hasAgencyCapability } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { A4AStore } from 'calypso/state/a8c-for-agencies/types';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import useHandleMemberAction from '../../hooks/use-handle-member-action';
import { useMemberList } from '../../hooks/use-member-list';
import { TeamMember } from '../../types';
import GetStarted from '../get-started';
import { ActionColumn, DateColumn, MemberColumn, RoleStatusColumn } from './columns';

import './style.scss';

export default function TeamList() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const isDesktop = useDesktopBreakpoint();

	const [ dataViewsState, setDataViewsState ] = useState< DataViewsState >( initialDataViewsState );

	const { members, hasMembers, isPending, refetch } = useMemberList();

	const title = translate( 'Manage team members' );

	const onInviteClick = () => {
		dispatch( recordTracksEvent( 'calypso_a4a_team_invite_team_member_click' ) );
		page( A4A_TEAM_INVITE_LINK );
	};

	const handleAction = useHandleMemberAction( { onRefetchList: refetch } );

	const canRemove = useSelector( ( state: A4AStore ) =>
		hasAgencyCapability( state, 'a4a_remove_users' )
	);

	const currentUser = useSelector( getCurrentUser );

	const fields = useMemo(
		() => [
			{
				id: 'user',
				header: translate( 'User' ).toUpperCase(),
				render: ( { item }: { item: TeamMember } ): ReactNode => {
					return <MemberColumn member={ item } withRoleStatus={ ! isDesktop } />;
				},
				enableHiding: false,
				enableSorting: false,
			},
			...( isDesktop
				? [
						{
							id: 'role',
							header: translate( 'Role' ).toUpperCase(),
							render: ( { item }: { item: TeamMember } ): ReactNode => {
								return <RoleStatusColumn member={ item } />;
							},
							enableHiding: false,
							enableSorting: false,
						},
						{
							id: 'added-date',
							header: translate( 'Added' ).toUpperCase(),
							render: ( { item }: { item: TeamMember } ): ReactNode => {
								return <DateColumn date={ item.dateAdded } />;
							},
							enableHiding: false,
							enableSorting: false,
						},
				  ]
				: [] ),
			{
				id: 'actions',
				header: '',
				render: ( { item }: { item: TeamMember } ): ReactNode => {
					return (
						<ActionColumn
							member={ item }
							onMenuSelected={ ( action ) => handleAction( action, item ) }
							canRemove={ canRemove || item.email === currentUser?.email }
						/>
					);
				},
				width: isDesktop ? '40%' : undefined,
				enableHiding: false,
				enableSorting: false,
			},
		],
		[ canRemove, currentUser?.email, handleAction, isDesktop, translate ]
	);

	if ( isPending ) {
		return <PagePlaceholder />;
	}

	if ( ! hasMembers ) {
		return <GetStarted />;
	}

	return (
		<Layout className="team-list full-width-layout-with-table" title={ title } wide compact>
			<LayoutTop>
				<LayoutHeader>
					<Title>{ title }</Title>
					<Actions>
						<Button variant="primary" onClick={ onInviteClick }>
							{ translate( 'Invite a team member' ) }
						</Button>
					</Actions>
				</LayoutHeader>
			</LayoutTop>
			<LayoutBody>
				<ItemsDataViews
					data={ {
						items: members,
						getItemId: ( user ) => `${ user.id }`,
						pagination: {
							totalItems: 1,
							totalPages: 1,
						},
						enableSearch: false,
						fields: fields,
						actions: [],
						setDataViewsState: setDataViewsState,
						dataViewsState: dataViewsState,
					} }
				/>
			</LayoutBody>
		</Layout>
	);
}
