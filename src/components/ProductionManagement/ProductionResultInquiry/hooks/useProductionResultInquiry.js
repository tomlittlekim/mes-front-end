import { useState, useEffect, useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { useDomain, DOMAINS } from '../../../../contexts/DomainContext';
import { useTheme } from '@mui/material';
import { useGridUtils } from '../../../../utils/grid/useGridUtils';
import { useGraphQL } from '../../../../apollo/useGraphQL';
import useLocalStorageVO from '../../../Common/UseLocalStorageVO';
import Message from '../../../../utils/message/Message';
import { printProductionResult, exportProductionResultToCSV } from '../utils/printUtils';
import { formatProductionResultData } from '../utils/gridDataUtils';
import { PRODUCTION_RESULTS_QUERY } from '../utils/graphqlQueries';
import { gql } from '@apollo/client';

// 제품 정보 조회를 위한 GraphQL 쿼리
const PRODUCTS_QUERY = gql`
    query getProductMaterials {
        productMaterials {
            systemMaterialId
            userMaterialId
            materialName
            materialStandard
            materialCategory
            materialType
            unit
        }
    }
`;

// 설비 정보 조회를 위한 GraphQL 쿼리
const EQUIPMENTS_QUERY = gql`
    query getEquipments($filter: EquipmentFilter) {
        getEquipments(filter: $filter) {
            equipmentId
            equipmentName
            equipmentType
            factoryId
            factoryName
            lineId
            lineName
            equipmentStatus
        }
    }
`;

// 제품 정보에 표시값 추가 유틸리티 함수
const enrichProductWithDisplayValues = (product) => {
  // 기본 제품 정보 반환
  return {
    ...product,
    value: product.systemMaterialId, // 선택기에서 사용할 값
    label: `${product.userMaterialId} (${product.materialName || ''})`  // 선택기에서 보여줄 레이블
  };
};

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
  const { control, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      prodResultId: '',
      workOrderId: '',
      productId: '',
      equipmentId: '',
      startDateRange: {
        startDate: null,
        endDate: null
      },
      endDateRange: {
        startDate: null,
        endDate: null
      }
    }
  });

  // 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [productionResultList, setProductionResultList] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [equipmentOptions, setEquipmentOptions] = useState([]);
  
  // 제품 옵션 목록 상태
  const [productOptions, setProductOptions] = useState([]);
  // 제품 로딩 상태 추가
  const [isProductsLoading, setIsProductsLoading] = useState(false);
  // 설비 로딩 상태 추가
  const [isEquipmentsLoading, setIsEquipmentsLoading] = useState(false);

  // GraphQL 기능 사용
  const { executeQuery } = useGraphQL();

  // 그리드 유틸리티 훅 사용
  const { formatDateToYYYYMMDD } = useGridUtils();

  // 제품 정보 로드 함수
  const loadProductMaterials = useCallback(async () => {
    // 이미 데이터가 있거나 로딩 중이면 중복 호출 방지
    if (productOptions.length > 0 || isProductsLoading) {
      return productOptions;
    }

    setIsProductsLoading(true);

    try {
      const response = await executeQuery({ query: PRODUCTS_QUERY });

      if (response?.data?.productMaterials) {
        // 제품 정보에 표시값 추가
        const enrichedProducts = response.data.productMaterials.map(
          product => enrichProductWithDisplayValues(product)
        );

        // 상태 업데이트
        setProductOptions(enrichedProducts);
        return enrichedProducts;
      } else {
        console.error("제품 정보가 없거나 형식이 맞지 않습니다.");
        return [];
      }
    } catch (error) {
      console.error("제품 정보 로드 오류:", error);
      return [];
    } finally {
      setIsProductsLoading(false);
    }
  }, [executeQuery, isProductsLoading]);

  // 설비 정보 로드 함수
  const loadEquipments = useCallback(async () => {
    // 이미 설비 정보가 있거나 로딩 중인 경우 중복 호출 방지
    if (equipmentOptions.length > 0 || isEquipmentsLoading) {
      return equipmentOptions;
    }

    setIsEquipmentsLoading(true);

    try {
      const response = await executeQuery({
        query: EQUIPMENTS_QUERY,
        variables: {
          filter: {
            factoryId: '',
            factoryName: '',
            lineId: '',
            lineName: '',
            equipmentId: '',
            equipmentName: '',
            equipmentSn: '',
            equipmentType: ''
          }
        }
      });

      if (response?.data?.getEquipments) {
        // 설비 정보를 드롭박스 옵션 형식으로 변환
        const formattedEquipments = response.data.getEquipments.map(equipment => ({
          value: equipment.equipmentId,
          label: `${equipment.equipmentName || ''} (${equipment.equipmentId})`,
          equipmentId: equipment.equipmentId,
          equipmentName: equipment.equipmentName,
          factoryName: equipment.factoryName,
          lineName: equipment.lineName,
          equipmentType: equipment.equipmentType
        }));

        setEquipmentOptions(formattedEquipments);
        return formattedEquipments;
      }
      return [];
    } catch (error) {
      console.error("설비 정보 로드 오류:", error);
      return [];
    } finally {
      setIsEquipmentsLoading(false);
    }
  }, [executeQuery, isEquipmentsLoading, equipmentOptions.length]);

  // 생산시작일시 범위 변경 핸들러
  const handleStartDateRangeChange = useCallback((startDate, endDate) => {
    setValue('startDateRange', { startDate, endDate });
  }, [setValue]);

  // 생산종료일시 범위 변경 핸들러
  const handleEndDateRangeChange = useCallback((startDate, endDate) => {
    setValue('endDateRange', { startDate, endDate });
  }, [setValue]);

  // 생산실적 목록 로드 함수
  const loadProductionResults = useCallback((filter = {}) => {
    setIsLoading(true);
    setErrorMessage(null);

    // 스키마에 맞게 필터 생성 - state 필드 제거
    const apiFilter = { ...filter };
    
    // state 필드가 있으면 제거 (스키마에 없음)
    if (apiFilter.state) {
      delete apiFilter.state;
    }

    return executeQuery({
      query: PRODUCTION_RESULTS_QUERY,
      variables: { filter: apiFilter }
    })
    .then(response => {
      if (response.data && response.data.productionResults) {
        const formattedData = formatProductionResultData(response.data);
        setProductionResultList(formattedData);
      } else {
        setProductionResultList([]);
      }
      setIsLoading(false);
      return response;
    })
    .catch(error => {
      console.error("Error fetching production results:", error);
      setErrorMessage('생산실적 데이터를 불러오는데 실패했습니다.');
      setIsLoading(false);
      setProductionResultList([]);
      throw error;
    });
  }, [executeQuery]);

  // 초기화 함수
  const handleReset = useCallback(() => {
    reset({
      prodResultId: '',
      workOrderId: '',
      productId: '',
      equipmentId: '',
      startDateRange: {
        startDate: null,
        endDate: null
      },
      endDateRange: {
        startDate: null,
        endDate: null
      }
    });

    // 초기화 후 모든 생산실적 다시 로드
    loadProductionResults({
      flagActive: true
    });
  }, [reset, loadProductionResults]);

  // 검색 실행 함수
  const handleSearch = useCallback((data) => {
    // 생산실적 목록 초기화
    setProductionResultList([]);

    // 필터 객체 생성
    const filter = {
      flagActive: true
    };

    // 생산실적ID가 있으면 추가
    if (data.prodResultId) {
      filter.prodResultId = data.prodResultId;
    }

    // workOrderId가 있으면 추가
    if (data.workOrderId) {
      filter.workOrderId = data.workOrderId;
    }

    // productId가 있으면 추가
    if (data.productId) {
      filter.productId = data.productId;
    }

    // equipmentId가 있으면 추가
    if (data.equipmentId) {
      filter.equipmentId = data.equipmentId;
    }

    // 생산시작일시 범위가 있으면 추가
    if (data.startDateRange) {
      if (data.startDateRange.startDate) {
        try {
          filter.prodStartTimeFrom = format(data.startDateRange.startDate, 'yyyy-MM-dd');
        } catch (error) {
          console.error("Invalid startDate for prodStartTimeFrom:", error);
        }
      }

      if (data.startDateRange.endDate) {
        try {
          filter.prodStartTimeTo = format(data.startDateRange.endDate, 'yyyy-MM-dd');
        } catch (error) {
          console.error("Invalid endDate for prodStartTimeTo:", error);
        }
      }
    }

    // 생산종료일시 범위가 있으면 추가
    if (data.endDateRange) {
      if (data.endDateRange.startDate) {
        try {
          filter.prodEndTimeFrom = format(data.endDateRange.startDate, 'yyyy-MM-dd');
        } catch (error) {
          console.error("Invalid startDate for prodEndTimeFrom:", error);
        }
      }

      if (data.endDateRange.endDate) {
        try {
          filter.prodEndTimeTo = format(data.endDateRange.endDate, 'yyyy-MM-dd');
        } catch (error) {
          console.error("Invalid endDate for prodEndTimeTo:", error);
        }
      }
    }

    // 생산실적 검색
    loadProductionResults(filter);
  }, [loadProductionResults]);

  // 출력 핸들러
  const handlePrint = useCallback(() => {
    if (productionResultList.length > 0) {
      printProductionResult(null, productionResultList, loginUser?.userName, productOptions, equipmentOptions);
    } else {
      Message.showWarning({ message: '출력할 생산실적이 없습니다.' });
    }
  }, [productionResultList, loginUser?.userName, productOptions, equipmentOptions]);

  // 엑셀 내보내기 핸들러
  const handleExport = useCallback(() => {
    if (productionResultList.length > 0) {
      exportProductionResultToCSV(null, productionResultList, productOptions, equipmentOptions);
    } else {
      Message.showWarning({ message: '내보낼 생산실적이 없습니다.' });
    }
  }, [productionResultList, productOptions, equipmentOptions]);

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

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    // 제품 정보 로드
    loadProductMaterials();
    // 설비 정보 로드
    loadEquipments();
  }, [loadProductMaterials, loadEquipments]);

  // 생산실적 데이터 로드는 별도 useEffect로 분리
  useEffect(() => {
    // 첫 마운트 시 한 번만 실행하기 위한 플래그
    let isMounted = true;

    const init = async () => {
      if (isMounted) {
        // 초기 데이터 로드 (완료된 생산실적만)
        setIsLoading(true);
        setErrorMessage(null);

        try {
          const response = await executeQuery({
            query: PRODUCTION_RESULTS_QUERY,
            variables: { 
              filter: {
                flagActive: true
              }
            }
          });

          if (isMounted) {
            if (response.data && response.data.productionResults) {
              const formattedData = formatProductionResultData(response.data);
              setProductionResultList(formattedData);
            } else {
              setProductionResultList([]);
            }
            setIsLoading(false);
          }
        } catch (error) {
          if (isMounted) {
            console.error("Error fetching production results:", error);
            setErrorMessage('생산실적 데이터를 불러오는데 실패했습니다.');
            setIsLoading(false);
            setProductionResultList([]);
          }
        }
      }
    };

    init();

    // 언마운트 시 플래그 업데이트
    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  return {
    // 검색폼 관련
    control,
    handleSubmit,
    handleStartDateRangeChange,
    handleEndDateRangeChange,
    handleReset,
    handleSearch,

    // 생산실적 관련
    isLoading,
    productionResultList,
    handlePrint,
    handleExport,
    errorMessage,

    // 색상 및 테마
    getTextColor,
    getBgColor,
    getBorderColor,

    // 옵션 데이터
    equipmentOptions,
    productOptions,

    // 리프레시 키
    refreshKey
  };
};