const { gql } = require("apollo-server-express");

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  scalar Date

  type Message {
    id: Int!
    text: String!
    user: User!
    dateSent: Date
    channelId: Int!
  }
  type MessageResponse {
    ok: Boolean!
    message: Message
    errors: [Error!]
  }
  type MessagesResponse {
    ok: Boolean!
    messages: [Message]
    errors: [Error!]
  }
  type TranscriptResponse {
    ok: Boolean!
    transcript: String
    errors: [Error!]
  }
  input MessageInput {
    channelId: Int!
    text: String!
  }
  type Query {
    messagesForChannel(channelId: Int!): MessagesResponse
  }
  type Mutation {
    sendMessageToChannel(message: MessageInput!): MessageResponse
    downloadChannelTranscript(channelId: Int!): TranscriptResponse
  }
  type Subscription {
    channelMessageAdded(channelId: Int!): MessageResponse!
  }
`;

module.exports = typeDefs;
