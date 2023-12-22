import { useTranslate } from 'i18n-calypso';
import GuidedTour from 'calypso/jetpack-cloud/components/guided-tour';
import { useSelector } from 'calypso/state';
import { getPreference } from 'calypso/state/preferences/selectors';
import { JETPACK_MANAGE_ONBOARDING_TOURS_PREFERENCE_NAME } from '../constants';

interface Props {
	isMonitorPopupVisible: boolean;
}

export default function EnableMonitorTourStep1( { isMonitorPopupVisible }: Props ) {
	const translate = useTranslate();
	const hasFinishedStep1 = useSelector( ( state ) =>
		getPreference( state, JETPACK_MANAGE_ONBOARDING_TOURS_PREFERENCE_NAME[ 'enableMonitorStep1' ] )
	);
	const shouldRenderEnableMonitorTourStep2 = hasFinishedStep1 && ! isMonitorPopupVisible;

	return (
		shouldRenderEnableMonitorTourStep2 && (
			<GuidedTour
				preferenceName={ JETPACK_MANAGE_ONBOARDING_TOURS_PREFERENCE_NAME[ 'enableMonitorStep2' ] }
				tours={ [
					{
						target: '.components-form-toggle__input:not([disabled])',
						popoverPosition: 'bottom left',
						title: translate( '🎉 Monitor Status' ),
						description: (
							<>
								{ translate(
									'Here you can see the current monitoring status of your sites. You can enable or disable this setting per site to receive notifications when your site is down.'
								) }
								<br />
								<br />
								{ translate( 'Let’s continue exploring, shall we?' ) }
							</>
						),

						redirectOnButtonClick: '/overview',
					},
				] }
			/>
		)
	);
}
