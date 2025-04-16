import {graphFetch} from "../fetchConfig";

const getCodeClassQuery = `
      query getCodeClass($filter: CodeClassFilter) {
        getCodeClass(filter: $filter) {
          codeClassId
          codeClassName
          codeClassDesc
        }
      }
    `;

const saveCodeClassMutation = `
      mutation saveCodeClass($createdRows: [CodeClassInput], $updatedRows: [CodeClassUpdate]) {
        saveCodeClass(createdRows: $createdRows, updatedRows: $updatedRows)
    }
  `;

const getCodesQuery = `
      query getCodes($codeClassId: String!) {
        getCodes(codeClassId: $codeClassId) {
          codeClassId
          codeId
          codeName
          codeDesc
          sortOrder
          createUser
          createDate
          updateUser
          updateDate
        }
      }
    `;

const saveCodeMutation = `
      mutation saveCode($createdRows: [CodeInput], $updatedRows: [CodeUpdate]) {
        saveCode(createdRows: $createdRows, updatedRows: $updatedRows)
    }
  `;

const deleteCodeMutation = `
      mutation DeleteCode($codeId: String!) {
        deleteCode(codeId: $codeId)
      }
    `;

export const getCodeClass = async (filter = {}) => {
    const response = await graphFetch(getCodeClassQuery, {filter});
    return response.getCodeClass
}

export const getCodeList = async (codeClassId) => {
    const response = await graphFetch(getCodesQuery, codeClassId);
    return response.getCodes
}

export const saveCodeClass = (req) =>  graphFetch(saveCodeClassMutation,req)

export const saveCode = (req) => graphFetch(saveCodeMutation,req)

export const deleteCode = (codeId) => graphFetch(deleteCodeMutation, codeId)