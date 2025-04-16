// 검색 조건 초기값
export const SEARCH_CONDITIONS = {
  userMaterialId: '',
  materialName: '',
  fromDate: null,
  toDate: null
};

// 단위 선택 목록
export const UNIT_OPTIONS = [
  { value: "", label: "선택" },
  { value: "EA", label: "개" },
  { value: "roll", label: "롤" },
  { value: "bottle", label: "병" },
  { value: "pack", label: "팩" },
  { value: "can", label: "캔" },
  { value: "sheet", label: "장" },
  { value: "set", label: "세트" },
  { value: "ream", label: "연" },
  { value: "pair", label: "쌍" },
  { value: "box", label: "박스" },
  { value: "kg", label: "kg" },
  { value: "g", label: "g" },
  { value: "l", label: "리터" },
  { value: "ml", label: "ml" }
];

// 자재 카테고리 목록
export const CATEGORY_OPTIONS = [
  { value: "", label: "선택" },
  { value: "잉크", label: "잉크" },
  { value: "포장재", label: "포장재" },
  { value: "전자부품", label: "전자부품" },
  { value: "기계부품", label: "기계부품" },
  { value: "화학원료", label: "화학원료" },
  { value: "기타", label: "기타" }
];