import React, { Fragment } from 'react';
import { Mutation } from 'react-apollo';
import { Button } from 'reactstrap';
import { SEND_MESSAGE_TO_CHANNEL } from './channelQueries';
import { sendMessageToChannelUpdate } from './mutationUpdates';
const showSendMessages = ({
  channel,
  canSend,
  handleChange,
  messageText,
  onAddMessageToChannel,
  SendMessageToChannel
}) => {
  return (
    <div className="chat-send-message">
      {channel && channel.channelStatus.status === 'Open' ? (
        <Fragment>
          <input
            type="text"
            className="form-control"
            placeholder="Type a message"
            name="messageText"
            id="messageTextInput"
            onChange={handleChange}
            value={messageText}
            onKeyPress={e => {
              if (e.key === 'Enter' && canSend) {
                onAddMessageToChannel(SendMessageToChannel);
              }
            }}
          />
          <Button
            color="primary"
            className="chat-button"
            onClick={e => onAddMessageToChannel(SendMessageToChannel)}
            disabled={!canSend}
          >
            Send
          </Button>
        </Fragment>
      ) : (
        ''
      )}
    </div>
  );
};
export const SendMessage = ({
  channel,
  onAddMessageToChannel,
  messageText,
  canSend,
  handleChange,
  filters,
  displayErrors
}) => {
  return (
    <Mutation
      mutation={SEND_MESSAGE_TO_CHANNEL}
      update={(cache, { data: { sendMessageToChannel } }) => {
        if (sendMessageToChannel.ok) {
          sendMessageToChannelUpdate({
            channel,
            sendMessageToChannel,
            cache,
            filters
          });
        } else {
          displayErrors(sendMessageToChannel.errors);
        }
      }}
    >
      {(SendMessageToChannel, args) => {
        return showSendMessages({
          channel,
          canSend,
          handleChange,
          messageText,
          onAddMessageToChannel,
          SendMessageToChannel,
          displayErrors
        });
      }}
    </Mutation>
  );
};
