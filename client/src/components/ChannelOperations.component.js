import React, { Fragment } from 'react';
import { Mutation } from 'react-apollo';
import { Button } from 'reactstrap';
import ChannelCloseModal from './ChannelCloseModal.component';
import { CLOSE_EXTERNAL_CHANNEL } from './channelQueries';

const displayOperationMessage = ({ channel }) => {
  if (channel.flaggedReason) {
    return (
      <span>
        <strong>Flagged Reason:</strong>
        {'  '}
        <em>{channel.flaggedReason}</em>
      </span>
    );
  }
  return <Fragment />;
};
export const ChannelOperations = ({
  showCloseChannelModal,
  isChannelCloseModalOpen,
  onCloseChannelCancel,
  onCloseChannelConfirm,
  channel,
  filters,
  canClose,
  closedReason,
  handleChange
}) => {
  return (
    <Mutation mutation={CLOSE_EXTERNAL_CHANNEL}>
      {(CloseExternalChannel, args) => (
        <div className="chat-operation-buttons">
          {channel && filters.status !== 'closed' ? (
            <Fragment>
              <div className="chat-operation-message">
                {displayOperationMessage({ channel })}
              </div>
              <div className="chat-operation-button">
                <Button
                  color="primary"
                  className="chat-button"
                  onClick={e => {
                    showCloseChannelModal();
                  }}
                >
                  Close
                </Button>
              </div>
            </Fragment>
          ) : (
            <Fragment />
          )}
          <ChannelCloseModal
            isChannelCloseModalOpen={isChannelCloseModalOpen}
            handleCancel={onCloseChannelCancel}
            handleConfirm={onCloseChannelConfirm}
            title="Close Channel"
            CloseExternalChannel={CloseExternalChannel}
            canClose={canClose}
            closedReason={closedReason}
            handleChange={handleChange}
          />
        </div>
      )}
    </Mutation>
  );
};
