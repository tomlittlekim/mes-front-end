# 메뉴 페이지 업데이트 요약

## 변경 내용
1. 모든 메뉴 페이지의 하단 정보 영역(`bottom-info`)에서 "총 n개 조회되었습니다" 항목 제거
2. 각 그리드 아래에 그리드 별 조회 결과 수 표시 추가

## 적용된 파일
현재까지 다음 파일들이 업데이트 되었습니다:
- `src/components/BomManagement/BomManagement.js`
- `src/components/ProductManagement/ProductManagement.js`
- `src/components/FactoryManagement/FactoryManagement.jsx`
- `src/components/EquipmentManagement/EquipmentManagement.js`
- `src/components/CustomerManagement/CustomerManagement.js`

## 추가 작업 필요 파일
다음 파일들도 동일한 패턴으로 수정이 필요합니다:
- `src/components/WarehouseManagement/WarehouseManagement.js`
- `src/components/LineManagement/LineManagement.js`
- `src/components/InventoryManagement/InventoryManagement.js`
- `src/components/MaterialManagement/MaterialManagement.js`
- 그 외 "총 n개 조회되었습니다" 문구를 사용하는 메뉴 페이지

## 변경 방법
각 파일에서:
1. 하단 정보 영역의 "총 n개 조회되었습니다" 텍스트를 제거합니다.
2. 각 `GridWrapper` 컴포넌트에 적절한 `itemType` 속성을 추가합니다. 

예시:
```jsx
// 수정 전
<GridWrapper
  title="거래처 목록"
  buttons={customerGridButtons}
  gridProps={customerGridProps}
  gridRef={customerGridRef}
/>

// 수정 후
<GridWrapper
  title="거래처 목록"
  buttons={customerGridButtons}
  gridProps={customerGridProps}
  gridRef={customerGridRef}
  itemType="거래처"  // 추가된 부분
/>
```

자세한 가이드는 `GUIDE_FOR_GRID_INFO.md` 문서를 참조하세요. 