import { DOMAINS } from "../../../../contexts/DomainContext";

// 스타일 관련 함수
export const getTextColor = (domain, isDarkMode) => domain === DOMAINS.PEMS ?
  (isDarkMode ? '#f0e6d9' : 'rgba(0, 0, 0, 0.87)') :
  (isDarkMode ? '#b3c5e6' : 'rgba(0, 0, 0, 0.87)');

export const getBgColor = (domain, isDarkMode) => domain === DOMAINS.PEMS ?
  (isDarkMode ? 'rgba(45, 30, 15, 0.5)' : 'rgba(252, 235, 212, 0.6)') :
  (isDarkMode ? 'rgba(0, 27, 63, 0.5)' : 'rgba(232, 244, 253, 0.6)');

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

export default {
    getTextColor,
    getBgColor,
    getBorderColor,
    getMaterialTypeColor
};