import {useCallback, useState, useRef} from 'react';
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
    setProductionResult
) => {
  const {executeQuery} = useGraphQL();
  const {saveProductionResult, deleteProductionResult} = useProductionResult();

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

        // 캐시된 데이터가 있는 경우 재사용
        if (
            lastLoadedWorkOrderId.current === workOrder.workOrderId &&
            cachedProductionResults.current.length >= 0
        ) {
          setProductionResultList(cachedProductionResults.current);
          setProductionResult(null);
          return Promise.resolve({
            data: {productionResultsByWorkOrderId: cachedProductionResults.current}
          });
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
    } catch (error) {
      console.error("Error during modal close:", error);
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
      
      // 액션이 있으면 즉시 실행 - defectsForSave를 직접 전달
      if (currentSaveAction) {
        currentSaveAction(defectsForSave);
      }
    } else {
      setIsDefectInfoModalOpen(false);
    }
  }, [currentProductionResult, modalResolveReject]);

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

          // 음수 검사
          if (currentRow.goodQty < 0 || currentRow.defectQty < 0) {
            Message.showWarning('양품수량과 불량수량은 0 이상이어야 합니다.');
            return Promise.resolve();
          }

          // 불량수량이 0보다 큰데 불량정보가 없는 경우 불량정보 입력 모달 표시
          if (currentRow.defectQty > 0 && (!defectInfosForSave || defectInfosForSave.length === 0)) {
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
                  // Promise가 반환되면 resolve하여 실제 값을 추출
                  const processDefectInfos = (defectsPromise) => {
                    if (defectsPromise && typeof defectsPromise.then === 'function') {
                      return defectsPromise.then(defects => {
                        return defects || [];
                      });
                    }
                    return Promise.resolve(defectsPromise || []);
                  };
                  
                  processDefectInfos(latestDefectInfos).then(resolvedDefects => {
                    // 최종 불량정보 (Promise에서 추출된 값 또는 현재 상태의 값)
                    const finalDefectInfos = resolvedDefects && resolvedDefects.length > 0 
                      ? resolvedDefects 
                      : defectInfosForSave || [];
                      
                    if (finalDefectInfos.length === 0 && currentRow.defectQty > 0) {
                      Message.showWarning('불량수량이 입력되었으나 불량정보가 없습니다. 불량정보를 입력해주세요.');
                      isLoadingRef.current = false;
                      resolve();
                      return;
                    }
                    
                    saveProductionResult(
                        !currentRow.prodResultId,
                        currentRow,
                        selectedWorkOrder || {productId: currentRow.productId}, // 작업지시가 없으면 생산실적의 제품ID 사용
                        finalDefectInfos, // 최종 확정된 불량정보 사용
                        () => {
                          // 성공 메시지 표시 후, 생산실적 저장 이후 항상 상태 초기화
                          setTimeout(() => {
                            // 작업지시 목록 갱신
                            refreshWorkOrderList();
                            // 항상 오른쪽 그리드 초기화
                            setSelectedWorkOrder(null);
                            // setProductionResult가 함수인지 확인 후 호출
                            if (typeof setProductionResult === 'function') {
                              setProductionResult(null);
                            } else {
                              console.error('setProductionResult is not a function:', setProductionResult);
                            }
                            // setProductionResultList가 함수인지 확인 후 호출
                            if (typeof setProductionResultList === 'function') {
                              setProductionResultList([]);
                            } else {
                              console.warn('setProductionResultList is not a function');
                            }
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
                  });
                }
              });
            });
          }

          // 생산실적 데이터 준비
          const isNewResult = !currentRow.prodResultId;
          const productionInfo = selectedWorkOrder
              || {productId: currentRow.productId}; // 작업지시가 없으면 생산실적의 제품ID 사용
              
          // 불량수량이 있지만 불량정보가 없는 경우 빈 배열 전달
          const finalDefectInfos = currentRow.defectQty > 0 
            ? (defectInfosForSave && defectInfosForSave.length > 0 ? defectInfosForSave : [])
            : []; // 불량수량이 0이면 빈 배열
            
          return saveProductionResult(
              isNewResult,
              currentRow,
              productionInfo,
              finalDefectInfos, // 준비된 불량정보 사용
              () => {
                // 성공 메시지 표시 후, 생산실적 저장 이후 항상 상태 초기화
                setTimeout(() => {
                  // 작업지시 목록 갱신
                  refreshWorkOrderList();

                  // 항상 오른쪽 그리드 초기화
                  setSelectedWorkOrder(null);
                  
                  // setProductionResult가 함수인지 확인 후 호출
                  if (typeof setProductionResult === 'function') {
                    setProductionResult(null);
                  } else {
                    console.error('setProductionResult is not a function:', setProductionResult);
                  }
                  
                  // setProductionResultList가 함수인지 확인 후 호출
                  if (typeof setProductionResultList === 'function') {
                    setProductionResultList([]);
                  } else {
                    console.warn('setProductionResultList is not a function');
                  }

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

              if (errorMessage.includes('작업지시수량') && errorMessage.includes(
                  '초과')) {
                Message.showError({message: errorMessage});
              } else {
                Message.showError({message: '생산실적 저장 중 오류가 발생했습니다.'});
              }
            } else {
              Message.showError({message: '생산실적 저장 중 오류가 발생했습니다.'});
            }
            return Promise.resolve();
          });
        } catch (error) {
          console.error("Unexpected error in saveResult:", error);
          Message.showError({message: '저장 중 오류가 발생했습니다.'});
          isLoadingRef.current = false;
          return Promise.resolve();
        }
      },
      [
        selectedWorkOrder,
        saveProductionResult,
        refreshWorkOrderList,
        setSelectedWorkOrder,
        defectInfosForSave,
        openDefectInfoModal,
        setModalResolveReject
      ]
  );

  /**
   * 생산실적 삭제 함수
   *
   * @param {Object} productionResult - 삭제할 생산실적
   * @param {Function} setProductionResult - 생산실적 상태 변경 함수
   * @param {Function} setProductionResultList - 생산실적 목록 상태 변경 함수
   */
  const deleteResult = useCallback(
      (productionResult, setProductionResult, setProductionResultList) => {
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
              // 삭제 후 상태 초기화
              refreshWorkOrderList();

              // 항상 오른쪽 그리드 초기화
              setSelectedWorkOrder(null);
              setProductionResult(null);
              setProductionResultList([]);
              isLoadingRef.current = false;
            }
        );
      },
      [deleteProductionResult, refreshWorkOrderList, setSelectedWorkOrder]
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
        prodStartTime: new Date().toISOString(),  // 현재 시간 기본값
        prodEndTime: new Date().toISOString(),
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
    
    // 양품수량과 불량수량이 음수인지 검사
    if (newIndependentResult.goodQty < 0 || newIndependentResult.defectQty < 0) {
      Message.showWarning('양품수량과 불량수량은 0 이상이어야 합니다.');
      return;
    }
    
    // 생산실적 객체 생성
    const prodResult = {
      ...newIndependentResult,
      id: `temp_${Date.now()}`, // 임시 ID 생성
      prodResultId: null,       // 서버에서 생성될 ID
      flagActive: true
    };
    
    // 불량수량이 0보다 크면 불량정보 모달 표시
    if (prodResult.defectQty > 0) {
      // 불량정보 모달 표시 전에 현재 생산실적 정보 설정
      setCurrentProductionResult(prodResult);
      openDefectInfoModal(prodResult);
      
      // 불량정보 입력 후 저장 처리를 위한 콜백 설정
      setModalResolveReject({
        resolve: () => {}, // 빈 함수로 설정하여 오류 방지
        reject: () => {},  // 빈 함수로 설정하여 오류 방지
        saveAction: (directDefectInfos) => {
          // 직접 전달된 불량정보 사용
          if (!directDefectInfos || directDefectInfos.length === 0) {
            Message.showWarning('불량수량이 입력되었으나 불량정보가 없습니다. 불량정보를 입력해주세요.');
            return;
          }
          
          saveProductionResult(
            true, // 새로운 생산실적
            prodResult,
            {productId: prodResult.productId}, // 작업지시 없이 제품ID만 사용
            directDefectInfos, // 직접 전달된 불량정보만 사용
            () => {
              // 성공 후 상태 초기화
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
        }
      });
      return;
    }
    
    // 불량수량이 없는 경우 바로 저장
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
          setDefectInfosForSave([]);
          isLoadingRef.current = false;
        }, 500);
      }
    );
  }, [
    saveProductionResult, 
    setIsIndependentModalOpen, 
    openDefectInfoModal, 
    setCurrentProductionResult, 
    setModalResolveReject,
    refreshWorkOrderList,
    setSelectedWorkOrder,
    setProductionResult,
    setProductionResultList,
    setDefectInfosForSave
  ]);

  // 모달 닫기 함수
  const closeIndependentModal = useCallback(() => {
    setIsIndependentModalOpen(false);
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
    isIndependentModalOpen,
    closeIndependentModal,
    handleSaveIndependentResult
  };
};

export default useProductionResultOperations;