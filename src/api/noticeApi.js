import { graphFetch } from './fetchConfig';

/**
 * 공지사항을 생성하거나 수정합니다.
 * @param {Object} req - 공지사항 데이터
 * @param {number} req.noticeId - 공지사항 ID (수정 시에만 필요)
 * @param {string} req.noticeTitle - 공지사항 제목
 * @param {string} req.attachmentPath - 첨부파일 경로
 * @param {string} req.noticeContents - 공지사항 내용
 * @param {number} req.priorityLevel - 우선순위 레벨
 * @param {string} req.noticeTtl - 공지사항 만료일
 * @returns {Promise<string>} - 성공 메시지
 */
export const upsertNotice = async (req) => {
  const mutation = `
    mutation UpsertNotice($req: UpsertNoticeRequest) {
      upsertNotice(req: $req)
    }
  `;

  const response = await graphFetch(mutation, { req });
  return response.upsertNotice;
};

/**
 * 공지사항을 삭제합니다.
 * @param {number} noticeId - 삭제할 공지사항 ID
 * @returns {Promise<string>} - 성공 메시지
 */
export const deleteNotice = async (noticeId) => {
  const mutation = `
    mutation DeleteNotice($noticeId: Int!) {
      deleteNotice(noticeId: $noticeId)
    }
  `;

  const response = await graphFetch(mutation, { noticeId });
  return response.deleteNotice;
};

/**
 * 공지사항의 조회수를 증가시킵니다.
 * @param {number} noticeId - 공지사항 ID
 * @returns {Promise<string>} - 성공 메시지
 */
export const upReadCountForNotice = async (noticeId) => {
  const mutation = `
    mutation UpReadCountForNotice($noticeId: Int!) {
      upReadCountForNotice(noticeId: $noticeId)
    }
  `;

  const response = await graphFetch(mutation, { noticeId });
  return response.upReadCountForNotice;
};

/**
 * 공지사항 목록을 조회합니다.
 * @param {Object} req - 검색 조건
 * @param {string} req.fromDate - 시작일
 * @param {string} req.toDate - 종료일
 * @returns {Promise<Array>} - 공지사항 목록
 */
export const getAllNotice = async (req) => {
  const query = `
    query GetAllNotice($req: NoticeSearchRequest) {
      getALlNotice(req: $req) {
        noticeId
        noticeTitle
        attachmentPath
        noticeContents
        noticeWriter
        readCount
        priorityLevel
        noticeTtl
        createDate
        createUser
        flagActive
      }
    }
  `;

  const response = await graphFetch(query, { req });
  return response.getALlNotice;
}; 