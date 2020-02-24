import gql from 'graphql-tag';
const errorsObjString = `errors {
	path
	message
}`;
const messageObjectString = `{
	id
	text
	user {
		id
		email
		firstName
		lastName
	}
	dateSent
	channelId
}`;
const memberObjectString = `{
	id	
	user {
		id
		email
		firstName
		lastName
	}
	dateJoined
	dateLeft
}`;
const channelObjectString = `{
	id
	name
	channelType {
		id
		type
	}
	channelStatus {
		id
		status
	}
	account {
		id
		accountName
		accountAcronym
	}
	createdBy {
		id
		email
		firstName
		lastName
	}
	createdAt
	lastModifiedBy {
		id
		email
		firstName
		lastName
	}
	lastModifiedAt
	
	lastMessageSnippet
	assignedTo {
		id
		email
		firstName
		lastName
	}
	closedReason
	flaggedReason
	uniqueId
	members ${memberObjectString}
	messages ${messageObjectString}
	friendlyName
	lastViews {
		id
		userId
		channelId
		lastViewedAt
	}
	unreadMessageCount
}`;

const channelNotificationString = `{
	id
	notifiedBy {
		id
		email
		firstName
		lastName
	}
	notified {
		id
		email
		firstName
		lastName
	}
	channel ${channelObjectString}
	dateSent
	status {
		id
		status
		slug
	}
	type {
		id
		type
		slug
	}
	message
}`;

export const GET_MESSAGES_FOR_CHANNEL = gql`
	query MessagesForChannel($channelId: Int!) {
		messagesForChannel(channelId: $channelId) {
			ok
			messages ${messageObjectString}
			${errorsObjString}
		}
	}
`;

export const GET_CHANNELS_WITH_FILTERS = gql`
	query GetChannelsWithFilters($filters: ChannelsFilterInput) {
		getChannelsWithFilters(filters: $filters) {
			ok
			channels ${channelObjectString}			
			${errorsObjString}
		}
	}
`;

export const GET_EXTERNAL_CHANNEL_TYPES = gql`
	{
		externalChannelTypes {
			id
			type
		}
	}
`;

export const CREATE_NEW_EXTERNAL_CHANNEL = gql`
	mutation CreateExternalChannel($channelTypeId: Int!) {
		createExternalChannel(channelTypeId: $channelTypeId) {
			ok
			channel ${channelObjectString}
			${errorsObjString}
		}
	}
`;

export const SEND_MESSAGE_TO_CHANNEL = gql`
	mutation SendMessageToChannel($message: MessageInput!) {
		sendMessageToChannel(message: $message) {
			ok
			message ${messageObjectString}
			${errorsObjString}
		}
	}
`;

export const CLOSE_EXTERNAL_CHANNEL = gql`
	mutation CloseExternalChannel($channelId: Int!, $reason: String!) {
		closeExternalChannel(channelId: $channelId, reason: $reason) {
			ok
			channel ${channelObjectString}
			${errorsObjString}
		}
	}
`;

export const ACCEPT_EXTERNAL_CHANNEL = gql`
	mutation AcceptExternalChannel($channelId: Int!) {
		acceptExternalChannel(channelId: $channelId) {
			ok
			channel	${channelObjectString}			
			${errorsObjString}
		}
	}
`;

export const GET_MY_INTERNAL_USERS = gql`
	query GetMyInternalUsers {
		getMyInternalUsers {
			ok
			users {
				id
				firstNameLastName
			}
			${errorsObjString}
		}
	}
`;
export const GET_MY_USERS = gql`
	query GetMyUsers {
		getMyUsers {
			ok
			users {
				id
				firstNameLastName
			}
			${errorsObjString}
		}
	}
`;

export const INVITE_USERS_TO_CHANNEL = gql`
	mutation InviteUsersToChannel($invitations: InvitationList!) {
		inviteUsersToChannel(invitations: $invitations) {
			ok
			notifications ${channelNotificationString}
			${errorsObjString}
		}
	}
`;

export const CHANNEL_NOTIFICATION_ADDED_SUBSCRIPTION = gql`
	subscription ChannelNotificationAdded {
		channelNotificationAdded {
			ok
			notification ${channelNotificationString}
			${errorsObjString}
			
		}
	}
`;

export const MY_OPEN_CHANNEL_NOTIFICATIONS = gql`
	query MyOpenChannelNotifications {
		myOpenChannelNotifications {
			ok
			notifications ${channelNotificationString}
			${errorsObjString}
		}
	}
`;

export const UPDATE_CHANNEL_NOTIFICATION = gql`
	mutation UpdateChannelNotification($updates: UpdateNotificationInput!) {
		updateChannelNotification(updates: $updates) {
			ok
			notification ${channelNotificationString}
			${errorsObjString}
		}
	}
`;

export const GET_MEMBERS_FOR_CHANNEL = gql`
	query MembersForChannel($channelId: Int!) {
		membersForChannel(channelId: $channelId) {
			ok
			members ${memberObjectString}
			${errorsObjString}
		}
	}
`;

export const MARK_CHANNEL_VIEWED = gql`
	mutation MarkChannelViewed($channelId: Int!) {
		markChannelViewed(channelId: $channelId) {
			ok
			channel	${channelObjectString}			
			${errorsObjString}
		}
	}
`;

export const GET_CHANNEL_STATUSES = gql`
	query GetChannelStatuses {
		getChannelStatuses {
			ok
			statuses {
				id
				status
			}
			${errorsObjString}
		}
	}
`;

export const CHANNEL_MESSAGE_ADDED_SUBSCRIPTION = gql`
	subscription ChannelMessageAdded($channelId: Int!) {
		channelMessageAdded(channelId: $channelId) {
			ok
			message ${messageObjectString}
			${errorsObjString}
			
		}
	}
`;

export const CHANNEL_UPDATED_SUBSCRIPTION = gql`
subscription ChannelUpdated {
	channelUpdated {
		ok
		channel	${channelObjectString}			
		${errorsObjString}
		updatePerformed
	}
}
`;

export const CHANNEL_ADDED_SUBSCRIPTION = gql`
subscription channelAdded {
	channelAdded {
		ok
		channel	${channelObjectString}			
		${errorsObjString}
	}
}
`;
