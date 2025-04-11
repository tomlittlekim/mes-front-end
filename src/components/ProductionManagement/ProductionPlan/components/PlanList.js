import React, { useMemo } from 'react';
import { Typography } from '@mui/material';
import { format } from 'date-fns';
import { EnhancedDataGridWrapper } from '../../../Common';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import ShiftTypeChip from './ShiftTypeChip';
import ProductMaterialSelector from '../editors/ProductMaterialSelector';

/**
 * 생산계획 목록 컴포넌트
 *
 * @param {Object} props - 컴포넌트 속성
 * @param {Array} props.planList - 생산계획 목록 데이터
 * @param {Function} props.onRowClick - 행 클릭 핸들러
 * @param {Function} props.onAdd - 등록 버튼 클릭 핸들러
 * @param {Function} props.onSave - 저장 버튼 클릭 핸들러
 * @param {Function} props.onDelete - 삭제 버튼 클릭 핸들러
 * @param {Number} props.refreshKey - 새로고침 키
 * @param {String} props.tabId - 탭 ID
 * @param {Object} props.gridProps - 그리드 추가 속성
 * @param {Array} props.productMaterials - 제품 정보 목록
 * @returns {JSX.Element}
 */
const PlanList = ({
  planList,
  onRowClick,
  onAdd,
  onSave,
  onDelete,
  refreshKey,
  tabId,
  gridProps,
  productMaterials
}) => {
  // 생산계획 목록 그리드 컬럼 정의
  const planColumns = useMemo(() => ([
    {
      field: 'prodPlanId',
      headerName: '생산계획ID',
      width: 150,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'orderId',
      headerName: '주문번호',
      width: 150,
      editable: true,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'productId',
      headerName: '제품ID*',
      width: 150,
      editable: true,
      headerAlign: 'center',
      align: 'center',
      renderEditCell: (params) => (
          <ProductMaterialSelector {...params} productMaterials={productMaterials} />
      ),
      renderCell: (params) => {
        // 새로 추가된 행인지 확인 (id가 NEW_로 시작하는지)
        const isNewRow = params.row.id?.toString().startsWith('NEW_');

        // 새로 추가된 행이고 값이 없는 경우에만 '필수 입력' 표시
        const showRequired = isNewRow && (!params.value || params.value === '');

        if (showRequired) {
          return (
              <Typography variant="body2" sx={{ color: '#f44336' }}>
                필수 입력
              </Typography>
          );
        }

        // productId 값이 있으면 해당 제품의 userMaterialId 찾아서 표시
        if (params.value) {
          const product = productMaterials.find(p => p.systemMaterialId === params.value);
          if (product) {
            return (
                <Typography variant="body2">
                  {product.userMaterialId || params.value}
                </Typography>
            );
          }
        }

        // 기본값 표시 (productId 값 자체)
        return (
            <Typography variant="body2">
              {params.value || ''}
            </Typography>
        );
      }
    },
    {
      field: 'productName',
      headerName: '제품명',
      width: 180,
      editable: true,
      headerAlign: 'center',
      align: 'left',
      renderEditCell: (params) => (
          <ProductMaterialSelector {...params} productMaterials={productMaterials} />
      ),
      renderCell: (params) => {
        // params.value가 있으면 그대로 표시
        if (params.value) {
          return <Typography variant="body2">{params.value}</Typography>;
        }

        // params.value가 없지만 productId가 있는 경우, productId로 제품명 조회
        if (params.row.productId) {
          const product = productMaterials.find(p => p.systemMaterialId === params.row.productId);
          if (product && product.materialName) {
            // 이 경우 실제 params.value는 업데이트되지 않지만, 화면에는 제품명 표시
            return <Typography variant="body2">{product.materialName}</Typography>;
          }
        }

        // 둘 다 없는 경우 빈 문자열 표시
        return <Typography variant="body2"></Typography>;
      }
    },
    {
      field: 'shiftType',
      headerName: '주/야간',
      width: 120,
      editable: true,
      headerAlign: 'center',
      align: 'center',
      type: 'singleSelect',
      valueOptions: [
        { value: 'DAY', label: '주간' },
        { value: 'NIGHT', label: '야간' },
      ],
      renderCell: (params) => {
        return <ShiftTypeChip type={params.value || 'DAY'} />;
      }
    },
    {
      field: 'planQty',
      headerName: '계획수량',
      width: 120,
      editable: true,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
          <Typography variant="body2">
            {params.value ? Number(params.value).toLocaleString() : '0'}
          </Typography>
      )
    },
    {
      field: 'planStartDate',
      headerName: '계획시작일시',
      width: 180,
      editable: true,
      type: 'date',
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        let displayValue = '';
        if (params.value) {
          try {
            const date = new Date(params.value);
            displayValue = !isNaN(date) ? format(date, 'yyyy-MM-dd') : '';
          } catch (e) {
            displayValue = '';
          }
        }

        return (
            <Typography variant="body2">
              {displayValue}
            </Typography>
        );
      }
    },
    {
      field: 'planEndDate',
      headerName: '계획종료일시',
      width: 180,
      editable: true,
      type: 'date',
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        let displayValue = '';
        if (params.value) {
          try {
            const date = new Date(params.value);
            displayValue = !isNaN(date) ? format(date, 'yyyy-MM-dd') : '';
          } catch (e) {
            displayValue = '';
          }
        }

        return (
            <Typography variant="body2">
              {displayValue}
            </Typography>
        );
      }
    },
    {
      field: 'createUser',
      headerName: '등록자',
      width: 150,
      editable: false,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'createDate',
      headerName: '등록일',
      width: 120,
      editable: false,
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
    },
    {
      field: 'updateUser',
      headerName: '수정자',
      width: 150,
      editable: false,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'updateDate',
      headerName: '수정일',
      width: 120,
      editable: false,
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
  ]), [productMaterials]);

  // 생산계획 목록 그리드 버튼
  const planGridButtons = useMemo(() => ([
    { label: '등록', onClick: onAdd, icon: <AddIcon /> },
    { label: '저장', onClick: onSave, icon: <SaveIcon /> },
    { label: '삭제', onClick: onDelete, icon: <DeleteIcon /> }
  ]), [onAdd, onSave, onDelete]);

  return (
      <EnhancedDataGridWrapper
          title="생산계획목록"
          key={refreshKey}
          rows={planList}
          columns={planColumns}
          buttons={planGridButtons}
          height={450}
          onRowClick={onRowClick}
          tabId={tabId + "-production-plans"}
          gridProps={gridProps}
      />
  );
};

export default PlanList;