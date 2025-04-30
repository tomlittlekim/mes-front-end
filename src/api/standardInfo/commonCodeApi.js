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

const getGridCodeQuery = `
    query getGridCodes($codeClassId: String!) {
      getGridCodes(codeClassId: $codeClassId) {
        codeId
        codeName
      }
    }
  `;

const initialCodeQuery = `
  query getInitialCodes($codeClassId: String!) {
    getInitialCodes(codeClassId: $codeClassId) {
      codeId
      codeName
    }
  }
`;

const getCodeListQuery = `
  query getGridCodeList($codeClassIds: [String!]!) {
    getGridCodeList(codeClassIds: $codeClassIds) {
        codeClassId
        codeClassName
        codeClassDesc
        codes {
          codeId
          codeName
        }
      }
    }
`

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

/**
 * 코드 클레스 리스트 가져오는 메소드
 * */
export const getCodeClass = async (filter = {}) => {
  const response = await graphFetch(getCodeClassQuery, {filter});
  return response.getCodeClass
}


/**
 * 코드 리스트 가져오는 메소드
 * ex) codeClassId = { codeClassId: codeGroup.codeClassId }
 * */
export const getCodeList = async (codeClassId) => {
  const response = await graphFetch(getCodesQuery, codeClassId);
  return response.getCodes
}

/**
 *  그리드나 드롭다운에 들어갈 공통코드 리스트 불러오는 메소드
 *  리턴값은 label , value 객체로 응답
 * */
export const getGridCodes = async (codeClassId) => {
  const response = await graphFetch(getGridCodeQuery, {codeClassId});

  return response.getGridCodes.map(row => ({
    value: row.codeId,
    label: row.codeName,
  }));
}

export const getInitialCodes = async (codeClassId) =>{
  const response = await graphFetch(initialCodeQuery, {codeClassId});

  return response.getInitialCodes.map(row => ({
    value: row.codeId,
    label: row.codeName,
  }));
}

export const getGridCodeList = async (codeClassIds) => {
  const response = await graphFetch(getCodeListQuery, { codeClassIds });

  return response.getGridCodeList.reduce((acc, codeClass) => {
    acc[codeClass.codeClassId] = codeClass.codes.map(row => ({
      value: row.codeId,
      label: row.codeName,
    }));
    return acc;
  }, {});
};

export const saveCodeClass = (req) =>  graphFetch(saveCodeClassMutation,req)

export const saveCode = (req) => graphFetch(saveCodeMutation,req)

export const deleteCode = (codeId) => graphFetch(deleteCodeMutation, codeId)