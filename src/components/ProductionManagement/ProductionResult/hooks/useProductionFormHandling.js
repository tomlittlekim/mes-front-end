import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';

/**
 * 검색 폼 및 필터 관련 로직을 처리하는 커스텀 훅
 */
export const useProductionFormHandling = (loadWorkOrders, setSelectedWorkOrder, setProductionResult, setProductionResultList) => {
  // React Hook Form 설정
  const { control, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      workOrderId: '',
      productId: '',
      equipmentId: '',
      dateRange: {
        startDate: null,
        endDate: null
      }
    }
  });

  // 날짜 범위 변경 핸들러
  const handleDateRangeChange = useCallback((startDate, endDate) => {
    setValue('dateRange', { startDate, endDate });
  }, [setValue]);

  // 초기화 함수
  const handleReset = useCallback(() => {
    reset({
      workOrderId: '',
      productId: '',
      equipmentId: '',
      dateRange: {
        startDate: null,
        endDate: null
      }
    });
  }, [reset]);

  // 검색 실행 함수
  const handleSearch = useCallback((data) => {
    // 선택 상태 초기화
    setSelectedWorkOrder(null);
    setProductionResult(null);
    setProductionResultList([]); // 검색 시 생산실적 목록 초기화 추가

    // 날짜 형식 변환과 필터 객체 생성
    const filter = {};

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

    console.log("1",data.dateRange);

    // dateRange 객체에서 시작일/종료일을 추출하여 필터 데이터로 변환
    if (data.dateRange) {
      if (data.dateRange.startDate) {
        try {
          filter.planStartDateFrom = format(data.dateRange.startDate, 'yyyy-MM-dd');
        } catch (error) {
          console.error("Invalid startDate:", error);
        }
      }

      if (data.dateRange.endDate) {
        try {
          filter.planStartDateTo = format(data.dateRange.endDate, 'yyyy-MM-dd');
        } catch (error) {
          console.error("Invalid endDate:", error);
        }
      }
    }

    // 상태 필터 - 생산 가능한 상태의 작업지시만 조회 ('IN_PROGRESS'만 허용)
    filter.state = ['IN_PROGRESS'];

    // flagActive는 항상 true로 설정 (활성화된 데이터만 조회)
    filter.flagActive = true;

    // 작업지시 검색
    loadWorkOrders(filter);
  }, [loadWorkOrders, setSelectedWorkOrder, setProductionResult, setProductionResultList]);

  return {
    control,
    handleSubmit,
    reset,
    setValue,
    handleDateRangeChange,
    handleReset,
    handleSearch
  };
};