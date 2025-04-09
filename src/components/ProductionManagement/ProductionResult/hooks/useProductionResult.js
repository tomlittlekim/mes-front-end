import { useCallback } from 'react';
import { gql } from '@apollo/client';
import { useGraphQL } from '../../../../apollo/useGraphQL';
import Message from '../../../../utils/message/Message';

// GraphQL 쿼리 정의
const SAVE_PRODUCTION_RESULT_MUTATION = gql`
    mutation SaveProductionResult($createdRows: [ProductionResultInput], $updatedRows: [ProductionResultUpdate]) {
        saveProductionResult(createdRows: $createdRows, updatedRows: $updatedRows)
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
   * @param {Array} defectList - 불량정보 목록
   * @param {Function} onSuccess - 성공 시 콜백 함수
   */
  const saveProductionResult = useCallback((isNewResult, productionResult, selectedWorkOrder, defectList, onSuccess) => {
    if (isNewResult) {
      // 신규 생산실적 생성
      const createInput = {
        workOrderId: selectedWorkOrder.workOrderId,
        goodQty: productionResult.goodQty || 0,
        defectQty: productionResult.defectQty || 0,
        equipmentId: productionResult.equipmentId,
        resultInfo: productionResult.resultInfo || "",
        defectCause: productionResult.defectCause || "",
        flagActive: true
      };

      executeMutation({
        mutation: SAVE_PRODUCTION_RESULT_MUTATION,
        variables: {
          createdRows: [createInput],
          updatedRows: null
        }
      })
      .then((result) => {
        if (result.data && result.data.saveProductionResult) {
          // 새로운 생산실적 ID 조회
          executeQuery({
            query: PRODUCTION_RESULTS_BY_WORK_ORDER_QUERY,
            variables: { workOrderId: selectedWorkOrder.workOrderId }
          })
          .then(response => {
            if (response.data && response.data.productionResultsByWorkOrderId.length > 0) {
              const newProdResult = response.data.productionResultsByWorkOrderId[0];

              // 불량정보 저장 (불량이 있는 경우)
              if (defectList.length > 0 && newProdResult.prodResultId) {
                saveDefectInfo(newProdResult.prodResultId, selectedWorkOrder.workOrderId, defectList, selectedWorkOrder.productId, onSuccess);
              } else {
                Message.showSuccess('생산실적이 저장되었습니다.', onSuccess);
              }
            } else {
              Message.showSuccess('생산실적이 저장되었습니다.', onSuccess);
            }
          })
          .catch(error => {
            console.error("Error fetching new production result:", error);
            Message.showSuccess('생산실적이 저장되었습니다.', onSuccess);
          });
        } else {
          Message.showError({ message: '생산실적 저장에 실패했습니다.' });
        }
      })
      .catch((error) => {
        console.error("Error saving production result:", error);
        Message.showError({ message: '생산실적 저장 중 오류가 발생했습니다.' });
      });
    } else {
      // 기존 생산실적 수정
      const updateInput = {
        prodResultId: productionResult.prodResultId,
        workOrderId: selectedWorkOrder.workOrderId,
        goodQty: productionResult.goodQty || 0,
        defectQty: productionResult.defectQty || 0,
        equipmentId: productionResult.equipmentId,
        resultInfo: productionResult.resultInfo || "",
        defectCause: productionResult.defectCause || "",
        flagActive: true
      };

      executeMutation({
        mutation: SAVE_PRODUCTION_RESULT_MUTATION,
        variables: {
          createdRows: null,
          updatedRows: [updateInput]
        }
      })
      .then((result) => {
        if (result.data && result.data.saveProductionResult) {
          // 불량정보 저장 (불량이 있는 경우)
          if (defectList.length > 0 && productionResult.prodResultId) {
            saveDefectInfo(productionResult.prodResultId, selectedWorkOrder.workOrderId, defectList, selectedWorkOrder.productId, onSuccess);
          } else {
            Message.showSuccess('생산실적이 저장되었습니다.', onSuccess);
          }
        } else {
          Message.showError({ message: '생산실적 저장에 실패했습니다.' });
        }
      })
      .catch((error) => {
        console.error("Error updating production result:", error);
        Message.showError({ message: '생산실적 수정 중 오류가 발생했습니다.' });
      });
    }
  }, [executeMutation, executeQuery]);

  /**
   * 불량정보 저장 함수
   *
   * @param {string} prodResultId - 생산실적 ID
   * @param {string} workOrderId - 작업지시 ID
   * @param {Array} defectList - 불량정보 목록
   * @param {string} productId - 제품 ID
   * @param {Function} onSuccess - 성공 시 콜백 함수
   */
  const saveDefectInfo = useCallback((prodResultId, workOrderId, defectList, productId, onSuccess) => {
    const SAVE_DEFECT_INFO_MUTATION = gql`
        mutation SaveDefectInfo($prodResultId: String!, $workOrderId: String!, $defectInputs: [DefectInfoInputType]!) {
            saveDefectInfoForProductionResult(
                prodResultId: $prodResultId,
                workOrderId: $workOrderId,
                defectInputs: $defectInputs
            )
        }
    `;

    // 불량정보 DTO 변환
    const defectInputs = defectList.map(defect => ({
      workOrderId: workOrderId,
      prodResultId: prodResultId,
      productId: productId,
      defectQty: defect.defectQty,
      defectType: defect.defectName,
      defectReason: defect.defectReason || '',
      resultInfo: defect.resultInfo || defect.defectName,
      state: defect.state || 'NEW',
      defectCause: defect.defectCause || ''
    }));

    executeMutation({
      mutation: SAVE_DEFECT_INFO_MUTATION,
      variables: {
        prodResultId,
        workOrderId,
        defectInputs
      }
    })
    .then((result) => {
      Message.showSuccess('생산실적과 불량정보가 저장되었습니다.', onSuccess);
    })
    .catch((error) => {
      console.error("Error saving defect info:", error);
      Message.showWarning('생산실적은 저장되었으나 불량정보 저장에 실패했습니다.');
      onSuccess();  // 생산실적은 저장되었으므로 새로고침
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
    saveDefectInfo,
    deleteProductionResult
  };
};

export default useProductionResult;