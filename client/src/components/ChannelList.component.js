import React, { Fragment } from 'react';

import { Mutation } from 'react-apollo';
import {
  ACCEPT_EXTERNAL_CHANNEL,
  INVITE_USERS_TO_CHANNEL
} from './channelQueries';

import ChannelAcceptModal from './ChannelAcceptModal.component';
import ChannelInviteModal from './ChannelInviteModal.component';
import { Channel } from './Channel.component';

export const ChannelList = ({
  channelList,
  onChannelSelected,
  selectedChannel,
  showAcceptChannelModal,
  onAcceptChannelConfirm,
  onAcceptChannelCancel,
  isChannelAcceptModalOpen,
  showInviteChannelModal,
  isInviteChannelModalOpen,
  onInviteChannelConfirm,
  onInviteChannelCancel,
  invitedUsers,
  updateInvitedUsers,
  MarkChannelViewed,
  user
}) => {
  const listFound = channelList && channelList[0];

  return (
    <Mutation mutation={ACCEPT_EXTERNAL_CHANNEL}>
      {(AcceptExternalChannel, args) => (
        <Mutation mutation={INVITE_USERS_TO_CHANNEL}>
          {(InviteUsersToChannel, args) => (
            <Fragment>
              <div className="chat-inbox">
                {listFound
                  ? channelList.map(c => (
                      <Channel
                        key={c.id}
                        channel={c}
                        onChannelSelected={onChannelSelected}
                        selectedChannel={selectedChannel}
                        showAcceptChannelModal={showAcceptChannelModal}
                        showInviteChannelModal={showInviteChannelModal}
                        MarkChannelViewed={MarkChannelViewed}
                        user={user}
                      />
                    ))
                  : null}
              </div>
              <ChannelAcceptModal
                isChannelAcceptModalOpen={isChannelAcceptModalOpen}
                handleCancel={onAcceptChannelCancel}
                handleConfirm={onAcceptChannelConfirm}
                title="Accept Channel"
                AcceptExternalChannel={AcceptExternalChannel}
                channel={selectedChannel}
              />
              <ChannelInviteModal
                isInviteChannelModalOpen={isInviteChannelModalOpen}
                handleCancel={onInviteChannelCancel}
                handleConfirm={onInviteChannelConfirm}
                title="Invite Channel"
                InviteUsersToChannel={InviteUsersToChannel}
                channel={selectedChannel}
                invitedUsers={invitedUsers}
                updateInvitedUsers={updateInvitedUsers}
              />
            </Fragment>
          )}
        </Mutation>
      )}
    </Mutation>
  );
};
