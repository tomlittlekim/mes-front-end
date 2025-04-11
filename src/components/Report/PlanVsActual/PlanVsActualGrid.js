import React from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid'; // DataGridPro -> DataGrid
import { Box } from '@mui/material';

/**
 * 계획 대비 실적 조회 결과 그리드
 *
 * @param {object} props - { rows, columns, loading, refreshKey, ...gridProps }
 * @returns {JSX.Element}
 */
const PlanVsActualGrid = ({ rows = [], columns = [], loading, refreshKey, ...gridProps }) => {

  return (
    <Box sx={{ height: 600, width: '100%' }}> {/* 높이 조절 필요 */} 
      <DataGrid
        key={refreshKey} // 데이터 변경 시 그리드 강제 리렌더링
        rows={rows}
        columns={columns} // 외부에서 정의된 컬럼 사용
        loading={loading}
        density="compact" // 밀도 설정
        rowHeight={35} // 행 높이 조절
        // 기본 기능 활성화
        disableRowSelectionOnClick
        slots={{ toolbar: GridToolbar }} // 툴바 활성화 (필터, 내보내기 등)
        slotProps={{
          toolbar: {
            showQuickFilter: true, // 빠른 검색 필터
            quickFilterProps: { debounceMs: 500 },
            printOptions: { disableToolbarButton: true }, // 인쇄 버튼 비활성화
            csvOptions: { utf8WithBom: true }, // CSV 내보내기 UTF8 설정
          },
        }}
        // initialState, slots 등 gridProps에서 받아온 설정 적용
        {...gridProps}
      />
    </Box>
  );
};

export default PlanVsActualGrid; 