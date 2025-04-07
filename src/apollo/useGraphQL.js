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
// useGraphQL.js 개선 버전
import { useApolloClient } from '@apollo/client';
import { useState } from 'react';
import { gql } from '@apollo/client';
import Message from '../utils/message/Message';

export const useGraphQL = () => {
    const client = useApolloClient();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    /**
     * GraphQL 쿼리 실행 함수
     * 문자열 쿼리를 자동으로 gql로 변환하는 기능 추가
     *
     * @param {Object|String} options - 쿼리 옵션 객체 또는 쿼리 문자열
     * @param {Object} [variables] - 쿼리 변수 (옵션 객체를 사용하지 않는 경우)
     * @returns {Promise} 쿼리 결과 Promise
     */
    const executeQuery = async (options, variables) => {
        setLoading(true);
        setError(null);

        try {
            // 옵션이 객체인지 문자열인지 확인
            let queryObj;
            if (typeof options === 'object' && options.query) {
                // 객체 형태로 전달된 경우
                queryObj = {
                    query: typeof options.query === 'string' ? gql(options.query) : options.query,
                    variables: options.variables
                };
            } else {
                // 분리된 매개변수로 전달된 경우
                queryObj = {
                    query: typeof options === 'string' ? gql(options) : options,
                    variables
                };
            }

            // 요청 로깅
            console.log('Executing GraphQL query:', queryObj);

            const result = await client.query(queryObj);
            setData(result.data);
            return result;
        } catch (error) {
            console.error('GraphQL Query Error:', error);
            setError(error);

            // GraphQL 에러 메시지 추출 및 사용자 친화적인 메시지 표시
            const errorMessage = error.graphQLErrors?.[0]?.message ||
                error.networkError?.message ||
                '서버 연결 중 오류가 발생했습니다.';

            // 선택적으로 Message 컴포넌트 사용하여 UI에 에러 표시
            // Message.showError({message: errorMessage});

            throw error;
        } finally {
            setLoading(false);
        }
    };

    /**
     * GraphQL 뮤테이션 실행 함수
     * 문자열 뮤테이션을 자동으로 gql로 변환하는 기능 추가
     *
     * @param {Object|String} options - 뮤테이션 옵션 객체 또는 뮤테이션 문자열
     * @param {Object} [variables] - 뮤테이션 변수 (옵션 객체를 사용하지 않는 경우)
     * @returns {Promise} 뮤테이션 결과 Promise
     */
    const executeMutation = async (options, variables) => {
        setLoading(true);
        setError(null);

        try {
            // 옵션이 객체인지 문자열인지 확인
            let mutationObj;
            if (typeof options === 'object' && options.mutation) {
                // 객체 형태로 전달된 경우
                mutationObj = {
                    mutation: typeof options.mutation === 'string' ? gql(options.mutation) : options.mutation,
                    variables: options.variables
                };
            } else {
                // 분리된 매개변수로 전달된 경우
                mutationObj = {
                    mutation: typeof options === 'string' ? gql(options) : options,
                    variables
                };
            }

            // 요청 로깅
            console.log('Executing GraphQL mutation:', mutationObj);

            const result = await client.mutate(mutationObj);
            setData(result.data);
            return result;
        } catch (error) {
            console.error('GraphQL Mutation Error:', error);
            setError(error);

            // GraphQL 에러 메시지 추출 및 사용자 친화적인 메시지 표시
            const errorMessage = error.graphQLErrors?.[0]?.message ||
                error.networkError?.message ||
                '서버 연결 중 오류가 발생했습니다.';

            // 선택적으로 Message 컴포넌트 사용하여 UI에 에러 표시
            // Message.showError({message: errorMessage});

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