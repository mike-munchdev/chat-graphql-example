const { gql } = require("apollo-server-express");

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type ChannelMessageStatus {
    id: Int!
    status: String!
  }

  type Query {
    channelMessageStatuses: [ChannelMessageStatus]
    channelMessageStatus(id: Int!): ChannelMessageStatus
  }

  type ChannelMessageStatusResponse {
    ok: Boolean!
    channelMessageStatus: ChannelMessageStatus
    errors: [Error!]
  }

  type Mutation {
    createChannelMessageStatus(
      channelStatus: String!
    ): ChannelMessageStatusResponse!
  }
`;

module.exports = typeDefs;
