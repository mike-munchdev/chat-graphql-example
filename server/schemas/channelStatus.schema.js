const { gql } = require("apollo-server-express");

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type ChannelStatus {
    id: Int!
    status: String!
  }

  type ChannelStatusResponse {
    ok: Boolean!
    status: ChannelStatus
    errors: [Error!]
  }

  type ChannelStatusesResponse {
    ok: Boolean!
    statuses: [ChannelStatus!]
    errors: [Error!]
  }

  type Query {
    getChannelStatuses: ChannelStatusesResponse!
    getChannelStatus: ChannelStatusResponse!
  }

  type Mutation {
    createChannelStatus(channelStatus: String!): ChannelStatusResponse!
  }
`;

module.exports = typeDefs;
