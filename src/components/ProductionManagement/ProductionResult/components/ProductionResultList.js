import React, { useMemo } from 'react';
import { Typography } from '@mui/material';
import { format } from 'date-fns';
import { EnhancedDataGridWrapper } from '../../../Common';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';

/**
 * 생산실적 목록 컴포넌트
 *
 * @param {Object} props - 컴포넌트 속성
 * @param {Array} props.productionResultList - 생산실적 목록 데이터
 * @param {Object} props.selectedWorkOrder - 선택된 작업지시 객체
 * @param {Function} props.onRowClick - 행 클릭 핸들러
 * @param {Function} props.onCreateResult - 생산실적 생성 핸들러
 * @param {Function} props.onSave - 저장 핸들러
 * @param {Function} props.onDelete - 삭제 핸들러
 * @param {Array} props.equipmentOptions - 설비 옵션 목록
 * @param {String} props.tabId - 탭 ID
 * @returns {JSX.Element}
 */
const ProductionResultList = ({
  productionResultList,
  selectedWorkOrder,
  onRowClick,
  onCreateResult,
  onSave,
  onDelete,
  equipmentOptions,
  tabId
}) => {
  // 생산실적 그리드 컬럼 정의
  const productionResultColumns = useMemo(() => ([
    {
      field: 'prodResultId',
      headerName: '생산실적ID',
      width: 150,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'workOrderId',
      headerName: '작업지시ID',
      width: 150,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'goodQty',
      headerName: '양품수량',
      width: 120,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
          <Typography variant="body2">
            {params.value ? Number(params.value).toLocaleString() : '0'}
          </Typography>
      )
    },
    {
      field: 'defectQty',
      headerName: '불량수량',
      width: 120,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
          <Typography variant="body2" className={params.value > 0 ? "defect-highlight" : ""}>
            {params.value ? Number(params.value).toLocaleString() : '0'}
          </Typography>
      )
    },
    {
      field: 'equipmentId',
      headerName: '설비',
      width: 150,
      headerAlign: 'center',
      align: 'center',
      valueFormatter: (params) => {
        // 설비ID를 설비명으로 변환
        const equipment = equipmentOptions.find(e => e.value === params.value);
        return equipment ? equipment.label : params.value;
      }
    },
    {
      field: 'progressRate',
      headerName: '진척률',
      width: 120,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
          <Typography variant="body2">
            {params.value ? `${params.value}%` : '0%'}
          </Typography>
      )
    },
    {
      field: 'defectRate',
      headerName: '불량률',
      width: 120,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
          <Typography variant="body2" className={Number(params.value) > 5 ? "defect-rate-warning" : ""}>
            {params.value ? `${params.value}%` : '0%'}
          </Typography>
      )
    },
    {
      field: 'createDate',
      headerName: '등록일',
      width: 120,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        if (!params.value) {
          return <Typography variant="body2"></Typography>;
        }

        try {
          const date = new Date(params.value);
          const displayValue = !isNaN(date) ? format(date, 'yyyy-MM-dd') : '';
          return <Typography variant="body2">{displayValue}</Typography>;
        } catch (e) {
          return <Typography variant="body2"></Typography>;
        }
      }
    }
  ]), [equipmentOptions]);

  // 생산실적 목록 그리드 버튼
  const productionResultButtons = useMemo(() => ([
    { label: '신규등록', onClick: onCreateResult, icon: <AddIcon /> },
    { label: '저장', onClick: onSave, icon: <SaveIcon /> },
    { label: '삭제', onClick: onDelete, icon: <DeleteIcon /> }
  ]), [onCreateResult, onSave, onDelete]);

  return (
      <EnhancedDataGridWrapper
          title={`생산실적 목록 ${selectedWorkOrder ? '- ' + selectedWorkOrder.workOrderId : ''}`}
          rows={productionResultList}
          columns={productionResultColumns}
          buttons={productionResultButtons}
          height={350}
          onRowClick={onRowClick}
          tabId={tabId + "-production-results"}
      />
  );
};

export default ProductionResultList;