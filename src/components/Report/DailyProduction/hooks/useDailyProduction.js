import { useState, useCallback, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';

/**
 * 생산 일보 로직 커스텀 훅
 *
 * @param {string} tabId - 탭 ID
 * @returns {object} - 상태 및 핸들러
 */
export const useDailyProduction = (tabId) => {
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const { control, handleSubmit, reset, setValue, getValues } = useForm({
    defaultValues: {
      productionDate: new Date().toISOString().split('T')[0], // 오늘 날짜 기본값
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
        date: formData.productionDate,
        line: formData.line || null,
      };
      console.log('API Params:', params);

      // --- 가상 데이터 생성 로직 --- 
      const mockGridData = [];
      const mockChartData = [];
      const timeSlots = [ // 8시간 근무 가정
        '08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00', 
        '13:00 - 14:00', '14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00'
      ];
      const workers = ['김민준', '이서연', '박지훈', '최수현'];
      const statuses = ['가동', '가동', '가동', '비가동', '점검중'];
      const items = ['제품 A', '제품 B'];
      const equipments = ['설비 1', '설비 2'];

      for (let i = 0; i < timeSlots.length; i++) {
        const timeSlot = timeSlots[i];
        const productionQty = Math.floor(Math.random() * 50) + 10; // 10 ~ 59
        const workerName = workers[Math.floor(Math.random() * workers.length)];
        const equipmentName = equipments[Math.floor(Math.random() * equipments.length)];
        const equipmentStatus = statuses[Math.floor(Math.random() * statuses.length)];
        const itemName = items[Math.floor(Math.random() * items.length)];

        mockGridData.push({
          id: i + 1,
          timeSlot: timeSlot,
          itemName: itemName,
          productionQty: productionQty,
          workerName: workerName,
          equipmentName: equipmentName,
          equipmentStatus: equipmentStatus,
        });
        
        // 차트 데이터 (시간대별 생산량)
        mockChartData.push({
          name: timeSlot.split(' - ')[0], // 시작 시간만 표시
          생산량: productionQty,
        });
      }
      // --- 가상 데이터 종료 ---

      await new Promise(resolve => setTimeout(resolve, 450));
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

  const handleDateChange = useCallback((newValue) => {
    console.log('Date changed in hook:', newValue);
  }, []);

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

export default useDailyProduction; 