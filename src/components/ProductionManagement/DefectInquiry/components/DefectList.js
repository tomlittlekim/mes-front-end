import React, { useMemo } from 'react';
import { Typography, Chip, IconButton } from '@mui/material';
import { format } from 'date-fns';
import { EnhancedDataGridWrapper } from '../../../Common';
import PrintIcon from '@mui/icons-material/Print';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

/**
 * 불량 목록 컴포넌트
 *
 * @param {Object} props - 컴포넌트 속성
 * @param {Array} props.defectList - 불량 정보 목록 데이터
 * @param {Function} props.onRowClick - 행 클릭 핸들러
 * @param {Function} props.onPrint - 출력 버튼 클릭 핸들러
 * @param {Function} props.onExport - 엑셀 내보내기 버튼 클릭 핸들러
 * @param {Number} props.refreshKey - 새로고침 키
 * @param {String} props.tabId - 탭 ID
 * @returns {JSX.Element}
 */
const DefectList = ({
  defectList,
  onRowClick,
  onPrint,
  onExport,
  refreshKey,
  tabId
}) => {
  // 불량 목록 그리드 컬럼 정의
  const defectColumns = useMemo(() => ([
    {
      field: 'defectId',
      headerName: '불량ID',
      width: 120,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'workOrderId',
      headerName: '작업지시ID',
      width: 130,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'prodResultId',
      headerName: '생산실적ID',
      width: 130,
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
    {
      field: 'resultInfo',
      headerName: '불량유형',
      width: 120,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        const defectType = params.value || '기타';
        let color = 'default';

        if (defectType.includes('외관')) color = 'warning';
        else if (defectType.includes('기능')) color = 'error';
        else if (defectType.includes('치수')) color = 'primary';
        else if (defectType.includes('재질')) color = 'secondary';

        return (
            <Chip
                label={defectType}
                size="small"
                color={color}
                variant="outlined"
            />
        );
      }
    },
    {
      field: 'defectQty',
      headerName: '불량수량',
      width: 100,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        return (
            <Typography variant="body2" className={params.value > 5 ? "defect-highlight" : ""}>
              {params.value ? params.value.toLocaleString() : '0'}
            </Typography>
        );
      }
    },
    {
      field: 'defectCause',
      headerName: '불량원인',
      width: 150,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'state',
      headerName: '상태',
      width: 100,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        const statusMap = {
          'NEW': { label: '신규', className: 'status-wait' },
          'PROCESSING': { label: '처리중', className: 'status-inprogress' },
          'COMPLETED': { label: '완료됨', className: 'status-completed' }
        };

        const status = statusMap[params.value] || { label: params.value, className: '' };

        return (
            <Typography variant="body2" className={status.className}>
              {status.label}
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
        if (!params.value) return <Typography variant="body2"></Typography>;

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
    }
  ]), []);

  // 불량 목록 그리드 버튼
  const defectGridButtons = useMemo(() => ([
    { label: '출력', onClick: onPrint, icon: <PrintIcon /> },
    { label: '엑셀', onClick: onExport, icon: <FileDownloadIcon /> }
  ]), [onPrint, onExport]);

  return (
      <EnhancedDataGridWrapper
          title="불량정보 목록"
          key={refreshKey}
          rows={defectList}
          columns={defectColumns}
          buttons={defectGridButtons}
          height={450}
          onRowClick={onRowClick}
          tabId={tabId + "-defect-info"}
      />
  );
};

export default DefectList;