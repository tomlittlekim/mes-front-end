import {useCallback, useRef} from 'react';
import {useGraphQL} from '../../../../apollo/useGraphQL';
import Message from '../../../../utils/message/Message';
import {
  PRODUCTION_RESULTS_BY_WORK_ORDER_QUERY,
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
   * GraphQL 에러 응답에서 사용자 친화적인 에러 메시지를 추출하는 함수
   * 
   * @param {Object} error - GraphQL 에러 객체
   * @returns {string} 추출된 에러 메시지
   */
  const extractErrorMessage = useCallback((error) => {
    // networkError가 있는 경우 그 구조도 확인
    if (error.networkError) {
      if (error.networkError.result) {
        // NetworkError.result.errors 확인
      }
    }
    
    /**
     * 메시지에서 Java 예외 정보와 기술적 정보를 제거하는 함수
     */
    const cleanMessage = (message) => {
      if (!message || typeof message !== 'string') return message;
      
      let cleanedMessage = message;
      
      // Java 예외 클래스명 제거
      const javaExceptionPrefixes = [
        'java.lang.RuntimeException: ',
        'java.lang.Exception: ',
        'java.lang.IllegalArgumentException: ',
        'java.lang.IllegalStateException: ',
        'RuntimeException: ',
        'Exception: '
      ];
      
      for (const prefix of javaExceptionPrefixes) {
        if (cleanedMessage.startsWith(prefix)) {
          cleanedMessage = cleanedMessage.replace(prefix, '');
          break;
        }
      }
      
      // ": " 로 분리해서 실제 에러 메시지 부분만 추출
      if (cleanedMessage.includes(': ')) {
        const parts = cleanedMessage.split(': ');
        
        // 가장 구체적인 에러 메시지를 찾기 위해 마지막에서 두 번째 또는 마지막 부분 선택
        if (parts.length >= 2) {
          // "생산실적 저장 중 오류가 발생했습니다: 구체적인 에러" 형태인 경우
          const lastPart = parts[parts.length - 1].trim();
          const secondLastPart = parts[parts.length - 2].trim();
          
          // 마지막 부분이 더 구체적인 에러인지 확인
          if (lastPart && lastPart !== '생산실적 저장 중 오류가 발생했습니다' && 
              lastPart.length > 10) {
            cleanedMessage = lastPart;
          } else if (secondLastPart && secondLastPart.length > 10) {
            cleanedMessage = secondLastPart;
          } else {
            cleanedMessage = lastPart;
          }
        }
      }
      
      return cleanedMessage;
    };
    
    // 1. GraphQL errors 배열에서 메시지 추출 시도
    if (error.graphQLErrors && Array.isArray(error.graphQLErrors) && error.graphQLErrors.length > 0) {
      const graphQLError = error.graphQLErrors[0];
      
      if (graphQLError.message) {
        const cleanedMessage = cleanMessage(graphQLError.message);
        if (cleanedMessage) {
          return cleanedMessage;
        }
      }
    }

    // 2. networkError에서 메시지 추출 시도
    if (error.networkError && error.networkError.result && error.networkError.result.errors) {
      const networkErrors = error.networkError.result.errors;
      
      if (Array.isArray(networkErrors) && networkErrors.length > 0 && networkErrors[0].message) {
        const cleanedMessage = cleanMessage(networkErrors[0].message);
        if (cleanedMessage) {
          return cleanedMessage;
        }
      }
    }

    // 3. 일반 에러 메시지 확인
    if (error.message) {
      const cleanedMessage = cleanMessage(error.message);
      if (cleanedMessage) {
        return cleanedMessage;
      }
    }

    // 4. toString() 메서드로 에러 문자열 확인
    if (typeof error.toString === 'function') {
      const errorString = error.toString();
      if (errorString && errorString !== '[object Object]') {
        const cleanedMessage = cleanMessage(errorString);
        if (cleanedMessage) {
          return cleanedMessage;
        }
      }
    }

    // 5. JSON.stringify로 에러 객체 내용 확인 (마지막 수단)
    try {
      const errorJSON = JSON.stringify(error, null, 2);
      
      // JSON에서 message 패턴 찾기
      const messageMatch = errorJSON.match(/"message"\s*:\s*"([^"]+)"/);
      if (messageMatch && messageMatch[1]) {
        const cleanedMessage = cleanMessage(messageMatch[1]);
        if (cleanedMessage) {
          return cleanedMessage;
        }
      }
    } catch (jsonError) {
      // JSON stringify 실패 시 무시
    }

    // 6. 기본 에러 메시지 반환
    return '생산실적 저장 중 오류가 발생했습니다.';
  }, []);

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
          // 신규 생산실적 생성 - 불량정보를 포함한 중첩 구조
          createdRows = [{
            ...baseData,
            // 불량정보를 직접 포함
            defectInfos: defectInfos || []
          }];
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

        // GraphQL 뮤테이션 실행
        return executeMutation({
          mutation: SAVE_PRODUCTION_RESULT_MUTATION,
          variables: {
            createdRows: createdRows
            // defectInfos는 이제 각 createdRows에 포함됨
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
          console.error("[saveProductionResult] Error saving production result:", error);
          
          // GraphQL 에러 응답에서 실제 에러 메시지 추출
          const userFriendlyMessage = extractErrorMessage(error);
          
          Message.showError({message: userFriendlyMessage});
          throw error;
        })
        .finally(() => {
          isSavingRef.current = false;
        });
      }, [executeMutation, extractErrorMessage]);

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
        
        // GraphQL 에러 응답에서 실제 에러 메시지 추출
        const userFriendlyMessage = extractErrorMessage(error);
        
        Message.showError({message: userFriendlyMessage});
      })
      .finally(() => {
        delete isDeletingRef.current[prodResultId];
      });
    }, () => {
      // 취소 시에도 상태 초기화
      delete isDeletingRef.current[prodResultId];
    });
  }, [executeMutation, extractErrorMessage]);

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
      
      // GraphQL 에러 응답에서 실제 에러 메시지 추출
      const userFriendlyMessage = extractErrorMessage(error);
      
      Message.showError({ message: userFriendlyMessage });
    })
    .finally(() => {
      // 모든 항목의 삭제 상태 초기화
      prodResultIds.forEach(id => {
        delete isDeletingRef.current[id];
      });
    });
  }, [executeMutation, extractErrorMessage]);

  /**
   * 다중 생산실적 저장 함수 - 여러 행을 한 번에 저장
   *
   * @param {Array} productionResults - 저장할 생산실적 배열
   * @param {Object} productionInfo - 생산 정보(작업지시 또는 제품 정보)  
   * @param {Object} defectInfosMap - 각 행의 불량정보 맵 {tempId: [defectInfos]}
   * @param {Function} onSuccess - 성공 시 콜백 함수
   * @returns {Promise} GraphQL mutation 결과를 반환하는 Promise
   */
  const saveMultipleProductionResults = useCallback(
    (productionResults, productionInfo, defectInfosMap = {}, onSuccess) => {
      // 이미 저장 중인 경우 중복 호출 방지
      if (isSavingRef.current) {
        const error = new Error('저장 중입니다. 잠시만 기다려주세요.');
        Message.showWarning(error.message);
        return Promise.reject(error);
      }

      isSavingRef.current = true;

      // 빈 배열인 경우 처리
      if (!productionResults || productionResults.length === 0) {
        const error = new Error('저장할 생산실적이 없습니다.');
        Message.showWarning(error.message);
        isSavingRef.current = false;
        return Promise.reject(error);
      }

      // 저장 가능한 행들만 필터링 (신규 행 또는 임시 행)
      const newRows = productionResults.filter(row => 
        row.isNew === true || 
        row.id.toString().startsWith('temp_') || 
        !row.prodResultId
      );

      if (newRows.length === 0) {
        const error = new Error('저장할 신규 생산실적이 없습니다.');
        Message.showWarning(error.message);
        isSavingRef.current = false;
        return Promise.reject(error);
      }

      // 각 행의 필수 필드 검증
      for (const row of newRows) {
        // 제품ID 필수 확인
        if (!row.productId && (!productionInfo || !productionInfo.productId)) {
          const error = new Error('제품ID는 필수 입력 항목입니다.');
          Message.showError({message: error.message});
          isSavingRef.current = false;
          return Promise.reject(error);
        }

        // 창고 필수 입력 검사
        if (!row.warehouseId) {
          const error = new Error('창고는 필수 입력 항목입니다.');
          Message.showError({message: error.message});
          isSavingRef.current = false;
          return Promise.reject(error);
        }

        // 생산시작일시 필수 입력 검사
        if (!row.prodStartTime) {
          const error = new Error('생산시작일시는 필수 입력 항목입니다.');
          Message.showError({message: error.message});
          isSavingRef.current = false;
          return Promise.reject(error);
        }

        // 생산종료일시 필수 입력 검사
        if (!row.prodEndTime) {
          const error = new Error('생산종료일시는 필수 입력 항목입니다.');
          Message.showError({message: error.message});
          isSavingRef.current = false;
          return Promise.reject(error);
        }

        // 생산수량 검사
        if ((Number(row.goodQty) + Number(row.defectQty)) <= 0) {
          const error = new Error('생산수량이 1 이상이어야 합니다.');
          Message.showError({message: error.message});
          isSavingRef.current = false;
          return Promise.reject(error);
        }
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

      // 생산실적 데이터 배열 준비 - 불량정보를 각 행에 직접 포함
      const createdRows = newRows.map(row => {
        // 해당 행의 불량정보 가져오기
        const rowDefectInfos = defectInfosMap[row.id] || [];
        
        // 불량정보를 백엔드 형식으로 변환
        const defectInfos = rowDefectInfos.map(defect => ({
          workOrderId: row.workOrderId || (productionInfo ? productionInfo.workOrderId : null),
          productId: row.productId || (productionInfo ? productionInfo.productId : null),
          defectQty: Number(defect.defectQty),
          defectType: defect.defectType,
          defectCause: defect.defectCause,
          resultInfo: defect.resultInfo || defect.defectType,
          state: 'NEW',
          flagActive: true
        }));

        return {
          workOrderId: row.workOrderId || (productionInfo ? productionInfo.workOrderId : null),
          productId: row.productId || (productionInfo ? productionInfo.productId : null),
          goodQty: Number(row.goodQty) || 0,
          defectQty: Number(row.defectQty) || 0,
          equipmentId: row.equipmentId || "",
          warehouseId: row.warehouseId || "",
          resultInfo: row.resultInfo || "",
          defectCause: row.defectCause || "",
          // 날짜 필드 처리 - 서버가 기대하는 형식으로 변환
          prodStartTime: formatDateForServer(row.prodStartTime),
          prodEndTime: formatDateForServer(row.prodEndTime),
          flagActive: true,
          // 불량정보를 직접 포함 (중첩 구조)
          defectInfos: defectInfos
        };
      });

      // GraphQL 뮤테이션 실행 - 중첩 구조 방식
      return executeMutation({
        mutation: SAVE_PRODUCTION_RESULT_MUTATION,
        variables: {
          createdRows: createdRows
          // defectInfos는 각 createdRows에 포함되므로 별도 전달 불필요
        }
      })
      .then((result) => {
        if (result.data && result.data.saveProductionResult) {
          Message.showSuccess(`${newRows.length}건의 생산실적이 저장되었습니다.`, onSuccess);
          return result;
        } else {
          const errorMessage = extractErrorMessage(result);
          throw new Error(errorMessage);
        }
      })
      .catch((error) => {
        console.error('다중 생산실적 저장 실패:', error);
        const errorMessage = extractErrorMessage(error);
        Message.showError({message: errorMessage});
        throw error;
      })
      .finally(() => {
        isSavingRef.current = false;
      });
    }, [executeMutation, extractErrorMessage]);

  return {
    saveProductionResult,
    deleteProductionResult,
    deleteProductionResults,
    saveMultipleProductionResults
  };
};

export default useProductionResult;