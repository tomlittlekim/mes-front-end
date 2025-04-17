// WorkOrderList.js 수정 - ProductMaterialSelector 활용
import React, { useMemo } from 'react';
import { Typography } from '@mui/material';
import { format } from 'date-fns';
import { EnhancedDataGridWrapper } from '../../../Common';
import ShiftTypeChip from './ShiftTypeChip';

/**
 * 작업지시 목록 컴포넌트
 *
 * @param {Object} props - 컴포넌트 속성
 * @param {Array} props.workOrderList - 작업지시 목록 데이터
 * @param {Function} props.onRowClick - 행 클릭 핸들러
 * @param {String} props.tabId - 탭 ID
 * @param {Array} props.productOptions - 제품 옵션 목록
 * @returns {JSX.Element}
 */
const WorkOrderList = ({ workOrderList, onRowClick, tabId, productOptions = [], height = 350 }) => {
  // 작업지시 목록 그리드 컬럼 정의
  const workOrderColumns = useMemo(() => ([
    {
      field: 'workOrderId',
      headerName: '작업지시ID',
      width: 150,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'prodPlanId',
      headerName: '생산계획ID',
      width: 150,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'productId',
      headerName: '제품ID',
      width: 180,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        // systemMaterialId를 기준으로 제품 찾기
        const product = productOptions.find(p =>
            p.systemMaterialId === params.value
        );

        // 제품을 찾았으면 userMaterialId와 materialName 표시
        if (product) {
          return (
              <Typography variant="body2">
                {product.userMaterialId || ''} {product.materialName ? `(${product.materialName})` : ''}
              </Typography>
          );
        }

        // 대체 검색: userMaterialId와 일치하는지 확인
        const productByUserId = productOptions.find(p =>
            p.userMaterialId === params.value
        );

        if (productByUserId) {
          return (
              <Typography variant="body2">
                {productByUserId.userMaterialId || ''} {productByUserId.materialName ? `(${productByUserId.materialName})` : ''}
              </Typography>
          );
        }

        // 제품을 찾지 못한 경우 원래 값 표시
        return (
            <Typography variant="body2">
              {params.value || '-'}
            </Typography>
        );
      }
    },
    {
      field: 'orderQty',
      headerName: '작업수량',
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
      field: 'shiftType',
      headerName: '근무타입',
      width: 120,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
          <ShiftTypeChip type={params.value || 'DAY'} />
      )
    },
    {
      field: 'state',
      headerName: '상태',
      width: 120,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        let label;
        let className;

        switch (params.value) {
          case 'PLANNED':
            label = '계획됨';
            className = 'status-planned';
            break;
          case 'IN_PROGRESS':
            label = '진행중';
            className = 'status-inprogress';
            break;
          case 'COMPLETED':
            label = '완료됨';
            className = 'status-completed';
            break;
          case 'CANCELED':
            label = '취소됨';
            className = 'status-canceled';
            break;
          default:
            label = params.value;
            className = '';
        }

        return (
            <Typography variant="body2" className={className}>
              {label}
            </Typography>
        );
      }
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
  ]), [productOptions]); // productOptions를 의존성 배열에 추가

  // 작업지시 목록 그리드 버튼
  const workOrderGridButtons = useMemo(() => ([]), []);

  return (
      <EnhancedDataGridWrapper
          title="작업지시 목록"
          rows={workOrderList}
          columns={workOrderColumns}
          buttons={workOrderGridButtons}
          height={height}  // 외부에서 전달받은 높이 사용
          onRowClick={onRowClick}
          tabId={tabId + "-work-orders"}
      />
  );
};

export default WorkOrderList;