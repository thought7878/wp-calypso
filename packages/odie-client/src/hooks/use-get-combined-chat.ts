import { HelpCenterSelect } from '@automattic/data-stores';
import { HELP_CENTER_STORE } from '@automattic/help-center/src/stores';
import { useSelect } from '@wordpress/data';
import { useState, useEffect } from '@wordpress/element';
import { ODIE_TRANSFER_MESSAGE } from '../constants';
import { emptyChat } from '../context';
import { getZendeskConversation, useOdieChat } from '../data';
import type { Chat, Message } from '../types';

/**
 * This combines the ODIE chat with the ZENDESK conversation.
 * @returns The combined chat.
 */
export const useGetCombinedChat = ( shouldUseHelpCenterExperience: boolean | undefined ) => {
	const { currentSupportInteraction } = useSelect( ( select ) => {
		const store = select( HELP_CENTER_STORE ) as HelpCenterSelect;
		return {
			currentSupportInteraction: store.getCurrentSupportInteraction(),
		};
	}, [] );

	const [ mainChatState, setMainChatState ] = useState< Chat >( emptyChat );

	// Get the current odie chat
	const odieId =
		currentSupportInteraction?.events.find( ( event ) => event.event_source === 'odie' )
			?.event_external_id ?? null;

	// Get the current Zendesk conversation ID
	const conversationId =
		currentSupportInteraction?.events.find( ( event ) => event.event_source === 'zendesk' )
			?.event_external_id ?? null;

	const { data: odieChat, isLoading: isOdieChatLoading } = useOdieChat( Number( odieId ) );

	useEffect( () => {
		if ( odieId && ( ! conversationId || ! shouldUseHelpCenterExperience ) ) {
			if ( odieChat ) {
				setMainChatState( {
					...odieChat,
					provider: 'odie',
					conversationId: null,
					supportInteractionId: currentSupportInteraction!.uuid,
					status: 'loaded',
				} );
			}
		} else if ( odieId && conversationId && shouldUseHelpCenterExperience ) {
			if ( odieChat ) {
				getZendeskConversation( {
					chatId: odieChat.odieId,
					conversationId: conversationId.toString(),
				} )?.then( ( conversation ) => {
					if ( conversation ) {
						setMainChatState( {
							...odieChat,
							supportInteractionId: currentSupportInteraction!.uuid,
							conversationId: conversation.id,
							messages: [
								...odieChat.messages,
								ODIE_TRANSFER_MESSAGE( true ),
								...( conversation.messages as Message[] ),
							],
							provider: 'zendesk',
							status: 'loaded',
						} );
					}
				} );
			}
		} else if ( currentSupportInteraction ) {
			setMainChatState( ( prevChat ) => ( {
				...( prevChat.supportInteractionId !== currentSupportInteraction!.uuid
					? emptyChat
					: prevChat ),
				supportInteractionId: currentSupportInteraction!.uuid,
				status: 'loaded',
			} ) );
		}
	}, [ isOdieChatLoading, odieChat, conversationId, odieId, currentSupportInteraction ] );

	return { mainChatState, setMainChatState };
};
