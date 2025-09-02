// Apollo Client setup

import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

export const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:4001";

export function createApolloClient() {
  const httpLink = new HttpLink({ uri: GRAPHQL_URL });

  const authLink = setContext((_, { headers }) => {
    if (typeof window === "undefined") return { headers };
    const token = localStorage.getItem("auth_token");
    return {
      headers: {
        ...headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };
  });

  return new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
    connectToDevTools: process.env.NODE_ENV !== "production",
  });
}
