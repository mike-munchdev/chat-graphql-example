import { isEqual } from 'lodash';
import {
	GET_CHANNELS_WITH_FILTERS,
	GET_MESSAGES_FOR_CHANNEL,
	MY_OPEN_CHANNEL_NOTIFICATIONS
} from './channelQueries';

export const defaultFilters = {
	assigned: 'my',
	endDate: '',
	keywords: '',
	members: [],
	startDate: '',
	status: 'open'
};

export const defaultUnassignedFilters = {
	assigned: 'un',
	endDate: '',
	keywords: '',
	members: [],
	startDate: '',
	status: 'open'
};

export const defaultSingleChannelFilters = {
	assigned: null,
	endDate: null,
	keywords: null,
	members: null,
	startDate: null,
	status: null
};

const sortChannelsByLastModifiedDate = channels => {
	const newChannels = channels.sort((a, b) => {
		let dateA = a.lastModifiedAt;
		let dateB = b.lastModifiedAt;

		if (dateA > dateB) {
			return -1;
		}
		if (dateA < dateB) {
			return 1;
		}

		// dates must be equal
		return 0;
	});

	return newChannels;
};
export const channelUpdatedUpdate = ({ channels, filters, channelUpdated }) => {
	const { updatePerformed, channel } = channelUpdated;

	switch (updatePerformed) {
		case 'closeExternalChannel':
			return closeExternalChannelUpdate({ channels, filters, channel });
		case 'acceptExternalChannel':
			return acceptExternalChannelUpdate({ channels, filters, channel });
		case 'markChannelViewed':
			return markChannelViewedUpdate({ channels, filters, channel });
		case 'receivedMessageFromChannel':
			return receivedMessageFromChannel({ channels, filters, channel });
		default:
			return { channels };
	}
};

export const channelAddedUpdate = ({ channels, channel, filters }) => {
	if (isEqual(filters, defaultUnassignedFilters)) {
		return sortChannelsByLastModifiedDate([channel, ...channels]);
	}
	return channels;
};

export const receivedMessageFromChannel = ({ channels, channel, filters }) => {
	const channelsWithouUpdatedChannel = channels.filter(
		c => c.id !== channel.id
	);
	return {
		channels: sortChannelsByLastModifiedDate([
			...channelsWithouUpdatedChannel,
			channel
		])
	};
};
export const markChannelViewedUpdate = ({ channels, filters, channel }) => {
	// filter out the channel from the list of channels
	const channelsWithouUpdatedChannel = channels.filter(
		c => c.id !== channel.id
	);
	return {
		channels: sortChannelsByLastModifiedDate([
			...channelsWithouUpdatedChannel,
			channel
		])
	};
};
export const acceptExternalChannelUpdate = ({ channels, filters, channel }) => {
	const channelsWithoutAcceptedChannel = channels.filter(
		c => c.id !== channel.id
	);

	return {
		channels: sortChannelsByLastModifiedDate([
			...channelsWithoutAcceptedChannel,
			channel
		]),
		filters: { ...filters, assigned: 'my', status: 'open' }
	};
};
export const closeExternalChannelUpdate = ({ channels, filters, channel }) => {
	const channelsWithoutClosed = channels.filter(c => c.id !== channel.id);

	return {
		channels: channelsWithoutClosed
	};
};
export const sendMessageToChannelUpdate = ({
	cache,
	filters,
	sendMessageToChannel,
	channel
}) => {
	const { messagesForChannel } = cache.readQuery({
		query: GET_MESSAGES_FOR_CHANNEL,
		variables: {
			channelId: channel.id
		}
	});

	cache.writeQuery({
		query: GET_MESSAGES_FOR_CHANNEL,
		variables: {
			channelId: channel.id
		},
		data: {
			messagesForChannel: {
				...messagesForChannel,
				messages: [
					sendMessageToChannel.message,
					...messagesForChannel.messages
				]
			}
		}
	});

	const { getChannelsWithFilters } = cache.readQuery({
		query: GET_CHANNELS_WITH_FILTERS,
		variables: {
			filters
		}
	});

	let channels = [...getChannelsWithFilters.channels];
	channels[
		channels.findIndex(c => c.id === channel.id)
	].lastModifiedAt = new Date().toISOString();

	channels = sortChannelsByLastModifiedDate(channels);

	cache.writeQuery({
		query: GET_CHANNELS_WITH_FILTERS,
		variables: {
			filters
		},
		data: {
			getChannelsWithFilters: {
				...getChannelsWithFilters,
				channels
			}
		}
	});
};

export const updateChannelNotificationsUpdate = ({ cache }) => {
	const { myOpenChannelNotifications } = cache.readQuery({
		query: MY_OPEN_CHANNEL_NOTIFICATIONS
	});

	const openNotifications = myOpenChannelNotifications.notifications.filter(
		n => n.status.slug === 'sent'
	);

	// remove closed channel from open list
	cache.writeQuery({
		query: MY_OPEN_CHANNEL_NOTIFICATIONS,

		data: {
			myOpenChannelNotifications: {
				...myOpenChannelNotifications,
				notifications: openNotifications
			}
		}
	});
};
