const { gql } = require("apollo-server-express");

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type ChannelNotificationStatus {
    id: Int!
    status: String!
    slug: String!
  }

  type ChannelNotificationStatusResponse {
    ok: Boolean!
    status: ChannelNotificationStatus
    errors: [Error!]
  }
  type ChannelNotificationStatusesResponse {
    ok: Boolean!
    status: [ChannelNotificationStatus!]
    errors: [Error!]
  }
  type Query {
    channelNotificationStatuses: ChannelNotificationStatusesResponse!
    channelNotificationStatus: ChannelNotificationStatusResponse!
  }

  type Mutation {
    createChannelNotificationStatus(
      status: String!
    ): ChannelNotificationStatusResponse!
  }
`;

module.exports = typeDefs;
