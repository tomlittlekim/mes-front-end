import { gql } from "@apollo/client";

// 모바일용 생산실적 조회 쿼리
export const PRODUCTION_RESULTS_MOBILE = gql`
    query ProductionResultsAtMobile($filter: ProductionResultFilter) {
        productionResultsAtMobile(filter: $filter) {
            prodResultId
            workOrderId
            productId
            goodQty
            defectQty
            progressRate
            defectRate
            equipmentId
            warehouseId
            resultInfo
            defectCause
            prodStartTime
            prodEndTime
            createDate
            createUser
            updateDate
            updateUser
            flagActive
            workOrder {
                workOrderId
                productId
            }
            defectInfos {
                defectId
                prodResultId
                defectQty
                defectCause
                resultInfo
            }
        }
    }
`;

// 제품 목록 조회 쿼리 - 웹 버전과 동일하게 수정
export const PRODUCT_OPTIONS = gql`
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

// 설비 목록 조회 쿼리 - 웹 버전과 동일하게 수정
export const EQUIPMENT_OPTIONS = gql`
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

// 창고 목록 조회 쿼리
export const WAREHOUSE_OPTIONS = gql`
    query getWarehouse($filter: WarehouseFilter) {
        getWarehouse(filter: $filter) {
            warehouseId
            warehouseName
            warehouseType
            factoryId
        }
    }
`;

// 생산 시작 모바일 전용 뮤테이션
export const START_PRODUCTION_MOBILE = gql`
    mutation StartProductionAtMobile($input: ProductionResultInput!) {
        startProductionAtMobile(input: $input)
    }
`;

// 생산실적 업데이트 모바일 전용 뮤테이션
export const UPDATE_PRODUCTION_RESULT_MOBILE = gql`
    mutation UpdateProductionResultAtMobile(
        $prodResultId: String!,
        $input: ProductionResultInput!,
        $defectInfos: [DefectInfoInput]
    ) {
        updateProductionResultAtMobile(
            prodResultId: $prodResultId,
            input: $input,
            defectInfos: $defectInfos
        )
    }
`;

// 생산실적 삭제 뮤테이션
export const DELETE_PRODUCTION_RESULT = gql`
    mutation DeleteProductionResult($prodResultId: String!) {
        deleteProductionResult(prodResultId: $prodResultId)
    }
`; 