// require("./server/config/config");
const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const https = require('https');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const { ApolloServer } = require('apollo-server-express');

const typeDefs = require('./server/schemas/index');

// Provide resolver functions for your schema fields
const resolvers = require('./server/resolvers/index');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(express.static(path.join(__dirname, 'client/build')));
app.use(express.static(path.join(__dirname, 'public')));

const PORT = Number(process.env.PORT) || 4000;

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true
});

server.applyMiddleware({
  app,
  cors: true,
  bodyParserConfig: true
});

const httpServer = http.createServer(app);

server.installSubscriptionHandlers(httpServer);

httpServer.listen({ port: PORT }, () => {
  console.log(`🚀 Server ready at ${PORT}`);
  console.log(`🚀 GraphQL Server ready at ${PORT}${server.graphqlPath}`);
  console.log(
    `🚀 GraphQL Subscriptions ready at ${PORT}${server.subscriptionsPath}`
  );
});
