const { gql } = require("apollo-server-express");

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  scalar Date
  type ChannelNotification {
    id: Int!
    notifiedBy: User!
    notified: User!
    channel: Channel!
    dateSent: Date!
    status: ChannelNotificationStatus
    type: ChannelNotificationType
    linkId: Int
    rejectedReason: String
    message: String
  }

  type ChannelNotificationsResponse {
    ok: Boolean!
    notifications: [ChannelNotification!]
    errors: [Error!]
  }

  type ChannelNotificationResponse {
    ok: Boolean!
    notification: ChannelNotification
    errors: [Error!]
  }

  type Query {
    notificationsByChannel(channelId: Int!): ChannelNotificationsResponse!
    myOpenChannelNotifications: ChannelNotificationsResponse!
  }

  input InvitationList {
    channelId: Int!
    users: [Int]!
  }

  input UpdateNotificationInput {
    notificationId: Int!
    status: String!
    rejectedReason: String
  }

  type Mutation {
    inviteUsersToChannel(
      invitations: InvitationList!
    ): ChannelNotificationsResponse
    updateChannelNotification(
      updates: UpdateNotificationInput!
    ): ChannelNotificationResponse!
  }

  type Subscription {
    channelNotificationAdded: ChannelNotificationResponse
  }
`;

module.exports = typeDefs;
