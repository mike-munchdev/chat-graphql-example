import React, { Fragment } from 'react';
import { Query } from 'react-apollo';
import FontAwesome from 'react-fontawesome';
import {
  GET_MESSAGES_FOR_CHANNEL,
  CHANNEL_MESSAGE_ADDED_SUBSCRIPTION
} from './channelQueries';
import { ErrorList } from './ErrorList.component';
import ChannelMessageHistory from './ChannelMessageHistory.component';

export const ChannelMessages = ({
  channel,
  user,
  canView,
  scrollToBottom,
  displayErrors
}) => {
  return channel ? (
    <Query
      query={GET_MESSAGES_FOR_CHANNEL}
      variables={{ channelId: channel.id }}
      fetchPolicy="network-only"
    >
      {({ loading, error, data, subscribeToMore, ...result }) => {
        if (loading)
          return (
            <FontAwesome
              name="spinner"
              spin
              style={{
                textShadow: '0 0.5px 0 rgba(0, 0, 0, 0.1)'
              }}
            />
          );

        if (error) return <ErrorList errors={[error]} />;

        if (!data.messagesForChannel.ok)
          return <ErrorList errors={data.messagesForChannel.errors} />;

        return (
          <Fragment>
            {channel && canView ? (
              <ChannelMessageHistory
                scrollToBottom={scrollToBottom}
                {...data}
                {...result}
                user={user}
                subscribeToNewMessages={() =>
                  subscribeToMore({
                    variables: {
                      channelId: channel.id
                    },
                    document: CHANNEL_MESSAGE_ADDED_SUBSCRIPTION,
                    updateQuery: (prev, { subscriptionData }) => {
                      if (!subscriptionData.data) return prev;
                      const newFeedItem =
                        subscriptionData.data.channelMessageAdded.message;

                      const previousMessages = prev
                        ? prev.messagesForChannel.messages
                        : [];

                      return {
                        messagesForChannel: {
                          ...prev.messagesForChannel,
                          messages: [newFeedItem, ...previousMessages]
                        }
                      };
                    }
                  })
                }
              />
            ) : (
              <div />
            )}
          </Fragment>
        );
      }}
    </Query>
  ) : (
    <div className="chat-history-container" />
  );
};
