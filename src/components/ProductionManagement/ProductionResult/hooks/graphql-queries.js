// graphql-queries.js - GraphQL 쿼리/뮤테이션 중앙 관리

import { gql } from '@apollo/client';

// 작업지시 관련 쿼리
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

// 생산실적 관련 쿼리/뮤테이션
export const PRODUCTION_RESULTS_BY_WORK_ORDER_QUERY = gql`
    query getProductionResultsByWorkOrderId($workOrderId: String!) {
        productionResultsByWorkOrderId(workOrderId: $workOrderId) {
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
            createUser
            createDate
            updateUser
            updateDate
            flagActive
        }
    }
`;

// 제품ID로 생산실적 조회 쿼리 (신규)
export const PRODUCTION_RESULTS_BY_PRODUCT_QUERY = gql`
    query getProductionResultsByProductId($productId: String!) {
        productionResultsByProductId(productId: $productId) {
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
            createUser
            createDate
            updateUser
            updateDate
            flagActive
        }
    }
`;

// 생산실적 조회 쿼리 (필터 사용, 신규)
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
            createUser
            createDate
            updateUser
            updateDate
            flagActive
        }
    }
`;

// 생산실적 저장 뮤테이션
export const SAVE_PRODUCTION_RESULT_MUTATION = gql`
    mutation SaveProductionResult($createdRows: [ProductionResultInput], $updatedRows: [ProductionResultUpdate], $defectInfos: [DefectInfoInput]) {
        saveProductionResult(createdRows: $createdRows, updatedRows: $updatedRows, defectInfos: $defectInfos)
    }
`;

// 생산실적 삭제 뮤테이션
export const DELETE_PRODUCTION_RESULT_MUTATION = gql`
    mutation DeleteProductionResult($prodResultId: String!) {
        deleteProductionResult(prodResultId: $prodResultId)
    }
`;

// 불량정보 관련 쿼리
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

// 제품 목록 조회 쿼리 (신규)
export const PRODUCTS_QUERY = gql`
    query getProductMaterials {
        productMaterials {
            systemMaterialId
            userMaterialId
            materialName
            materialStandard
            materialCategory
            materialType
            unit
        }
    }
`;

// 설비 목록 조회 쿼리
export const EQUIPMENTS_QUERY = gql`
    query getEquipments($filter: EquipmentFilter) {
        getEquipments(filter: $filter) {
            equipmentId
            equipmentName
            equipmentType
            factoryId
            factoryName
            lineId
            lineName
            equipmentStatus
        }
    }
`;