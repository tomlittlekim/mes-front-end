import { gql } from "@apollo/client";

// 제품 조회 쿼리 - filter 객체를 사용하도록 수정
export const MATERIAL_GET = gql`
    query GetCompleteMaterials($filter: MaterialFilter) {
        getCompleteMaterials(filter: $filter) {
            systemMaterialId
            materialCategory
            userMaterialId
            materialName
            materialStandard
            unit
            baseQuantity
            materialStorage
            createUser
            createDate
            updateUser
            updateDate
        }
    }
`;

// 제품 저장 뮤테이션
export const MATERIAL_SAVE = gql`
    mutation SaveMaterials($createdRows: [MaterialInput], $updatedRows: [MaterialUpdate]) {
        saveMaterials(createdRows: $createdRows, updatedRows: $updatedRows)
    }
`;

// 제품 삭제 뮤테이션
export const MATERIAL_DELETE = gql`
    mutation DeleteMaterials($systemMaterialIds: [String!]!) {
        deleteMaterials(systemMaterialIds: $systemMaterialIds)
    }
`;