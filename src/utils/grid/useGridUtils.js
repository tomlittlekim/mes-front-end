import { useCallback } from 'react';

/**
 * 그리드 관련 일반 유틸리티 커스텀 훅
 */
export const useGridUtils = () => {
    /**
     * 고유 ID 생성
     */
    const generateId = useCallback((prefix = 'NEW') => {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        return `${prefix}_${timestamp}_${random}`;
    }, []);

    /**
     * 날짜를 YYYY-MM-DD 형식으로 변환
     */
    const formatDateToYYYYMMDD = useCallback((date) => {
        return date ? date.toISOString().split('T')[0] : null;
    }, []);

    /**
     * 현재 날짜를 YYYY-MM-DD 형식으로 반환
     */
    const getCurrentDate = useCallback(() => {
        return formatDateToYYYYMMDD(new Date());
    }, [formatDateToYYYYMMDD]);

    /**
     * flagActive 값을 Y/N 형식으로 변환
     */
    const formatFlagActive = useCallback((value) => {
        if (value === null) return 'N';
        return value ? 'Y' : 'N';
    }, []);

    /**
     * 그리드 데이터 포맷팅
     */
    const formatGridData = useCallback((data, dataKey, formatter) => {
        if (!data?.[dataKey]) return [];
        return data[dataKey].map(formatter);
    }, []);

    return {
        generateId,
        formatDateToYYYYMMDD,
        getCurrentDate,
        formatFlagActive,
        formatGridData
    };
}; 