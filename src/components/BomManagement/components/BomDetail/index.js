import React from 'react';
import { Grid } from '@mui/material';
import { EnhancedDataGridWrapper } from '../../../Common';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import { getBomDetailColumns } from './BomDetailColumns';
import MaterialSelectModal from '../materialSelectModal';
import BomDetailModal from './Modal';

/**
 * BOM 상세 목록 그리드 컴포넌트
 * 
 * @param {Object} props - 컴포넌트 속성
 * @returns {JSX.Element}
 */
const BomDetail = ({
  bomDetailList,
  selectedBom,
  handleDetailSelect,
  handleDetailProcessUpdate,
  handleRowAdd,
  handleDetailSave,
  handleDetailDelete,
  setBomDetailList,
  handleOpenMaterialSelectModal,
  apiRef,
  //드롭다운 옵션
  materialCategoryOptions,
}) => {
  // 그리드 버튼 정의
  const bomDetailGridButtons = [
    { label: '행추가', onClick: () => handleRowAdd(setBomDetailList), icon: <AddIcon />, disabled: !selectedBom },
    { label: '저장', onClick: handleDetailSave, icon: <SaveIcon /> },
    { label: '삭제', onClick: handleDetailDelete, icon: <DeleteIcon /> }
  ];

    // 드롭다운 옵션이 포함된 컬럼 생성
  // 컬럼 정의 가져오기
    const bomDetailColumns = getBomDetailColumns({
        handleOpenMaterialSelectModal,
        materialCategoryOptions
    });

  return (
    <Grid item xs={12} md={6}>
      <EnhancedDataGridWrapper
        key={selectedBom?.bomId || 'empty'}
        title={`상세정보 ${selectedBom ? '- ' + selectedBom.materialName : ''}`}
        rows={bomDetailList}
        columns={bomDetailColumns}
        buttons={bomDetailGridButtons}
        height={590}
        gridProps={{
          editMode: 'cell',
          checkboxSelection: true,
          onSelectionModelChange: handleDetailSelect,
          onProcessUpdate: handleDetailProcessUpdate,
          columnVisibilityModel: {
            bomId: false,
            bomDetailId: false,
            parentItemCd: false,
            parentMaterialName: false,
            userParentItemCd: false,
            parentMaterialType: false
          },
          apiRef: apiRef,
        }}
      />
    </Grid>
  );
};

export { MaterialSelectModal, BomDetailModal };
export default BomDetail; 