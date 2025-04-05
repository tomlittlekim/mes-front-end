import { graphFetch } from "./fetchConfig";

const query = `
    query getGridCodes($codeClassId: String!) {
      getGridCodes(codeClassId: $codeClassId) {
        codeId
        codeName
      }
    }
  `;

export const getCodes = async (data) => graphFetch(query, {codeClassId: data});