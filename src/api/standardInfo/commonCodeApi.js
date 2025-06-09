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

const getDefaultCodeListQuery = `
      query getGridDefaultCodeList($codeClassIds: [String!]!) {
    getGridDefaultCodeList(codeClassIds: $codeClassIds) {
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
      mutation DeleteCode($codeIds: [String!]!) {
        deleteCode(codeIds: $codeIds)
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

/**
 * 공통으로 불러오는 부분 많아서 캐싱 로직 추가
 */
let codeCache = {};

export const getGridCodeList = async (codeClassIds) => {
  const cacheKey = `normal_${codeClassIds.sort().join('_')}`;

  // 캐시에 있으면 캐시된 값 반환
  if (codeCache[cacheKey]) {
    return codeCache[cacheKey];
  }

  const response = await graphFetch(getCodeListQuery, { codeClassIds });

  if (!response.getGridCodeList) {
    console.warn('getGridCodeList 응답이 없습니다:', response);
    return {};
  }

  const result = response.getGridCodeList.reduce((acc, codeClass) => {
    acc[codeClass.codeClassId] = codeClass.codes.map(row => ({
      value: row.codeId,
      label: row.codeName,
    }));
    return acc;
  }, {});

  // 결과를 캐시에 저장
  codeCache[cacheKey] = result;

  return result;
};

export const getDefaultGridCodeList = async (codeClassIds) => {
  // 캐시 키 생성
  const cacheKey = `default_${codeClassIds.sort().join('_')}`;

  // 캐시에 있으면 캐시된 값 반환
  if (codeCache[cacheKey]) {
    return codeCache[cacheKey];
  }

  const response = await graphFetch(getDefaultCodeListQuery, { codeClassIds });

  if (!response.getGridDefaultCodeList) {
    console.warn('getGridDefaultCodeList 응답이 없습니다:', response);
    return {};
  }

  const result = response.getGridDefaultCodeList.reduce((acc, codeClass) => {
    acc[codeClass.codeClassId] = codeClass.codes.map(row => ({
      value: row.codeId,
      label: row.codeName,
    }));
    return acc;
  }, {});

  // 결과를 캐시에 저장
  codeCache[cacheKey] = result;

  return result;
};

// 캐시 초기화 함수
export const clearCodeCache = () => {
  codeCache = {};
};

export const saveCodeClass = (req) =>  graphFetch(saveCodeClassMutation,req)

export const saveCode = (req) => graphFetch(saveCodeMutation,req)

export const deleteCode = (codeIds) => graphFetch(deleteCodeMutation, codeIds)