import React from 'react';
import { FormControl, Select, MenuItem } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CancelIcon from '@mui/icons-material/Cancel';

/**
 * 작업지시 상태 필드용 커스텀 에디터 컴포넌트
 *
 * @param {Object} props - 컴포넌트 속성 (DataGrid에서 전달)
 * @returns {JSX.Element}
 */
const StateEditor = (props) => {
  const { id, field, value, api } = props;

  // 상태 옵션
  const stateOptions = [
    { value: 'PLANNED', label: '계획됨', icon: <ScheduleIcon fontSize="small" /> },
    { value: 'IN_PROGRESS', label: '진행중', icon: <PlayCircleFilledIcon fontSize="small" /> },
    { value: 'COMPLETED', label: '완료됨', icon: <CheckCircleIcon fontSize="small" /> },
    { value: 'CANCELED', label: '취소됨', icon: <CancelIcon fontSize="small" /> }
  ];

  const handleChange = (event) => {
    const newValue = event.target.value;

    // DataGrid API를 사용하여 셀 값을 업데이트
    api.setEditCellValue({ id, field, value: newValue });

    // 변경 후 자동으로 편집 모드 종료
    setTimeout(() => {
      api.commitCellChange({ id, field });
      api.setCellMode(id, field, 'view');
    }, 100);
  };

  return (
      <FormControl fullWidth size="small">
        <Select
            value={value || 'PLANNED'}
            onChange={handleChange}
            sx={{ m: 0, p: 0 }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                api.setCellMode(id, field, 'view');
              }
            }}
        >
          {stateOptions.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.icon} {option.label}
              </MenuItem>
          ))}
        </Select>
      </FormControl>
  );
};

export default StateEditor;