"use client";


import { ApolloProvider } from "@apollo/client/react";
import { useMemo } from "react";
import { createApolloClient } from "@/lib/apolloClient";

export default function Providers({ children }) {
  const client = useMemo(() => createApolloClient(), []);
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
