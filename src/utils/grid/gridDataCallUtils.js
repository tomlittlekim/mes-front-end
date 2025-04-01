import Message from "../message/Message";
import {useEffect} from "react";

/**
 * 그리드의 초기 데이터를 로드하는 공통 함수
 * @param {Object} params
 * @param {Function} params.executeQuery - GraphQL 쿼리 실행 함수
 * @param {string} params.query - GraphQL 쿼리 문자열
 * @param {Function} params.setData - 데이터 설정 함수
 * @param {Function} params.setLoading - 로딩 상태 설정 함수
 * @param {Function} params.formatData - 데이터 포맷팅 함수
 * @param {Object} params.defaultFilter - 기본 필터 객체
 */
export const loadInitialData = async ({
                                          executeQuery,
                                          query,
                                          setData,
                                          setLoading,
                                          formatData,
                                          defaultFilter
                                      }) => {
    try {
        const result = await executeQuery(query, { filter: defaultFilter });

        if (result.data) {
            setData(formatData(result.data));
        }
    } catch (error) {
        Message.showError(error);
    } finally {
        setLoading(false);
    }
};

/**
 * 그리드 데이터 검색을 위한 공통 함수
 * @param {Object} params
 * @param {Function} params.executeQuery - GraphQL 쿼리 실행 함수
 * @param {string} params.query - GraphQL 쿼리 문자열
 * @param {Function} params.setData - 데이터 설정 함수
 * @param {Function} params.setRefreshKey - 그리드 새로고침 키 설정 함수
 * @param {Function} params.formatSearchParams - 검색 파라미터 포맷팅 함수
 */
export const handleGridSearch = async ({
                                           executeQuery,
                                           query,
                                           setData,
                                           formatData,
                                           setRefreshKey,
                                           formatSearchParams,
                                           searchParams
                                       }) => {
    try {
        const result = await executeQuery(query, {
            filter: formatSearchParams(searchParams)
        });

        if (result.data) {
            setData(formatData(result.data));
            setRefreshKey(prev => prev + 1);
        }
    } catch (error) {
        Message.showError(error);
    }
};

/**
 * 그리드에 새로운 행을 추가하는 공통 함수
 * @param {Object} params
 * @param {Function} params.createNewRow - 새로운 행 데이터 생성 함수
 * @param {Function} params.setData - 데이터 설정 함수
 * @param {Array} params.currentData - 현재 데이터 배열
 */
export const handleGridAdd = ({
                                  createNewRow,
                                  setData,
                                  currentData
                              }) => {
    const newRow = createNewRow();
    setData([...currentData, newRow]);
};

/**
 * 그리드 데이터 저장을 위한 공통 함수
 * @param {Object} params
 * @param {Function} params.executeMutation - GraphQL mutation 실행 함수
 * @param {string} params.mutation - GraphQL mutation 문자열
 * @param {Function} params.setLoading - 로딩 상태 설정 함수
 * @param {Function} params.handleSearch - 검색 함수 (저장 후 목록 새로고침용)
 * @param {Array} params.data - 저장할 데이터 배열
 * @param {Object} params.searchParams - 검색 파라미터 (목록 새로고침용)
 */
export const handleGridSave = async ({
                                         executeMutation,
                                         mutation,
                                         setLoading,
                                         handleSearch,
                                         data,  // { createdRows, updatedRows } 형태로 전달됨
                                         searchParams
                                     }) => {
    if (!data.createdRows?.length && !data.updatedRows?.length) {
        Message.showWarning(Message.NO_DATA_TO_SAVE);
        return;
    }

    setLoading(true);
    try {
        await executeMutation(mutation, data);

        Message.showSuccess(Message.SAVE_SUCCESS);
        handleSearch(searchParams); // 저장 후 목록 새로고침
    } catch (error) {
        Message.showError(error);
    } finally {
        setLoading(false);
    }
};

/**
 * 그리드 데이터 삭제를 위한 공통 함수
 * @param {Object} params
 * @param {Function} params.executeMutation - GraphQL mutation 실행 함수
 * @param {string} params.mutation - GraphQL mutation 문자열
 * @param {Function} params.setLoading - 로딩 상태 설정 함수
 * @param {Function} params.handleSearch - 검색 함수 (삭제 후 목록 새로고침용)
 * @param {Array} params.data - 전체 데이터 배열
 * @param {Object} params.searchParams - 검색 파라미터 (목록 새로고침용)
 */
export const handleGridDelete = async ({
    executeMutation,
    mutation,
    setLoading,
    handleSearch,
    data,
    searchParams,
    setDataList,
    setAddRows,
    mutationData
}) => {
    if (!data?.length) {
        Message.showWarning(Message.NO_SELECTED_ROWS);
        return;
    }

    Message.showDeleteConfirm(async () => {
        setLoading(true);
        try {
            // 신규 행은 클라이언트에서만 제거
            const newRows = data.filter(row => row.id.startsWith('NEW_'));
            if (newRows.length > 0) {
                setDataList(prev => prev.filter(row => !newRows.some(newRow => newRow.id === row.id)));
                setAddRows(prev => prev.filter(row => !newRows.some(newRow => newRow.id === row.id)));
            }

            // 기존 행은 서버에 삭제 요청
            const existingRows = data.filter(row => !row.id.startsWith('NEW_'));
            if (existingRows.length > 0) {
                await executeMutation(mutation, mutationData);
            }

            Message.showSuccess(Message.DELETE_SUCCESS);
            handleSearch(searchParams); // 삭제 후 목록 새로고침
        } catch (error) {
            Message.showError(error);
        } finally {
            setLoading(false);
        }
    });
};

/**
 * 데이터 변경 감지 및 그리드 업데이트를 위한 공통 useEffect
 * @param {Object} params
 * @param {Object} params.data - GraphQL 응답 데이터
 * @param {Function} params.setData - 데이터 설정 함수
 * @param {Function} params.setLoading - 로딩 상태 설정 함수
 * @param {Function} params.formatData - 데이터 포맷팅 함수
 */
export const useGridDataEffect = ({
                                      data,
                                      setData,
                                      setLoading,
                                      formatData
                                  }) => {
    useEffect(() => {
        if (data) {
            const formattedData = formatData(data);
            setData(formattedData);
            setLoading(false);
        }
    }, [data]);
};