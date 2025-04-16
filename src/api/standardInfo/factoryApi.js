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

const createFactoryMutation = `
      mutation SaveFactory($createdRows: [FactoryInput], $updatedRows: [FactoryUpdate]) {
        saveFactory(createdRows: $createdRows, updatedRows: $updatedRows)
    }
  `;

const deleteFactoryMutation = `
      mutation DeleteFactory($factoryId: String!) {
        deleteFactory(factoryId: $factoryId)
      }
    `;

export const getFactory = async (filter = {}) => {
    const response = await graphFetch(getFactoryQuery, {filter});
    return response.factories
}

export const saveFactory = (req) => graphFetch(createFactoryMutation,req)

export const deleteFactory = (warehouseId) => graphFetch(deleteFactoryMutation, warehouseId)