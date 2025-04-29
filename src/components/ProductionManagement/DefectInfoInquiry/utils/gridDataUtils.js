/**
 * 불량정보 데이터를 그리드 표시용으로 변환하는 함수
 * 
 * @param {Object} responseData - API에서 응답받은 원본 데이터
 * @returns {Array} 데이터그리드에 표시할 데이터 배열
 */
export const formatDefectInfoData = (responseData) => {
  // API 응답이 없거나 데이터가 없는 경우 빈 배열 반환
  if (!responseData || !responseData.allDefectInfos) {
    return [];
  }

  // 불량 정보 추출
  const defectInfos = responseData.allDefectInfos;

  // 데이터그리드에 표시할 형식으로 데이터 변환
  return defectInfos.map((defect, index) => {
    return {
      ...defect,
      id: defect.id || index, // id가 없을 경우 인덱스로 대체
      defectQty: defect.defectQty ? parseFloat(defect.defectQty) : 0, // 불량수량 숫자 형식으로 변환
    };
  });
}; 