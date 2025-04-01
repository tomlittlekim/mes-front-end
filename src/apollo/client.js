// src/apollo/client.js
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
    uri: 'http://localhost:8080/graphql',
    credentials: 'include' // CORS 설정
});

// 인증 헤더 추가
const authLink = setContext((_, { headers }) => {
    const token = localStorage.getItem('token'); // 또는 다른 인증 토큰
    return {
        headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : "",
        }
    };
});

export const client = new ApolloClient({
    link: authLink.concat(httpLink),
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