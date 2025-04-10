import React, { useMemo } from 'react';
import { Typography } from '@mui/material';
import { format } from 'date-fns';
import { EnhancedDataGridWrapper } from '../../../Common';
import PrintIcon from '@mui/icons-material/Print';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import StatusChip from './StatusChip';

/**
 * 생산실적 목록 그리드 컴포넌트
 *
 * @param {Object} props - 컴포넌트 속성
 * @param {Array} props.productionList - 생산실적 목록 데이터
 * @param {number} props.refreshKey - 새로고침 키
 * @param {Function} props.onRowClick - 행 클릭 핸들러
 * @param {Function} props.onPrint - 출력 버튼 클릭 핸들러
 * @param {Function} props.onExport - 엑셀 내보내기 버튼 클릭 핸들러
 * @param {string} props.tabId - 탭 ID
 * @param {Object} props.gridProps - 그리드 추가 속성
 * @returns {JSX.Element}
 */
const ProductionResultList = ({
  productionList,
  refreshKey,
  onRowClick,
  onPrint,
  onExport,
  tabId,
  gridProps
}) => {
  // 생산실적 목록 그리드 컬럼 정의
  const productionColumns = useMemo(() => ([
    // 기본 정보
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
      field: 'productId',
      headerName: '제품ID',
      width: 120,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'productName',
      headerName: '제품명',
      width: 150,
      headerAlign: 'center',
      align: 'center'
    },
    // 공장/라인/설비 정보
    {
      field: 'factoryName',
      headerName: '공장',
      width: 120,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'lineName',
      headerName: '라인',
      width: 120,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'equipmentName',
      headerName: '설비',
      width: 150,
      headerAlign: 'center',
      align: 'center'
    },
    // 생산 정보
    {
      field: 'productionDate',
      headerName: '생산일자',
      width: 110,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'startTime',
      headerName: '시작시간',
      width: 120,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'endTime',
      headerName: '종료시간',
      width: 120,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'productionTime',
      headerName: '생산시간',
      width: 100,
      headerAlign: 'center',
      align: 'center'
    },
    // 수량 정보
    {
      field: 'planQuantity',
      headerName: '계획수량',
      width: 100,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
          <Typography variant="body2">
            {params.value ? Number(params.value).toLocaleString() : '0'}
          </Typography>
      )
    },
    {
      field: 'goodQuantity',
      headerName: '양품수량',
      width: 100,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
          <Typography variant="body2">
            {params.value ? Number(params.value).toLocaleString() : '0'}
          </Typography>
      )
    },
    {
      field: 'defectQuantity',
      headerName: '불량수량',
      width: 100,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
          <Typography variant="body2" className={params.value > 0 ? "defect-highlight" : ""}>
            {params.value ? Number(params.value).toLocaleString() : '0'}
          </Typography>
      )
    },
    {
      field: 'yieldRate',
      headerName: '수율(%)',
      width: 100,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
          <Typography variant="body2">
            {params.value ? Number(params.value).toFixed(2) + '%' : '0%'}
          </Typography>
      )
    },
    // 작업자 정보
    {
      field: 'worker',
      headerName: '작업자',
      width: 120,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'supervisor',
      headerName: '관리자',
      width: 120,
      headerAlign: 'center',
      align: 'center'
    },
    // 상태
    {
      field: 'status',
      headerName: '상태',
      width: 100,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
          <StatusChip status={params.value} />
      )
    },
    // 이력 정보
    {
      field: 'createDate',
      headerName: '등록일',
      width: 110,
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
      field: 'createUser',
      headerName: '등록자',
      width: 100,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'updateDate',
      headerName: '수정일',
      width: 110,
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
      width: 100,
      headerAlign: 'center',
      align: 'center'
    }
  ]), []);

  // 생산실적 목록 그리드 버튼 (출력 및 엑셀 내보내기 버튼 추가)
  const productionGridButtons = useMemo(() => [
    { label: '출력', onClick: onPrint, icon: <PrintIcon /> },
    { label: '엑셀', onClick: onExport, icon: <FileDownloadIcon /> }
  ], [onPrint, onExport]);

  return (
      <EnhancedDataGridWrapper
          title="생산실적 목록"
          key={refreshKey}
          rows={productionList}
          columns={productionColumns}
          buttons={productionGridButtons}
          height={450} // 생산계획관리와 같은 그리드 높이 사용
          onRowClick={onRowClick}
          tabId={tabId + "-production-results"}
          gridProps={{
            initialState: gridProps?.initialState,
            ...gridProps
          }}
      />
  );
};

export default ProductionResultList;