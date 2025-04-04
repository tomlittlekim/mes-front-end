export const BOM_QUERY = `
    query getBomList($filter: BomFilter) {
        getBomList(filter: $filter) {
            bomId
            bomLevel
            bomName
            materialType
            materialCategory
            itemCd
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
    query getBomDetail($bomId: String!) {
        getBomDetail(bomId: $bomId) {
            bomLevel
            itemCd
            userMaterialId
            materialName
            parentItemCd
            userParentItemCd
            parentMaterialName
            materialStandard
            unit
            itemQty
            remark
            flagActive
            createUser
            createDate
            updateUser
            updateDate
        }
    }
`;

export const BOM_MUTATION = `
    mutation saveBom($createdRows: [BomInput], $updatedRows: [BomUpdate]) {
        saveBom(createdRows: $createdRows, updatedRows: $updatedRows)
    }
`;

export const BOM_DELETE_MUTATION = `
    mutation deleteBom($bomIds: [String!]!) {
        deleteBom(bomIds: $bomIds)
    }
`;

export const BOM_DETAIL_MUTATION = `
    mutation saveBomDetail($createdRows: [BomDetailInput], $updatedRows: [BomDetailUpdate]) {
        saveBomDetail(createdRows: $createdRows, updatedRows: $updatedRows)
    }
`;

export const BOM_DETAIL_DELETE_MUTATION = `
    mutation deleteBomDetail($bomDetailIds: [String!]!) {
        deleteBomDetail(bomDetailIds: $bomDetailIds)
    }
`; 