import React from "react";
import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  HttpLink,
} from "apollo-boost";
import { ApolloProvider } from "@apollo/react-hooks";

import App from "./App";

const httpLink = new HttpLink({
  uri: "http://localhost:5000/api",
});

// Following authLink function is from: https://www.apollographql.com/docs/react/v2/networking/network-layer/
let authLink = new ApolloLink((operation, forward) => {
  // get the authentication token from local storage if it exists
  let token = localStorage.getItem("token");

  // return the headers to the context so httpLink can read them
  operation.setContext({
    headers: {
      authorization: token ? `Bearer ${token}` : "",
    },
  });

  return forward(operation);
});

export let cl = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export default (
  <ApolloProvider client={cl}>
    <App />
  </ApolloProvider>
);
