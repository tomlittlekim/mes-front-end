import { useState, useCallback } from 'react';
import Message from "../message/Message";

/**
 * 그리드 데이터 호출 관련 커스텀 훅
 */
export const useGridDataCall = ({
    executeQuery,
    executeMutation,
    query,
    mutation,
    deleteMutation,
    formatData,
    defaultFilter = {},
    onSuccess,
    clearAddRows,
    clearUpdatedRows
}) => {
    const [loading, setLoading] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    /** 데이터 새로고침 */
    const refresh = useCallback(
        async (customFilter = {}) => {
            try {
                setLoading(true);
                const filter = { ...defaultFilter, ...customFilter }; // Merge defaultFilter with customFilter
                
                // 필터가 비어있는 경우 기본값으로 설정
                if (Object.keys(filter).length === 0) {
                    return [];
                }

                const result = await executeQuery(query, { filter });
                return result.data ? formatData(result.data) : [];
            } catch (error) {
                Message.showError(Message.SERVER_ERROR);
                return [];
            } finally {
                setLoading(false);
            }
        },
        [executeQuery, query, defaultFilter, formatData]
    );

    /**
     * 그리드 데이터 검색
     */
    const handleGridSearch = useCallback(async (searchParams) => {
        try {
            setLoading(true);
            const result = await executeQuery(query, { filter: searchParams });
            return result.data ? formatData(result.data) : [];
        } catch (error) {
            Message.showError(Message.SERVER_ERROR);
            return [];
        } finally {
            setLoading(false);
        }
    }, [executeQuery, query, formatData]);

    /**
     * 그리드 데이터 저장
     */
    const handleGridSave = useCallback(async (mutationData) => {
        try {
            setLoading(true);
            const result = await executeMutation(mutation, mutationData);
            if (result.data) {
                Message.showSuccess(Message.SAVE_SUCCESS);
                await onSuccess?.();
                clearAddRows?.();
                clearUpdatedRows?.();
                setRefreshKey(prev => prev + 1);
            }
            return result;
        } catch (error) {
            Message.showError(Message.ERROR_DURING_SAVE);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [executeMutation, mutation, onSuccess, clearAddRows, clearUpdatedRows]);

    /**
     * 그리드 데이터 삭제
     * 기본 메세지는 DELETE_CONFIRM 이지만, 원하는 다른 형태의 메세지가 있다면 customMessage 속성을 사용하면 됩니다.
     */
    const handleGridDelete = useCallback(async ({mutationData, setDataList, newRows = [], customMessage = {}, refreshFilter = {}}) => {
        Message.showDeleteConfirm(async () => {
            try {
                setLoading(true);

                // 신규 행 삭제 (클라이언트에서만 처리)
                if (newRows.length > 0) {
                    setDataList(prev => prev.filter(row => !newRows.some(newRow => newRow.id === row.id)));
                    clearAddRows?.();
                }

                // 기존 행 삭제 (서버로 요청)
                if (mutationData) {
                    await executeMutation(deleteMutation, mutationData);
                    Message.showSuccess(Message.DELETE_SUCCESS);

                    // 삭제 후 데이터 갱신
                    const result = await refresh(refreshFilter);
                    if (result && setDataList) {
                        setDataList(result);
                    }
                }

                setRefreshKey(prev => prev + 1);
            } catch (error) {
                Message.showError(Message.ERROR_DURING_DELETE);
            } finally {
                setLoading(false);
            }
        }, customMessage);
    }, [executeMutation, deleteMutation, refresh, clearAddRows]);

    return {
        loading,
        refresh,
        handleGridSearch,
        handleGridSave,
        handleGridDelete,
    };
}; 