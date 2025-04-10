import { useState, useEffect, useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { useDomain, DOMAINS } from '../../../../contexts/DomainContext';
import { useTheme } from '@mui/material';
import { useGridUtils } from '../../../../utils/grid/useGridUtils';
import { useGraphQL } from '../../../../apollo/useGraphQL';
import { gql } from '@apollo/client';
import useLocalStorageVO from '../../../Common/UseLocalStorageVO';
import Message from '../../../../utils/message/Message';

/**
 * 생산실적조회 기능 제공 커스텀 훅
 *
 * @param {string} tabId - 탭 ID
 * @returns {Object} 생산실적조회에 필요한 상태 및 함수들
 */
export const useProductionResultInquiry = (tabId) => {
  // 테마, 도메인 및 시스템 설정
  const theme = useTheme();
  const { domain } = useDomain();
  const isDarkMode = theme.palette.mode === 'dark';
  const { loginUser } = useLocalStorageVO();

  // React Hook Form 설정
  const { control, handleSubmit, reset, setValue, getValues } = useForm({
    defaultValues: {
      prodResultId: '',
      workOrderId: '',
      productId: '',
      status: '',
      equipmentId: '',
      dateRange: {
        startDate: null,
        endDate: null
      }
    }
  });

  // 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [productionList, setProductionList] = useState([]);
  const [selectedProduction, setSelectedProduction] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // 그리드 유틸리티 훅 사용
  const { formatDateToYYYYMMDD } = useGridUtils();

  // GraphQL 훅 사용
  const { executeQuery } = useGraphQL();

  // GraphQL 쿼리 정의
  const PRODUCTION_RESULT_LIST_QUERY = gql`
      query getProductionResultList($filter: ProductionResultInquiryFilter) {
          productionResultList(filter: $filter) {
              id
              prodResultId
              workOrderId
              productId
              productName
              factoryId
              factoryName
              lineId
              lineName
              equipmentId
              equipmentName
              productionDate
              planQuantity
              actualQuantity
              goodQuantity
              defectQuantity
              progressRate
              defectRate
              inputAmount
              outputAmount
              yieldRate
              productionTime
              startTime
              endTime
              worker
              supervisor
              status
              createDate
              updateDate
              createUser
              updateUser
          }
      }
  `;

  // 생산실적 목록 데이터 포맷 함수
  const formatProductionListData = useCallback((data) => {
    if (!data?.productionResultList) {
      return [];
    }

    return data.productionResultList.map((result) => ({
      ...result,
      id: result.prodResultId,
      planQuantity: result.planQuantity ? Number(result.planQuantity) : 0,
      actualQuantity: result.actualQuantity ? Number(result.actualQuantity) : 0,
      goodQuantity: result.goodQuantity ? Number(result.goodQuantity) : 0,
      defectQuantity: result.defectQuantity ? Number(result.defectQuantity) : 0,
      inputAmount: result.inputAmount ? Number(result.inputAmount) : 0,
      outputAmount: result.outputAmount ? Number(result.outputAmount) : 0,
      yieldRate: result.yieldRate ? Number(result.yieldRate) : 0,
      createDate: result.createDate ? new Date(result.createDate) : null,
      updateDate: result.updateDate ? new Date(result.updateDate) : null
    }));
  }, []);

  // 초기화 함수
  const handleReset = useCallback(() => {
    // 기본값으로 폼 초기화
    reset({
      prodResultId: '',
      workOrderId: '',
      productId: '',
      status: '',
      equipmentId: '',
      dateRange: {
        startDate: null,
        endDate: null
      }
    });

    // 기본 날짜 범위 재설정
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);

    setValue('dateRange', {
      startDate,
      endDate
    });
  }, [reset, setValue]);

  // 날짜 범위 변경 핸들러
  const handleDateRangeChange = useCallback((startDate, endDate) => {
    setValue('dateRange', { startDate, endDate });
  }, [setValue]);

  // 검색 실행 함수
  const handleSearch = useCallback((data) => {
    setIsLoading(true);
    setSelectedProduction(null);

    // 날짜 형식 변환 - null 값도 허용
    const filterData = {...data};

    // dateRange 객체에서 시작일, 종료일 범위를 추출하여 필터 데이터로 변환
    if (filterData.dateRange) {
      if (filterData.dateRange.startDate) {
        try {
          filterData.fromDate = format(filterData.dateRange.startDate, 'yyyy-MM-dd');
        } catch (error) {
          console.error("Invalid startDate:", error);
          filterData.fromDate = null;
        }
      }

      if (filterData.dateRange.endDate) {
        try {
          filterData.toDate = format(filterData.dateRange.endDate, 'yyyy-MM-dd');
        } catch (error) {
          console.error("Invalid endDate:", error);
          filterData.toDate = null;
        }
      }

      // dateRange 객체 제거 (GraphQL에 불필요한 데이터 전송 방지)
      delete filterData.dateRange;
    }

    // 생산실적 검색
    executeQuery({
      query: PRODUCTION_RESULT_LIST_QUERY,
      variables: { filter: filterData }
    })
    .then(response => {
      if (response.data) {
        const formattedData = formatProductionListData(response.data);
        setProductionList(formattedData);
        setRefreshKey(prev => prev + 1);
      }
      setIsLoading(false);
    })
    .catch(error => {
      console.error("Error fetching production results:", error);
      Message.showError({ message: '데이터를 불러오는데 실패했습니다.' });
      setIsLoading(false);
      setProductionList([]);
    });
  }, [executeQuery, PRODUCTION_RESULT_LIST_QUERY, formatProductionListData]);

  // 생산실적 선택 핸들러
  const handleProductionSelect = useCallback((params) => {
    const production = productionList.find(p => p.id === params.id);
    setSelectedProduction(production);
  }, [productionList]);

  // 출력 핸들러 추가
  const handlePrint = useCallback(() => {
    if (!selectedProduction) {
      Message.showWarning('출력할 생산실적을 선택해주세요.');
      return;
    }

    Message.showSuccess('생산실적 정보가 출력됩니다.');
    // 실제 인쇄 기능 구현 필요
  }, [selectedProduction]);

  // 엑셀 내보내기 핸들러 추가
  const handleExport = useCallback(() => {
    if (productionList.length === 0) {
      Message.showWarning('내보낼 데이터가 없습니다.');
      return;
    }

    Message.showSuccess('생산실적 데이터가 엑셀로 내보내집니다.');
    // 실제 엑셀 내보내기 기능 구현 필요
  }, [productionList]);

  // 컴포넌트 마운트 시 초기 데이터 로드 (생산계획관리와 동일한 방식으로 수정)
  useEffect(() => {
    let isMounted = true;

    const timer = setTimeout(() => {
      if (isMounted) {
        try {
          // 기본 날짜 범위 설정 (오늘부터 1주일)
          const endDate = new Date();
          const startDate = new Date();
          startDate.setDate(endDate.getDate() - 7);

          setValue('dateRange', {
            startDate,
            endDate
          });

          // 초기 데이터 조회
          handleSearch({
            dateRange: {
              startDate,
              endDate
            }
          });
        } catch (err) {
          console.error("Initial load error:", err);
          setIsLoading(false);
        }
      }
    }, 100);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []); // 빈 의존성 배열로 마운트 시 한 번만 실행

  // 도메인별 색상 설정 함수
  const getTextColor = useCallback(() => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? '#f0e6d9' : 'rgba(0, 0, 0, 0.87)';
    }
    return isDarkMode ? '#b3c5e6' : 'rgba(0, 0, 0, 0.87)';
  }, [domain, isDarkMode]);

  const getBgColor = useCallback(() => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? 'rgba(45, 30, 15, 0.5)' : 'rgba(252, 235, 212, 0.6)';
    }
    return isDarkMode ? 'rgba(0, 27, 63, 0.5)' : 'rgba(232, 244, 253, 0.6)';
  }, [domain, isDarkMode]);

  const getBorderColor = useCallback(() => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? '#3d2814' : '#f5e8d7';
    }
    return isDarkMode ? '#1e3a5f' : '#e0e0e0';
  }, [domain, isDarkMode]);

  // 초기 정렬 상태 설정 - 생산실적ID 역순
  const initialState = useMemo(() => ({
    sorting: {
      sortModel: [{ field: 'prodResultId', sort: 'desc' }]
    }
  }), []);

  return {
    // 검색폼 상태 및 핸들러
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    handleDateRangeChange,
    handleReset,
    handleSearch,

    // 생산실적 관련 상태 및 핸들러
    isLoading,
    productionList,
    selectedProduction,
    handleProductionSelect,
    handlePrint,    // 출력 핸들러 추가
    handleExport,   // 엑셀 내보내기 핸들러 추가

    // 색상 및 테마
    getTextColor,
    getBgColor,
    getBorderColor,

    // 그리드 설정
    initialState,

    // 리프레시 키
    refreshKey
  };
};

export default useProductionResultInquiry;