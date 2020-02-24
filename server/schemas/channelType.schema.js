const { gql } = require("apollo-server-express");

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type ChannelType {
    id: Int!
    type: String!
  }

  type Query {
    channelTypes: [ChannelType]
    channelType(id: Int!): ChannelType
    externalChannelTypes: [ChannelType]
  }

  type ChannelTypeResponse {
    ok: Boolean!
    channelType: ChannelType
    errors: [Error!]
  }

  type Mutation {
    createChannelType(channelType: String!): ChannelTypeResponse!
  }
`;

module.exports = typeDefs;
