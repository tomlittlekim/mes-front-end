import { useCallback } from 'react';
import { gql } from '@apollo/client';
import { useGraphQL } from '../../../../apollo/useGraphQL';
import Message from '../../../../utils/message/Message';

// GraphQL 쿼리 정의
const SAVE_PRODUCTION_RESULT_MUTATION = gql`
    mutation SaveProductionResult($createdRows: [ProductionResultInput], $updatedRows: [ProductionResultUpdate], $defectInfos: [DefectInfoInput]) {
        saveProductionResult(createdRows: $createdRows, updatedRows: $updatedRows, defectInfos: $defectInfos)
    }
`;

const DELETE_PRODUCTION_RESULT_MUTATION = gql`
    mutation DeleteProductionResult($prodResultId: String!) {
        deleteProductionResult(prodResultId: $prodResultId)
    }
`;

const PRODUCTION_RESULTS_BY_WORK_ORDER_QUERY = gql`
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

/**
 * 생산실적 관련 로직을 처리하는 커스텀 훅
 *
 * @returns {Object} 생산실적 관련 함수
 */
export const useProductionResult = () => {
  const { executeQuery, executeMutation } = useGraphQL();

  /**
   * 생산실적 저장 함수
   *
   * @param {boolean} isNewResult - 신규 생산실적 여부
   * @param {Object} productionResult - 생산실적 데이터
   * @param {Object} selectedWorkOrder - 선택된 작업지시 객체
   * @param {Array} defectInfos - 불량정보 목록
   * @param {Function} onSuccess - 성공 시 콜백 함수
   * @returns {Promise} GraphQL mutation 결과를 반환하는 Promise
   */
  const saveProductionResult = useCallback((isNewResult, productionResult, selectedWorkOrder, defectInfos, onSuccess) => {
    // 디버깅 로그 추가
    console.log('[saveProductionResult] 호출됨:', {
      isNewResult,
      productionResult,
      selectedWorkOrder,
      defectInfos: defectInfos || []
    });

    // 변수 준비
    let createdRows = null;
    let updatedRows = null;
    let defectInfoInputs = null;

    if (isNewResult) {
      // 신규 생산실적 생성
      createdRows = [{
        workOrderId: selectedWorkOrder.workOrderId,
        goodQty: productionResult.goodQty || 0,
        defectQty: productionResult.defectQty || 0,
        equipmentId: productionResult.equipmentId || "",
        resultInfo: productionResult.resultInfo || "",
        defectCause: productionResult.defectCause || "",
        flagActive: true
      }];
    } else {
      // 기존 생산실적 수정
      updatedRows = [{
        prodResultId: productionResult.prodResultId,
        workOrderId: selectedWorkOrder.workOrderId,
        goodQty: productionResult.goodQty || 0,
        defectQty: productionResult.defectQty || 0,
        equipmentId: productionResult.equipmentId || "",
        resultInfo: productionResult.resultInfo || "",
        defectCause: productionResult.defectCause || "",
        flagActive: true
      }];
    }

    // 불량정보가 있는 경우 데이터 구조 최적화
    if (defectInfos && defectInfos.length > 0) {
      defectInfoInputs = defectInfos.map(defect => {
        // 불량정보 객체 최적화
        const optimizedDefect = {
          prodResultId: productionResult.prodResultId,
          productId: selectedWorkOrder.productId,
          defectQty: Number(defect.defectQty),
          defectType: defect.defectType,
          defectCause: defect.defectCause,
          resultInfo: defect.resultInfo || defect.defectType,
          state: 'NEW',
          flagActive: true
        };

        console.log('[saveProductionResult] 최적화된 불량정보:', optimizedDefect);
        return optimizedDefect;
      });
    }

    console.log('[saveProductionResult] 생산실적 저장 요청:', {
      createdRows,
      updatedRows,
      defectInfoInputs
    });

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
      console.log('[saveProductionResult] 저장 결과:', result);

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
    });
  }, [executeMutation]);

  /**
   * 생산실적 삭제 함수
   *
   * @param {string} prodResultId - 삭제할 생산실적 ID
   * @param {Function} onSuccess - 성공 시 콜백 함수
   */
  const deleteProductionResult = useCallback((prodResultId, onSuccess) => {
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
      });
    });
  }, [executeMutation]);

  return {
    saveProductionResult,
    deleteProductionResult
  };
};

export default useProductionResult;