// src/graphql-queries/common/codeQueries.js
import { gql } from '@apollo/client';

export const GET_INITIAL_CODES_QUERY = gql`
    query getInitialCodes($codeClassId: String!) {
        getInitialCodes(codeClassId: $codeClassId) {
            codeClassId
            codeId
            codeName
            codeDesc
            sortOrder
            flagActive
            createUser
            createDate
            updateUser
            updateDate
        }
    }
`;

export const GET_CODES_QUERY = gql`
    query getCodes($codeClassId: String!) {
        getCodes(codeClassId: $codeClassId) {
            codeClassId
            codeId
            codeName
            codeDesc
            sortOrder
            flagActive
            createUser
            createDate
            updateUser
            updateDate
        }
    }
`;

export const GET_GRID_CODES_QUERY = gql`
    query getGridCodes($codeClassId: String!) {
        getGridCodes(codeClassId: $codeClassId) {
            codeClassId
            codeId
            codeName
            codeDesc
            sortOrder
            flagActive
            createUser
            createDate
            updateUser
            updateDate
        }
    }
`;

export const GET_CODE_CLASS_QUERY = gql`
    query getCodeClass($filter: CodeClassFilter) {
        getCodeClass(filter: $filter) {
            codeClassId
            codeClassName
            codeClassDesc
        }
    }
`;

export const GET_GRID_CODE_LIST_QUERY = gql`
    query getGridCodeList($codeClassIds: [String!]) {
        getGridCodeList(codeClassIds: $codeClassIds) {
            codeClassId
            codeClassName
            codeClassDesc
            codes {
                codeClassId
                codeId
                codeName
                codeDesc
                sortOrder
                flagActive
                createUser
                createDate
                updateUser
                updateDate
            }
        }
    }
`;

export const SAVE_CODE_CLASS_MUTATION = gql`
    mutation saveCodeClass($createdRows: [CodeClassInput], $updatedRows: [CodeClassUpdate]) {
        saveCodeClass(createdRows: $createdRows, updatedRows: $updatedRows)
    }
`;

export const SAVE_CODE_MUTATION = gql`
    mutation saveCode($createdRows: [CodeInput], $updatedRows: [CodeUpdate]) {
        saveCode(createdRows: $createdRows, updatedRows: $updatedRows)
    }
`;

export const DELETE_CODE_MUTATION = gql`
    mutation deleteCode($codeIds: [String!]!) {
        deleteCode(codeIds: $codeIds)
    }
`; 