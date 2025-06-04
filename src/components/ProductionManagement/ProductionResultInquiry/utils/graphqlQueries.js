import { gql } from '@apollo/client';

/**
 * 생산실적 목록 조회 쿼리
 */
export const PRODUCTION_RESULTS_QUERY = gql`
    query getProductionResults($filter: ProductionResultFilter) {
        productionResults(filter: $filter) {
            id
            workOrderId
            prodResultId
            productId
            goodQty
            defectQty
            progressRate
            defectRate
            equipmentId
            resultInfo
            defectCause
            prodStartTime
            prodEndTime
            createUser
            createUserName
            createDate
            updateUser
            updateDate
            flagActive
        }
    }
`;

/**
 * 불량정보 조회 쿼리
 */
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