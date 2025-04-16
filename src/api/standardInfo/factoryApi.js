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
      mutation DeleteFactory($factoryId: String!) {
        deleteFactory(factoryId: $factoryId)
      }
    `;

/**
 * 공장 리스트 불러오는 메소드
 * */
export const getFactory = async (filter = {}) => {
    const response = await graphFetch(getFactoryQuery, {filter});
    return response.factories
}

/**
 * 로그인한 site, compCd 에 존재하는 공장 리스트를 불러오는 메소드
 * */
export const getGridFactory = async () => {
    const response = await graphFetch(getGridFactoryQuery);
    return response.getGridFactory
}

export const saveFactory = (req) => graphFetch(saveFactoryMutation,req)

export const deleteFactory = (warehouseId) => graphFetch(deleteFactoryMutation, warehouseId)