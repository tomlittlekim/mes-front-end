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
                defectType
                defectQty
                defectReason
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

// 생산실적 저장 뮤테이션
export const SAVE_PRODUCTION_RESULT = gql`
    mutation SaveProductionResult(
        $createdRows: [ProductionResultInput], 
        $updatedRows: [ProductionResultUpdate],
        $defectInfos: [DefectInfoInput]
    ) {
        saveProductionResult(
            createdRows: $createdRows, 
            updatedRows: $updatedRows,
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