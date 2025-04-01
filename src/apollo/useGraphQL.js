/**
 * GraphQL 쿼리와 뮤테이션을 실행하기 위한 커스텀 훅
 *
 * @description
 * Apollo Client의 useApolloClient를 래핑하여 쿼리와 뮤테이션 실행을 단순화하는 훅입니다.
 * 컴포넌트에서 GraphQL 작업을 수행할 때 반복되는 코드를 줄이고 일관된 에러 처리를 제공합니다.
 *
 * @example
 * const { executeQuery, executeMutation } = useGraphQL();
 *
 * // 쿼리 실행
 * const result = await executeQuery(MY_QUERY, { variables });
 *
 * // 뮤테이션 실행
 * const result = await executeMutation(MY_MUTATION, { variables });
 *
 * @returns {Object} executeQuery와 executeMutation 함수를 포함하는 객체
 */
import { useApolloClient } from '@apollo/client';
import { useState } from 'react';

export const useGraphQL = () => {
    const client = useApolloClient();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    const executeQuery = async (query, variables) => {
        setLoading(true);
        setError(null);
        try {
            const result = await client.query({
                query,
                variables
            });
            setData(result.data);
            return result;
        } catch (error) {
            setError(error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const executeMutation = async (mutation, variables) => {
        setLoading(true);
        setError(null);
        try {
            const result = await client.mutate({
                mutation,
                variables
            });
            setData(result.data);
            return result;
        } catch (error) {
            setError(error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return {
        executeQuery,
        executeMutation,
        loading,
        error,
        data
    };
};