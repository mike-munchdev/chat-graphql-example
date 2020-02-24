const { gql } = require("apollo-server-express");

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type ChannelNotificationType {
    id: Int!
    type: String!
    slug: String!
  }

  type ChannelNotificationTypeResponse {
    ok: Boolean!
    type: ChannelNotificationType
    errors: [Error!]
  }
  type ChannelNotificationTypesResponse {
    ok: Boolean!
    type: [ChannelNotificationType!]
    errors: [Error!]
  }
  type Query {
    channelNotificationTypes: ChannelNotificationTypesResponse!
    channelNotificationType: ChannelNotificationTypeResponse!
  }

  type Mutation {
    createChannelNotificationType(
      type: String!
    ): ChannelNotificationTypeResponse!
  }
`;

module.exports = typeDefs;
