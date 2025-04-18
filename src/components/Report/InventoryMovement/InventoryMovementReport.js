import React from 'react';

/**
 * 입출고 현황 리포트 정의 (EnhancedDataGridWrapper용)
 */
const InventoryMovementReport = (props) => {
  const columns = [
    { field: 'id', headerName: 'ID', width: 70, hide: true },
    { field: 'materialName', headerName: '자재명', width: 250 },
    { field: 'openingStock', headerName: '기초재고', width: 120, type: 'number', align: 'right', headerAlign: 'right' },
    { field: 'inQty', headerName: '입고수량', width: 120, type: 'number', align: 'right', headerAlign: 'right' },
    { field: 'outQty', headerName: '출고수량', width: 120, type: 'number', align: 'right', headerAlign: 'right' },
    { field: 'currentStock', headerName: '현재고', width: 120, type: 'number', align: 'right', headerAlign: 'right' },
    // { field: 'unit', headerName: '단위', width: 100 },
  ];

  const defaultGridProps = {
    initialState: {
      columns: {
        columnVisibilityModel: { id: false },
      },
      sorting: {
        sortModel: [{ field: 'materialName', sort: 'asc' }],
      },
    },
    ...props.gridProps
  };

  return null;
};

export const inventoryMovementColumns = InventoryMovementReport.columns;
export const inventoryMovementGridProps = InventoryMovementReport.defaultGridProps;

// export default InventoryMovementReport; 