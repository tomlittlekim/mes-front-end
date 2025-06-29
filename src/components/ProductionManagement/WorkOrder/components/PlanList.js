import React, { useMemo } from 'react';
import { Typography } from '@mui/material';
import { format } from 'date-fns';
import { EnhancedDataGridWrapper } from '../../../Common';

/**
 * 생산계획 목록 그리드 컴포넌트
 *
 * @param {Object} props - 컴포넌트 속성
 * @param {Array} props.planList - 생산계획 목록 데이터
 * @param {number} props.refreshKey - 새로고침 키
 * @param {Function} props.onRowClick - 행 클릭 핸들러
 * @param {string} props.tabId - 탭 ID
 * @param {Array} props.productMaterials - 제품 정보 목록
 * @returns {JSX.Element}
 */
const PlanList = ({ planList, refreshKey, onRowClick, tabId, productMaterials = [] }) => {
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
      field: 'productId',
      headerName: '제품ID',
      width: 150,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        // productId(systemMaterialId)에 해당하는 userMaterialId 찾기
        const material = productMaterials.find(m => m.systemMaterialId === params.value);
        const displayValue = material ? material.userMaterialId : params.value;

        return (
            <Typography variant="body2">
              {displayValue || ''}
            </Typography>
        );
      }
    },
    {
      field: 'productName',
      headerName: '제품명',
      width: 180,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        // productId를 이용해 제품명 찾기
        const material = productMaterials.find(m => m.systemMaterialId === params.row.productId);
        const displayValue = material ? material.materialName : '';

        return (
            <Typography variant="body2">
              {displayValue}
            </Typography>
        );
      }
    },
    {
      field: 'materialCategory',
      headerName: '제품유형',
      width: 120,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        // productId를 이용해 제품유형 찾기
        const material = productMaterials.find(m => m.systemMaterialId === params.row.productId);
        const displayValue = material ? material.materialCategory : '';

        return (
            <Typography variant="body2">
              {displayValue}
            </Typography>
        );
      }
    },
    {
      field: 'planQty',
      headerName: '계획수량',
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
      field: 'planStartDate',
      headerName: '계획시작일시',
      width: 180,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        let displayValue = '';
        if (params.value) {
          try {
            const date = new Date(params.value);
            displayValue = !isNaN(date) ? format(date, 'yyyy-MM-dd HH:mm') : '';
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
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        let displayValue = '';
        if (params.value) {
          try {
            const date = new Date(params.value);
            displayValue = !isNaN(date) ? format(date, 'yyyy-MM-dd HH:mm') : '';
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
      width: 100,
      headerAlign: 'center',
      align: 'center'
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
  ]), [productMaterials]);

  // 빈 버튼 배열 - 생산계획 그리드는 버튼이 없음
  const planGridButtons = useMemo(() => ([]), []);

  // 초기 정렬 상태 설정 - 생산계획ID 역순
  const planInitialState = useMemo(() => ({
    sorting: {
      sortModel: [{ field: 'prodPlanId', sort: 'desc' }]
    }
  }), []);

  return (
      <EnhancedDataGridWrapper
          title="생산계획 목록"
          key={refreshKey}
          rows={planList}
          columns={planColumns}
          buttons={planGridButtons}
          height={450}
          onRowClick={onRowClick}
          tabId={tabId + "-production-plans"}
          gridProps={{
            initialState: planInitialState
          }}
      />
  );
};

export default PlanList;