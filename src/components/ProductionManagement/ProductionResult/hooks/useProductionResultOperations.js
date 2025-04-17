import { useCallback, useState, useRef } from 'react';
import { useGraphQL } from '../../../../apollo/useGraphQL';
import { useProductionResult } from './useProductionResult';
import Message from '../../../../utils/message/Message';
import Swal from 'sweetalert2';
import {
  PRODUCTION_RESULTS_BY_WORK_ORDER_QUERY,
  PRODUCTION_RESULTS_QUERY,
  DEFECT_INFO_BY_PROD_RESULT_QUERY
} from './graphql-queries';

/**
 * 생산실적 관련 작업을 처리하는 커스텀 훅
 */
export const useProductionResultOperations = (
    selectedWorkOrder,
    setSelectedWorkOrder,
    workOrderList,
    refreshWorkOrderList
) => {
  const { executeQuery } = useGraphQL();
  const { saveProductionResult, deleteProductionResult } = useProductionResult();

  // 불량정보 모달 관련 상태
  const [isDefectInfoModalOpen, setIsDefectInfoModalOpen] = useState(false);
  const [currentProductionResult, setCurrentProductionResult] = useState(null);
  const [defectInfos, setDefectInfos] = useState([]);
  const [defectInfosForSave, setDefectInfosForSave] = useState([]);
  const [modalResolveReject, setModalResolveReject] = useState({ resolve: null, reject: null, saveAction: null });

  // 중복 API 호출 방지를 위한 캐싱
  const lastLoadedWorkOrderId = useRef(null);
  const cachedProductionResults = useRef([]);

  // API 호출 중복 방지를 위한 ref
  const isLoadingRef = useRef(false);

  // 생산실적 목록 로드 함수 - 중복 호출 방지 및 캐싱 적용
  const loadProductionResults = useCallback((workOrder, setProductionResultList, setProductionResult) => {
    // 작업지시가 선택된 경우
    if (workOrder && workOrder.workOrderId) {
      // 동일한 작업지시에 대한 중복 호출 방지
      if (
          lastLoadedWorkOrderId.current === workOrder.workOrderId &&
          cachedProductionResults.current.length >= 0
      ) {
        setProductionResultList(cachedProductionResults.current);
        setProductionResult(null);
        return Promise.resolve({ data: { productionResultsByWorkOrderId: cachedProductionResults.current } });
      }

      // 중복 API 호출 방지
      if (isLoadingRef.current) {
        return Promise.resolve();
      }

      isLoadingRef.current = true;

      return executeQuery({
        query: PRODUCTION_RESULTS_BY_WORK_ORDER_QUERY,
        variables: { workOrderId: workOrder.workOrderId }
      })
      .then(response => {
        if (response.data && response.data.productionResultsByWorkOrderId) {
          const results = response.data.productionResultsByWorkOrderId.map(result => ({
            ...result,
            id: result.prodResultId
          }));
          setProductionResultList(results);

          // 캐시 업데이트
          lastLoadedWorkOrderId.current = workOrder.workOrderId;
          cachedProductionResults.current = results;
        } else {
          setProductionResultList([]);
          cachedProductionResults.current = [];
        }
        setProductionResult(null);
        return response;
      })
      .catch(error => {
        console.error("Error fetching production results:", error);
        setProductionResultList([]);
        setProductionResult(null);
        cachedProductionResults.current = [];
        return error;
      })
      .finally(() => {
        isLoadingRef.current = false;
      });
    }
    // 작업지시가 선택되지 않은 경우 - 생산실적 목록 초기화
    else {
      setProductionResultList([]);
      setProductionResult(null);
      cachedProductionResults.current = [];
      return Promise.resolve();
    }
  }, [executeQuery]);

  // 생산실적 목록 필터로 로드 함수 (신규) - 중복 호출 방지 적용
  const loadProductionResultsByFilter = useCallback((filter, setProductionResultList, setProductionResult) => {
    // 로딩 중인 경우 중복 호출 방지
    if (isLoadingRef.current) {
      return Promise.resolve();
    }

    isLoadingRef.current = true;

    return executeQuery({
      query: PRODUCTION_RESULTS_QUERY,
      variables: { filter }
    })
    .then(response => {
      if (response.data && response.data.productionResults) {
        const results = response.data.productionResults.map(result => ({
          ...result,
          id: result.prodResultId
        }));
        setProductionResultList(results);
      } else {
        setProductionResultList([]);
      }
      setProductionResult(null);
      return response;
    })
    .catch(error => {
      console.error("Error fetching production results by filter:", error);
      setProductionResultList([]);
      setProductionResult(null);
      return error;
    })
    .finally(() => {
      isLoadingRef.current = false;
    });
  }, [executeQuery]);

  // 불량정보 목록 로드 함수 - 중복 호출 방지 적용
  const loadDefectInfos = useCallback((prodResultId) => {
    if (!prodResultId) return Promise.resolve([]);

    // 로딩 중인 경우 중복 호출 방지
    if (isLoadingRef.current) {
      return Promise.resolve([]);
    }

    isLoadingRef.current = true;

    return executeQuery({
      query: DEFECT_INFO_BY_PROD_RESULT_QUERY,
      variables: { prodResultId }
    })
    .then(response => {
      if (response.data && response.data.defectInfosByProdResultId) {
        return response.data.defectInfosByProdResultId;
      }
      return [];
    })
    .catch(error => {
      console.error("Error fetching defect infos:", error);
      return [];
    })
    .finally(() => {
      isLoadingRef.current = false;
    });
  }, [executeQuery]);

  // 불량정보 모달 열기 함수
  const openDefectInfoModal = useCallback((productionResult) => {
    setCurrentProductionResult(productionResult);
    setIsDefectInfoModalOpen(true);

    // 기존 불량정보가 있는 경우 로드
    if (productionResult.prodResultId) {
      loadDefectInfos(productionResult.prodResultId)
      .then(defectInfos => {
        setDefectInfos(defectInfos);
      });
    } else {
      setDefectInfos([]);
    }
  }, [loadDefectInfos]);

  // 불량정보 모달 닫기 함수
  const closeDefectInfoModal = useCallback(() => {
    // 즉시 모달 상태 업데이트
    setIsDefectInfoModalOpen(false);
    setCurrentProductionResult(null);

    try {
      // 생산실적 저장 프로세스 중인 경우 - resolve 호출
      if (modalResolveReject.resolve) {
        // resolve를 호출하여 프로미스 체인 완료
        modalResolveReject.resolve();

        // 모달 닫기 안내 메시지 표시
        Swal.fire({
          title: '작업 취소',
          text: '불량정보 입력이 취소되었습니다.',
          icon: 'info',
          confirmButtonText: '확인'
        });
      }

      // 상태 초기화
      setModalResolveReject({ resolve: null, reject: null, saveAction: null });
    } catch (error) {
      console.error("Error during modal close:", error);
    }
  }, [modalResolveReject]);

  // 불량정보 저장 핸들러
  const handleSaveDefectInfos = useCallback((defectInfoList) => {
    // DefectInfoInput에 맞게 데이터 구조 변환
    const formattedDefectInfos = defectInfoList.map(item => ({
      workOrderId: item.workOrderId,
      prodResultId: item.prodResultId,
      productId: item.productId,
      defectQty: Number(item.defectQty),
      defectType: item.defectType,
      defectCause: item.defectCause,
      resultInfo: item.resultInfo || item.defectType,
      state: item.state || "NEW",
      flagActive: true
    }));

    // 중요: defectInfosForSave 상태 업데이트
    setDefectInfosForSave(formattedDefectInfos);

    // 모달 닫기
    setIsDefectInfoModalOpen(false);

    // 불량정보 저장 후 생산실적 저장 액션 실행
    if (modalResolveReject.saveAction) {
      // 불량정보가 저장되었으므로 생산실적 저장 액션 실행
      // 여기서 formattedDefectInfos를 직접 전달하여 최신 상태를 보장
      modalResolveReject.saveAction(formattedDefectInfos);

      // 상태 초기화
      setModalResolveReject({ resolve: null, reject: null, saveAction: null });
    }
  }, [modalResolveReject]);

  // 생산실적 셀 값 변경 감지 핸들러
  const handleProductionResultEdit = useCallback((updatedRow) => {
    // 불량수량이 변경되었고 0으로 설정된 경우 불량정보 초기화
    if (updatedRow.defectQty === 0) {
      setDefectInfosForSave([]);
    }
  }, []);

  // 생산실적 저장 함수 - 중복 저장 방지
  const saveResult = useCallback((
      productionResult,
      productionResultList,
      setProductionResult,
      setProductionResultList
  ) => {
    try {
      if (!productionResult) {
        Message.showWarning('저장할 생산실적이 없습니다.');
        return Promise.resolve();
      }

      // 로딩 중인 경우 중복 호출 방지
      if (isLoadingRef.current) {
        Message.showWarning('처리 중입니다. 잠시만 기다려주세요.');
        return Promise.resolve();
      }

      isLoadingRef.current = true;

      // productionResultList에서 현재 선택된 행 다시 가져오기
      const currentRow = productionResultList.find(row => row.id === productionResult.id);

      if (!currentRow) {
        Message.showWarning('저장할 생산실적이 없습니다.');
        isLoadingRef.current = false;
        return Promise.resolve();
      }

      // 제품ID 필수 체크 - 작업지시가 없는 경우
      if (!currentRow.productId && (!selectedWorkOrder || !selectedWorkOrder.productId)) {
        Message.showWarning('제품ID는 필수 입력 항목입니다.');
        isLoadingRef.current = false;
        return Promise.resolve();
      }

      // 양품수량과 불량수량이 음수인지 검사
      if (currentRow.goodQty < 0 || currentRow.defectQty < 0) {
        Message.showWarning('양품수량과 불량수량은 0 이상이어야 합니다.');
        isLoadingRef.current = false;
        return Promise.resolve();
      }

      // 불량수량이 0보다 큰데 불량정보가 없는 경우 불량정보 입력 모달 표시
      if (currentRow.defectQty > 0 && defectInfosForSave.length === 0) {
        // 불량정보 모달 표시
        openDefectInfoModal(currentRow);
        isLoadingRef.current = false;

        // Promise 반환하여 모달 처리 완료 후 계속 진행
        return new Promise((resolve, reject) => {
          // 불량정보가 저장된 후 실행할 액션 저장
          setModalResolveReject({
            resolve,
            reject,
            // saveAction에 최신 불량정보를 전달받도록 수정
            saveAction: (latestDefectInfos) => {
              isLoadingRef.current = true;
              // 여기서 latestDefectInfos는 handleSaveDefectInfos에서 생성된 최신 불량정보
              saveProductionResult(
                  !currentRow.prodResultId,
                  currentRow,
                  selectedWorkOrder || { productId: currentRow.productId }, // 작업지시가 없으면 생산실적의 제품ID 사용
                  latestDefectInfos || defectInfosForSave, // 최신 불량정보 또는 상태에 저장된 불량정보 사용
                  () => {
                    // 성공 메시지 표시 후, 생산실적 저장 이후 항상 상태 초기화
                    setTimeout(() => {
                      // 작업지시 목록 갱신
                      refreshWorkOrderList();
                      // 항상 오른쪽 그리드 초기화
                      setSelectedWorkOrder(null);
                      setProductionResult(null);
                      setProductionResultList([]);
                      // 불량정보 상태 초기화
                      setDefectInfosForSave([]);
                      isLoadingRef.current = false;
                      resolve();
                    }, 500);
                  }
              ).catch(error => {
                console.error("Error during saveProductionResult:", error);
                Swal.fire({
                  title: '저장 실패',
                  text: '생산실적 저장 중 오류가 발생했습니다.',
                  icon: 'error',
                  confirmButtonText: '확인'
                });
                isLoadingRef.current = false;
                resolve();
              });
            }
          });
        });
      }

      // 생산실적 데이터 준비
      const isNewResult = !currentRow.prodResultId;
      const productionInfo = selectedWorkOrder || { productId: currentRow.productId }; // 작업지시가 없으면 생산실적의 제품ID 사용

      return saveProductionResult(
          isNewResult,
          currentRow,
          productionInfo,
          defectInfosForSave, // 상태에 저장된 불량정보 사용
          () => {
            // 성공 메시지 표시 후, 생산실적 저장 이후 항상 상태 초기화
            setTimeout(() => {
              // 작업지시 목록 갱신
              refreshWorkOrderList();

              // 항상 오른쪽 그리드 초기화
              setSelectedWorkOrder(null);
              setProductionResult(null);
              setProductionResultList([]);

              // 불량정보 상태 초기화
              setDefectInfosForSave([]);
              isLoadingRef.current = false;
            }, 500);
          }
      ).catch(error => {
        console.error("Error during saveProductionResult:", error);
        isLoadingRef.current = false;

        if (error.graphQLErrors && error.graphQLErrors.length > 0) {
          const errorMessage = error.graphQLErrors[0].message;

          if (errorMessage.includes('작업지시수량') && errorMessage.includes('초과')) {
            Message.showError({ message: errorMessage });
          } else {
            Message.showError({ message: '생산실적 저장 중 오류가 발생했습니다.' });
          }
        } else {
          Message.showError({ message: '생산실적 저장 중 오류가 발생했습니다.' });
        }
        return Promise.resolve();
      });
    } catch (error) {
      console.error("Unexpected error in saveResult:", error);
      Message.showError({ message: '저장 중 오류가 발생했습니다.' });
      isLoadingRef.current = false;
      return Promise.resolve();
    }
  }, [
    selectedWorkOrder,
    saveProductionResult,
    refreshWorkOrderList,
    setSelectedWorkOrder,
    defectInfosForSave,
    openDefectInfoModal,
    setModalResolveReject
  ]);

  // 생산실적 삭제 함수 - 중복 삭제 방지
  const deleteResult = useCallback((
      productionResult,
      setProductionResult,
      setProductionResultList
  ) => {
    if (!productionResult) {
      Message.showWarning('삭제할 생산실적을 선택해주세요.');
      return;
    }

    // 로딩 중인 경우 중복 호출 방지
    if (isLoadingRef.current) {
      Message.showWarning('처리 중입니다. 잠시만 기다려주세요.');
      return;
    }

    isLoadingRef.current = true;

    // 임시 ID인 경우 (저장되지 않은 행)
    if (productionResult.id.toString().startsWith('temp_')) {
      setProductionResultList(prev => prev.filter(item => item.id !== productionResult.id));
      setProductionResult(null);
      isLoadingRef.current = false;
      return;
    }

    if (!productionResult.prodResultId) {
      Message.showWarning('삭제할 생산실적을 선택해주세요.');
      isLoadingRef.current = false;
      return;
    }

    deleteProductionResult(
        productionResult.prodResultId,
        () => {
          // 삭제 후 상태 초기화
          refreshWorkOrderList();

          // 항상 오른쪽 그리드 초기화
          setSelectedWorkOrder(null);
          setProductionResult(null);
          setProductionResultList([]);
          isLoadingRef.current = false;
        }
    );
  }, [deleteProductionResult, refreshWorkOrderList, setSelectedWorkOrder]);

  // 새 생산실적 생성 함수 (작업지시 기반)
  const createResult = useCallback((setProductionResultList, setProductionResult, productResultListData) => {
    // 새 생산실적 객체 생성
    const newResult = {
      id: `temp_${Date.now()}`, // 임시 ID (클라이언트용)
      workOrderId: selectedWorkOrder ? selectedWorkOrder.workOrderId : null,
      prodResultId: null, // 서버에서 생성될 ID
      productId: selectedWorkOrder ? selectedWorkOrder.productId : "",
      goodQty: 0,
      defectQty: 0,
      equipmentId: "",
      resultInfo: "",
      defectCause: "",
      progressRate: null, // 백엔드에서 자동 계산될 값
      defectRate: null, // 백엔드에서 자동 계산될 값
      createDate: null, // 백엔드에서 자동 설정될 값
      flagActive: true
    };

    // 새 행을 목록에 추가하고 선택
    setProductionResultList(prev => [newResult, ...prev]);
    setProductionResult(newResult);

    // 불량정보 상태 초기화
    setDefectInfosForSave([]);
  }, [selectedWorkOrder]);

  // 새 생산실적 생성 함수 (독립형) - 신규
  const createIndependentResult = useCallback((setProductionResultList, setProductionResult) => {
    // 작업지시와 무관한 새 생산실적 객체 생성
    const newResult = {
      id: `temp_${Date.now()}`, // 임시 ID (클라이언트용)
      workOrderId: null, // 작업지시 없음
      prodResultId: null, // 서버에서 생성될 ID
      productId: "", // 제품ID 입력 필요
      goodQty: 0,
      defectQty: 0,
      equipmentId: "",
      resultInfo: "",
      defectCause: "",
      progressRate: null,
      defectRate: null,
      createDate: null,
      flagActive: true
    };

    // 새 행을 목록에 추가하고 선택
    setProductionResultList(prev => [newResult, ...prev]);
    setProductionResult(newResult);

    // 불량정보 상태 초기화
    setDefectInfosForSave([]);
  }, []);

  return {
    loadProductionResults,
    loadProductionResultsByFilter,
    saveResult,
    deleteResult,
    createResult,
    createIndependentResult,
    isDefectInfoModalOpen,
    openDefectInfoModal,
    closeDefectInfoModal,
    handleSaveDefectInfos,
    currentProductionResult,
    defectInfos,
    handleProductionResultEdit
  };
};