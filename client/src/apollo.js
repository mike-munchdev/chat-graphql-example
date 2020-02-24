import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';

import { split } from 'apollo-link';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';

export default async () => {
  try {
    // Create a HttpLink link:
    const httpLink = new HttpLink({
      uri: `http://localhost:4000/graphql`,
      credentials: 'same-origin'
    });

    const wsLink = new WebSocketLink({
      uri: `ws://localhost:4000/graphql`,
      options: {
        reconnect: true
      }
    });
    const link = split(
      ({ query }) => {
        const { kind, operation } = getMainDefinition(query);

        return kind === 'OperationDefinition' && operation === 'subscription';
      },
      wsLink,
      httpLink
    );

    return new ApolloClient({
      link,
      cache: new InMemoryCache()
    });
  } catch (e) {
    console.log(e);
    return;
  }
};
