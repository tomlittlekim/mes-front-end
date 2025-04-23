import { useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';

/**
 * 검색 폼 및 필터 관련 로직을 처리하는 커스텀 훅
 */
export const useProductionFormHandling = (loadWorkOrders, setSelectedWorkOrder, setProductionResult, setProductionResultList) => {
  // React Hook Form 설정
  const { control, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      prodPlanId: '',
      workOrderId: '',
      productId: '',
      workType: ''
    }
  });

  // 중복 실행 방지를 위한 ref
  const isSearchingRef = useRef(false);
  const lastSearchParamsRef = useRef(null);

  // 초기화 함수
  const handleReset = useCallback(() => {
    reset({
      prodPlanId: '',
      workOrderId: '',
      productId: '',
      workType: ''
    });

    // 검색 상태 초기화
    isSearchingRef.current = false;
    lastSearchParamsRef.current = null;
  }, [reset]);

  // 검색 실행 함수 - 중복 실행 방지 및 동일 검색 스킵
  const handleSearch = useCallback((data) => {
    // 이미 검색 중인 경우 중복 실행 방지
    if (isSearchingRef.current) {
      return;
    }

    // 동일한 검색 파라미터로 중복 검색 방지
    const searchParams = JSON.stringify(data);
    if (lastSearchParamsRef.current === searchParams) {
      return;
    }

    isSearchingRef.current = true;
    lastSearchParamsRef.current = searchParams;

    // 선택 상태 초기화
    setSelectedWorkOrder(null);
    setProductionResult(null);
    setProductionResultList([]); // 검색 시 생산실적 목록 초기화 추가

    // 날짜 형식 변환과 필터 객체 생성
    const filter = {};

    // 생산계획ID가 있으면 추가
    if (data.prodPlanId) {
      filter.prodPlanId = data.prodPlanId;
    }

    // workOrderId가 있으면 추가
    if (data.workOrderId) {
      filter.workOrderId = data.workOrderId;
    }

    // productId가 있으면 추가
    if (data.productId) {
      filter.productId = data.productId;
    }

    // 근무타입이 있으면 추가
    if (data.workType) {
      filter.shiftType = data.workType;
    }

    // 상태 필터 - 생산 가능한 상태의 작업지시만 조회 ('IN_PROGRESS'만 허용)
    filter.state = ['IN_PROGRESS'];

    // flagActive는 항상 true로 설정 (활성화된 데이터만 조회)
    filter.flagActive = true;

    // 작업지시 검색
    loadWorkOrders(filter)
    .finally(() => {
      // 검색 완료 후 상태 업데이트
      isSearchingRef.current = false;
    });
  }, [loadWorkOrders, setSelectedWorkOrder, setProductionResult, setProductionResultList]);

  return {
    control,
    handleSubmit,
    reset,
    setValue,
    handleReset,
    handleSearch
  };
};