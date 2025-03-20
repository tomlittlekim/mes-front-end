# 그리드 하단 정보 표시 가이드

## 개요
모든 메뉴 페이지에서 다음과 같은 개선 사항을 적용합니다:
1. 하단 정보 영역(`bottom-info`)에서 "총 n개 조회되었습니다" 항목을 제거합니다.
2. 각 그리드 아래에 직접 결과 수를 표시합니다.

## 개선 방법

### 1. GridWrapper 컴포넌트 업데이트
GridWrapper 컴포넌트에 다음 속성들이 추가되었습니다:
- `showCount`: 결과 수 표시 여부 (기본값: true)
- `countText`: 커스텀 결과 텍스트
- `itemType`: 항목 유형 (기본값: '항목')

### 2. CSS 스타일 추가
Grid.css에 다음 스타일들이 추가되었습니다:
- `.grid-bottom-info`: 그리드 하단 정보 컨테이너
- `.grid-info-dot`: 정보 텍스트 앞에 표시되는 점

### 3. 모든 메뉴 페이지 업데이트 사항

각 메뉴 페이지에서 다음 작업을 수행해야 합니다:

1. 하단 정보 영역에서 "총 n개 조회되었습니다" 텍스트를 제거합니다.
   ```jsx
   <div className="bottom-info">
     {/* "총 n개 조회되었습니다" 라인 제거 */}
     <div className="info-text">
       <span className="info-dot"></span>
       메뉴에 대한 설명...
     </div>
     ...
   </div>
   ```

2. 각 GridWrapper 컴포넌트에 itemType 속성을 추가합니다.
   ```jsx
   <GridWrapper
     title="제품 정보"
     buttons={productGridButtons}
     gridProps={productGridProps}
     gridRef={productGridRef}
     itemType="제품"  // 항목 유형에 맞게 추가
   />
   ```

### 4. 예시

#### 단일 그리드 메뉴
```jsx
<GridWrapper
  title="제품 정보"
  buttons={productGridButtons}
  gridProps={productGridProps}
  gridRef={productGridRef}
  itemType="제품"
/>
```

#### 두 개의 그리드가 있는 메뉴
```jsx
<GridWrapper
  title="공장 목록"
  buttons={factoryGridButtons}
  gridProps={factoryGridProps}
  gridRef={factoryGridRef}
  itemType="공장"
/>

<GridWrapper
  title="공장 상세 정보"
  buttons={detailGridButtons}
  gridProps={detailGridProps}
  gridRef={detailGridRef}
  itemType="상세 정보"
/>
```

### 5. 커스텀 텍스트 사용 (필요한 경우)
특별한 텍스트가 필요한 경우:
```jsx
<GridWrapper
  title="BOM 정보"
  buttons={bomGridButtons}
  gridProps={bomGridProps}
  gridRef={bomGridRef}
  countText={`총 ${bomList.length}개 BOM 관계가 검색되었습니다.`}
/>
```

## 결과
이 개선 사항을 적용하면:
1. 각 그리드 아래에 해당 그리드의 결과 수가 직접 표시됩니다.
2. 하단 정보 영역의 중복된 정보가 제거됩니다.
3. 사용자는 각 그리드와 관련된 정보를 더 명확하게 확인할 수 있습니다. 