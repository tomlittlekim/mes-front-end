import { useState, useCallback, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';

/**
 * 기간별 생산 실적 로직 커스텀 훅
 *
 * @param {string} tabId - 탭 ID
 * @returns {object} - 상태 및 핸들러
 */
export const usePeriodicProduction = (tabId) => {
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const { control, handleSubmit, reset, setValue, getValues } = useForm({
    defaultValues: {
      productionDateRange: [null, null],
      item: '',
      line: '',
    },
  });

  const handleSearch = useCallback(async (formData) => {
    console.log('Search Params:', formData);
    setIsLoading(true);
    setReportData([]);
    setChartData([]);
    try {
      const params = {
        startDate: formData.productionDateRange[0] ? formData.productionDateRange[0] : null,
        endDate: formData.productionDateRange[1] ? formData.productionDateRange[1] : null,
        item: formData.item || null,
        line: formData.line || null,
      };
      console.log('API Params:', params);

      // --- 가상 데이터 생성 로직 --- 
      const mockGridData = [];
      const mockChartData = [];
      const days = Math.floor(Math.random() * 10) + 5; // 5~14일치 데이터
      const baseDate = new Date();
      for (let i = 0; i < days; i++) {
        const currentDate = new Date(baseDate);
        currentDate.setDate(baseDate.getDate() - i);
        const dateStr = currentDate.toISOString().split('T')[0];

        const productionQty = Math.floor(Math.random() * 300) + 100; // 100 ~ 399
        const defectQty = Math.floor(productionQty * (Math.random() * 0.1)); // 0% ~ 10% 불량
        const operatingTime = Math.floor(Math.random() * 180) + 300; // 300 ~ 479분 가동
        const itemName = `제품 ${String.fromCharCode(65 + (i % 3))}`;
        const lineName = `라인 ${(i % 2) + 1}`;

        mockGridData.push({
          id: i + 1,
          date: dateStr,
          itemName: itemName,
          lineName: lineName,
          productionQty: productionQty,
          defectQty: defectQty,
          operatingTime: operatingTime,
        });
        
        // 차트 데이터 (일자별 총 생산량, 불량수, 가동시간)
        const existingChartEntry = mockChartData.find(entry => entry.date === dateStr);
        if (existingChartEntry) {
          existingChartEntry.생산수량 += productionQty;
          existingChartEntry.불량수 += defectQty;
          existingChartEntry.가동시간 += operatingTime; // 일별 합계 또는 평균 선택
        } else {
          mockChartData.push({
            date: dateStr,
            생산수량: productionQty,
            불량수: defectQty,
            가동시간: operatingTime,
          });
        }
      }
      // 날짜 오름차순 정렬
      mockChartData.sort((a, b) => new Date(a.date) - new Date(b.date));
      // --- 가상 데이터 종료 ---

      await new Promise(resolve => setTimeout(resolve, 600));
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

export default usePeriodicProduction; 