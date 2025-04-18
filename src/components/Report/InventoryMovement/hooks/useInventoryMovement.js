import { useState, useCallback, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { GRAPHQL_URL } from '../../../../config';

// GraphQL 쿼리 정의 (InventoryHistoryManagement.js 에서 복사)
const GET_INVENTORY_HISTORY_LIST = `
  query getInventoryHistoryList($filter: InventoryHistoryFilter) {
    getInventoryHistoryList(filter: $filter) {
      inOutType
      warehouseName
      supplierName
      manufacturerName
      materialName
      changeQty
      currentQty
      unit
      createDate
    }
  }
`;

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
      systemMaterialIds: [], // 선택된 제품 ID 배열
      inOutType: '',
      warehouseName: '',
      supplierName: '',
      manufacturerName: '',
      unit: '',
    },
  });

  const handleSearch = useCallback(async (formData) => {
    console.log('Search Params:', formData);
    setIsLoading(true);
    setReportData([]);
    setChartData([]);
    try {
      // API 파라미터 설정
      const filter = {
        startDate: formData.movementDateRange?.[0] ? new Date(formData.movementDateRange[0]).toISOString().split('T')[0] : null,
        endDate: formData.movementDateRange?.[1] ? new Date(formData.movementDateRange[1]).toISOString().split('T')[0] : null,
        
        // materialNames 필드 - 백엔드 필드명과 일치시킴
        // 제품 선택 결과가 있는 경우 배열로 전달, 없으면 필드 제외
        ...(formData.materialNames && formData.materialNames.length > 0 ? { materialNames: formData.materialNames } : {}),
        
        inOutType: formData.inOutType || null,
        warehouseName: formData.warehouseName || null,
        supplierName: formData.supplierName || null,
        manufacturerName: formData.manufacturerName || null,
      };
      
      console.log('API Params:', filter);

      const response = await fetch(GRAPHQL_URL, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: GET_INVENTORY_HISTORY_LIST,
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

      const historyData = result.data?.getInventoryHistoryList;
      if (!historyData) {
        console.warn('No inventory history data found.');
        setReportData([]);
        setChartData([]);
        setIsLoading(false);
        return;
      }
      
      console.log('Fetched History Data:', historyData);

      // --- 데이터 가공 로직 수정 ---
      // 1. 차트 데이터 생성 - 품목별 입고량, 출고량, 현재재고량 계산
      const summaryMap = new Map();
      
      historyData.forEach(item => {
        const key = item.materialName;
        if (!summaryMap.has(key)) {
          summaryMap.set(key, { 
            materialName: key, 
            inQty: 0, 
            outQty: 0,
            currentStock: 0  // 현재 재고량 추가
          });
        }
        
        const summary = summaryMap.get(key);
        const qty = Number(item.changeQty) || 0;
        
        if (item.inOutType === 'IN') {
          summary.inQty += qty;
        } else if (item.inOutType === 'OUT') {
          summary.outQty += Math.abs(qty);
        }
        
        // 현재 재고량은 입고량 - 출고량
        summary.currentStock = summary.inQty - summary.outQty;
      });
      
      // 차트 데이터 형식으로 변환
      const processedChartData = Array.from(summaryMap.values())
        .map(summary => ({
          name: summary.materialName,
          '입고량': summary.inQty,
          '출고량': summary.outQty,
          '현재재고량': summary.currentStock  // 현재 재고량 추가
        }))
        .sort((a, b) => b['입고량'] - a['입고량']); // 입고량 기준 내림차순 정렬

      // 2. 그리드 데이터 생성 (상세 이력에 고유 ID 추가)
      const processedGridData = historyData.map((item, index) => ({
        ...item,
        id: `${item.materialName}-${item.createDate}-${index}`,
        changeQty: Number(item.changeQty) || 0,
        currentQty: Number(item.currentQty) || 0
      }))
      .sort((a, b) => new Date(b.createDate) - new Date(a.createDate)); // 날짜 기준 내림차순 정렬

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
      movementDateRange: [null, null],
      systemMaterialIds: [], // 리셋 시 선택된 제품 ID 배열도 초기화
      inOutType: '', 
      warehouseName: '', 
      supplierName: '', 
      manufacturerName: '', 
      unit: '',
    }); 
    setReportData([]);
    setChartData([]);
    setRefreshKey(prev => prev + 1);
  }, [reset]);

  const handleDateRangeChange = useCallback((newValue) => {
    if(newValue && Array.isArray(newValue)) {
      setValue('movementDateRange', newValue); 
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
  };
};

export default useInventoryMovement; 