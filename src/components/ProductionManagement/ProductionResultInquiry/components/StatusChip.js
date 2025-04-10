import React from 'react';
import { Chip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingIcon from '@mui/icons-material/Pending';

/**
 * 생산실적 상태 표시용 Chip 컴포넌트
 *
 * @param {Object} props
 * @param {string} props.status - 상태값 ('PLANNED', 'INPROGRESS', 'COMPLETED', 'CANCELED', 기타)
 * @returns {JSX.Element}
 */
const StatusChip = ({ status }) => {
  // 상태별 설정
  const getStatusConfig = () => {
    switch (status) {
      case 'PLANNED':
        return {
          label: '계획',
          color: 'primary',
          icon: <ScheduleIcon fontSize="small" />,
          className: 'status-planned'
        };
      case 'INPROGRESS':
        return {
          label: '진행중',
          color: 'warning',
          icon: <PlayCircleFilledIcon fontSize="small" />,
          className: 'status-inprogress'
        };
      case 'COMPLETED':
        return {
          label: '완료',
          color: 'success',
          icon: <CheckCircleIcon fontSize="small" />,
          className: 'status-completed'
        };
      case 'CANCELED':
        return {
          label: '취소',
          color: 'error',
          icon: <CancelIcon fontSize="small" />,
          className: 'status-canceled'
        };
      case 'WAIT':
        return {
          label: '대기중',
          color: 'info',
          icon: <PendingIcon fontSize="small" />,
          className: 'status-wait'
        };
      default:
        return {
          label: status || '미정의',
          color: 'default',
          icon: <PendingIcon fontSize="small" />,
          className: ''
        };
    }
  };

  const config = getStatusConfig();

  return (
      <Chip
          label={config.label}
          color={config.color}
          icon={config.icon}
          size="small"
          variant="filled"
          className={config.className}
          sx={{
            fontWeight: 500,
            fontSize: '0.75rem',
            height: '24px',
            '& .MuiChip-icon': {
              fontSize: '1rem'
            }
          }}
      />
  );
};

export default StatusChip;