import { useState, useCallback } from 'react';

/**
 * 그리드 행 관련 커스텀 훅
 */
export const useGridRow = ({
    createNewRow,
    formatNewRow,
    formatUpdatedRow,
    formatExistingRow
}) => {
    const [selectedRows, setSelectedRows] = useState([]);
    const [addRows, setAddRows] = useState([]);
    const [updatedRows, setUpdatedRows] = useState([]);

    /**
     * 행 선택 핸들러
     */
    const handleRowSelect = useCallback((params, dataList) => {
        const selectionArray = Array.isArray(params) ? params : [params];
        const selectedItems = dataList.filter(row => selectionArray.includes(row.id));
        setSelectedRows(selectedItems);
    }, []);

    /**
     * 행 업데이트 핸들러
     */
    const handleRowUpdate = useCallback((newRow, oldRow, setDataList) => {
        const isNewRow = oldRow.id.startsWith('NEW_');

        // 데이터 리스트 업데이트
        setDataList(prev => 
            prev.map(row => 
                row.id === oldRow.id ? newRow : row
            )
        );

        if (isNewRow) {
            // 신규 행인 경우 addRows 상태에 추가
            setAddRows(prevAddRows => {
                const existingIndex = prevAddRows.findIndex(
                    row => row.id === newRow.id
                );
                if (existingIndex !== -1) {
                    const updated = [...prevAddRows];
                    updated[existingIndex] = newRow;
                    return updated;
                }
                return [...prevAddRows, newRow];
            });
        } else {
            // 기존 행 수정인 경우
            setUpdatedRows(prevUpdatedRows => {
                const existingIndex = prevUpdatedRows.findIndex(
                    row => row.id === newRow.id
                );
                if (existingIndex !== -1) {
                    const updated = [...prevUpdatedRows];
                    updated[existingIndex] = newRow;
                    return updated;
                }
                return [...prevUpdatedRows, newRow];
            });
        }

        return newRow;
    }, []);

    /**
     * 행 추가 핸들러
     */
    const handleRowAdd = useCallback((setDataList) => {
        const newRow = createNewRow();
        setDataList(prev => [...prev, newRow]);
        setAddRows(prev => [...prev, newRow]);
    }, [createNewRow]);

    /**
     * 저장 데이터 포맷터
     */
    const formatSaveData = useCallback((addRows = [], updatedRows = []) => {
        const newRows = addRows.map(formatNewRow);
        const existingRows = updatedRows.map(formatUpdatedRow);

        return {
            createdRows: newRows,
            updatedRows: existingRows
        };
    }, [formatNewRow, formatUpdatedRow]);

    /**
     * 삭제 데이터 포맷터
     */
    const formatDeleteData = useCallback((data, formatExistingRow) => {
        if (!Array.isArray(data)) {
            return { newRows: [], existingRows: [] };
        }

        const newRows = data.filter(row => row?.id?.startsWith?.('NEW_'));
        const existingRows = data
            .filter(row => !row?.id?.startsWith?.('NEW_'))
            .map(formatExistingRow)
            .filter(row => row);

        return {
            newRows,
            existingRows
        };
    }, []);

    /**
     * 행 상태 초기화
     */
    const resetRows = useCallback(() => {
        setAddRows([]);
        setUpdatedRows([]);
    }, []);

    return {
        selectedRows,
        addRows,
        updatedRows,
        setAddRows,
        setUpdatedRows,
        setSelectedRows,
        handleRowSelect,
        handleRowUpdate,
        handleRowAdd,
        formatSaveData,
        formatDeleteData,
        resetRows
    };
}; 