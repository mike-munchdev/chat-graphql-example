const { gql } = require("apollo-server-express");

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type ChannelMember {
    id: Int!
    user: User!
    channelId: Int!
    dateJoined: Date
    dateLeft: Date
  }

  type ChannelMembersResponse {
    ok: Boolean!
    members: [ChannelMember!]
    errors: [Error!]
  }

  type ChannelMemberResponse {
    ok: Boolean!
    member: ChannelMember
    errors: [Error!]
  }

  input CreateChannelMemberInput {
    channelId: Int!
    memberId: Int!
  }
  type Query {
    membersForChannel(channelId: Int!): ChannelMembersResponse!
  }

  type Mutation {
    createChannelMember(input: CreateChannelMemberInput): ChannelMemberResponse!
  }
`;

module.exports = typeDefs;
