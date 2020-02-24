export const isSelectedChannel = (channel, selectedChannel) => {
	if (!channel || !selectedChannel) {
		return false;
	}
	return channel.id === selectedChannel.id;
};
