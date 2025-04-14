import { useState, useCallback, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';

/**
 * 입출고 현황 로직 커스텀 훅
 *
 * @param {string} tabId - 탭 ID
 * @returns {object} - 상태 및 핸들러
 */
export const useInventoryMovement = (tabId) => {
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const { control, handleSubmit, reset, setValue, getValues } = useForm({
    defaultValues: {
      movementDateRange: [null, null],
      item: '',
    },
  });

  const handleSearch = useCallback(async (formData) => {
    console.log('Search Params:', formData);
    setIsLoading(true);
    setReportData([]);
    setChartData([]);
    try {
      const params = {
        startDate: formData.movementDateRange[0] ? formData.movementDateRange[0] : null,
        endDate: formData.movementDateRange[1] ? formData.movementDateRange[1] : null,
        item: formData.item || null,
      };
      console.log('API Params:', params);

      // --- 가상 데이터 생성 로직 --- 
      const mockGridData = [];
      const mockChartData = [];
      const itemCount = Math.floor(Math.random() * 8) + 4; // 4~11개 품목

      for (let i = 1; i <= itemCount; i++) {
        const openingStock = Math.floor(Math.random() * 100); // 0 ~ 99
        const inQty = Math.floor(Math.random() * 150) + 50; // 50 ~ 199
        const outQty = Math.floor(Math.random() * (openingStock + inQty * 0.8)); // 기초 + 입고량의 80% 내에서 출고
        const currentStock = openingStock + inQty - outQty;
        const itemName = `자재 ${String.fromCharCode(65 + i)}`;

        mockGridData.push({
          id: i,
          itemName: itemName,
          openingStock: openingStock,
          inQty: inQty,
          outQty: outQty,
          currentStock: currentStock,
        });
        
        // 차트 데이터 (품목별 입/출고량)
        mockChartData.push({
          name: itemName,
          입고량: inQty,
          출고량: outQty,
        });
      }
      // --- 가상 데이터 종료 ---

      await new Promise(resolve => setTimeout(resolve, 650));
      setReportData(mockGridData);
      setChartData(mockChartData);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error fetching report data:', error);
      setReportData([]);
      setChartData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    // 현재 폼의 기본값을 사용하여 초기 검색 실행
    handleSearch(getValues()); 
  }, [handleSearch, getValues]);

  const handleReset = useCallback(() => {
    reset();
    setReportData([]);
    setChartData([]);
    setRefreshKey(prev => prev + 1);
  }, [reset]);

  const handleDateRangeChange = useCallback((newValue) => {
    console.log('Date range changed in hook:', newValue);
  }, []);

  return {
    control,
    handleSubmit,
    reset,
    setValue,
    handleDateRangeChange,
    handleReset,
    handleSearch,
    isLoading,
    reportData,
    chartData,
    refreshKey,
  };
};

export default useInventoryMovement; 