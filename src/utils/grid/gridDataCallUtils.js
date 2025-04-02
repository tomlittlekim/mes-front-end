import Message from "../message/Message";

/**
 * 그리드 데이터 호출 관련 유틸리티 클래스(서버 호출 데이터만!)
 */
export class GridDataCallUtils {
    /**
     * 그리드의 초기 데이터를 로드
     * @param {Object} params
     * @param {Function} params.executeQuery - GraphQL 쿼리 실행 함수
     * @param {string} params.query - GraphQL 쿼리 문자열
     * @param {Function} params.setData - 데이터 설정 함수
     * @param {Function} params.setLoading - 로딩 상태 설정 함수
     * @param {Function} params.formatData - 데이터 포맷팅 함수
     * @param {Object} params.defaultFilter - 기본 필터 객체
     */
    static async loadInitialData({
        executeQuery,
        query,
        setData,
        setLoading,
        formatData,
        defaultFilter
    }) {
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
    }

    /**
     * 그리드 데이터 검색
     * @param {Object} params
     * @param {Function} params.executeQuery - GraphQL 쿼리 실행 함수
     * @param {string} params.query - GraphQL 쿼리 문자열
     * @param {Function} params.setData - 데이터 설정 함수
     * @param {Function} params.setRefreshKey - 그리드 새로고침 키 설정 함수
     * @param {Function} params.formatSearchParams - 검색 파라미터 포맷팅 함수
     */
    static async handleGridSearch({
        executeQuery,
        query,
        setData,
        formatData,
        setRefreshKey,
        formatSearchParams,
        searchParams
    }) {
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
    }

    /**
     * 그리드에 새로운 행을 추가
     * @param {Object} params
     * @param {Function} params.createNewRow - 새로운 행 데이터 생성 함수
     * @param {Function} params.setData - 데이터 설정 함수
     * @param {Array} params.currentData - 현재 데이터 배열
     */
    static handleGridAdd({
        createNewRow,
        setData,
        currentData
    }) {
        const newRow = createNewRow();
        setData([...currentData, newRow]);
    }

    /**
     * 그리드 데이터 저장
     * @param {Object} params
     * @param {Function} params.executeMutation - GraphQL mutation 실행 함수
     * @param {string} params.mutation - GraphQL mutation 문자열
     * @param {Function} params.setLoading - 로딩 상태 설정 함수
     * @param {Function} params.handleSearch - 검색 함수 (저장 후 목록 새로고침용)
     * @param {Array} params.data - 저장할 데이터 배열
     * @param {Object} params.searchParams - 검색 파라미터 (목록 새로고침용)
     */
    static async handleGridSave({
        executeMutation,
        mutation,
        setLoading,
        handleSearch,
        data,  // { createdRows, updatedRows } 형태로 전달됨
        searchParams
    }) {
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
    }

    /**
     * 그리드 데이터 삭제
     * @param {Object} params
     * @param {Function} params.executeMutation - GraphQL mutation 실행 함수
     * @param {string} params.mutation - GraphQL mutation 문자열
     * @param {Function} params.setLoading - 로딩 상태 설정 함수
     * @param {Function} params.handleSearch - 검색 함수 (삭제 후 목록 새로고침용)
     * @param {Array} params.data - 전체 데이터 배열
     * @param {Object} params.searchParams - 검색 파라미터 (목록 새로고침용)
     */
    static async handleGridDelete({
        executeMutation,
        mutation,
        setLoading,
        handleSearch,
        data,
        searchParams,
        setDataList,
        setAddRows,
        mutationData
    }) {
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
    }
}