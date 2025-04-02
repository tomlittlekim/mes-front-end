// src/apollo/client.js
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
    uri: 'http://localhost:8080/graphql',
    credentials: 'include' // CORS 설정
});

// 쿠키에서 JWT 토큰 가져오기 함수
const getJwtToken = () => {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith('jwt=')) {
            return cookie.substring(4); // 'jwt=' 이후의 값
        }
    }
    return null;
};

// 인증 헤더 추가
const authLink = setContext((_, { headers }) => {
    const token = getJwtToken();
    
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