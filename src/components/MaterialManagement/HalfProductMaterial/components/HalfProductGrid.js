import React from 'react';
import { Grid } from '@mui/material';
import { EnhancedDataGridWrapper } from '../../../Common';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';

// 그리드 컬럼 정의
export const COLUMNS = [
  {field: 'systemMaterialId', headerName: '시스템자재ID', width: 120},
  {field: 'materialCategory', headerName: '자재유형', width: 100, type: 'singleSelect',
    valueOptions: [
      { value: '잉크', label: '잉크' },
      { value: '포장재', label: '포장재' },
    ], editable: true},
  {field: 'userMaterialId', headerName: '반제품ID', width: 120, editable: true },
  {field: 'materialName', headerName: '자재명', width: 180, flex: 1, editable: true },
  {field: 'materialStandard', headerName: '규격', width: 120, editable: true },
  {field: 'unit', headerName: '단위', width: 70, type: 'singleSelect',
    valueOptions: [
      { value: 'EA', label: '개' },
      { value: 'roll', label: '롤' },
      { value: 'bottle', label: '병' },
      { value: 'pack', label: '팩' },
      { value: 'can', label: '캔' },
      { value: 'sheet', label: '장' },
      { value: 'set', label: '세트' },
      { value: 'ream', label: '연' },
      { value: 'pair', label: '쌍' },
    ], editable: true },
  {field: 'baseQuantity', headerName: '기본수량', width: 80, type: 'number', editable: true },
  { field: 'createUser', headerName: '작성자', width: 100},
  { field: 'createDate', headerName: '작성일', width: 200},
  { field: 'updateUser', headerName: '수정자', width: 100},
  { field: 'updateDate', headerName: '수정일', width: 200},
];

const HalfProductGrid = ({
  materialList, 
  handleSelectionModelChange, 
  handleProcessRowUpdate, 
  handleRowAdd, 
  handleSave, 
  handleDelete,
  setMaterialList,
  generateId,
  tabId
}) => {
  
  // 그리드 버튼 정의
  const gridButtons = [
    {label: '행추가', onClick: () => handleRowAdd(setMaterialList), icon: <AddIcon/>},
    {label: '저장', onClick: handleSave, icon: <SaveIcon/>},
    {label: '삭제', onClick: handleDelete, icon: <DeleteIcon/>}
  ];
  
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <EnhancedDataGridWrapper
          title="반제품 정보"
          rows={materialList}
          columns={COLUMNS}
          buttons={gridButtons}
          height={450}
          tabId={tabId + "-materials"}
          onRowClick={handleSelectionModelChange}
          gridProps={{
            editMode: 'cell',
            checkboxSelection: true,
            getRowId: (row) => row.id || generateId('TEMP'),
            onProcessUpdate: handleProcessRowUpdate,
            onSelectionModelChange: handleSelectionModelChange,
            columnVisibilityModel: {
              systemMaterialId: false,
            },
          }}
        />
      </Grid>
    </Grid>
  );
};

export default HalfProductGrid; 