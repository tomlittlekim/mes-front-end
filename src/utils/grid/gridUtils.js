/**
 * 고유 ID 생성 함수(MUI Grid 특성 상 행마다 id가 존재해야 함)
 * @param {string} prefix - ID 접두사 (예: 'NEW', 'TEMP')
 * @returns {string} 생성된 고유 ID
 */
export const generateId = (prefix = 'NEW') => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `${prefix}_${timestamp}_${random}`;
};

/**
 * 날짜를 YYYY-MM-DD 형식으로 변환(datePicker에서 사용)
 * @param {Date} date - 변환할 날짜
 * @returns {string} YYYY-MM-DD 형식의 날짜 문자열
 */
export const formatDateToYYYYMMDD = (date) => {
    return date ? date.toISOString().split('T')[0] : null;
};

/**
 * 현재 날짜를 YYYY-MM-DD 형식으로 반환
 * @returns {string} YYYY-MM-DD 형식의 현재 날짜
 */
export const getCurrentDate = () => {
    return formatDateToYYYYMMDD(new Date());
};

/**
 * flagActive 값을 Y/N 형식으로 변환
 * @param {boolean|null} value - 변환할 flagActive 값
 * @returns {string} 'Y' 또는 'N'
 */
export const formatFlagActive = (value) => {
    if (value === null) return 'N';
    return value ? 'Y' : 'N';
};

/**
 * 그리드 데이터 포맷팅
 * @param {Object} data - 원본 데이터
 * @param {string} dataKey - 데이터 키 (예: 'materials')
 * @param {Function} formatter - 각 항목 포맷팅 함수
 * @returns {Array} 포맷팅된 데이터 배열
 */
export const formatGridData = (data, dataKey, formatter) => {
    if (!data?.[dataKey]) return [];
    return data[dataKey].map(formatter);
};

/**
 * 행 선택 핸들러 생성
 * @param {Array} dataList - 전체 데이터 리스트
 * @param {Function} setSelectedItem - 선택된 아이템 설정 함수
 * @returns {Function} 행 선택 핸들러
 */
export const createRowSelectHandler = (dataList, setSelectedItem) => (params) => {
    const selectedItem = dataList.find(item => item.id === params.id);
    setSelectedItem(selectedItem);
};

/**
 * 그리드 행 업데이트 핸들러 생성
 * @param {Function} setDataList - 데이터 리스트 설정 함수
 * @param {Function} setAddRows - 추가 행 설정 함수
 * @param {Function} setUpdatedRows - 수정 행 설정 함수
 * @returns {Function} 행 업데이트 핸들러
 */
export const createRowUpdateHandler = (setDataList, setAddRows, setUpdatedRows) => (newRow, oldRow) => {
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

/**
 * 그리드 행 추가 핸들러 생성
 * @param {Function} createNewRow - 새로운 행 생성 함수
 * @param {Function} setDataList - 데이터 리스트 설정 함수
 * @param {Function} setAddRows - 추가 행 설정 함수
 * @returns {Function} 행 추가 핸들러
 */
export const createRowAddHandler = (createNewRow, setDataList, setAddRows) => () => {
    const newRow = createNewRow();
    setDataList(prev => [...prev, newRow]);
    setAddRows(prev => [...prev, newRow]);
};

/**
 * 그리드 저장 데이터 포맷팅 함수 생성
 * @param {Function} formatNewRow - 신규 행 포맷팅 함수
 * @param {Function} formatUpdatedRow - 수정 행 포맷팅 함수
 * @returns {Function} 포맷팅된 저장 데이터를 반환하는 함수
 */
export const createSaveDataFormatter = (formatNewRow, formatUpdatedRow) => (addRows = [], updatedRows = []) => {
    const newRows = addRows.map(formatNewRow);
    const existingRows = updatedRows.map(formatUpdatedRow);

    return {
        createdRows: newRows,
        updatedRows: existingRows
    };
};

/**
 * 그리드 삭제 데이터 포맷팅 함수 생성(신규 생성 행은 클라이언트측에서 삭제, 이미 저장된 데이터만 서버로 담아서 전송)
 * @param {Function} formatExistingRow - 기존 행 포맷팅 함수
 * @returns {Function} 포맷팅된 삭제 데이터를 반환하는 함수
 */
export const createDeleteDataFormatter = (formatExistingRow) => (rows) => {
    const newRows = rows.filter(row => row.id.startsWith('NEW_'));
    const existingRows = rows
        .filter(row => !row.id.startsWith('NEW_'))
        .map(formatExistingRow);

    return {
        newRows,
        existingRows
    };
};