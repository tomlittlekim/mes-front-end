import {graphFetch} from "../fetchConfig";

const getFactoryQuery = `
      query getFactories($filter: FactoryFilter) {
        factories(filter: $filter) {
          factoryId
          factoryName
          factoryCode
          address
          telNo
          remark
          createUser
          createDate
          updateUser
          updateDate
        }
      }
    `;


const getGridFactoryQuery = `
      query getGridFactory {
        getGridFactory {
          factoryId
          factoryName
          factoryCode
        }
      }
    `;


const saveFactoryMutation = `
      mutation SaveFactory($createdRows: [FactoryInput], $updatedRows: [FactoryUpdate]) {
        saveFactory(createdRows: $createdRows, updatedRows: $updatedRows)
    }
  `;

const deleteFactoryMutation = `
      mutation DeleteFactory($factoryIds: [String!]!) {
        deleteFactory(factoryIds: $factoryIds)
      }
    `;


export const getFactory = async (filter = {}) => {
    const response = await graphFetch(getFactoryQuery, {filter});
    return response.factories
}

export const getGridFactory = async () => {
    const response = await graphFetch(getGridFactoryQuery);
    return response.getGridFactory
}

export const saveFactory = (req) => graphFetch(saveFactoryMutation,req)

export const deleteFactory = (warehouseId) => graphFetch(deleteFactoryMutation, warehouseId)