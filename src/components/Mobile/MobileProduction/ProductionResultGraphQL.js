import { gql } from "@apollo/client";

// 생산실적 조회 쿼리
export const PRODUCTION_GET = gql`
    query GetProductionResults($filter: ProductionResultInquiryFilter) {
        productionResultList(filter: $filter) {
            id
            prodResultId
            workOrderId
            productId
            productName
            equipmentId
            equipmentName
            productionDate
            planQuantity
            actualQuantity
            defectQuantity
            progressRate
            defectRate
            worker
            status
            createDate
            updateDate
        }
    }
`;

// 생산실적 저장 뮤테이션
export const PRODUCTION_SAVE = gql`
    mutation SaveProductionResult($createdRows: [ProductionResultInput], $updatedRows: [ProductionResultUpdate], $defectInfos: [DefectInfoInput]) {
        saveProductionResult(
            createdRows: $createdRows,
            updatedRows: $updatedRows,
            defectInfos: $defectInfos
        )
    }
`;

// 생산실적 삭제 뮤테이션
export const PRODUCTION_DELETE = gql`
    mutation DeleteProductionResult($prodResultId: String!) {
        deleteProductionResult(prodResultId: $prodResultId)
    }
`;

// 제품 조회 쿼리
export const PRODUCT_GET = gql`
    query GetProducts {
        getCompleteMaterials {
            systemMaterialId
            userMaterialId
            materialName
        }
    }
`;

// 설비 조회 쿼리
export const EQUIPMENT_GET = gql`
    query GetEquipments {
        getEquipments {
            equipmentId
            equipmentName
        }
    }
`;

// 작업지시 조회 쿼리
export const WORK_ORDER_GET = gql`
    query GetWorkOrders($filter: WorkOrderFilter) {
        getWorkOrders(filter: $filter) {
            workOrderId
            productId
            productName
            orderQty
            state
        }
    }
`;