import { gql } from '@apollo/client';

/**
 * 작업지시 목록 조회 쿼리
 */
export const WORK_ORDERS_QUERY = gql`
    query getWorkOrders($filter: WorkOrderFilter) {
        workOrders(filter: $filter) {
            site
            compCd
            workOrderId
            prodPlanId
            productId
            orderQty
            shiftType
            state
            flagActive
            createUser
            createDate
            updateUser
            updateDate
        }
    }
`;

/**
 * 작업지시별 생산실적 조회 쿼리
 */
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