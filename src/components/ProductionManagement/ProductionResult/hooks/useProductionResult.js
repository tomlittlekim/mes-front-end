import {useCallback, useRef} from 'react';
import {useGraphQL} from '../../../../apollo/useGraphQL';
import Message from '../../../../utils/message/Message';
import {
  SAVE_PRODUCTION_RESULT_MUTATION,
  DELETE_PRODUCTION_RESULT_MUTATION,
  DELETE_PRODUCTION_RESULTS_MUTATION,
} from './graphql-queries';

/**
 * 생산실적 관련 로직을 처리하는 커스텀 훅
 *
 * @returns {Object} 생산실적 관련 함수
 */
export const useProductionResult = () => {
  const {executeQuery, executeMutation} = useGraphQL();

  // API 호출 중복 방지를 위한 ref
  const isExecutingMutationRef = useRef(false);
  const isSavingRef = useRef(false);
  const isDeletingRef = useRef({});

  /**
   * 생산실적 저장 함수 - 중복 호출 방지 적용
   *
   * @param {boolean} isNewResult - 신규 생산실적 여부
   * @param {Object} productionResult - 생산실적 데이터
   * @param {Object} productionInfo - 생산 정보(작업지시 또는 제품 정보)
   * @param {Array} defectInfos - 불량정보 목록
   * @param {Function} onSuccess - 성공 시 콜백 함수
   * @returns {Promise} GraphQL mutation 결과를 반환하는 Promise
   */
  const saveProductionResult = useCallback(
      (isNewResult, productionResult, productionInfo, defectInfos,
          onSuccess) => {
        // 이미 저장 중인 경우 중복 호출 방지
        if (isSavingRef.current) {
          const error = new Error('저장 중입니다. 잠시만 기다려주세요.');
          Message.showWarning(error.message);
          return Promise.reject(error);
        }

        isSavingRef.current = true;

        // 변수 준비
        let createdRows = null;
        let defectInfoInputs = null;

        // 제품ID 필수 확인
        if (!productionResult.productId && (!productionInfo
            || !productionInfo.productId)) {
          const error = new Error('제품ID는 필수 입력 항목입니다.');
          Message.showError({message: error.message});
          isSavingRef.current = false;
          return Promise.reject(error);
        }

        // 불량수량 검사 추가 - 불량수량이 있는데 불량정보가 없는 경우
        if (productionResult.defectQty > 0 && (!defectInfos || defectInfos.length === 0)) {
          console.warn('경고: 불량수량이 있지만 불량정보가 없습니다.', productionResult.defectQty);
          // 여기서는 경고만 로그로 남기고 계속 진행
        }

        // 날짜 형식 변환 함수 (LocalDateTime 형식으로 변환, 시간대 유지)
        const formatDateForServer = (dateValue) => {
          if (!dateValue) return null;

          try {
            const date = dateValue instanceof Date
                ? dateValue
                : new Date(dateValue);

            if (isNaN(date.getTime())) return null;

            // 현지 시간을 유지하면서 'YYYY-MM-DDTHH:MM:SS' 형식으로 변환
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');
            
            return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
          } catch (e) {
            console.error('날짜 변환 오류:', e);
            return null;
          }
        };

        // 생산실적 데이터 준비
        const baseData = {
          workOrderId: productionResult.workOrderId || (productionInfo ? productionInfo.workOrderId : null),
          productId: productionResult.productId || (productionInfo ? productionInfo.productId : null),
          goodQty: productionResult.goodQty || 0,
          defectQty: productionResult.defectQty || 0,
          equipmentId: productionResult.equipmentId || "",
          warehouseId: productionResult.warehouseId || "",
          resultInfo: productionResult.resultInfo || "",
          defectCause: productionResult.defectCause || "",
          // 날짜 필드 처리 - 서버가 기대하는 형식으로 변환
          prodStartTime: formatDateForServer(productionResult.prodStartTime),
          prodEndTime: formatDateForServer(productionResult.prodEndTime),
          flagActive: true
        };

        if (isNewResult) {
          // 신규 생산실적 생성
          createdRows = [baseData];
        } else {
          // 기존 생산실적이지만 수정 불가이므로 에러 메시지 표시
          const error = new Error('등록된 생산실적은 수정할 수 없습니다. 삭제 후 재등록해주세요.');
          Message.showError({message: error.message});
          isSavingRef.current = false;
          return Promise.reject(error);
        }

        // 불량정보가 있는 경우 데이터 구조 최적화
        if (defectInfos && defectInfos.length > 0) {
          console.log('전달된 불량정보:', defectInfos);
          defectInfoInputs = defectInfos.map(defect => {
            // 불량정보 객체 최적화
            const optimizedDefect = {
              prodResultId: productionResult.prodResultId,
              productId: productionResult.productId || (productionInfo
                  ? productionInfo.productId : null),
              workOrderId: productionResult.workOrderId || (productionInfo
                  ? productionInfo.workOrderId : null),
              defectQty: Number(defect.defectQty),
              defectType: defect.defectType,
              defectCause: defect.defectCause,
              resultInfo: defect.resultInfo || defect.defectType,
              state: 'NEW',
              flagActive: true
            };

            return optimizedDefect;
          });
          console.log('변환된 불량정보:', defectInfoInputs);
        } else if (productionResult.defectQty > 0) {
          // 불량수량이 있는데 불량정보가 없는 경우 빈 배열로 초기화
          console.warn('불량수량이 있지만 불량정보가 제공되지 않았습니다. 빈 배열로 초기화합니다.');
          defectInfoInputs = [];
        } else {
          // 불량수량이 없는 경우 빈 배열로 초기화
          defectInfoInputs = [];
        }

        console.log('생산실적 저장 요청 데이터:', {
          createdRows: createdRows,
          defectInfos: defectInfoInputs
        });

        // GraphQL 뮤테이션 실행
        return executeMutation({
          mutation: SAVE_PRODUCTION_RESULT_MUTATION,
          variables: {
            createdRows: createdRows,
            defectInfos: defectInfoInputs
          }
        })
        .then((result) => {
          if (result.data && result.data.saveProductionResult) {
            Message.showSuccess('생산실적이 저장되었습니다.', onSuccess);
            return result;
          } else {
            const error = new Error('생산실적 저장에 실패했습니다.');
            Message.showError({message: error.message});
            throw error;
          }
        })
        .catch((error) => {
          console.error(
              "[saveProductionResult] Error saving production result:", error);
          Message.showError(
              {message: error.message || '생산실적 저장 중 오류가 발생했습니다.'});
          throw error;
        })
        .finally(() => {
          isSavingRef.current = false;
        });
      }, [executeMutation]);

  /**
   * 생산실적 삭제 함수 - 중복 삭제 방지 적용
   *
   * @param {string} prodResultId - 삭제할 생산실적 ID
   * @param {Function} onSuccess - 성공 시 콜백 함수
   */
  const deleteProductionResult = useCallback((prodResultId, onSuccess) => {
    // 이미 삭제 중인 경우 중복 호출 방지
    if (isDeletingRef.current[prodResultId]) {
      Message.showWarning('삭제 처리 중입니다. 잠시만 기다려주세요.');
      return;
    }

    isDeletingRef.current[prodResultId] = true;

    Message.showDeleteConfirm(() => {
      executeMutation({
        mutation: DELETE_PRODUCTION_RESULT_MUTATION,
        variables: {prodResultId}
      })
      .then((result) => {
        if (result.data && result.data.deleteProductionResult) {
          Message.showSuccess('생산실적이 삭제되었습니다.', onSuccess);
        } else {
          Message.showError({message: '생산실적 삭제에 실패했습니다.'});
        }
      })
      .catch((error) => {
        console.error("Error deleting production result:", error);
        Message.showError({message: '생산실적 삭제 중 오류가 발생했습니다.'});
      })
      .finally(() => {
        delete isDeletingRef.current[prodResultId];
      });
    }, () => {
      // 취소 시에도 상태 초기화
      delete isDeletingRef.current[prodResultId];
    });
  }, [executeMutation]);

  /**
   * 생산실적 다중 삭제 함수
   *
   * @param {Array} prodResultIds - 삭제할 생산실적 ID 목록
   * @param {Function} onSuccess - 성공 시 콜백 함수
   */
  const deleteProductionResults = useCallback((prodResultIds, onSuccess) => {
    // 유효성 검사
    if (!prodResultIds || !Array.isArray(prodResultIds) || prodResultIds.length === 0) {
      Message.showWarning('삭제할 생산실적을 선택해주세요.');
      return;
    }

    // 이미 삭제 중인 항목들이 있는지 확인
    const alreadyDeleting = prodResultIds.some(id => isDeletingRef.current[id]);
    if (alreadyDeleting) {
      Message.showWarning('삭제 처리 중인 항목이 있습니다. 잠시만 기다려주세요.');
      return;
    }

    // 모든 항목을 삭제 중 상태로 설정
    prodResultIds.forEach(id => {
      isDeletingRef.current[id] = true;
    });

    // 삭제 확인 메시지 (Message.showDeleteConfirm 사용하지 않고 직접 처리)
    executeMutation({
      mutation: DELETE_PRODUCTION_RESULTS_MUTATION,
      variables: { prodResultIds }
    })
    .then((result) => {
      if (result.data && result.data.deleteProductionResults) {
        Message.showSuccess(`${prodResultIds.length}건의 생산실적이 삭제되었습니다.`, onSuccess);
      } else {
        Message.showError({ message: '생산실적 삭제에 실패했습니다.' });
      }
    })
    .catch((error) => {
      console.error("Error deleting production results:", error);
      Message.showError({ message: '생산실적 삭제 중 오류가 발생했습니다.' });
    })
    .finally(() => {
      // 모든 항목의 삭제 상태 초기화
      prodResultIds.forEach(id => {
        delete isDeletingRef.current[id];
      });
    });
  }, [executeMutation]);

  return {
    saveProductionResult,
    deleteProductionResult,
    deleteProductionResults
  };
};

export default useProductionResult;