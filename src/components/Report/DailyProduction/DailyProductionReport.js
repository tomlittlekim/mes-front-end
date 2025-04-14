import React from 'react';

/**
 * 생산 일보 리포트 정의 (EnhancedDataGridWrapper용)
 */
const DailyProductionReport = (props) => {
  const columns = [
    { field: 'id', headerName: 'ID', width: 70, hide: true },
    { field: 'timeSlot', headerName: '시간대', width: 150 }, // 예: "09:00 - 10:00"
    { field: 'itemName', headerName: '품목명', width: 180 },
    { field: 'productionQty', headerName: '생산량', width: 110, type: 'number', align: 'right', headerAlign: 'right' },
    { field: 'workerName', headerName: '작업자', width: 130 },
    { field: 'equipmentName', headerName: '설비명', width: 150 },
    { field: 'equipmentStatus', headerName: '설비상태', width: 120 }, // 예: "가동", "비가동", "점검중"
  ];

  const defaultGridProps = {
    initialState: {
      columns: {
        columnVisibilityModel: { id: false },
      },
      sorting: {
        sortModel: [{ field: 'timeSlot', sort: 'asc' }],
      },
    },
    ...props.gridProps
  };

  return null;
};

export const dailyProductionColumns = DailyProductionReport.columns;
export const dailyProductionGridProps = DailyProductionReport.defaultGridProps;

// export default DailyProductionReport; 