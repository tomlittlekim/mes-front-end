import { useState, useCallback } from 'react';
import {getGridCodes, getGridCodeList, getInitialCodes} from "../../api/standardInfo/commonCodeApi";

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
    const [addRows = [], setAddRows] = useState([]);
    const [updatedRows = [], setUpdatedRows] = useState([]);

    /**
     * 행 선택 핸들러
     */
    const handleRowSelect = useCallback((newSelection, dataList) => {
        const selectionArray = Array.isArray(newSelection) ? newSelection : [newSelection];
        const selectedItems = dataList.filter(row => selectionArray.includes(row.id));
        setSelectedRows(selectedItems);
    }, []);

    /**
     * 행 업데이트 핸들러
     */
    const handleRowUpdate = useCallback((newRow, oldRow, setDataList) => {
        setDataList(prev => prev?.map(row => row.id === oldRow.id ? newRow : row));

        const isNewRow = oldRow.id.startsWith('NEW_');
        if (isNewRow) {
            setAddRows(prev => {
                const existingIndex = prev?.findIndex(row => row.id === oldRow.id) ?? -1 ;
                return existingIndex >= 0
                    ? prev?.map((row, i) => i === existingIndex ? newRow : row)
                    : [newRow, ...(prev || [])];
            });
        } else {
            setUpdatedRows(prev => {
                const existingIndex = prev?.findIndex(row => row.id === oldRow.id) ?? -1;
                return existingIndex >= 0
                    ? prev?.map((row, i) => i === existingIndex ? newRow : row)
                    : [newRow, ...(prev || [])];
            });
        }
        return newRow;
    }, []);

    /**
     * 행 추가 핸들러
     */
    const handleRowAdd = useCallback((setDataList) => {
        const newRow = createNewRow();
        setDataList(prev => {
            const safePrev = Array.isArray(prev) ? prev : [];
            return [newRow, ...safePrev];
        });
        setAddRows(prev => {
            const safePrev = Array.isArray(prev) ? prev : [];
            return [newRow, ...safePrev];
        });
    }, [createNewRow]);

    /**
     * 저장 데이터 포맷터
     */
    const formatSaveData = useCallback((addRows, updatedRows) => ({
        createdRows: (addRows || []).map(row => formatNewRow(row)),
        updatedRows: (updatedRows || []).map(row => formatUpdatedRow(row))
    }), [formatNewRow, formatUpdatedRow]);

    /**
     * 삭제 데이터 포맷터
     */
    const formatDeleteData = useCallback((selectedRows) => ({
        newRows: selectedRows.filter(row => row.id.startsWith('NEW_')),
        existingRows: selectedRows
        .filter(row => !row.id.startsWith('NEW_'))
        .map(row => formatExistingRow(row))
    }), [formatExistingRow]);

    return {
        selectedRows,
        addRows,
        updatedRows,
        setAddRows,
        setUpdatedRows,
        handleRowSelect,
        handleRowUpdate,
        handleRowAdd,
        formatSaveData,
        formatDeleteData
    };
};

/**
 * 공통코드를 불러오는 메소드
 * */
export function fetchGridCodesByCodeClassId(codeClassId, setOptions) {
    getGridCodes(codeClassId)
    .then((options) => {
        if (options.errors) {
            console.error(options.errors);
        } else {
            setOptions(options);
        }
    })
    .catch((err) => console.error(err));
}

export function fetchDefaultCodesByCodeClassId(codeClassId, setOptions) {
    getInitialCodes(codeClassId)
    .then((options) => {
        if (options.errors) {
            console.error(options.errors);
        } else {
            setOptions(options);
        }
    })
    .catch((err) => console.error(err));
}

/**
 * DataGrid의 다중 행 선택 모델을 관리하는 커스텀 훅
 *
 * @param {string[]} initialModel 초기 선택 ID 배열 (기본: 빈 배열)
 * @param rowSetters
 * @returns {{
 *   selectionModel: string[],
 *   onSelectionModelChange: (newModel: string[]) => void,
 *   clearSelection: () => void
 *   removeSelectedRows: () => void
 * }}
 */
export function useSelectionModel(
    initialModel = [],
    ...rowSetters // setAddCodeRows, setUpdatedCodeRows, setCodes
) {
    const [selectionModel, setSelectionModel] = useState(initialModel);

    const onSelectionModelChange = useCallback(newModel => {
        setSelectionModel(newModel);
    }, []);

    const clearSelection = useCallback(() => {
        setSelectionModel([]);
    }, []);

    // 훅 안에서 일반 콜백 함수로 선언
    const removeSelectedRows = useCallback((ids) => {
        rowSetters.forEach(setFn =>
            setFn(prev => prev.filter(row => !ids.includes(row.id)))
        );
    }, [rowSetters]);

    return {
        selectionModel,
        onSelectionModelChange,
        clearSelection,
        removeSelectedRows
    };
}
