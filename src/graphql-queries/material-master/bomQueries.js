export const BOM_QUERY = `
    query getBomList($filter: BomFilter) {
        getBomList(filter: $filter) {
            bomId
            bomLevel
            bomName
            materialType
            materialCategory
            systemMaterialId
            userMaterialId
            materialName
            materialStandard
            unit
            remark
            flagActive
            createUser
            createDate
            updateUser
            updateDate
        }
    }
`;

export const BOM_DETAIL_QUERY = `
    query getBomDetails($bomId: String!) {
        getBomDetails(bomId: $bomId) {
            bomDetailId
            bomLevel
            materialType
            systemMaterialId
            userMaterialId
            materialName
            parentItemCd
            userParentItemCd
            parentMaterialType
            parentMaterialName
            materialStandard
            unit
            itemQty
            remark
            flagActive
        }
    }
`;

export const BOM_MUTATION = `
    mutation saveBom($createdRows: [BomInput], $updatedRows: [BomUpdate]) {
        saveBom(createdRows: $createdRows, updatedRows: $updatedRows)
    }
`;

export const BOM_DELETE_MUTATION = `
    mutation deleteBom($bomId: String!) {
        deleteBom(bomId: $bomId)
    }
`;

export const BOM_DETAIL_MUTATION = `
    mutation saveBomDetails($createdRows: [BomDetailInput], $updatedRows: [BomDetailUpdate]) {
        saveBomDetails(createdRows: $createdRows, updatedRows: $updatedRows)
    }
`;

export const BOM_DETAIL_DELETE_MUTATION = `
    mutation deleteBomDetails($bomDetailIds: [String!]!) {
        deleteBomDetails(bomDetailIds: $bomDetailIds)
    }
`;

export const MATERIALS_BY_TYPE_QUERY = `
    query getMaterialsByType($materialType: String!) {
    getMaterialsByType(materialType: $materialType) {
        materialCategory
        systemMaterialId
        userMaterialId
        materialName
        materialStandard
        unit
  }
}
`;
