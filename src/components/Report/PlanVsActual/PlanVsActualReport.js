import React from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Box } from '@mui/material';

/**
 * 계획 대비 실적 조회 결과 그리드 정의 (EnhancedDataGridWrapper와 함께 사용)
 *
 * @param {object} props - { refreshKey, ...gridProps } (rows, columns 등은 EnhancedDataGridWrapper에서 관리)
 * @returns {null} - 이 컴포넌트는 직접 렌더링되지 않고, 컬럼 정의 등을 제공
 */
const PlanVsActualReport = ({ refreshKey, ...gridProps }) => {
  // EnhancedDataGridWrapper에 전달될 컬럼 및 속성 정의
  const columns = [
    { field: 'id', headerName: 'ID', width: 70, hide: true }, // 내부 식별용 ID
    { field: 'itemName', headerName: '품목명', width: 180, editable: false },
    { field: 'equipmentName', headerName: '설비명', width: 150, editable: false },
    { field: 'planQty', headerName: '계획수량', width: 120, type: 'number', editable: false, align: 'right', headerAlign: 'right' },
    { field: 'actualQty', headerName: '실적수량', width: 120, type: 'number', editable: false, align: 'right', headerAlign: 'right' },
    {
      field: 'achievementRate',
      headerName: '달성률 (%)',
      width: 120,
      type: 'number',
      editable: false,
      align: 'right', 
      headerAlign: 'right',
      valueGetter: (params) => { 
        const plan = Number(params.row.planQty);
        const actual = Number(params.row.actualQty);
        if (plan > 0 && actual >= 0) {
            return parseFloat(((actual / plan) * 100).toFixed(1));
        }
        return 0;
      },
    },
    {
      field: 'difference',
      headerName: '차이',
      width: 120,
      type: 'number',
      editable: false,
      align: 'right',
      headerAlign: 'right',
      valueGetter: (params) => (Number(params.row.actualQty) || 0) - (Number(params.row.planQty) || 0)
    },
  ];

  const defaultGridProps = {
    // density: 'compact',
    // rowHeight: 35,
    // disableRowSelectionOnClick: true,
    // slots: { toolbar: GridToolbar },
    // slotProps: {
    //   toolbar: {
    //     showQuickFilter: true,
    //     quickFilterProps: { debounceMs: 500 },
    //     printOptions: { disableToolbarButton: true },
    //     csvOptions: { utf8WithBom: true },
    //   },
    // },
    initialState: {
      columns: {
        columnVisibilityModel: { id: false },
      },
      sorting: {
        sortModel: [{ field: 'itemName', sort: 'asc' }],
      },
      // pagination: { paginationModel: { pageSize: 10 } },
    },
    ...gridProps // 외부에서 전달받은 props 우선 적용
  };

  // 이 컴포넌트는 설정을 반환하는 용도이므로 null을 반환하거나, 
  // EnhancedDataGridWrapper의 props로 직접 전달하는 구조로 변경
  return null; 

  /* EnhancedDataGridWrapper 사용 예시:
  <EnhancedDataGridWrapper
    title="계획 대비 실적"
    rows={reportData} // 훅에서 가져온 데이터
    columns={columns} // 여기서 정의한 컬럼
    loading={isLoading}
    refreshKey={refreshKey}
    height={400}
    gridProps={defaultGridProps} // 여기서 정의한 기본 그리드 속성
    // buttons={gridButtons} // 필요시 버튼 추가
    // onRowClick={handleRowClick} // 필요시 행 클릭 핸들러 추가
  />
  */
};

// 컬럼 및 그리드 속성을 외부에서 사용할 수 있도록 export (옵션)
export const planVsActualColumns = PlanVsActualReport.columns;
export const planVsActualGridProps = PlanVsActualReport.defaultGridProps;

// export default PlanVsActualReport; // 컴포넌트 자체를 export 할 필요는 없음 