import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTheme } from '@mui/material';
import { useGraphQL } from '../../../../apollo/useGraphQL';
import { GET_PLAN_VS_ACTUAL_DATA, GET_PRODUCTS_LIST } from '../utils/graphqlQueries';
import { GRAPHQL_URL } from '../../../../config';

/**
 * 계획대비 실적조회 커스텀 훅
 * 
 * @param {string} tabId - 탭 ID
 * @returns {Object} - 계획대비 실적조회에 필요한 상태와 함수들
 */
export const usePlanVsActual = (tabId) => {
  const theme = useTheme();
  const { executeQuery } = useGraphQL();
  
  // 상태 관리
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [productList, setProductList] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // React Hook Form 설정
  const { control, handleSubmit, reset, setValue, getValues } = useForm({
    defaultValues: {
      dateRange: [null, null],
      selectedProducts: [],
      state: 'COMPLETED'
    }
  });

  // 제품 목록 로드
  const loadProducts = useCallback(async () => {
    try {
      const result = await executeQuery({
        query: GET_PRODUCTS_LIST,
        variables: { filter: { isActive: true } }
      });
      
      if (result.data && result.data.getProducts) {
        setProductList(result.data.getProducts);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setProductList([]);
    }
  }, [executeQuery]);

  // 계획대비 실적 데이터 로드
  const handleSearch = useCallback(async (formData) => {
    setIsLoading(true);
    setReportData([]);
    setChartData([]);

    try {
      // 검색 필터 생성
      const filter = {
        startDate: formData.dateRange?.[0] ? new Date(formData.dateRange[0]).toISOString().split('T')[0] : null,
        endDate: formData.dateRange?.[1] ? new Date(formData.dateRange[1]).toISOString().split('T')[0] : null,
        state: formData.state || 'COMPLETED'
      };

      // 선택된 제품이 있는 경우
      if (formData.selectedProducts && formData.selectedProducts.length > 0) {
        filter.productIds = formData.selectedProducts.map(p => p.productId);
      }

      // GraphQL 쿼리 실행
      const response = await fetch(GRAPHQL_URL, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: GET_PLAN_VS_ACTUAL_DATA,
          variables: { filter }
        })
      });
      
      const result = await response.json();
      
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }
      
      const planVsActualData = result.data?.getPlanVsActualData || [];
      
      if (planVsActualData.length === 0) {
        setReportData([]);
        setChartData([]);
        setIsLoading(false);
        return;
      }
      
      // 데이터 가공 - 고유 ID 추가 및 필요한 계산
      const processedData = planVsActualData.map((item, index) => ({
        ...item,
        id: `${item.productId}-${item.planDate}-${index}`,
        achievementRate: item.planQty > 0 ? (item.completedQty / item.planQty * 100).toFixed(1) : 0
      }));
      
      // 차트 데이터 생성 - 제품별 계획수량, 지시수량, 실적수량
      const productSummary = new Map();
      processedData.forEach(item => {
        const key = item.productName;
        if (!productSummary.has(key)) {
          productSummary.set(key, {
            name: key,
            '계획수량': 0,
            '지시수량': 0,
            '완료수량': 0
          });
        }
        
        const summary = productSummary.get(key);
        summary['계획수량'] += Number(item.planQty) || 0;
        summary['지시수량'] += Number(item.orderQty) || 0;
        summary['완료수량'] += Number(item.completedQty) || 0;
      });
      
      const processedChartData = Array.from(productSummary.values())
        .sort((a, b) => b['계획수량'] - a['계획수량']);
      
      // 상태 업데이트
      setReportData(processedData);
      setChartData(processedChartData);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error searching plan vs actual data:', error);
      setReportData([]);
      setChartData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 초기화 함수
  const handleReset = useCallback(() => {
    reset({
      dateRange: [null, null],
      selectedProducts: [],
      state: 'COMPLETED'
    });
    
    setReportData([]);
    setChartData([]);
    setRefreshKey(prev => prev + 1);
  }, [reset]);

  // 날짜 범위 변경 핸들러
  const handleDateRangeChange = useCallback((newValue) => {
    if (newValue && Array.isArray(newValue)) {
      setValue('dateRange', newValue);
    }
  }, [setValue]);

  // 컴포넌트 마운트 시 제품 목록 로드
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // 초기 로드 시 기본 검색 실행
  useEffect(() => {
    handleSearch(getValues());
  }, [handleSearch, getValues]);

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
    productList
  };
};

export default usePlanVsActual; 