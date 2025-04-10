import React, { useMemo } from 'react';
import { Typography } from '@mui/material';
import { format } from 'date-fns';
import { EnhancedDataGridWrapper } from '../../../Common';
import PrintIcon from '@mui/icons-material/Print';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

/**
 * 생산실적 목록 그리드 컴포넌트
 *
 * @param {Object} props - 컴포넌트 속성
 * @param {Array} props.productionResultList - 생산실적 목록 데이터
 * @param {Object} props.selectedWorkOrder - 선택된 작업지시 객체
 * @param {Function} props.onPrint - 출력 버튼 클릭 핸들러
 * @param {Function} props.onExport - 엑셀 내보내기 버튼 클릭 핸들러
 * @param {string} props.tabId - 탭 ID
 * @param {Number} props.height - 그리드 높이
 * @returns {JSX.Element}
 */
const ProductionResultList = ({
  productionResultList,
  selectedWorkOrder,
  onPrint,
  onExport,
  tabId,
  height = 350
}) => {
  // 생산실적 그리드 컬럼 정의
  const productionResultColumns = useMemo(() => ([
    {
      field: 'prodResultId',
      headerName: '생산실적ID',
      width: 150,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
          <Typography variant="body2">
            {params.value || ''}
          </Typography>
      )
    },
    {
      field: 'goodQty',
      headerName: '양품수량',
      width: 120,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
          <Typography variant="body2">
            {params.value !== null && params.value !== undefined
                ? Number(params.value).toLocaleString()
                : '0'}
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
            {params.value !== null && params.value !== undefined
                ? Number(params.value).toLocaleString()
                : '0'}
          </Typography>
      )
    },
    {
      field: 'progressRate',
      headerName: '진척률',
      width: 100,
      headerAlign: 'center',
      align: 'center',
      description: '양품수량 기준 누적 진척률',
      renderCell: (params) => (
          <Typography variant="body2">
            {params.value !== null && params.value !== undefined
                ? `${params.value}%`
                : '0%'}
          </Typography>
      )
    },
    {
      field: 'defectRate',
      headerName: '불량률',
      width: 100,
      headerAlign: 'center',
      align: 'center',
      description: '현재 생산실적의 불량률',
      renderCell: (params) => (
          <Typography variant="body2" className={params.value > 0 ? "defect-highlight" : ""}>
            {params.value !== null && params.value !== undefined
                ? `${params.value}%`
                : '0%'}
          </Typography>
      )
    },
    {
      field: 'equipmentId',
      headerName: '설비ID',
      width: 150,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'createDate',
      headerName: '등록일시',
      width: 160,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        if (!params.value) {
          return <Typography variant="body2">-</Typography>;
        }

        try {
          const date = new Date(params.value);
          return (
              <Typography variant="body2">
                {!isNaN(date) ? format(date, 'yyyy-MM-dd HH:mm') : '-'}
              </Typography>
          );
        } catch (e) {
          return <Typography variant="body2">-</Typography>;
        }
      }
    },
    {
      field: 'createUser',
      headerName: '등록자',
      width: 120,
      headerAlign: 'center',
      align: 'center'
    }
  ]), []);

  // 생산실적 목록 그리드 버튼 (출력 및 엑셀 내보내기)
  const productionResultButtons = useMemo(() => ([
    { label: '출력', onClick: onPrint, icon: <PrintIcon /> },
    { label: '엑셀', onClick: onExport, icon: <FileDownloadIcon /> }
  ]), [onPrint, onExport]);

  return (
      <EnhancedDataGridWrapper
          title={`생산실적 목록 ${selectedWorkOrder ? '- ' + selectedWorkOrder.workOrderId : ''}`}
          rows={productionResultList}
          columns={productionResultColumns}
          buttons={productionResultButtons}
          height={height}
          tabId={tabId + "-production-results"}
          gridProps={{
            initialState: {
              sorting: {
                sortModel: [{ field: 'prodResultId', sort: 'desc' }]
              }
            }
          }}
      />
  );
};

export default ProductionResultList;