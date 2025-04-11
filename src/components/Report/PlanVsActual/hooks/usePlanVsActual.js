import { useState, useCallback, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
// import { fetchPlanVsActualData } from '../../../api/reportApi'; // 가상의 API 함수

/**
 * 계획 대비 실적 조회 로직 커스텀 훅
 *
 * @param {string} tabId - 탭 ID (필요시 사용)
 * @returns {object} - 상태 및 핸들러
 */
export const usePlanVsActual = (tabId) => {
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [chartData, setChartData] = useState([]); // 차트 데이터 상태 추가
  const [refreshKey, setRefreshKey] = useState(0); // 데이터 리프레시용 키

  // react-hook-form 설정
  const { control, handleSubmit, reset, setValue, watch, getValues } = useForm({
    defaultValues: {
      planDateRange: [null, null], // 기본값 [시작일, 종료일]
      item: '', // 품목 코드 또는 이름
      equipment: '', // 설비 코드 또는 이름
    },
  });

  // API 호출 및 데이터 처리 로직
  const handleSearch = useCallback(async (formData) => {
    console.log('Search Params:', formData);
    setIsLoading(true);
    setReportData([]); // 검색 시작 시 데이터 초기화
    setChartData([]); // 검색 시작 시 차트 데이터 초기화
    try {
      // API 파라미터 가공 (날짜 형식 등)
      const params = {
        startDate: formData.planDateRange[0] ? formData.planDateRange[0] : null,
        endDate: formData.planDateRange[1] ? formData.planDateRange[1] : null,
        item: formData.item || null,
        equipment: formData.equipment || null,
      };
      console.log('API Params:', params);

      // const data = await fetchPlanVsActualData(params); // 실제 API 호출
      
      // --- 가상 데이터 생성 로직 --- 
      const mockGridData = [];
      const mockChartData = [];
      const itemCount = Math.floor(Math.random() * 7) + 3; // 3~9개 품목/설비 조합 생성
      for (let i = 1; i <= itemCount; i++) {
        const planQty = Math.floor(Math.random() * 500) + 50;
        const actualQty = Math.floor(planQty * (Math.random() * 0.4 + 0.8));
        const achievementRate = planQty > 0 ? parseFloat(((actualQty / planQty) * 100).toFixed(1)) : 0;
        const itemName = `품목 ${String.fromCharCode(65 + i)}`;
        const equipmentName = `설비 ${i}`;
        
        mockGridData.push({
          id: i,
          itemName: itemName,
          equipmentName: equipmentName,
          planQty: planQty,
          actualQty: actualQty,
          // achievementRate, difference는 valueGetter에서 계산
        });

        // 차트 데이터 가공 (품목별 달성률)
        mockChartData.push({
          name: itemName, // X축 레이블
          달성률: achievementRate,
        });
      }
      // --- 가상 데이터 종료 ---

      await new Promise(resolve => setTimeout(resolve, 700)); // 로딩 효과
      setReportData(mockGridData); // 그리드 데이터 설정
      setChartData(mockChartData); // 차트 데이터 설정
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error fetching report data:', error);
      // 에러 처리 로직 (예: 사용자에게 알림 - SWR 또는 React Query 사용 고려)
      setReportData([]); // 에러 발생 시 데이터 초기화
      setChartData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    handleSearch(getValues());
  }, [handleSearch, getValues]);

  // 검색 조건 초기화 핸들러
  const handleReset = useCallback(() => {
    reset();
    setReportData([]);
    setChartData([]); // 초기화 시 차트 데이터도 초기화
    setRefreshKey(prev => prev + 1);
    // 초기화 후 바로 기본값으로 검색 실행 (선택적)
    // handleSearch(getValues());
  }, [reset]);

  // 날짜 범위 변경 핸들러 (SearchForm 에서 field.onChange 로 처리)
  const handleDateRangeChange = useCallback((newValue) => {
    // setValue('planDateRange', newValue); // react-hook-form Controller 에서 처리
    console.log('Date range changed in hook:', newValue);
  }, []);

  // 그리드 컬럼 정의 (PlanVsActualReport.js로 이동)
  // const gridColumns = useMemo(() => [...], []);

  // 그리드 추가 속성 (PlanVsActualReport.js로 이동)
  // const gridProps = useMemo(() => ({...}), []);

  return {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    handleDateRangeChange,
    handleReset,
    handleSearch,
    isLoading,
    reportData, // 그리드용 데이터
    chartData,  // 차트용 데이터
    // gridColumns, // 제거
    // gridProps, // 제거
    refreshKey,
  };
};

export default usePlanVsActual; 