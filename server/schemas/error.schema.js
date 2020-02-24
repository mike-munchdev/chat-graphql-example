const { gql } = require("apollo-server-express");

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Error {
    path: String
    message: String
  }
`;

module.exports = typeDefs;
