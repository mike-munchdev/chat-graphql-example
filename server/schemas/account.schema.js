const { gql } = require("apollo-server-express");

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Account {
    id: Int!
    accountName: String!
    accountAcronym: String
  }
`;

module.exports = typeDefs;
