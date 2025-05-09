import {graphFetch} from "../fetchConfig";

const getEquipmentQuery = `
      query getEquipments($filter: EquipmentFilter) {
        getEquipments(filter: $filter) {
          factoryId
          factoryName
          lineId
          lineName
          equipmentId
          equipmentBuyDate
          equipmentBuyVendor
          equipmentSn
          equipmentType
          equipmentName
          equipmentStatus
          remark
          createUser
          createDate
          updateUser
          updateDate
        }
      }
    `;

const saveEquipmentMutation = `
      mutation saveEquipment($createdRows: [EquipmentInput], $updatedRows: [EquipmentUpdate]) {
        saveEquipment(createdRows: $createdRows, updatedRows: $updatedRows)
    }
  `;

const deleteEquipmentMutation = `
      mutation deleteEquipment($equipmentIds: [String!]!) {
        deleteEquipment(equipmentIds: $equipmentIds)
      }
    `;

export const getEquipments = async (filter = {}) => {
    const response = await graphFetch(getEquipmentQuery, {filter});
    return response.getEquipments
}

export const saveEquipment = (req) => graphFetch(saveEquipmentMutation,req)

export const deleteEquipment = (warehouseId) => graphFetch(deleteEquipmentMutation, warehouseId)