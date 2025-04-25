import { graphFetch, apiFetch } from '../../src/api/fetchConfig';

// 모든 파일 목록 조회
export const getAllFiles = async () => {
  const query = `
    query GetAllFiles {
      getAllFiles {
        seq
        name
        extension
        size
        path
        createdAt
        updatedAt
      }
    }
  `;

  const response = await graphFetch(query);
  return response.data.getAllFiles;
};

// 파일 삭제
export const deleteFile = async (seq) => {
  const mutation = `
    mutation DeleteFile($seq: Int!) {
      deleteFile(seq: $seq)
    }
  `;

  const variables = { seq };
  const response = await graphFetch(mutation, variables);
  return response.data.deleteFile;
};

// 파일 업로드
export const uploadFile = async (formData) => {
  const response = await apiFetch('/api/file', {
    method: 'POST',
    body: formData,
    headers: {
      // FormData를 사용하므로 Content-Type 헤더를 설정하지 않습니다.
    },
  });
  return response;
}; 