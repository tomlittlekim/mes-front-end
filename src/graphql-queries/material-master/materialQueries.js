// src/graphql/queries/materialQueries.js
// @ts-nocheck
import { gql } from '@apollo/client';
export const MATERIAL_QUERY = gql`
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

export const MATERIAL_MUTATION = gql`
    mutation saveMaterials($createdRows: [MaterialInput], $updatedRows: [MaterialUpdate]) {
        saveMaterials(createdRows: $createdRows, updatedRows: $updatedRows)
    }
`;

export const DELETE_MUTATION = gql`
    mutation deleteMaterials($systemMaterialIds: [String!]!) {
        deleteMaterials(systemMaterialIds: $systemMaterialIds)
    }
`;