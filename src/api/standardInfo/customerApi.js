import {graphFetch} from "../fetchConfig";

const getVendorQuery = `
      query getVendors($filter: VendorFilter) {
        getVendors(filter: $filter) {
          vendorId
          vendorName
          vendorType
          businessRegNo
          ceoName
          businessType
          address
          telNo
          createUser
          createDate
          updateUser
          updateDate
        }
      }
    `;

const saveVendorMutation = `
      mutation SaveVendor($createdRows: [VendorInput], $updatedRows: [VendorUpdate]) {
        saveVendor(createdRows: $createdRows, updatedRows: $updatedRows)
    }
  `;

const deleteVendorMutation = `
      mutation DeleteVendor($vendorId: String!) {
        deleteVendor(vendorId: $vendorId)
      }
    `;

export const getVendors = async (filter = {}) => {
    const response = await graphFetch(getVendorQuery, {filter});
    return response.getVendors
}

export const saveVendor = (req) => graphFetch(saveVendorMutation,req)

export const deleteVendor = (vendorId) => graphFetch(deleteVendorMutation, vendorId)