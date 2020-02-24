import React, { Fragment } from 'react';
import { Mutation } from 'react-apollo';

import { MARK_CHANNEL_VIEWED } from './channelQueries';

import { ChannelList } from './ChannelList.component';

export const GetChannels = ({
  onChannelSelected,
  selectedChannel,
  filters,
  showAcceptChannelModal,
  onAcceptChannelConfirm,
  onAcceptChannelCancel,
  isChannelAcceptModalOpen,
  showInviteChannelModal,
  onInviteChannelConfirm,
  onInviteChannelCancel,
  isInviteChannelModalOpen,
  invitedUsers,
  updateInvitedUsers,
  user,

  channels
}) => (
  <Fragment>
    <Mutation mutation={MARK_CHANNEL_VIEWED}>
      {(MarkChannelViewed, args) => (
        <ChannelList
          channelList={channels}
          onChannelSelected={onChannelSelected}
          selectedChannel={selectedChannel}
          showAcceptChannelModal={showAcceptChannelModal}
          onAcceptChannelConfirm={onAcceptChannelConfirm}
          onAcceptChannelCancel={onAcceptChannelCancel}
          isChannelAcceptModalOpen={isChannelAcceptModalOpen}
          showInviteChannelModal={showInviteChannelModal}
          onInviteChannelConfirm={onInviteChannelConfirm}
          onInviteChannelCancel={onInviteChannelCancel}
          isInviteChannelModalOpen={isInviteChannelModalOpen}
          invitedUsers={invitedUsers}
          updateInvitedUsers={updateInvitedUsers}
          MarkChannelViewed={MarkChannelViewed}
          user={user}
        />
      )}
    </Mutation>
  </Fragment>
);
