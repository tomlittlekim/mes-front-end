import { useCallback, useRef } from 'react';
import { useGraphQL } from '../../../../apollo/useGraphQL';
import Message from '../../../../utils/message/Message';
import {
  SAVE_PRODUCTION_RESULT_MUTATION,
  DELETE_PRODUCTION_RESULT_MUTATION,
  PRODUCTION_RESULTS_BY_WORK_ORDER_QUERY
} from './graphql-queries';

/**
 * 생산실적 관련 로직을 처리하는 커스텀 훅
 *
 * @returns {Object} 생산실적 관련 함수
 */
export const useProductionResult = () => {
  const { executeQuery, executeMutation } = useGraphQL();

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
  const saveProductionResult = useCallback((isNewResult, productionResult, productionInfo, defectInfos, onSuccess) => {
    // 이미 저장 중인 경우 중복 호출 방지
    if (isSavingRef.current) {
      const error = new Error('저장 중입니다. 잠시만 기다려주세요.');
      Message.showWarning(error.message);
      return Promise.reject(error);
    }

    isSavingRef.current = true;

    // 변수 준비
    let createdRows = null;
    let updatedRows = null;
    let defectInfoInputs = null;

    // 제품ID 필수 확인
    if (!productionResult.productId && (!productionInfo || !productionInfo.productId)) {
      const error = new Error('제품ID는 필수 입력 항목입니다.');
      Message.showError({ message: error.message });
      isSavingRef.current = false;
      return Promise.reject(error);
    }

    // 생산실적 데이터 준비
    const baseData = {
      workOrderId: productionResult.workOrderId || (productionInfo ? productionInfo.workOrderId : null),
      productId: productionResult.productId || (productionInfo ? productionInfo.productId : null),
      goodQty: productionResult.goodQty || 0,
      defectQty: productionResult.defectQty || 0,
      equipmentId: productionResult.equipmentId || "",
      resultInfo: productionResult.resultInfo || "",
      defectCause: productionResult.defectCause || "",
      flagActive: true
    };

    if (isNewResult) {
      // 신규 생산실적 생성
      createdRows = [baseData];
    } else {
      // 기존 생산실적 수정
      updatedRows = [{
        prodResultId: productionResult.prodResultId,
        ...baseData
      }];
    }

    // 불량정보가 있는 경우 데이터 구조 최적화
    if (defectInfos && defectInfos.length > 0) {
      defectInfoInputs = defectInfos.map(defect => {
        // 불량정보 객체 최적화
        const optimizedDefect = {
          prodResultId: productionResult.prodResultId,
          productId: productionResult.productId || (productionInfo ? productionInfo.productId : null),
          workOrderId: productionResult.workOrderId || (productionInfo ? productionInfo.workOrderId : null),
          defectQty: Number(defect.defectQty),
          defectType: defect.defectType,
          defectCause: defect.defectCause,
          resultInfo: defect.resultInfo || defect.defectType,
          state: 'NEW',
          flagActive: true
        };

        return optimizedDefect;
      });
    }

    // GraphQL 뮤테이션 실행
    return executeMutation({
      mutation: SAVE_PRODUCTION_RESULT_MUTATION,
      variables: {
        createdRows: createdRows,
        updatedRows: updatedRows,
        defectInfos: defectInfoInputs
      }
    })
    .then((result) => {
      if (result.data && result.data.saveProductionResult) {
        Message.showSuccess('생산실적이 저장되었습니다.', onSuccess);
        return result;
      } else {
        const error = new Error('생산실적 저장에 실패했습니다.');
        Message.showError({ message: error.message });
        throw error;
      }
    })
    .catch((error) => {
      console.error("[saveProductionResult] Error saving production result:", error);
      Message.showError({ message: error.message || '생산실적 저장 중 오류가 발생했습니다.' });
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
        variables: { prodResultId }
      })
      .then((result) => {
        if (result.data && result.data.deleteProductionResult) {
          Message.showSuccess('생산실적이 삭제되었습니다.', onSuccess);
        } else {
          Message.showError({ message: '생산실적 삭제에 실패했습니다.' });
        }
      })
      .catch((error) => {
        console.error("Error deleting production result:", error);
        Message.showError({ message: '생산실적 삭제 중 오류가 발생했습니다.' });
      })
      .finally(() => {
        delete isDeletingRef.current[prodResultId];
      });
    }, () => {
      // 취소 시에도 상태 초기화
      delete isDeletingRef.current[prodResultId];
    });
  }, [executeMutation]);

  return {
    saveProductionResult,
    deleteProductionResult
  };
};

export default useProductionResult;