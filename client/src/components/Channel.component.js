import React from 'react';
import FontAwesome from 'react-fontawesome';
import moment from 'moment';
import { Button } from 'reactstrap';
import { isSelectedChannel } from './channelMethods';

const getIndicator = ({ channel, user }) => {
  if (channel.channelStatus.status === 'Flagged') {
    return <FontAwesome name="flag" />;
  }
  if (channel.channelStatus.status === 'Closed') {
    return <FontAwesome name="lock" />;
  }
  return '';
};

const getInitials = user => {
  return user
    ? `${user.firstName.slice(0, 1)}${user.lastName.slice(0, 1)}`
    : 'N/A';
};

const displayChannelOperationButton = ({
  channel,
  showAcceptChannelModal,
  showInviteChannelModal
}) => {
  if (
    channel.channelStatus.status === 'Closed' ||
    channel.channelStatus.status === 'Flagged'
  ) {
    return '';
  } else if (channel.assignedTo) {
    return (
      <Button
        color="primary"
        size="sm"
        className="chat-button"
        onClick={e => {
          showInviteChannelModal();
        }}
      >
        Invite
      </Button>
    );
  } else {
    return (
      <Button
        color="primary"
        size="sm"
        className="chat-button"
        onClick={e => {
          showAcceptChannelModal();
        }}
      >
        Accept
      </Button>
    );
  }
};
export const Channel = ({
  channel,
  onChannelSelected,
  selectedChannel,
  showAcceptChannelModal,
  showInviteChannelModal,
  MarkChannelViewed,
  user
}) => {
  return (
    <div
      className={`chat_list ${
        isSelectedChannel(channel, selectedChannel) ? 'active_chat' : ''
      } }`}
      key={channel.id}
      onClick={e => onChannelSelected(channel, MarkChannelViewed)}
    >
      <div className="chat-channels">
        <div className="chat-new_indicator">
          {getIndicator({ channel, user })}
        </div>
        <div className="chatAssignedTo">
          <div className="chatAssignedToContainer">
            <Button
              type="button"
              className="chat-button btn btn-primary btn-sm"
            >
              {getInitials(channel.assignedTo)}

              {channel.unreadMessageCount &&
              !isSelectedChannel(channel, selectedChannel) ? (
                <div className="chatAssignedToContainer_counter">
                  {channel.unreadMessageCount}
                </div>
              ) : (
                <div />
              )}
            </Button>
          </div>
        </div>
        <div className="chat-preview_info">
          <div className="chat-preview_info_header">
            {`${channel.createdBy.firstName} ${channel.createdBy.lastName} - ${channel.friendlyName} -  ${channel.channelStatus.status}`}
          </div>
          <div className="chat-preview_info_message">
            {channel.lastMessageSnippet || ''}
          </div>
        </div>
        <div className="chat-date">
          <div className="chat-date_text">
            {moment(channel.lastModifiedAt).format('MMM DD')}
          </div>
        </div>
        <div className="chat-buttons">
          {displayChannelOperationButton({
            channel,
            showAcceptChannelModal,
            showInviteChannelModal
          })}
        </div>
      </div>
    </div>
  );
};
