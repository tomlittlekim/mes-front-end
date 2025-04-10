import { useState, useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { gql } from '@apollo/client';
import { useGraphQL } from '../../../../apollo/useGraphQL';
import Message from '../../../../utils/message/Message';
import useLocalStorageVO from '../../../Common/UseLocalStorageVO';

// GraphQL 쿼리 정의
const DEFECT_INFO_LIST_QUERY = gql`
    query defectInfoList($filter: DefectInfoFilter) {
        defectInfoList(filter: $filter) {
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
export const useDefectInquiry = (tabId) => {
  // API 연동 및 유틸리티
  const { executeQuery } = useGraphQL();
  const { loginUser } = useLocalStorageVO();

  // React Hook Form 설정
  const { control, handleSubmit, reset, getValues, setValue } = useForm({
    defaultValues: {
      workOrderId: '',
      prodResultId: '',
      productId: '',
      defectType: '',
      state: '',
      dateRange: {
        startDate: null,
        endDate: null
      }
    }
  });

  // 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [defectList, setDefectList] = useState([]);
  const [selectedDefect, setSelectedDefect] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // 초기화 함수
  const handleReset = useCallback(() => {
    reset({
      workOrderId: '',
      prodResultId: '',
      productId: '',
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

  // 검색 실행 함수
  const handleSearch = useCallback((data) => {
    setIsLoading(true);
    setSelectedDefect(null);

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

    // 불량 정보 검색
    executeQuery({
      query: DEFECT_INFO_LIST_QUERY,
      variables: { filter: filterData }
    })
    .then(response => {
      if (response.data && response.data.defectInfoList) {
        setDefectList(response.data.defectInfoList.map(item => ({
          ...item,
          id: item.defectId
        })));
        setRefreshKey(prev => prev + 1);
      }
      setIsLoading(false);
    })
    .catch(error => {
      console.error("Error fetching defect info:", error);
      Message.showError({message: '불량 정보를 불러오는데 실패했습니다.'});
      setIsLoading(false);
      setDefectList([]);
    });
  }, [executeQuery]);

  // 불량 선택 핸들러
  const handleDefectSelect = useCallback((params) => {
    const defect = defectList.find(d => d.id === params.id);
    setSelectedDefect(defect);
  }, [defectList]);

  // 출력 핸들러
  const handlePrint = useCallback(() => {
    if (!selectedDefect) {
      Message.showWarning('출력할 불량정보를 선택해주세요.');
      return;
    }

    Message.showSuccess('불량정보가 출력됩니다.');
    // 실제 인쇄 기능 구현 필요
  }, [selectedDefect]);

  // 엑셀 내보내기 핸들러
  const handleExport = useCallback(() => {
    if (defectList.length === 0) {
      Message.showWarning('내보낼 데이터가 없습니다.');
      return;
    }

    Message.showSuccess('불량정보 데이터가 엑셀로 내보내집니다.');
    // 실제 엑셀 내보내기 기능 구현 필요
  }, [defectList]);

  // 상세보기 핸들러
  const handleViewDetail = useCallback((defectId) => {
    const defect = defectList.find(d => d.id === defectId);
    if (defect) {
      setSelectedDefect(defect);
      setIsDetailDialogOpen(true);
    }
  }, [defectList]);

  // 상세보기 닫기 핸들러
  const handleCloseDetail = useCallback(() => {
    setIsDetailDialogOpen(false);
  }, []);

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    let isMounted = true;

    // 현재 날짜 기준 기본 날짜 범위 설정 (최근 7일)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);

    setValue('dateRange', { startDate, endDate });

    const timer = setTimeout(() => {
      if (isMounted) {
        try {
          handleSearch({
            dateRange: { startDate, endDate }
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
  }, []); // 의존성 배열에서 handleSearch를 제거하여 초기 로드 시에만 실행되도록 수정

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
    handleViewDetail,
    isDetailDialogOpen,
    handleCloseDetail,

    // 그리드 속성
    initialState,

    // 리프레시 키
    refreshKey
  };
};

export default useDefectInquiry;