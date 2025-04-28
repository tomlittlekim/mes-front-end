import React from 'react';
import { Grid } from '@mui/material';
import { EnhancedDataGridWrapper } from '../../../Common';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import getBomColumns from "./BomColumns";
import BomModal from './Modal';
import {getBomModalFields} from './Modal/BomModal';

/**
 * BOM 목록 그리드 컴포넌트
 * 
 * @param {Object} props - 컴포넌트 속성
 * @returns {JSX.Element}
 */
const BomList = ({
  bomList,
  handleBomSelect,
  handleOpenRegisterModal,
  handleOpenEditModal,
  handleBomDelete
}) => {
  // 그리드 버튼 정의
  const bomGridButtons = [
    { label: '등록', onClick: handleOpenRegisterModal, icon: <AddIcon /> },
    { label: '수정', onClick: handleOpenEditModal, icon: <EditIcon /> },
    { label: '삭제', onClick: handleBomDelete, icon: <DeleteIcon /> }
  ];

  // 컬럼 정의 가져오기
  const bomColumns = getBomColumns();

  return (
    <Grid item xs={12} md={6}>
      <EnhancedDataGridWrapper
        title="BOM 목록"
        rows={bomList}
        columns={bomColumns}
        buttons={bomGridButtons}
        height={590}
        onRowClick={handleBomSelect}
        gridProps={{
          checkboxSelection: false,
          disableRowSelectionOnClick: false,
          columnVisibilityModel: {
            bomId: false,
            systemMaterialId: false,
          }
        }}
      />
    </Grid>
  );
};

export { BomModal, getBomModalFields };
export default BomList; 