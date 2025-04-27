import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { GRAPHQL_URL } from '../../../../config';

// GraphQL 쿼리 정의
const PLAN_VS_ACTUAL_QUERY = `
  query planVsActual($filter: PlanVsActualFilter) {
    planVsActual(filter: $filter) {
      prodPlanId
      planQty
      totalOrderQty
      completedOrderQty
      achievementRate
      materialName
      systemMaterialId
    }
  }
`;

const GET_MATERIALS_QUERY = `
  query getMaterialNameAndSysId {
    getMaterialNameAndSysId {
      systemMaterialId
      materialName
    }
  }
`;

/**
 * 계획대비 실적조회 커스텀 훅
 * 
 * @param {string} tabId - 탭 ID
 * @returns {Object} - 계획대비 실적조회에 필요한 상태와 함수들
 */
export const usePlanVsActual = (tabId) => {
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [materialList, setMaterialList] = useState([]);

  const { control, handleSubmit, reset, setValue, getValues } = useForm({
    defaultValues: {
      dateRange: [null, null],
      systemMaterialIds: [], // 선택된 자재 ID 배열
    },
  });

  // 자재 목록 로드
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const response = await fetch(GRAPHQL_URL, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: GET_MATERIALS_QUERY
          })
        });
        
        const result = await response.json();
        
        if (result.errors) {
          console.error('GraphQL Error:', result.errors);
        } else if (result.data && result.data.getMaterialNameAndSysId) {
          setMaterialList(result.data.getMaterialNameAndSysId);
        }
      } catch (error) {
        console.error('Error fetching materials:', error);
      }
    };
    
    fetchMaterials();
  }, []);

  const handleSearch = useCallback(async (formData) => {
    console.log('Search Params:', formData);
    setIsLoading(true);
    setReportData([]);
    setChartData([]);
    try {
      // API 파라미터 설정
      const filter = {
        startDate: formData.dateRange?.[0] ? new Date(formData.dateRange[0]).toISOString().split('T')[0] : null,
        endDate: formData.dateRange?.[1] ? new Date(formData.dateRange[1]).toISOString().split('T')[0] : null,
        
        // systemMaterialIds 필드는 항상 포함 (필수 파라미터이므로)
        systemMaterialIds: formData.systemMaterialIds || []
      };
      
      console.log('API Params:', filter);

      const response = await fetch(GRAPHQL_URL, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: PLAN_VS_ACTUAL_QUERY,
          variables: { filter }
        })
      });
      
      const responseText = await response.text();
      if (!responseText.trim()) {
        throw new Error('빈 응답을 받았습니다');
      }
      const result = JSON.parse(responseText);

      if (result.errors) {
        console.error('GraphQL Error:', result.errors);
        throw new Error(result.errors[0].message || 'GraphQL 데이터 조회 실패');
      }

      const planVsActualData = result.data?.planVsActual;
      if (!planVsActualData || planVsActualData.length === 0) {
        console.warn('No plan vs actual data found.');
        setReportData([]);
        setChartData([]);
        setIsLoading(false);
        return;
      }
      
      console.log('Fetched Plan vs Actual Data:', planVsActualData);

      // --- 데이터 가공 로직 ---
      // 1. 차트 데이터 생성 - 품목별 계획수량, 지시수량, 완료수량 계산
      const summaryMap = new Map();
      
      planVsActualData.forEach(item => {
        const key = item.materialName;
        if (!summaryMap.has(key)) {
          summaryMap.set(key, { 
            name: key, 
            '계획수량': 0, 
            '지시수량': 0,
            '완료수량': 0
          });
        }
        
        const summary = summaryMap.get(key);
        summary['계획수량'] += parseFloat(item.planQty) || 0;
        summary['지시수량'] += parseFloat(item.totalOrderQty) || 0;
        summary['완료수량'] += parseFloat(item.completedOrderQty) || 0;
      });
      
      // 차트 데이터 형식으로 변환
      const processedChartData = Array.from(summaryMap.values())
        .sort((a, b) => b['계획수량'] - a['계획수량']); // 계획수량 기준 내림차순 정렬

      // 2. 그리드 데이터 생성
      const processedGridData = planVsActualData.map((item, index) => ({
        id: `${item.prodPlanId}-${index}`,
        prodPlanId: item.prodPlanId,
        materialName: item.materialName,
        systemMaterialId: item.systemMaterialId,
        planQty: parseFloat(item.planQty) || 0,
        orderQty: parseFloat(item.totalOrderQty) || 0,
        completedQty: parseFloat(item.completedOrderQty) || 0,
        remainingQty: (parseFloat(item.planQty) || 0) - (parseFloat(item.completedOrderQty) || 0),
        achievementRate: parseFloat(item.achievementRate) || 0
      }));

      console.log('Processed Grid Data:', processedGridData);
      console.log('Processed Chart Data:', processedChartData);
      // --- 데이터 가공 종료 ---

      // 짧은 지연 후 상태 업데이트 (UI 반응성 개선)
      await new Promise(resolve => setTimeout(resolve, 300)); 
      setReportData(processedGridData);
      setChartData(processedChartData);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error fetching or processing report data:', error);
      setReportData([]);
      setChartData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 초기 로드 시 검색 실행
  useEffect(() => {
    handleSearch(getValues()); 
  }, [handleSearch, getValues]);

  const handleReset = useCallback(() => {
    reset({
      dateRange: [null, null],
      systemMaterialIds: [], // 리셋 시 선택된 자재 ID 배열도 초기화
    }); 
    setReportData([]);
    setChartData([]);
    setRefreshKey(prev => prev + 1);
  }, [reset]);

  const handleDateRangeChange = useCallback((newValue) => {
    if(newValue && Array.isArray(newValue)) {
      setValue('dateRange', newValue); 
    }
    console.log('Date range changed in hook:', newValue);
  }, [setValue]);

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
    materialList
  };
};

export default usePlanVsActual; 