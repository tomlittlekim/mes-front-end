import React from 'react';

/**
 * 일일 생산 수율 리포트 정의 (EnhancedDataGridWrapper용)
 */
const DailyYieldReport = (props) => {
  const columns = [
    { field: 'id', headerName: 'ID', width: 70, hide: true },
    { field: 'date', headerName: '생산일자', width: 130, type: 'date',
      valueGetter: (params) => params.value ? new Date(params.value) : null, 
      valueFormatter: (params) => params.value ? params.value.toLocaleDateString('ko-KR') : '' 
    },
    { field: 'itemName', headerName: '품목명', width: 180 },
    { field: 'equipmentName', headerName: '설비명', width: 150 },
    { field: 'productionQty', headerName: '생산수량', width: 110, type: 'number', align: 'right', headerAlign: 'right' },
    { field: 'goodQty', headerName: '양품수량', width: 110, type: 'number', align: 'right', headerAlign: 'right' },
    { field: 'defectQty', headerName: '불량수', width: 110, type: 'number', align: 'right', headerAlign: 'right' },
    {
      field: 'yieldRate',
      headerName: '수율 (%)',
      width: 110,
      type: 'number',
      align: 'right',
      headerAlign: 'right',
      valueGetter: (params) => {
        const production = Number(params.row.productionQty);
        const good = Number(params.row.goodQty);
        if (production > 0 && good >= 0) {
          return parseFloat(((good / production) * 100).toFixed(1));
        }
        return 0;
      },
      // valueFormatter: (params) => params.value != null ? `${params.value}%` : ''
    },
  ];

  const defaultGridProps = {
    initialState: {
      columns: {
        columnVisibilityModel: { id: false },
      },
      sorting: {
        sortModel: [{ field: 'itemName', sort: 'asc' }],
      },
    },
    ...props.gridProps
  };

  return null;
};

export const dailyYieldColumns = DailyYieldReport.columns;
export const dailyYieldGridProps = DailyYieldReport.defaultGridProps;

// export default DailyYieldReport; 