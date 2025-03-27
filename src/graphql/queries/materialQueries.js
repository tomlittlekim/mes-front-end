// src/graphql/queries/materialQueries.js
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
            supplierName
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
    mutation saveMaterials($materials: [MaterialInput!]!) {
        saveMaterials(materials: $materials) {
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
            supplierName
            materialStorage
            flagActive
            createUser
            createDate
            updateUser
            updateDate
        }
    }
`;

export const DELETE_MUTATION = gql`
    mutation deleteMaterials($ids: [String!]!) {
        deleteMaterials(ids: $ids)
    }
`;