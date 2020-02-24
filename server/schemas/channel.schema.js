const { gql } = require("apollo-server-express");

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  scalar Date
  type Channel {
    id: Int!
    name: String!
    channelType: ChannelType!
    channelStatus: ChannelStatus!
    account: Account
    createdBy: User!
    createdAt: Date!
    lastModifiedBy: User!
    lastModifiedAt: Date!

    lastMessageSnippet: String
    assignedTo: User
    members: [ChannelMember!]
    messages: [Message!]
    closedReason: String
    flaggedReason: String
    uniqueId: String!
    friendlyName: String
    lastViews: [LastView!]
    unreadMessageCount: Int
  }

  type LastView {
    id: Int!
    userId: Int!
    channelId: Int!
    lastViewedAt: Date!
  }

  input ChannelMemberInput {
    id: Int!
    firstNameLastName: String!
  }
  input ChannelsFilterInput {
    assigned: String
    status: String
    keywords: String
    members: [ChannelMemberInput!]
    startDate: Date
    endDate: Date
    uniqueId: String
  }

  type ChannelsResponse {
    ok: Boolean!
    channels: [Channel]
    errors: [Error!]
  }
  type ChannelResponse {
    ok: Boolean!
    channel: Channel
    errors: [Error!]
  }
  type ChannelUpdatedResponse {
    ok: Boolean!
    channel: Channel
    errors: [Error!]
    updatePerformed: String!
  }
  type SimpleResponse {
    ok: Boolean!
    errors: [Error!]
  }
  type Query {
    getChannelByUniqueId(id: String!): ChannelResponse
    getChannelsWithFilters(filters: ChannelsFilterInput): ChannelsResponse!
  }

  type Mutation {
    createExternalChannel(
      channelTypeId: Int!
      channelDescription: String!
    ): ChannelResponse!
    closeExternalChannel(channelId: Int!, reason: String!): ChannelResponse!
    acceptExternalChannel(channelId: Int!): ChannelResponse!
    markChannelViewed(channelId: Int!): ChannelResponse!
    flagExternalChannel(channelId: Int!, reason: String!): ChannelResponse!
  }

  type Subscription {
    channelUpdated: ChannelUpdatedResponse!
    channelAdded: ChannelResponse!
  }
`;

module.exports = typeDefs;
