/**
 * 그리드 관련 일반 유틸리티 클래스(편의성용 유틸)
 */
export class GridUtils {
    /**
     * 고유 ID 생성
     * @param {string} prefix - ID 접두사 (예: 'NEW', 'TEMP')
     * @returns {string} 생성된 고유 ID
     */
    static generateId(prefix = 'NEW') {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        return `${prefix}_${timestamp}_${random}`;
    }

    /**
     * 날짜를 YYYY-MM-DD 형식으로 변환
     * @param {Date} date - 변환할 날짜
     * @returns {string} YYYY-MM-DD 형식의 날짜 문자열
     */
    static formatDateToYYYYMMDD(date) {
        return date ? date.toISOString().split('T')[0] : null;
    }

    /**
     * 현재 날짜를 YYYY-MM-DD 형식으로 반환
     * @returns {string} YYYY-MM-DD 형식의 현재 날짜
     */
    static getCurrentDate() {
        return this.formatDateToYYYYMMDD(new Date());
    }

    /**
     * flagActive 값을 Y/N 형식으로 변환
     * @param {boolean|null} value - 변환할 flagActive 값
     * @returns {string} 'Y' 또는 'N'
     */
    static formatFlagActive(value) {
        if (value === null) return 'N';
        return value ? 'Y' : 'N';
    }

    /**
     * 그리드 데이터 포맷팅
     * @param {Object} data - 원본 데이터
     * @param {string} dataKey - 데이터 키 (예: 'materials')
     * @param {Function} formatter - 각 항목 포맷팅 함수
     * @returns {Array} 포맷팅된 데이터 배열
     */
    static formatGridData(data, dataKey, formatter) {
        if (!data?.[dataKey]) return [];
        return data[dataKey].map(formatter);
    }
}