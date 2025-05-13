import {apiFetch, graphFetch, initialFetch} from "./fetchConfig";

/**
 * 거래명세서 헤더 목록 조회
 * @param {Object} params - 검색 조건
 * @param {number} [params.id] - 거래명세서 ID
 * @param {string} [params.fromDate] - 시작일
 * @param {string} [params.toDate] - 종료일
 * @param {string} [params.orderNo] - 주문번호
 * @param {string} [params.customerId] - 고객사 ID
 * @returns {Promise<Array>} 거래명세서 헤더 목록
 */
export const getTransactionStatementHeaders = async (params = {}) => {
  const query = `
    query GetTransactionStatementHeaders($req: TransactionStatementSearchCondition) {
      transactionStatementHeaders(req: $req) {
        id
        site
        compCd
        orderNo
        orderDate
        customerName
        orderQuantity
        totalAmount
        supplyPrice
        vat
        flagIssuance
        issuanceDate
        flagVat
      }
    }
  `;

  const variables = {
    req: {
      id: params.id || null,
      fromDate: params.fromDate || null,
      toDate: params.toDate || null,
      orderNo: params.orderNo || null,
      customerId: params.customerId || null
    }
  };

  const response = await graphFetch(query, variables);
  return response.transactionStatementHeaders || [];
};

/**
 * 거래명세서 상세 목록 조회
 * @param {string} orderNo - 주문번호
 * @returns {Promise<Array>} 거래명세서 상세 목록
 */
export const getTransactionStatementDetails = async (orderNo) => {
  const query = `
    query GetTransactionStatementDetails($orderNo: String!) {
      transactionStatementDetails(orderNo: $orderNo) {
        id
        site
        compCd
        orderNo
        orderSubNo
        transactionStatementId
        transactionStatementDate
        systemMaterialId
        materialName
        materialStandard
        unit
        shippedQuantity
        unitPrice
        supplyPrice
        vat
      }
    }
  `;

  const variables = {
    orderNo
  };

  const response = await graphFetch(query, variables);
  return response.transactionStatementDetails || [];
};

/**
 * 거래명세서 삭제
 * @param {number} headerId - 거래명세서 헤더 ID
 * @returns {Promise<string>} 삭제 결과 메시지
 */
export const deleteTransactionStatement = async (orderNo) => {
  const query = `
    mutation deleteTransactionStatement($orderNo: String!) {
      deleteTransactionStatement(orderNo: $orderNo)
    }
  `;

  const variables = {
    orderNo
  };

  const response = await graphFetch(query, variables);
  return response.deleteTransactionStatement;
};

/**
 * 거래명세서 출력
 * @param {Object} params - 출력 요청 파라미터
 * @param {number} params.headerId - 거래명세서 헤더 ID
 * @param {string} params.transactionDate - 거래일자
 * @param {string} params.customerName - 고객사명
 * @param {Array<number>} params.detailIds - 출력할 상세 ID 목록
 * @returns {Promise<Blob>} PDF 파일 Blob
 */
export const printTransactionStatement = async (params) => {
  try {
    // REST API 호출 설정
    const response = await initialFetch('POST', '/api/print/ts', params);

    if (!response.ok) {
      throw new Error(`PDF 파일 다운로드에 실패했습니다. Status: ${response.status}`);
    }

    return await response.blob();
  } catch (error) {
    console.error('PDF 출력 중 오류 발생:', error);
    throw error;
  }
}; 