import React from 'react';

/**
 * 기간별 생산 실적 리포트 정의 (EnhancedDataGridWrapper용)
 */
const PeriodicProductionReport = (props) => {
  const columns = [
    { field: 'id', headerName: 'ID', width: 70, hide: true },
    { field: 'date', headerName: '일자', width: 130, type: 'date', 
      valueGetter: (params) => params.value ? new Date(params.value) : null, 
      valueFormatter: (params) => params.value ? params.value.toLocaleDateString('ko-KR') : '' 
    },
    { field: 'itemName', headerName: '품목명', width: 180 },
    { field: 'lineName', headerName: '라인명', width: 150 },
    { field: 'productionQty', headerName: '생산수량', width: 120, type: 'number', align: 'right', headerAlign: 'right' },
    { field: 'defectQty', headerName: '불량수', width: 120, type: 'number', align: 'right', headerAlign: 'right' },
    { field: 'operatingTime', headerName: '가동시간(분)', width: 130, type: 'number', align: 'right', headerAlign: 'right' },
  ];

  const defaultGridProps = {
    initialState: {
      columns: {
        columnVisibilityModel: { id: false },
      },
      sorting: {
        sortModel: [{ field: 'date', sort: 'desc' }],
      },
    },
    ...props.gridProps
  };

  return null;
};

export const periodicProductionColumns = PeriodicProductionReport.columns;
export const periodicProductionGridProps = PeriodicProductionReport.defaultGridProps;

// export default PeriodicProductionReport; 