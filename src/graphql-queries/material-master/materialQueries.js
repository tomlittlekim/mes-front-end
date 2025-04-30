// src/graphql/queries/materialQueries.js
export const RAW_SUB_MATERIAL_QUERY = `
    query getRawSubMaterials($filter: MaterialFilter) {
        getRawSubMaterials(filter: $filter) {
            seq
            materialType
            materialCategory
            systemMaterialId
            userMaterialId
            materialName
            materialStandard
            unit
            minQuantity
            maxQuantity
            baseQuantity
            manufacturerName
            supplierId
            flagActive
            createUser
            createDate
            updateUser
            updateDate
        }
    }
`;

export const COMPLETE_MATERIAL_QUERY = `
    query getCompleteMaterials($filter: MaterialFilter) {
        getCompleteMaterials(filter: $filter) {
            seq
            materialType
            materialCategory
            systemMaterialId
            userMaterialId
            materialName
            materialStandard
            unit
            minQuantity
            maxQuantity
            baseQuantity
            manufacturerName
            supplierId
            flagActive
            createUser
            createDate
            updateUser
            updateDate
        }
    }
`;


export const HALF_MATERIAL_QUERY = `
    query getHalfMaterials($filter: MaterialFilter) {
        getHalfMaterials(filter: $filter) {
            seq
            materialType
            materialCategory
            systemMaterialId
            userMaterialId
            materialName
            materialStandard
            unit
            minQuantity
            maxQuantity
            manufacturerName
            supplierId
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

/** material 관련된 dropdown 데이터 가져오는 유틸성 쿼리 */
export const ALL_MATERIALS_QUERY = `
    query getAllMaterials {
        getAllMaterials {
            materialType
            categories {
                materialCategory
                materials {
                    systemMaterialId
                    userMaterialId
                    materialName
                    materialStandard
                    unit
                }
            }
        }
    }
`;

export const VENDOR_LIST_BY_TYPE_QUERY = `
        query getVendorsByType($vendorType: [String!]) {
            getVendorsByType(vendorType: $vendorType) {
                vendorId
                vendorName
            }
        }
`