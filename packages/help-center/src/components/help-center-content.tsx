/* eslint-disable no-restricted-imports */
/**
 * External Dependencies
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { CardBody, Disabled } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { useEffect, useRef } from '@wordpress/element';
import clsx from 'clsx';
import React, { useState } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
/**
 * Internal Dependencies
 */
import { useHelpCenterContext } from '../contexts/HelpCenterContext';
import { useSupportStatus } from '../data/use-support-status';
import { useChatStatus, useShouldRenderEmailOption } from '../hooks';
import { HELP_CENTER_STORE } from '../stores';
import { HelpCenterArticle } from './help-center-article';
import { HelpCenterContactForm } from './help-center-contact-form';
import { HelpCenterContactPage } from './help-center-contact-page';
import { HelpCenterOdie } from './help-center-odie';
import { HelpCenterSearch } from './help-center-search';
import { SuccessScreen } from './ticket-success-screen';
import type { HelpCenterSelect } from '@automattic/data-stores';

import './help-center-content.scss';

// Disabled component only applies the class if isDisabled is true, we want it always.
function Wrapper( {
	isDisabled,
	className,
	children,
}: React.PropsWithChildren< { isDisabled: boolean; className: string } > ) {
	if ( isDisabled ) {
		return (
			<Disabled isDisabled={ isDisabled } className={ className }>
				{ children }
			</Disabled>
		);
	}
	return <div className={ className }>{ children }</div>;
}

const HelpCenterContent: React.FC< { isRelative?: boolean; currentRoute?: string } > = ( {
	currentRoute,
} ) => {
	const [ searchTerm, setSearchTerm ] = useState( '' );
	const [ hasBackButtonHeader, setHasBackButtonHeader ] = useState( false );
	const location = useLocation();
	const containerRef = useRef< HTMLDivElement >( null );
	const navigate = useNavigate();
	const { setNavigateToRoute } = useDispatch( HELP_CENTER_STORE );
	const { sectionName } = useHelpCenterContext();
	const { isLoading: isLoadingEmailStatus } = useShouldRenderEmailOption();
	const { isLoading: isLoadingChatStatus } = useChatStatus();

	const { data, isLoading: isLoadingEligibility } = useSupportStatus();

	const isUserEligible = data?.eligibility.is_user_eligible ?? false;
	const isLoadingEnvironment = isLoadingEmailStatus || isLoadingChatStatus || isLoadingEligibility;

	useEffect( () => {
		recordTracksEvent( 'calypso_helpcenter_page_open', {
			pathname: location.pathname,
			search: location.search,
			section: sectionName,
			force_site_id: true,
			location: 'help-center',
			is_free_user: ! isUserEligible,
		} );
	}, [ location, sectionName, isUserEligible ] );

	const { navigateToRoute, isMinimized } = useSelect( ( select ) => {
		const store = select( HELP_CENTER_STORE ) as HelpCenterSelect;
		return {
			navigateToRoute: store.getNavigateToRoute(),
			isMinimized: store.getIsMinimized(),
		};
	}, [] );

	useEffect( () => {
		if ( navigateToRoute ) {
			const fullLocation = [ location.pathname, location.search, location.hash ].join( '' );
			// On navigate once to keep the back button responsive.
			if ( fullLocation !== navigateToRoute ) {
				navigate( navigateToRoute );
			}
			setNavigateToRoute( null );
		}
	}, [ navigate, navigateToRoute, setNavigateToRoute, location ] );

	useEffect( () => {
		setSearchTerm( '' );
		if ( containerRef.current && ! location.hash && ! location.pathname.includes( '/odie' ) ) {
			containerRef.current.scrollTo( 0, 0 );
		}
	}, [ location ] );

	// The back button header requires extra styling to the container.
	useEffect( () => {
		setHasBackButtonHeader(
			Boolean( containerRef.current?.querySelector( '.help-center-back-button__header' ) )
		);
	}, [ location ] );

	return (
		<CardBody
			ref={ containerRef }
			className={ clsx( 'help-center__container-content', {
				'has-back-button-header': hasBackButtonHeader,
			} ) }
		>
			<Wrapper isDisabled={ isMinimized } className="help-center__container-content-wrapper">
				<Routes>
					<Route
						path="/"
						element={
							<HelpCenterSearch onSearchChange={ setSearchTerm } currentRoute={ currentRoute } />
						}
					/>
					<Route path="/post" element={ <HelpCenterArticle /> } />
					<Route path="/contact-options" element={ <HelpCenterContactPage /> } />
					<Route path="/contact-form" element={ <HelpCenterContactForm /> } />
					<Route path="/success" element={ <SuccessScreen /> } />
					<Route
						path="/odie"
						element={
							<HelpCenterOdie
								isLoadingEnvironment={ isLoadingEnvironment }
								isUserEligible={ isUserEligible }
								searchTerm={ searchTerm }
							/>
						}
					/>
				</Routes>
			</Wrapper>
		</CardBody>
	);
};

export default HelpCenterContent;
