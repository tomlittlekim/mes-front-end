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
      mutation DeleteLine($lineIds: [String!]!) {
        deleteLine(lineIds: $lineIds)
      }
    `;

export const getLines = async (filter = {}) => {
    const response = await graphFetch(getLinesQuery, {filter});
    return response.getLines
}

export const getLineOptions = async () => {
    const response = await graphFetch(getLineOptionQuery);
    return response.getLineOptions
}

export const saveLine = (req) => graphFetch(saveLineMutation,req)

export const deleteLine = (warehouseId) => graphFetch(deleteLineMutation, warehouseId)