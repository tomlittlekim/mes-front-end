// src/apollo/client.js
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import {handleTokenExpiration} from "../utils/auth";

const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const GRAPHQL_URL = isLocalhost ? 'http://localhost:8080/graphql' : '/graphql';
const logoutLink = onError(({ networkError, graphQLErrors }) => {
    if (networkError?.statusCode === 401) {handleTokenExpiration();}
});


const httpLink = createHttpLink({
    uri: GRAPHQL_URL,
    credentials: 'include' // CORS 설정
});

// 인증 헤더 추가
const authLink = setContext((_, { headers }) => {
    return {
        headers: {
            ...headers,
            // authorization: token ? `Bearer ${token}` : "",
        }
    };
});

export const client = new ApolloClient({
    link: logoutLink.concat(authLink.concat(httpLink)),
    cache: new InMemoryCache(),
    defaultOptions: {
        watchQuery: {
            fetchPolicy: 'network-only',
            errorPolicy: 'ignore',
        },
        query: {
            fetchPolicy: 'network-only',
            errorPolicy: 'all',
        },
    }
});

export { ApolloProvider };