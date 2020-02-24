const { gql } = require('apollo-server-express');

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type User {
    id: Int!
    email: String!
    userName: String!
    active: Boolean
  }

  type UsersResponse {
    ok: Boolean!
    users: [User]
    errors: [Error!]
  }

  type Query {
    users: UsersResponse
  }
`;

module.exports = typeDefs;
