import {useCallback, useState, useRef, useEffect} from 'react';
import {useGraphQL} from '../../../../apollo/useGraphQL';
import {useProductionResult} from './useProductionResult';
import Message from '../../../../utils/message/Message';
import Swal from 'sweetalert2';
import {
  PRODUCTION_RESULTS_BY_WORK_ORDER_QUERY,
  PRODUCTION_RESULTS_QUERY,
  DEFECT_INFO_BY_PROD_RESULT_QUERY
} from './graphql-queries';

/**
 * 생산실적 관련 작업을 처리하는 커스텀 훅
 *
 * @param {Object} selectedWorkOrder - 선택된 작업지시 정보
 * @param {Function} setSelectedWorkOrder - 작업지시 선택 상태 변경 함수
 * @param {Array} workOrderList - 작업지시 목록
 * @param {Function} refreshWorkOrderList - 작업지시 목록 새로고침 함수
 * @param {Function} setProductionResultList - 생산실적 목록 상태 변경 함수
 * @param {Function} setProductionResult - 선택된 생산실적 상태 변경 함수
 * @returns {Object} 생산실적 관련 함수와 상태
 */
export const useProductionResultOperations = (
    selectedWorkOrder,
    setSelectedWorkOrder,
    workOrderList,
    refreshWorkOrderList,
    setProductionResultList,
    setProductionResult,
    defectInfosMap = {} // 불량정보 맵 추가 (기본값 빈 객체)
) => {
  const {executeQuery} = useGraphQL();
  const { 
    saveProductionResult, 
    deleteProductionResult, 
    deleteProductionResults,
    saveMultipleProductionResults
  } = useProductionResult();

  // 상태 관리
  const [isDefectInfoModalOpen, setIsDefectInfoModalOpen] = useState(false);
  const [currentProductionResult, setCurrentProductionResult] = useState(null);
  const [defectInfos, setDefectInfos] = useState([]);
  const [defectInfosForSave, setDefectInfosForSave] = useState([]);
  const [modalResolveReject, setModalResolveReject] = useState({
    resolve: null,
    reject: null,
    saveAction: null
  });
  const [isIndependentModalOpen, setIsIndependentModalOpen] = useState(false);

  // 참조 상태 (refs)
  const lastLoadedWorkOrderId = useRef(null);
  const cachedProductionResults = useRef([]);
  const isLoadingRef = useRef(false);

  // ref를 통해 전역 맵에 추가하는 함수 - 내부 상태 참조
  const setDefectInfosMapRef = useRef(null);

  // 불량정보 맵 업데이트 함수 추가
  const updateDefectInfosMap = useCallback((rowId, defectInfos) => {
    if (setDefectInfosMapRef.current) {
      setDefectInfosMapRef.current(prevMap => {
        const newMap = {
          ...prevMap,
          [rowId]: defectInfos
        };
        return newMap;
      });
    }
  }, []);

  // 강제로 로딩 상태를 초기화하는 함수
  const forceResetLoadingState = useCallback(() => {
    isLoadingRef.current = false;
    
    // 모든 모달 관련 상태도 초기화
    setIsDefectInfoModalOpen(false);
    setCurrentProductionResult(null);
    setModalResolveReject({resolve: null, reject: null, saveAction: null});
    setIsIndependentModalOpen(false);
  }, []);

  // 컴포넌트 언마운트 시 상태 정리
  useEffect(() => {
    return () => {
      // 컴포넌트가 언마운트될 때 모든 상태 초기화
      isLoadingRef.current = false;
    };
  }, []);

  /**
   * 작업지시에 따른 생산실적 목록 로드
   *
   * @param {Object} workOrder - 작업지시 객체
   * @param {Function} setProductionResultList - 생산실적 목록 상태 변경 함수
   * @param {Function} setProductionResult - 선택된 생산실적 상태 변경 함수
   * @returns {Promise} 쿼리 실행 결과 Promise
   */
  const loadProductionResults = useCallback(
      (workOrder, setProductionResultList, setProductionResult) => {
        // 작업지시가 없는 경우 초기화 후 종료
        if (!workOrder?.workOrderId) {
          setProductionResultList([]);
          setProductionResult(null);
          cachedProductionResults.current = [];
          return Promise.resolve();
        }

        // 중복 API 호출 방지
        if (isLoadingRef.current) {
          return Promise.resolve();
        }

        // 로딩 플래그 설정
        isLoadingRef.current = true;

        // GraphQL 쿼리 실행
        return executeQuery({
          query: PRODUCTION_RESULTS_BY_WORK_ORDER_QUERY,
          variables: {workOrderId: workOrder.workOrderId}
        })
        .then(response => {
          if (response.data?.productionResultsByWorkOrderId) {
            // 응답 데이터 가공
            const results = response.data.productionResultsByWorkOrderId.map(
                result => ({
                  ...result,
                  id: result.prodResultId
                }));

            // 상태 및 캐시 업데이트
            setProductionResultList(results);
            lastLoadedWorkOrderId.current = workOrder.workOrderId;
            cachedProductionResults.current = results;
          } else {
            // 데이터 없음
            setProductionResultList([]);
            cachedProductionResults.current = [];
          }

          // 선택된 생산실적 초기화
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
      },
      [executeQuery]
  );

  /**
   * 필터 조건으로 생산실적 목록 로드
   *
   * @param {Object} filter - 검색 필터 조건
   * @param {Function} setProductionResultList - 생산실적 목록 상태 변경 함수
   * @param {Function} setProductionResult - 선택된 생산실적 상태 변경 함수
   * @returns {Promise} 쿼리 실행 결과 Promise
   */
  const loadProductionResultsByFilter = useCallback(
      (filter, setProductionResultList, setProductionResult) => {
        // 중복 API 호출 방지
        if (isLoadingRef.current) {
          return Promise.resolve();
        }

        isLoadingRef.current = true;

        return executeQuery({
          query: PRODUCTION_RESULTS_QUERY,
          variables: {filter}
        })
        .then(response => {
          if (response.data?.productionResults) {
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
      },
      [executeQuery]
  );

  /**
   * 불량정보 목록 로드
   *
   * @param {string} prodResultId - 생산실적 ID
   * @returns {Promise} 불량정보 목록 Promise
   */
  const loadDefectInfos = useCallback(
      (prodResultId) => {
        if (!prodResultId) {
          return Promise.resolve([]);
        }

        // 중복 API 호출 방지
        if (isLoadingRef.current) {
          return Promise.resolve([]);
        }

        isLoadingRef.current = true;

        return executeQuery({
          query: DEFECT_INFO_BY_PROD_RESULT_QUERY,
          variables: {prodResultId}
        })
        .then(response => {
          if (response.data?.defectInfosByProdResultId) {
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
      },
      [executeQuery]
  );

  /**
   * 불량정보 모달 열기
   *
   * @param {Object} productionResult - 불량정보를 등록할 생산실적
   */
  const openDefectInfoModal = useCallback(
      (productionResult) => {
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
      },
      [loadDefectInfos]
  );

  /**
   * 불량정보 모달 닫기
   */
  const closeDefectInfoModal = useCallback(() => {
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
      setModalResolveReject({resolve: null, reject: null, saveAction: null});
      
      // 로딩 상태 확실히 초기화 (모달을 닫을 때 항상 초기화)
      isLoadingRef.current = false;
    } catch (error) {
      console.error("Error during modal close:", error);
      // 오류 발생 시에도 로딩 상태 확실히 초기화
      isLoadingRef.current = false;
    }
  }, [modalResolveReject]);

  /**
   * 불량정보 저장 핸들러
   *
   * @param {Array} updatedDefectInfos - 업데이트된 불량정보 배열
   */
  const handleSaveDefectInfos = useCallback(updatedDefectInfos => {
    if (currentProductionResult && updatedDefectInfos) {
      // 상태는 여기서 업데이트하지만, 바로 사용할 변수도 생성
      setDefectInfos(updatedDefectInfos);

      // MuiGrid와 통일성을 위해 defectInfosMap에도 저장
      updateDefectInfosMap(currentProductionResult.id, updatedDefectInfos);

      // 새로운 불량정보 배열로 업데이트
      const defectsForSave = updatedDefectInfos.map(info => ({
        prodResultId: currentProductionResult.prodResultId || '',
        defectCode: info.defectCode || '',
        defectName: info.defectName || '',
        defectType: info.defectType || '',
        defectQty: Number(info.defectQty) || 0,
        defectCause: info.defectCause || '',
        resultInfo: info.resultInfo || '',
        flagActive: true
      }));

      // React 상태 업데이트는 비동기적이므로, 아래 saveAction이 즉시 실행되면
      // 아직 업데이트되지 않은 상태를 참조할 수 있음. 따라서 지역 변수를 직접 전달
      setDefectInfosForSave(defectsForSave);
      
      // 현재 모달리졸브 액션 확인
      const currentSaveAction = modalResolveReject.saveAction;
      
      // 모달 닫기 (모달 관련 상태 업데이트)
      setIsDefectInfoModalOpen(false);
      setCurrentProductionResult(null);
      
      // 모달 관련 상태 초기화
      setModalResolveReject({resolve: null, reject: null, saveAction: null});
      
      // 독립 생산실적인지 확인 (workOrderId가 null인 경우)
      const isIndependentResult = !currentProductionResult.workOrderId;
      
      // 액션이 있으면 즉시 실행 - defectsForSave를 직접 전달
      if (currentSaveAction) {
        try {
          currentSaveAction(defectsForSave);
        } catch (error) {
          console.error('불량정보 저장 중 오류:', error);
          // 오류 발생 시 로딩 상태 확실히 초기화
          isLoadingRef.current = false;
          Message.showError({message: '불량정보 저장 중 오류가 발생했습니다.'});
        }
      } else {
        // saveAction이 없는 경우 - MuiGrid 방식 또는 독립 생산실적
        if (isIndependentResult) {
          // 독립 생산실적인 경우 사용자에게 안내 메시지 표시
          Swal.fire({
            title: '불량정보 등록 완료',
            html: `불량정보가 등록되었습니다.<br/><br/>생산실적을 저장하려면 <strong style="color: #1976d2;">"저장" 버튼</strong>을 클릭해주세요.`,
            icon: 'success',
            confirmButtonText: '확인',
            confirmButtonColor: '#1976d2'
          });
        }
        
        // saveAction이 없는 경우에도 로딩 상태 초기화
        isLoadingRef.current = false;
      }
    } else {
      // 불량정보가 없는 경우에도 모든 상태 초기화
      setIsDefectInfoModalOpen(false);
      setCurrentProductionResult(null);
      setModalResolveReject({resolve: null, reject: null, saveAction: null});
      
      // 로딩 상태 확실히 초기화
      isLoadingRef.current = false;
    }
  }, [currentProductionResult, modalResolveReject, updateDefectInfosMap]);

  /**
   * 생산실적 저장 함수
   *
   * @param {Object} currentRow - 현재 선택된 생산실적
   * @param {Function} setProductionResult - 생산실적 상태 변경 함수
   * @param {Function} setProductionResultList - 생산실적 목록 상태 변경 함수
   * @returns {Promise} - 저장 작업 Promise
   */
  const saveResult = useCallback(
      async (currentRow, setProductionResult, setProductionResultList) => {
        // 로딩 중인 경우 중복 호출 방지
        if (isLoadingRef.current) {
          Message.showWarning('처리 중입니다. 잠시만 기다려주세요.');
          return Promise.resolve();
        }

        try {
          if (!currentRow) {
            Message.showWarning('저장할 생산실적을 선택해주세요.');
            return Promise.resolve();
          }

          // 필수 필드 검사
          if (!currentRow.productId) {
            Message.showWarning('제품ID는 필수 입력 항목입니다.');
            return Promise.resolve();
          }
          
          // 창고 필수 입력 검사 추가
          if (!currentRow.warehouseId) {
            Message.showWarning('창고는 필수 입력 항목입니다.');
            return Promise.resolve();
          }
          
          // 생산시작일시 필수 입력 검사 추가
          if (!currentRow.prodStartTime) {
            Message.showWarning('생산시작일시는 필수 입력 항목입니다.');
            return Promise.resolve();
          }
          
          // 생산종료일시 필수 입력 검사 추가
          if (!currentRow.prodEndTime) {
            Message.showWarning('생산종료일시는 필수 입력 항목입니다.');
            return Promise.resolve();
          }

          // 음수 검사
          if (currentRow.goodQty < 0 || currentRow.defectQty < 0) {
            Message.showWarning('생산수량이 1 이상이어야 합니다.');
            return Promise.resolve();
          }

          // 양품수량과 불량수량의 합이 1 이상인지 검사
          if ((Number(currentRow.goodQty) + Number(currentRow.defectQty)) <= 0) {
            Message.showWarning('생산수량이 1 이상이어야 합니다.');
            return Promise.resolve();
          }

          // 불량수량이 있는 경우 불량정보 확인
          if (currentRow.defectQty > 0) {
            // 불량정보가 등록되어 있는지 확인
            const defectInfos = defectInfosMap[currentRow.id] || [];
            
            if (defectInfos.length === 0) {
              // 불량정보가 없으면 저장 차단
              Message.showWarning('불량수량이 입력되어 있지만 불량정보가 등록되지 않았습니다. 해당 행의 "불량정보등록" 버튼을 클릭하여 불량정보를 등록해주세요.');
              return Promise.resolve();
            }
            
            // 로딩 상태 설정
            isLoadingRef.current = true;
            
            // 독립 생산실적인지 확인 (workOrderId가 없는 경우)
            const workOrderInfo = selectedWorkOrder || {
              workOrderId: currentRow.workOrderId,
              productId: currentRow.productId
            };
            
            // 불량정보가 있으면 불량정보와 함께 저장
            await saveProductionResult(
              true,
              currentRow,
              workOrderInfo,
              defectInfos,
              () => {
                // 성공 후 작업지시 목록 새로 조회 및 생산실적 목록 초기화
                setTimeout(() => {
                  refreshWorkOrderList();
                  setSelectedWorkOrder(null);
                  setProductionResult(null);
                  setProductionResultList([]);
                  setDefectInfosForSave([]);
                  isLoadingRef.current = false;
                }, 500);
              }
            );
            return;
          }
          
          // 독립 생산실적인지 확인 (workOrderId가 없는 경우)
          const workOrderInfo = selectedWorkOrder || {
            workOrderId: currentRow.workOrderId,
            productId: currentRow.productId
          };

          // 로딩 상태 설정
          isLoadingRef.current = true;

          // 불량수량이 없는 경우 바로 저장 - MuiGrid saveResult와 동일한 방식
          await saveProductionResult(
              true,
              currentRow,
              workOrderInfo,
              [],
              () => {
                // 성공 후 작업지시 목록 새로 조회 및 생산실적 목록 초기화
                setTimeout(() => {
                  refreshWorkOrderList();
                  setSelectedWorkOrder(null);
                  setProductionResult(null);
                  setProductionResultList([]);
                  setDefectInfosForSave([]);
                  isLoadingRef.current = false;
                }, 500);
              }
          );
        } catch (error) {
          console.error('Error saving production result:', error);
          // useProductionResult.js에서 이미 적절한 에러 메시지를 표시했으므로 여기서는 중복 표시하지 않음
          // Message.showError({message: '생산실적 저장 중 오류가 발생했습니다.'});
          
          // 에러 발생 시 반드시 로딩 상태 초기화
          isLoadingRef.current = false;
        }
      },
      [saveProductionResult, selectedWorkOrder, refreshWorkOrderList, setSelectedWorkOrder, setDefectInfosForSave, defectInfosMap]
  );

  /**
   * 생산실적 삭제 함수 (단일/다중 삭제 지원)
   *
   * @param {Object|Array} productionResultOrIds - 삭제할 생산실적 객체 또는 ID 배열
   * @param {Function} setProductionResult - 생산실적 상태 변경 함수
   * @param {Function} setProductionResultList - 생산실적 목록 상태 변경 함수
   */
  const deleteResult = useCallback(
      (productionResultOrIds, setProductionResult, setProductionResultList) => {
        // 로딩 중인 경우 중복 호출 방지
        if (isLoadingRef.current) {
          Message.showWarning('처리 중입니다. 잠시만 기다려주세요.');
          return;
        }

        try {
          // 배열인 경우 (다중 삭제)
          if (Array.isArray(productionResultOrIds)) {
            if (productionResultOrIds.length === 0) {
              Message.showWarning('삭제할 생산실적을 선택해주세요.');
              return;
            }

            isLoadingRef.current = true;

            // 다중 삭제 처리
            deleteProductionResults(
                productionResultOrIds,
                () => {
                  // 삭제 후 작업지시 목록 새로 조회 및 생산실적 목록 초기화
                  try {
                    refreshWorkOrderList();
                    setSelectedWorkOrder(null);
                    setProductionResult(null);
                    setProductionResultList([]);
                    isLoadingRef.current = false;
                  } catch (error) {
                    console.error('다중 삭제 후 처리 중 오류:', error);
                    isLoadingRef.current = false;
                  }
                }
            ).catch((error) => {
              console.error('다중 삭제 실패:', error);
              isLoadingRef.current = false;
            });
            return;
          }

          // 단일 삭제 처리 (기존 로직 유지)
          const productionResult = productionResultOrIds;
          if (!productionResult) {
            Message.showWarning('삭제할 생산실적을 선택해주세요.');
            isLoadingRef.current = false;
            return;
          }

          isLoadingRef.current = true;

          // 임시 ID인 경우 (저장되지 않은 행)
          if (productionResult.id.toString().startsWith('temp_')) {
            setProductionResultList(
                prev => prev.filter(item => item.id !== productionResult.id));
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
                // 삭제 후 작업지시 목록 새로 조회 및 생산실적 목록 초기화
                try {
                  refreshWorkOrderList();
                  setSelectedWorkOrder(null);
                  setProductionResult(null);
                  setProductionResultList([]);
                  isLoadingRef.current = false;
                } catch (error) {
                  console.error('단일 삭제 후 처리 중 오류:', error);
                  isLoadingRef.current = false;
                }
              }
          ).catch((error) => {
            console.error('단일 삭제 실패:', error);
            isLoadingRef.current = false;
          });
        } catch (error) {
          console.error('삭제 중 예상치 못한 오류:', error);
          isLoadingRef.current = false;
        }
      },
      [deleteProductionResult, deleteProductionResults, refreshWorkOrderList, setSelectedWorkOrder]
  );

  /**
   * 새 생산실적 생성
   *
   * @param {Function} setProductionResultList - 생산실적 목록 상태 변경 함수
   * @param {Function} setProductionResult - 선택된 생산실적 상태 변경 함수
   * @param {Array} productionResultList - 현재 생산실적 목록
   */
  const createResult = useCallback(
    (setProductionResultList, setProductionResult, productionResultList) => {
      // 작업지시가 선택되지 않았을 경우
      if (!selectedWorkOrder) {
        Message.error('작업지시를 선택해주세요.');
        return;
      }

      // 새로운 생산실적 기본값
      const newResult = {
        id: `temp_${Date.now()}`,  // 임시 ID (저장 시 실제 ID로 대체)
        workOrderId: selectedWorkOrder.workOrderId,
        prodResultId: null,  // 서버에서 생성
        productId: selectedWorkOrder.productId,  // 작업지시의 제품ID
        goodQty: 0,
        defectQty: 0,
        equipmentId: selectedWorkOrder.equipmentId || '',
        warehouseId: '',  // 필수 입력값으로 변경
        prodStartTime: new Date(),  // 현재 시간을 Date 객체로 초기화
        prodEndTime: new Date(),   // 현재 시간을 Date 객체로 초기화
        createDate: null,
        flagActive: true,
        createUser: '',
        isNew: true  // 신규 플래그
      };

      // 생산실적 목록 업데이트
      setProductionResultList([newResult, ...productionResultList]);

      // 선택 상태 업데이트
      setProductionResult(newResult);
    },
    [selectedWorkOrder]
  );

  /**
   * 새 생산실적 생성 함수 (독립형) - 작업지시 없이 생성
   *
   * @param {Function} setProductionResultList - 생산실적 목록 상태 변경 함수
   * @param {Function} setProductionResult - 생산실적 상태 변경 함수
   */
  // createIndependentResult 함수 수정 - 모달을 여는 함수로 변경
  const createIndependentResult = useCallback(() => {
        setIsIndependentModalOpen(true);
      }, []);

  // 독립 생산실적 저장 처리를 위한 새 함수 추가
  const handleSaveIndependentResult = useCallback((newIndependentResult) => {
    // 모달 닫기
    setIsIndependentModalOpen(false);
    
    // 제품ID 필수 체크
    if (!newIndependentResult.productId) {
      Message.showWarning('제품ID는 필수 입력 항목입니다.');
      return;
    }
    
    // 창고 필수 체크 추가
    if (!newIndependentResult.warehouseId) {
      Message.showWarning('창고는 필수 입력 항목입니다.');
      return;
    }
    
    // 생산시작일시 필수 체크 추가
    if (!newIndependentResult.prodStartTime) {
      Message.showWarning('생산시작일시는 필수 입력 항목입니다.');
      return;
    }
    
    // 생산종료일시 필수 체크 추가
    if (!newIndependentResult.prodEndTime) {
      Message.showWarning('생산종료일시는 필수 입력 항목입니다.');
      return;
    }
    
    // 양품수량과 불량수량이 음수인지 검사
    if (newIndependentResult.goodQty < 0 || newIndependentResult.defectQty < 0) {
      Message.showWarning('양품수량과 불량수량은 0 이상이어야 합니다.');
      return;
    }
    
    // 양품수량과 불량수량의 합이 1 이상인지 검사
    if ((Number(newIndependentResult.goodQty) + Number(newIndependentResult.defectQty)) <= 0) {
      Message.showWarning('양품수량과 불량수량의 합이 1 이상이어야 합니다.');
      return;
    }
    
    // 생산실적 객체 생성 - MuiGrid와 동일한 구조
    const prodResult = {
      ...newIndependentResult,
      id: `temp_${Date.now()}`, // 임시 ID 생성
      prodResultId: null,       // 서버에서 생성될 ID
      flagActive: true,
      isNew: true,              // MuiGrid와 동일하게 신규 표시
      state: 'NEW'              // 신규 상태 표시
    };
    
    // MuiGrid와 통일성을 위해 생산실적을 목록에 먼저 추가
    setProductionResultList(prevList => {
      const newList = [prodResult];
      return newList;
    });
    
    // 불량수량이 0보다 크면 불량정보 등록 필요 - MuiGrid와 동일한 방식
    if (prodResult.defectQty > 0) {
      // MuiGrid와 동일하게 불량정보 모달 열기
      openDefectInfoModal(prodResult);
      return;
    }
    
    // 불량수량이 없는 경우 바로 저장 - MuiGrid saveResult와 동일한 방식
    isLoadingRef.current = true;
    
    saveProductionResult(
      true, // 새로운 생산실적
      prodResult,
      {productId: prodResult.productId}, // 작업지시 없이 제품ID만 사용
      [], // 불량정보 없음
      () => {
        // 성공 후 상태 초기화
        setTimeout(() => {
          refreshWorkOrderList();
          setSelectedWorkOrder(null);
          setProductionResult(null);
          setProductionResultList([]);
          isLoadingRef.current = false;
        }, 500);
      }
    ).catch((error) => {
      // 저장 실패 시 로딩 상태 초기화
      console.error('독립 생산실적 저장 실패:', error);
      isLoadingRef.current = false;
    });
  }, [
    saveProductionResult, 
    setIsIndependentModalOpen, 
    openDefectInfoModal,
    setProductionResultList,
    refreshWorkOrderList,
    setSelectedWorkOrder,
    setProductionResult
  ]);

  // 모달 닫기 함수
  const closeIndependentModal = useCallback(() => {
    setIsIndependentModalOpen(false);
  }, []);

  /**
   * 다중 생산실적 저장 함수
   *
   * @param {Array} productionResultList - 저장할 생산실적 목록
   * @param {Function} setProductionResult - 생산실적 상태 변경 함수
   * @param {Function} setProductionResultList - 생산실적 목록 상태 변경 함수
   * @param {Object} defectInfosMap - 각 행의 불량정보 맵 {tempId: [defectInfos]} (선택사항)
   */
  const saveBatchResults = useCallback(
    async (productionResultList, setProductionResult, setProductionResultList, defectInfosMap = {}) => {
      // 로딩 중인 경우 중복 호출 방지
      if (isLoadingRef.current) {
        Message.showWarning('처리 중입니다. 잠시만 기다려주세요.');
        return Promise.resolve();
      }

      try {
        if (!productionResultList || productionResultList.length === 0) {
          Message.showWarning('저장할 생산실적이 없습니다.');
          return Promise.resolve();
        }

        // 저장 가능한 행들만 필터링 (신규 행 또는 임시 행)
        const newRows = productionResultList.filter(row => 
          row.isNew === true || 
          row.id.toString().startsWith('temp_') || 
          !row.prodResultId
        );

        if (newRows.length === 0) {
          Message.showWarning('저장할 신규 생산실적이 없습니다.');
          return Promise.resolve();
        }

        // 불량수량이 있는 행들 확인
        const rowsWithDefects = newRows.filter(row => Number(row.defectQty) > 0);
        
        if (rowsWithDefects.length > 0) {
          // 불량정보가 제공되지 않은 행들 확인
          const rowsWithoutDefectInfo = rowsWithDefects.filter(row => 
            !defectInfosMap[row.id] || defectInfosMap[row.id].length === 0
          );

          if (rowsWithoutDefectInfo.length > 0) {
            // 저장 가능한 행들 (불량수량이 없거나 불량정보가 있는 행들)
            const savableRows = newRows.filter(row => {
              const hasDefectQty = Number(row.defectQty) > 0;
              const hasDefectInfo = defectInfosMap[row.id] && defectInfosMap[row.id].length > 0;
              return !hasDefectQty || hasDefectInfo; // 불량수량이 없거나 불량정보가 있는 경우
            });

            if (savableRows.length > 0) {
              // 일부 행만 저장 가능한 경우
              const rowsWithoutDefectNames = rowsWithoutDefectInfo.map(row => 
                `행 ${productionResultList.findIndex(r => r.id === row.id) + 1}`
              ).join(', ');
              
              Swal.fire({
                title: '일부 행 저장',
                html: `다음 행들은 불량정보가 없어 저장에서 제외됩니다:<br/><strong>${rowsWithoutDefectNames}</strong><br/><br/>저장 가능한 <strong>${savableRows.length}개 행</strong>을 저장하시겠습니까?<br/><br/><span style="color: #1976d2;">불량정보가 필요한 행은 각 행의 "불량정보등록" 버튼을 클릭하여 등록해주세요.</span>`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#1976d2',
                cancelButtonColor: '#d33',
                confirmButtonText: `${savableRows.length}개 행 저장`,
                cancelButtonText: '취소'
              }).then(async (result) => {
                if (result.isConfirmed) {
                  await executeMultipleSave(savableRows, defectInfosMap);
                }
              });
              return Promise.resolve();
            } else {
              // 저장 가능한 행이 없는 경우
              const rowNames = rowsWithoutDefectInfo.map(row => 
                `행 ${productionResultList.findIndex(r => r.id === row.id) + 1}`
              ).join(', ');
              
              Swal.fire({
                title: '불량정보 등록 필요',
                html: `다음 행들에 불량수량이 있지만 불량정보가 등록되지 않았습니다:<br/><strong>${rowNames}</strong><br/><br/><span style="color: #d32f2f; font-weight: bold;">각 행의 "불량정보등록" 버튼을 클릭하여 불량정보를 등록해주세요.</span>`,
                icon: 'warning',
                confirmButtonText: '확인',
                confirmButtonColor: '#d32f2f'
              });
              return Promise.resolve(); // 저장 중단
            }
          }
        }

        // 불량수량이 없거나 모든 불량정보가 제공된 경우에만 저장 진행
        await executeMultipleSave(newRows, defectInfosMap);

        // 실제 저장 실행 함수
        async function executeMultipleSave(rowsToSave, defectInfosMap) {
          try {
            isLoadingRef.current = true;

            // 다중 저장 실행 (불량정보 매핑 포함)
            await saveMultipleProductionResults(
              rowsToSave,
              selectedWorkOrder,
              defectInfosMap, // 불량정보 매핑 전달
              () => {
                // 성공 후 작업지시 목록 새로 조회 및 생산실적 목록 초기화
                setTimeout(() => {
                  refreshWorkOrderList();
                  setSelectedWorkOrder(null);
                  setProductionResult(null);
                  setProductionResultList([]);
                  isLoadingRef.current = false;
                }, 500);
              }
            );
          } catch (error) {
            console.error('다중 저장 실패:', error);
            isLoadingRef.current = false;
          }
        }

      } catch (error) {
        console.error('다중 생산실적 저장 중 오류:', error);
        isLoadingRef.current = false;
      }
    },
    [saveMultipleProductionResults, selectedWorkOrder, refreshWorkOrderList, setSelectedWorkOrder]
  );

  return {
    isLoading: isLoadingRef.current,
    // 모달 관련 상태
    isDefectInfoModalOpen,
    currentProductionResult,
    defectInfos,
    defectInfosForSave,
    isIndependentModalOpen,
    // 로딩 함수들
    loadProductionResults,
    loadProductionResultsByFilter,
    loadDefectInfos,
    // 모달 관련 함수들
    openDefectInfoModal,
    closeDefectInfoModal,
    handleSaveDefectInfos,
    // 독립 생산실적 관련 함수들
    createResult,
    createIndependentResult,
    closeIndependentModal,
    handleSaveIndependentResult,
    // CRUD 함수들
    saveResult,
    saveBatchResults,
    deleteResult,
    // 유틸리티 함수들
    forceResetLoadingState,
    // DefectInfosMap 설정 함수 ref
    setDefectInfosMapRef
  };
};

export default useProductionResultOperations;