import { useState, useCallback, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';

/**
 * 일일 생산 수율 로직 커스텀 훅
 *
 * @param {string} tabId - 탭 ID
 * @returns {object} - 상태 및 핸들러
 */
export const useDailyYield = (tabId) => {
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const { control, handleSubmit, reset, setValue, getValues } = useForm({
    defaultValues: {
      productionDate: new Date().toISOString().split('T')[0], // 오늘 날짜 기본값
      item: '',
      equipment: '',
    },
  });

  const handleSearch = useCallback(async (formData) => {
    console.log('Search Params:', formData);
    setIsLoading(true);
    setReportData([]);
    setChartData([]);
    try {
      const params = {
        date: formData.productionDate,
        item: formData.item || null,
        equipment: formData.equipment || null,
      };
      console.log('API Params:', params);

      // --- 가상 데이터 생성 로직 --- 
      const mockGridData = [];
      const mockChartData = [];
      const itemCount = Math.floor(Math.random() * 6) + 3; // 3~8개 품목

      for (let i = 1; i <= itemCount; i++) {
        const productionQty = Math.floor(Math.random() * 200) + 50; // 50 ~ 249
        const defectQty = Math.floor(productionQty * (Math.random() * 0.15)); // 0% ~ 15% 불량
        const goodQty = productionQty - defectQty;
        const yieldRate = productionQty > 0 ? parseFloat(((goodQty / productionQty) * 100).toFixed(1)) : 0;
        const itemName = `부품 ${String.fromCharCode(65 + i)}`;
        const equipmentName = `설비 ${(i % 3) + 1}`;

        mockGridData.push({
          id: i,
          date: params.date, // 검색 조건의 날짜 사용
          itemName: itemName,
          equipmentName: equipmentName,
          productionQty: productionQty,
          goodQty: goodQty,
          defectQty: defectQty,
          // yieldRate는 valueGetter에서 계산
        });
        
        // 차트 데이터 (품목별 수율)
        mockChartData.push({
          name: itemName,
          수율: yieldRate,
        });
      }
      // --- 가상 데이터 종료 ---

      await new Promise(resolve => setTimeout(resolve, 500));
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

  // DatePicker 변경 핸들러
  const handleDateChange = useCallback((newValue) => {
    // setValue('productionDate', newValue ? newValue.toISOString().split('T')[0] : null);
    console.log('Date changed in hook:', newValue);
  }, [setValue]);

  return {
    control,
    handleSubmit,
    reset,
    setValue,
    handleDateChange,
    handleReset,
    handleSearch,
    isLoading,
    reportData,
    chartData,
    refreshKey,
  };
};

export default useDailyYield; 