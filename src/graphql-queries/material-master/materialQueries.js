// src/graphql/queries/materialQueries.js
export const MATERIAL_QUERY = `
    query getMaterials($filter: MaterialFilter) {
        materials(filter: $filter) {
            seq
            materialType
            systemMaterialId
            userMaterialId
            materialName
            materialStandard
            unit
            minQuantity
            maxQuantity
            manufacturerName
            supplierId
            materialStorage
            flagActive
            createUser
            createDate
            updateUser
            updateDate
        }
    }
`;

export const MATERIAL_MUTATION = `
    mutation saveMaterials($createdRows: [MaterialInput], $updatedRows: [MaterialUpdate]) {
        saveMaterials(createdRows: $createdRows, updatedRows: $updatedRows)
    }
`;

export const DELETE_MUTATION = `
    mutation deleteMaterials($systemMaterialIds: [String!]!) {
        deleteMaterials(systemMaterialIds: $systemMaterialIds)
    }
`;