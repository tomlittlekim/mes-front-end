/**
 * 그리드 행 관련 핸들러 및 CUD 데이터를 포매팅하는 유틸리티 클래스
 */
export class GridRowUtils {
    /**
     * 행 선택 핸들러 생성
     * @param {Array} dataList - 전체 데이터 리스트
     * @param {Function} setSelectedItem - 선택된 아이템 설정 함수
     * @returns {Function} 행 선택 핸들러
     */
    static createRowSelectHandler(dataList, setSelectedItem) {
        return (params) => {
            const selectedItem = dataList.find(item => item.id === params.id);
            setSelectedItem(selectedItem);
        };
    }

    /**
     * 그리드 행 업데이트 핸들러 생성
     * @param {Function} setDataList - 데이터 리스트 설정 함수
     * @param {Function} setAddRows - 추가 행 설정 함수
     * @param {Function} setUpdatedRows - 수정 행 설정 함수
     * @returns {Function} 행 업데이트 핸들러
     */
    static createRowUpdateHandler(setDataList, setAddRows, setUpdatedRows) {
        return (newRow, oldRow) => {
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
        };
    }

    /**
     * 그리드 행 추가 핸들러 생성
     * @param {Function} createNewRow - 새로운 행 생성 함수
     * @param {Function} setDataList - 데이터 리스트 설정 함수
     * @param {Function} setAddRows - 추가 행 설정 함수
     * @returns {Function} 행 추가 핸들러
     */
    static createRowAddHandler(createNewRow, setDataList, setAddRows) {
        return () => {
            const newRow = createNewRow();
            setDataList(prev => [...prev, newRow]);
            setAddRows(prev => [...prev, newRow]);
        };
    }

    /**
     * 그리드 저장 데이터 포맷팅 함수 생성
     * @param {Function} formatNewRow - 신규 행 포맷팅 함수
     * @param {Function} formatUpdatedRow - 수정 행 포맷팅 함수
     * @returns {Function} 포맷팅된 저장 데이터를 반환하는 함수
     */
    static createSaveDataFormatter(formatNewRow, formatUpdatedRow) {
        return (addRows = [], updatedRows = []) => {
            const newRows = addRows.map(formatNewRow);
            const existingRows = updatedRows.map(formatUpdatedRow);

            return {
                createdRows: newRows,
                updatedRows: existingRows
            };
        };
    }

    /**
     * 그리드 삭제 데이터 포맷팅 함수 생성
     * @param {Function} formatExistingRow - 기존 행 포맷팅 함수
     * @returns {Function} 포맷팅된 삭제 데이터를 반환하는 함수
     */
    static createDeleteDataFormatter(formatExistingRow) {
        return (rows) => {
            const newRows = rows.filter(row => row.id.startsWith('NEW_'));
            const existingRows = rows
                .filter(row => !row.id.startsWith('NEW_'))
                .map(formatExistingRow);

            return {
                newRows,
                existingRows
            };
        };
    }
}
