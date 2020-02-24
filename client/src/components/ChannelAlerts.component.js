import React from 'react';

import FontAwesome from 'react-fontawesome';
import { Query } from 'react-apollo';
import {
  MY_OPEN_CHANNEL_NOTIFICATIONS,
  CHANNEL_NOTIFICATION_ADDED_SUBSCRIPTION
} from './channelQueries';
import { ChannelNotificationList } from './ChannelNotificationList.container';

const playAlertSound2 = (frequency, type, x) => {
  const context = new (window.AudioContext || window.webkitAudioContext)();
  const o = context.createOscillator();
  const g = context.createGain();
  o.type = type;
  o.connect(g);
  o.frequency.value = frequency;
  g.connect(context.destination);
  o.start(0);
  g.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + x);
};
export const ChannelAlerts = ({ setSelectedChannel, displayErrors }) => (
  <Query query={MY_OPEN_CHANNEL_NOTIFICATIONS}>
    {({ loading, error, data, subscribeToMore, ...result }) => {
      if (loading)
        return (
          <div className="notification-container">
            <FontAwesome
              name="spinner"
              spin
              style={{
                textShadow: '0 0.5px 0 rgba(0, 0, 0, 0.1)'
              }}
              size="lg"
              color="red"
            />
          </div>
        );

      if (error) {
        return (
          <div className="notification-container">
            <FontAwesome
              name="exclamation"
              size="lg"
              style={{
                color: 'red',
                textShadow: '0 0.5px 0 rgba(0, 0, 0, 0.1)'
              }}
            />
          </div>
        );
      }

      return (
        <ChannelNotificationList
          {...data}
          {...result}
          setSelectedChannel={setSelectedChannel}
          displayErrors={displayErrors}
          subscribeToNewNotifications={() =>
            subscribeToMore({
              document: CHANNEL_NOTIFICATION_ADDED_SUBSCRIPTION,
              updateQuery: (prev, { subscriptionData }) => {
                if (!subscriptionData.data) return prev;
                const newFeedItem =
                  subscriptionData.data.channelNotificationAdded.notification;

                const previousNotifications = prev
                  ? prev.myOpenChannelNotifications.notifications
                  : [];

                playAlertSound2(440, 'sine', 0.25);
                return {
                  myOpenChannelNotifications: {
                    ...prev.myOpenChannelNotifications,
                    notifications: [newFeedItem, ...previousNotifications]
                  }
                };
              }
            })
          }
        />
      );
    }}
  </Query>
);
