import { graphFetch, apiFetch } from '../../src/api/fetchConfig';

// 모든 파일 목록 조회
export const getAllFiles = async () => {
  const query = `
    query GetAllFiles {
      getAllFiles {
        id
        name
        extension
        size
        path
        menuId
      }
    }
  `;

  const response = await graphFetch(query);
  return response.getAllFiles;
};

// 파일 삭제
export const deleteFile = async (id) => {
  const mutation = `
    mutation DeleteFile($id: Int!) {
      deleteFile(id: $id)
    }
  `;

  const variables = { id };
  const response = await graphFetch(mutation, variables);
  return response;
};

// 파일 업로드
export const uploadFile = async (formData) => {
  const response = await fetch('/api/drive/add', {
    method: 'POST',
    body: formData,
  });
  return response;
};

// 메뉴 목록 조회
export const getMenus = async () => {
  const query = `
    query {
      getMenus {
        menuId
        menuName
      }
    }
  `;
  
  const response = await graphFetch(query);
  return response.getMenus;
};

// 파일 정보 수정
export const updateFiles = async (files) => {
  const mutation = `
    mutation UpdateFiles($list: [ModifyFilesRequest]) {
      updateFiles(list: $list)
    }
  `;

  const variables = {
    list: files.map(file => ({
      id: file.id,
      name: file.name,
      menuId: file.menuId
    }))
  };

  const response = await graphFetch(mutation, variables);
  return response;
};

// 파일 다운로드
export const downloadFile = async (id) => {
  const response = await fetch(`/api/file/download/${id}`, {
    responseType: 'blob'
  });
  return response;
};