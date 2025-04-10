import { useState, useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { gql } from '@apollo/client';
import { useGraphQL } from '../../../../apollo/useGraphQL';
import Message from '../../../../utils/message/Message';
import useLocalStorageVO from '../../../Common/UseLocalStorageVO';
import { printDefectInfo, exportDefectInfoToCSV } from '../utils/printDefectUtils';

// GraphQL 쿼리 정의 - 컴포넌트 외부로 이동하여 재생성 방지
const DEFECT_INFO_ALL_QUERY = gql`
    query {
        allDefectInfos {
            defectId
            workOrderId
            prodResultId
            productId
            productName
            defectQty
            defectType
            resultInfo
            defectCause
            state
            createDate
            updateDate
            createUser
        }
    }
`;

const DEFECT_INFO_BY_WORKORDER_QUERY = gql`
    query defectInfosByWorkOrderId($workOrderId: String!) {
        defectInfosByWorkOrderId(workOrderId: $workOrderId) {
            defectId
            workOrderId
            prodResultId
            productId
            productName
            defectQty
            defectType
            resultInfo
            defectCause
            state
            createDate
            updateDate
            createUser
        }
    }
`;

const DEFECT_INFO_BY_PRODRESULT_QUERY = gql`
    query defectInfosByProdResultId($prodResultId: String!) {
        defectInfosByProdResultId(prodResultId: $prodResultId) {
            defectId
            workOrderId
            prodResultId
            productId
            productName
            defectQty
            defectType
            resultInfo
            defectCause
            state
            createDate
            updateDate
            createUser
        }
    }
`;

/**
 * 불량정보 관리 컴포넌트의 로직을 처리하는 커스텀 훅
 *
 * @param {string} tabId - 탭 ID
 * @returns {Object} 불량정보 관리 관련 상태와 핸들러
 */
export const useDefectManagement = (tabId) => {
  // API 연동 및 유틸리티
  const { executeQuery } = useGraphQL();

  // React Hook Form 설정
  const { control, handleSubmit, reset, getValues, setValue } = useForm({
    defaultValues: {
      workOrderId: '',
      prodResultId: '',
      productId: '',
      productName: '',
      defectType: '',
      state: '',
      dateRange: {
        startDate: null,
        endDate: null
      }
    }
  });

  // 상태 관리
  const [isLoading, setIsLoading] = useState(false);
  const [defectList, setDefectList] = useState([]);
  const [selectedDefect, setSelectedDefect] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isInitialLoadDone, setIsInitialLoadDone] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 초기화 함수
  const handleReset = useCallback(() => {
    reset({
      workOrderId: '',
      prodResultId: '',
      productId: '',
      productName: '',
      defectType: '',
      state: '',
      dateRange: {
        startDate: null,
        endDate: null
      }
    });
  }, [reset]);

  // 날짜 범위 변경 핸들러
  const handleDateRangeChange = useCallback((startDate, endDate) => {
    setValue('dateRange', { startDate, endDate });
  }, [setValue]);

  // 불량 정보 조회 공통 함수
  const fetchDefectInfos = useCallback((query, variables = {}, filterData = null) => {
    setIsLoading(true);
    setErrorMessage('');

    return executeQuery({
      query: query,
      variables: variables
    })
    .then(response => {
      let resultData = [];
      if (response.data) {
        if (response.data.defectInfosByWorkOrderId) {
          resultData = response.data.defectInfosByWorkOrderId;
        } else if (response.data.defectInfosByProdResultId) {
          resultData = response.data.defectInfosByProdResultId;
        } else if (response.data.allDefectInfos) {
          resultData = response.data.allDefectInfos;
        }
      }

      // 추가 필터링 (클라이언트 사이드)
      if (resultData.length > 0 && filterData) {
        // 필터 조건 적용
        if (filterData.productId) {
          resultData = resultData.filter(item =>
              item.productId && item.productId.includes(filterData.productId)
          );
        }

        if (filterData.productName) {
          resultData = resultData.filter(item =>
              item.productName && item.productName.includes(filterData.productName)
          );
        }

        if (filterData.defectType) {
          resultData = resultData.filter(item =>
              item.resultInfo && item.resultInfo.includes(filterData.defectType)
          );
        }

        if (filterData.state) {
          resultData = resultData.filter(item =>
              item.state === filterData.state
          );
        }

        // 날짜 필터링
        if (filterData.dateRange && (filterData.dateRange.startDate || filterData.dateRange.endDate)) {
          let startDate, endDate;

          if (filterData.dateRange.startDate) {
            startDate = new Date(filterData.dateRange.startDate);
            startDate.setHours(0, 0, 0, 0);
          }

          if (filterData.dateRange.endDate) {
            endDate = new Date(filterData.dateRange.endDate);
            endDate.setHours(23, 59, 59, 999);
          }

          resultData = resultData.filter(item => {
            if (!item.createDate) return false;

            const itemDate = new Date(item.createDate);

            if (startDate && itemDate < startDate) return false;
            if (endDate && itemDate > endDate) return false;

            return true;
          });
        }
      }

      // ID 필드 매핑 추가
      const processedData = resultData.map(item => ({
        ...item,
        id: item.defectId
      }));

      return processedData;
    })
    .catch(error => {
      console.error("Error fetching defect info:", error);
      // 오류 메시지에서 유용한 정보 추출
      let errorMsg = '불량 정보를 불러오는데 실패했습니다.';
      if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        errorMsg += ' 서버 오류: ' + error.graphQLErrors[0].message;
      } else if (error.networkError) {
        errorMsg += ' 네트워크 오류가 발생했습니다.';
      }

      setErrorMessage(errorMsg);
      throw error; // 오류를 다시 던져서 호출자가 처리할 수 있게 함
    })
    .finally(() => {
      setIsLoading(false);
    });
  }, [executeQuery]);

  // 검색 실행 함수
  const handleSearch = useCallback((data) => {
    setSelectedDefect(null);

    // 필터 데이터 준비
    const filterData = {...data};

    // 쿼리 변수 및 쿼리 선택
    let query;
    let variables = {};

    // workOrderId가 있으면 해당 쿼리 사용
    if (filterData.workOrderId) {
      query = DEFECT_INFO_BY_WORKORDER_QUERY;
      variables = { workOrderId: filterData.workOrderId };
    }
    // prodResultId가 있으면 해당 쿼리 사용
    else if (filterData.prodResultId) {
      query = DEFECT_INFO_BY_PRODRESULT_QUERY;
      variables = { prodResultId: filterData.prodResultId };
    }
    // 둘 다 없으면 모든 불량 정보 조회
    else {
      query = DEFECT_INFO_ALL_QUERY;
    }

    // 불량 정보 검색
    fetchDefectInfos(query, variables, filterData)
    .then(processedData => {
      setDefectList(processedData);
      setRefreshKey(prev => prev + 1);
    })
    .catch(() => {
      Message.showError({message: '불량 정보 조회 중 오류가 발생했습니다.'});
      setDefectList([]);
    });
  }, [fetchDefectInfos]);

  // 불량 선택 핸들러
  const handleDefectSelect = useCallback((params) => {
    const defect = defectList.find(d => d.id === params.id);
    setSelectedDefect(defect);
  }, [defectList]);

  // 사용자 정보 가져오기
  const { loginUser } = useLocalStorageVO();

  // 출력 핸들러
  const handlePrint = useCallback(() => {
    if (defectList.length === 0) {
      Message.showWarning({message: '출력할 불량정보가 없습니다.'});
      return;
    }

    // 사용자 이름 가져오기
    const userName = loginUser?.userName || '관리자';

    // 출력 함수 호출 - 전체 목록 출력
    printDefectInfo(defectList, userName);
  }, [defectList, loginUser]);

  // 엑셀 내보내기 핸들러
  const handleExport = useCallback(() => {
    if (defectList.length === 0) {
      Message.showWarning({message: '내보낼 데이터가 없습니다.'});
      return;
    }

    // 엑셀 내보내기 함수 호출 - 전체 목록 내보내기
    exportDefectInfoToCSV(defectList);
  }, [defectList]);

  // 초기 데이터 로드 함수
  const loadInitialData = useCallback(() => {
    // 이미 초기 로드가 완료되었으면 다시 실행하지 않음
    if (isInitialLoadDone) return;

    // 현재 날짜 기준 기본 날짜 범위 설정 (최근 7일)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);

    setValue('dateRange', { startDate, endDate });

    try {
      // 초기 로드 시 모든 불량 정보 조회
      fetchDefectInfos(DEFECT_INFO_ALL_QUERY, {}, { dateRange: { startDate, endDate } })
      .then(processedData => {
        setDefectList(processedData);
        setRefreshKey(prev => prev + 1);
        setIsInitialLoadDone(true);
      })
      .catch(() => {
        Message.showError({message: '초기 불량 정보 조회 중 오류가 발생했습니다.'});
        setDefectList([]);
        setIsInitialLoadDone(true); // 에러가 나더라도 초기 로드 완료 표시
      });
    } catch (err) {
      console.error("Initial load error:", err);
      setErrorMessage('불량 정보를 불러오는데 실패했습니다: ' + err.message);
      Message.showError({message: '불량 정보를 불러오는데 실패했습니다.'});
      setIsInitialLoadDone(true); // 에러가 나더라도 초기 로드 완료 표시
    }
  }, [isInitialLoadDone, setValue, fetchDefectInfos]);

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    const timer = setTimeout(loadInitialData, 100);
    return () => clearTimeout(timer);
  }, [loadInitialData]);

  // 초기 정렬 상태 설정 - 불량ID 기준 내림차순 정렬
  const initialState = useMemo(() => ({
    sorting: {
      sortModel: [{ field: 'defectId', sort: 'desc' }]
    }
  }), []);

  return {
    // 검색폼 상태 및 핸들러
    control,
    handleSubmit,
    reset,
    getValues,
    setValue,
    handleDateRangeChange,
    handleReset,
    handleSearch,

    // 불량정보 관련 상태 및 핸들러
    isLoading,
    defectList,
    selectedDefect,
    handleDefectSelect,
    handlePrint,
    handleExport,
    errorMessage,

    // 그리드 속성
    initialState,

    // 리프레시 키
    refreshKey
  };
};

export default useDefectManagement;