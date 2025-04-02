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
    defaultFilter,
    onSuccess,
    onDeleteSuccess,
    clearAddRows,
    clearUpdatedRows
}) => {
    const [loading, setLoading] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const refresh = useCallback(async () => {
        try {
            setLoading(true);
            const result = await executeQuery(query, { filter: defaultFilter });
            if (result.data) {
                return formatData(result.data);
            }
            return [];
        } catch (error) {
            Message.showError(Message.SERVER_ERROR);
            return [];
        } finally {
            setLoading(false);
        }
    }, [executeQuery, query, defaultFilter, formatData]);

    /**
     * 그리드의 초기 데이터를 로드
     */
    const loadInitialData = useCallback(async () => {
        return refresh();
    }, [refresh]);

    /**
     * 그리드 데이터 검색
     */
    const handleGridSearch = useCallback(async (searchParams) => {
        try {
            setLoading(true);
            const result = await executeQuery(query, { filter: searchParams });
            if (result.data) {
                return formatData(result.data);
            }
            return [];
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
                setRefreshKey(prev => prev + 1);
                if (onSuccess) {
                    await onSuccess();
                }
                // 저장 성공 후 addRows와 updatedRows 초기화
                if (clearAddRows) {
                    clearAddRows();
                }
                if (clearUpdatedRows && typeof clearUpdatedRows === 'function') {
                    clearUpdatedRows();
                }
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
     */
    const handleGridDelete = useCallback(async ({data, setDataList, clearAddRows, mutationData, searchParams}) => {
        Message.showDeleteConfirm(async () => {
            try {
                setLoading(true);
                await executeMutation(deleteMutation, mutationData);
                Message.showSuccess(Message.DELETE_SUCCESS);
                if (onDeleteSuccess) {
                    onDeleteSuccess();
                }
                if (setDataList) {
                    const result = await executeQuery(query, { filter: searchParams });
                    if (result.data) {
                        setDataList(formatData(result.data));
                    }
                }
                if (clearAddRows) {
                    clearAddRows();
                }
            } catch (error) {
                Message.showError(Message.ERROR_DURING_DELETE);
            } finally {
                setLoading(false);
            }
        });
    }, [executeQuery, executeMutation, query, deleteMutation, formatData, onDeleteSuccess]);

    return {
        loading,
        refreshKey,
        refresh,
        loadInitialData,
        handleGridSearch,
        handleGridSave,
        handleGridDelete
    };
}; 