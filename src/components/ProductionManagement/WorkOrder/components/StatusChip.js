import React from 'react';
import { Chip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CancelIcon from '@mui/icons-material/Cancel';

/**
 * 작업지시 상태를 시각적으로 표시하는 칩 컴포넌트
 *
 * @param {Object} props - 컴포넌트 속성
 * @param {string} props.status - 상태 코드 ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELED')
 * @returns {JSX.Element}
 */
const StatusChip = ({ status }) => {
  // 상태별 설정
  const statusConfig = {
    PLANNED: {
      label: '계획됨',
      color: 'primary',
      icon: <ScheduleIcon fontSize="small" />,
      variant: 'outlined'
    },
    IN_PROGRESS: {
      label: '진행중',
      color: 'warning',
      icon: <PlayCircleFilledIcon fontSize="small" />,
      variant: 'default'
    },
    COMPLETED: {
      label: '완료됨',
      color: 'success',
      icon: <CheckCircleIcon fontSize="small" />,
      variant: 'default'
    },
    CANCELED: {
      label: '취소됨',
      color: 'error',
      icon: <CancelIcon fontSize="small" />,
      variant: 'outlined'
    }
  };

  // 기본값 설정
  const defaultConfig = {
    label: status || '미정의',
    color: 'default',
    icon: null,
    variant: 'outlined'
  };

  // 상태코드에 맞는 설정 또는 기본값 사용
  const config = statusConfig[status] || defaultConfig;

  return (
      <Chip
          label={config.label}
          color={config.color}
          icon={config.icon}
          size="small"
          variant={config.variant}
          sx={{ minWidth: '80px', justifyContent: 'center' }}
      />
  );
};

export default StatusChip;