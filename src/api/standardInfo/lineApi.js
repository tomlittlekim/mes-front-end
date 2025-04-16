import {graphFetch} from "../fetchConfig";

const getLinesQuery = `
      query getLines($filter: LineFilter) {
        getLines(filter: $filter) {
          factoryId
          factoryName
          factoryCode
          lineId
          lineName
          lineDesc
          createUser
          createDate
          updateUser
          updateDate
        }
      }
    `;

const getLineOptionQuery = `
    query getLineOptions {
      getLineOptions {
        factoryId
        lineId
        lineName
      }
    }
  `;

const saveLineMutation = `
      mutation saveLine($createdRows: [LineInput], $updatedRows: [LineUpdate]) {
        saveLine(createdRows: $createdRows, updatedRows: $updatedRows)
    }
  `;

const deleteLineMutation = `
      mutation DeleteLine($lineId: String!) {
        deleteLine(lineId: $lineId)
      }
    `;


/**
 * 라인 리스트를 불러오는 메소드
 * */
export const getLines = async (filter = {}) => {
    const response = await graphFetch(getLinesQuery, {filter});
    return response.getLines
}

/**
 * 로그인한 site, compCd 에 존재하는 라인 리스트를 불러오는 메소드
 * */
export const getLineOptions = async () => {
    const response = await graphFetch(getLineOptionQuery);
    return response.getLineOptions
}

export const saveLine = (req) => graphFetch(saveLineMutation,req)

export const deleteLine = (warehouseId) => graphFetch(deleteLineMutation, warehouseId)