// useProductionResultOperations.js의 문제 해결
import { useCallback, useState } from 'react';
import { gql } from '@apollo/client';
import { useGraphQL } from '../../../../apollo/useGraphQL';
import { useProductionResult } from './useProductionResult';
import Message from '../../../../utils/message/Message';
import Swal from 'sweetalert2';

// GraphQL 쿼리 정의 유지
export const PRODUCTION_RESULTS_BY_WORK_ORDER_QUERY = gql`
    query getProductionResultsByWorkOrderId($workOrderId: String!) {
        productionResultsByWorkOrderId(workOrderId: $workOrderId) {
            id
            workOrderId
            prodResultId
            goodQty
            defectQty
            progressRate
            defectRate
            equipmentId
            resultInfo
            defectCause
            createUser
            createDate
            updateUser
            updateDate
            flagActive
        }
    }
`;

export const DEFECT_INFO_BY_PROD_RESULT_QUERY = gql`
    query getDefectInfosByProdResultId($prodResultId: String!) {
        defectInfosByProdResultId(prodResultId: $prodResultId) {
            id
            workOrderId
            prodResultId
            defectId
            productId
            defectQty
            defectType
            defectReason
            resultInfo
            state
            defectCause
            createUser
            createDate
            updateUser
            updateDate
            flagActive
        }
    }
`;

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

  // 생산실적 목록 로드 함수
  const loadProductionResults = useCallback((workOrder, setProductionResultList, setProductionResult) => {
    if (workOrder && workOrder.workOrderId) {
      executeQuery({
        query: PRODUCTION_RESULTS_BY_WORK_ORDER_QUERY,
        variables: { workOrderId: workOrder.workOrderId }
      })
      .then(response => {
        if (response.data && response.data.productionResultsByWorkOrderId) {
          const results = response.data.productionResultsByWorkOrderId.map(result => ({
            ...result,
            id: result.prodResultId
          }));

          // 여기서 진척률이 서버에서 제대로 계산되지 않았을 경우 계산 가능
          // 작업지시수량 대비 모든 생산실적의 양품수량 합계로 진척률 계산

          setProductionResultList(results);
        } else {
          setProductionResultList([]);
        }
        setProductionResult(null);
      })
      .catch(error => {
        console.error("Error fetching production results:", error);
        setProductionResultList([]);
        setProductionResult(null);
      });
    } else {
      setProductionResultList([]);
      setProductionResult(null);
    }
  }, [executeQuery]);

  // 불량정보 목록 로드 함수
  const loadDefectInfos = useCallback((prodResultId) => {
    if (!prodResultId) return Promise.resolve([]);

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

  // 불량정보 저장 핸들러 - 수정됨
  const handleSaveDefectInfos = useCallback((defectInfoList) => {
    console.log("불량정보 저장 시작:", defectInfoList);

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

    console.log("변환된 불량정보:", formattedDefectInfos);

    // 중요: defectInfosForSave 상태 업데이트
    setDefectInfosForSave(formattedDefectInfos);

    // 모달 닫기
    setIsDefectInfoModalOpen(false);

    // 불량정보 저장 후 생산실적 저장 액션 실행
    if (modalResolveReject.saveAction) {
      console.log("저장 액션 실행");
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

  // 생산실적 저장 함수 - 수정됨
  const saveResult = useCallback((
      productionResult,
      productionResultList,
      setProductionResult,
      setProductionResultList
  ) => {
    try {
      if (!selectedWorkOrder) {
        Message.showWarning('작업지시를 선택해주세요.');
        return Promise.resolve();
      }

      if (!productionResult) {
        Message.showWarning('저장할 생산실적이 없습니다.');
        return Promise.resolve();
      }

      // productionResultList에서 현재 선택된 행 다시 가져오기
      const currentRow = productionResultList.find(row => row.id === productionResult.id);

      if (!currentRow) {
        Message.showWarning('저장할 생산실적이 없습니다.');
        return Promise.resolve();
      }

      // 양품수량과 불량수량이 음수인지 검사
      if (currentRow.goodQty < 0 || currentRow.defectQty < 0) {
        Message.showWarning('양품수량과 불량수량은 0 이상이어야 합니다.');
        return Promise.resolve();
      }

      // 불량수량이 0보다 큰데 불량정보가 없는 경우 불량정보 입력 모달 표시
      if (currentRow.defectQty > 0 && defectInfosForSave.length === 0) {
        console.log("불량수량 있음, 불량정보 입력 모달 표시");
        // 불량정보 모달 표시
        openDefectInfoModal(currentRow);

        // Promise 반환하여 모달 처리 완료 후 계속 진행
        return new Promise((resolve, reject) => {
          // 불량정보가 저장된 후 실행할 액션 저장
          setModalResolveReject({
            resolve,
            reject,
            // saveAction에 최신 불량정보를 전달받도록 수정
            saveAction: (latestDefectInfos) => {
              // 여기서 latestDefectInfos는 handleSaveDefectInfos에서 생성된 최신 불량정보
              console.log("불량정보 저장 완료, 생산실적 저장 시작", latestDefectInfos);
              saveProductionResult(
                  !currentRow.prodResultId,
                  currentRow,
                  selectedWorkOrder,
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
                resolve();
              });
            }
          });
        });
      }

      // 생산실적 데이터 준비
      const isNewResult = !currentRow.prodResultId;

      console.log("생산실적 저장 시작:", {
        isNewResult,
        currentRow,
        selectedWorkOrder,
        defectInfosForSave
      });

      return saveProductionResult(
          isNewResult,
          currentRow,
          selectedWorkOrder,
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
            }, 500);
          }
      ).catch(error => {
        console.error("Error during saveProductionResult:", error);

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

  // 생산실적 삭제 함수
  const deleteResult = useCallback((
      productionResult,
      setProductionResult,
      setProductionResultList
  ) => {
    if (!selectedWorkOrder || !productionResult) {
      Message.showWarning('삭제할 생산실적을 선택해주세요.');
      return;
    }

    // 임시 ID인 경우 (저장되지 않은 행)
    if (productionResult.id.toString().startsWith('temp_')) {
      setProductionResultList(prev => prev.filter(item => item.id !== productionResult.id));
      setProductionResult(null);
      return;
    }

    if (!productionResult.prodResultId) {
      Message.showWarning('삭제할 생산실적을 선택해주세요.');
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
        }
    );
  }, [selectedWorkOrder, deleteProductionResult, refreshWorkOrderList, setSelectedWorkOrder]);

  // 새 생산실적 생성 함수
  const createResult = useCallback((setProductionResultList, setProductionResult, productResultListData) => {
    if (!selectedWorkOrder) {
      Message.showWarning('작업지시를 선택해주세요.');
      return;
    }

    // 기존 양품수량 합계 계산 - 매개변수로 받은 데이터 사용
    const existingGoodQtySum = productResultListData?.reduce((sum, result) => {
      return sum + (Number(result.goodQty) || 0);
    }, 0) || 0;

    console.log('기존 생산실적 양품수량 합계:', existingGoodQtySum);
    console.log('작업지시수량:', selectedWorkOrder.orderQty);

    // 새 생산실적 객체 생성
    const newResult = {
      id: `temp_${Date.now()}`, // 임시 ID (클라이언트용)
      workOrderId: selectedWorkOrder.workOrderId,
      prodResultId: null, // 서버에서 생성될 ID
      goodQty: 0,
      defectQty: 0,
      equipmentId: "",
      resultInfo: "",
      defectCause: "",
      progressRate: null, // 백엔드에서 자동 계산될 값
      defectRate: null, // 백엔드에서 자동 계산될 값
      createDate: null, // 백엔드에서 자동 설정될 값
      flagActive: true,

      // 클라이언트 측 진척률 계산을 위한 메타데이터 (필요 시)
      _existingGoodQtySum: existingGoodQtySum,
      _orderQty: selectedWorkOrder.orderQty
    };

    // 새 행을 목록에 추가하고 선택
    setProductionResultList(prev => [newResult, ...prev]);
    setProductionResult(newResult);

    // 불량정보 상태 초기화
    setDefectInfosForSave([]);
  }, [selectedWorkOrder, setDefectInfosForSave]);

  return {
    loadProductionResults,
    saveResult,
    deleteResult,
    createResult,
    isDefectInfoModalOpen,
    openDefectInfoModal,
    closeDefectInfoModal,
    handleSaveDefectInfos,
    currentProductionResult,
    defectInfos,
    handleProductionResultEdit
  };
};

export default useProductionResultOperations;