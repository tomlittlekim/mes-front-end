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