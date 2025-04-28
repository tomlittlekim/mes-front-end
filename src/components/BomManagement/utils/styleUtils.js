import { DOMAINS } from "../../../contexts/DomainContext";

/**
 * 도메인 및 테마 모드에 따른 텍스트 색상을 반환합니다.
 * 
 * @param {string} domain - 도메인
 * @param {boolean} isDarkMode - 다크모드 여부
 * @returns {string} - 텍스트 색상
 */
export const getTextColor = (domain, isDarkMode) => domain === DOMAINS.PEMS ?
    (isDarkMode ? '#f0e6d9' : 'rgba(0, 0, 0, 0.87)') :
    (isDarkMode ? '#b3c5e6' : 'rgba(0, 0, 0, 0.87)');

/**
 * 도메인 및 테마 모드에 따른 배경 색상을 반환합니다.
 * 
 * @param {string} domain - 도메인
 * @param {boolean} isDarkMode - 다크모드 여부
 * @returns {string} - 배경 색상
 */
export const getBgColor = (domain, isDarkMode) => domain === DOMAINS.PEMS ?
    (isDarkMode ? 'rgba(45, 30, 15, 0.5)' : 'rgba(252, 235, 212, 0.6)') :
    (isDarkMode ? 'rgba(0, 27, 63, 0.5)' : 'rgba(232, 244, 253, 0.6)');

/**
 * 도메인 및 테마 모드에 따른 테두리 색상을 반환합니다.
 * 
 * @param {string} domain - 도메인
 * @param {boolean} isDarkMode - 다크모드 여부
 * @returns {string} - 테두리 색상
 */
export const getBorderColor = (domain, isDarkMode) => domain === DOMAINS.PEMS ?
    (isDarkMode ? '#3d2814' : '#f5e8d7') :
    (isDarkMode ? '#1e3a5f' : '#e0e0e0');

/**
 * 자재 타입에 따른 색상을 반환합니다.
 * 
 * @param {string} materialType - 자재 타입
 * @returns {string} - 색상 코드
 */
export const getMaterialTypeColor = (materialType) => {
    switch (materialType) {
        case 'RAW_MATERIAL':
            return '#1976d2';  // 파란색
        case 'SUB_MATERIAL':
            return '#9c27b0';  // 보라색
        case 'HALF_PRODUCT':
            return '#ed6c02';  // 주황색
        case 'COMPLETE_PRODUCT':
            return '#2e7d32';  // 녹색
        default:
            return '#757575';  // 회색
    }
};

/**
 * 자재 상태에 따른 색상을 반환합니다.
 * 
 * @param {string} status - 자재 상태
 * @returns {string} - 색상 코드
 */
export const getMaterialStatusColor = (status) => {
    switch (status) {
        case 'ACTIVE':
            return '#4caf50';  // 녹색
        case 'INACTIVE':
            return '#f44336';  // 빨간색
        default:
            return '#9e9e9e';  // 회색
    }
};

export default {
    getTextColor,
    getBgColor,
    getBorderColor,
    getMaterialTypeColor,
    getMaterialStatusColor
}; 