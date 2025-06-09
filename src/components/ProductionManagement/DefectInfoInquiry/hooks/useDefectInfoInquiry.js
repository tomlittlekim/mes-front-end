import { useState, useEffect, useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { useDomain, DOMAINS } from '../../../../contexts/DomainContext';
import { useTheme } from '@mui/material';
import { useGridUtils } from '../../../../utils/grid/useGridUtils';
import { useGraphQL } from '../../../../apollo/useGraphQL';
import useLocalStorageVO from '../../../Common/UseLocalStorageVO';
import Message from '../../../../utils/message/Message';
import { printDefectInfo, exportDefectInfoToCSV } from '../utils/printUtils';
import { formatDefectInfoData } from '../utils/gridDataUtils';
import { ALL_DEFECT_INFOS_QUERY } from '../utils/graphqlQueries';
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
 * 불량조회 기능 제공 커스텀 훅
 *
 * @param {string} tabId - 탭 ID
 * @returns {Object} 불량조회에 필요한 상태 및 함수들
 */
export const useDefectInfoInquiry = (tabId) => {
  // 테마, 도메인 및 시스템 설정
  const theme = useTheme();
  const { domain } = useDomain();
  const isDarkMode = theme.palette.mode === 'dark';
  const { loginUser } = useLocalStorageVO();

  // React Hook Form 설정
  const { control, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      defectId: '',
      prodResultId: '',
      productId: '',
      equipmentId: '',
      dateRange: {
        startDate: null,
        endDate: null
      }
    }
  });

  // 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [defectInfoList, setDefectInfoList] = useState([]);
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

  // 날짜 범위 변경 핸들러
  const handleDateRangeChange = useCallback((fieldName, startDate, endDate) => {
    setValue(fieldName, { startDate, endDate });
  }, [setValue]);

  // 불량정보 목록 로드 함수
  const loadDefectInfos = useCallback((filter = {}) => {
    setIsLoading(true);
    setErrorMessage(null);

    // 날짜 범위 변환
    let variables = {};
    if (filter.dateRange?.startDate || filter.dateRange?.endDate) {
      const startDate = filter.dateRange?.startDate ? format(filter.dateRange.startDate, 'yyyy-MM-dd') : null;
      const endDate = filter.dateRange?.endDate ? format(filter.dateRange.endDate, 'yyyy-MM-dd') : null;
      
      // 날짜 범위 필터에 추가
      variables.startDate = startDate;
      variables.endDate = endDate;
    }

    // ID 필터 추가
    if (filter.defectId) {
      variables.defectId = filter.defectId;
    }
    if (filter.prodResultId) {
      variables.prodResultId = filter.prodResultId;
    }
    if (filter.productId) {
      variables.productId = filter.productId;
    }
    if (filter.equipmentId) {
      variables.equipmentId = filter.equipmentId;
    }

    return executeQuery({
      query: ALL_DEFECT_INFOS_QUERY
    })
    .then(response => {
      if (response.data) {
        // 필터 조건에 맞는 데이터만 클라이언트에서 필터링 (GraphQL 쿼리에 필터 옵션이 없으므로)
        let filteredData = { ...response.data };
        
        if (Object.keys(variables).length > 0) {
          const filtered = filteredData.allDefectInfos.filter(defect => {
            // 각 필터 조건을 확인
            if (variables.defectId && !defect.defectId?.includes(variables.defectId)) return false;
            if (variables.prodResultId && !defect.prodResultId?.includes(variables.prodResultId)) return false;
            if (variables.productId && defect.productId !== variables.productId) return false;
            if (variables.equipmentId && defect.equipmentId !== variables.equipmentId) return false;
            
            // 날짜 범위 필터링
            if (variables.startDate || variables.endDate) {
              const createDate = defect.createDate ? new Date(defect.createDate) : null;
              if (!createDate) return false;
              
              const createDateStr = format(createDate, 'yyyy-MM-dd');
              if (variables.startDate && createDateStr < variables.startDate) return false;
              if (variables.endDate && createDateStr > variables.endDate) return false;
            }
            
            return true;
          });
          
          filteredData.allDefectInfos = filtered;
        }
        
        const formattedData = formatDefectInfoData(filteredData);
        setDefectInfoList(formattedData);
      } else {
        setDefectInfoList([]);
      }
      setIsLoading(false);
      return response;
    })
    .catch(error => {
      console.error("Error fetching defect info:", error);
      setErrorMessage('불량정보 데이터를 불러오는데 실패했습니다.');
      setIsLoading(false);
      setDefectInfoList([]);
      throw error;
    });
  }, [executeQuery]);

  // 초기화 함수
  const handleReset = useCallback(() => {
    reset({
      defectId: '',
      prodResultId: '',
      productId: '',
      equipmentId: '',
      dateRange: {
        startDate: null,
        endDate: null
      }
    });
  }, [reset]);

  // 검색 핸들러
  const handleSearch = useCallback((data) => {
    loadDefectInfos(data);
  }, [loadDefectInfos]);

  // 출력 핸들러
  const handlePrint = useCallback(() => {
    printDefectInfo(defectInfoList, productOptions, equipmentOptions);
  }, [defectInfoList, productOptions, equipmentOptions]);

  // 엑셀 내보내기 핸들러
  const handleExport = useCallback(() => {
    exportDefectInfoToCSV(defectInfoList, productOptions, equipmentOptions);
  }, [defectInfoList, productOptions, equipmentOptions]);

  // 테마 관련 유틸리티 함수
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

  // 초기화 함수
  const init = async () => {
    setIsLoading(true);
    
    try {
      // 필요한 마스터 데이터 로드
      await Promise.all([
        loadProductMaterials(),
        loadEquipments()
      ]);
      
      // 불량정보 데이터 로드
      await loadDefectInfos();
    } catch (error) {
      console.error("초기화 중 오류 발생:", error);
      setErrorMessage('데이터 로드 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 초기화
  useEffect(() => {
    init();
    
    // 컴포넌트 언마운트 시 클린업
    return () => {
      // 클린업 로직
    };
  }, [refreshKey]);

  // 훅에서 노출할 값들
  return {
    // 불량 정보 관련
    isLoading,
    defectInfoList,
    handlePrint,
    handleExport,
    errorMessage,
    handleSearch,
    handleReset,

    // 색상 및 테마
    getTextColor,
    getBgColor,
    getBorderColor,

    // 선택 옵션
    equipmentOptions,
    productOptions,

    // 리프레시 키
    refreshKey,
    setRefreshKey,

    // 기타 유틸리티
    handleDateRangeChange,
    formatDateToYYYYMMDD
  };
};

export default useDefectInfoInquiry; 