import React from 'react';
import { FormControl, Select, MenuItem } from '@mui/material';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import NightsStayIcon from '@mui/icons-material/NightsStay';

/**
 * 근무타입(주간/야간) 필드용 커스텀 에디터 컴포넌트
 *
 * @param {Object} props - 컴포넌트 속성 (DataGrid에서 전달)
 * @returns {JSX.Element}
 */
const ShiftTypeEditor = (props) => {
  const { id, field, value, api } = props;

  // 근무타입 옵션
  const shiftOptions = [
    { value: 'DAY', label: '주간', icon: <WbSunnyIcon fontSize="small" /> },
    { value: 'NIGHT', label: '야간', icon: <NightsStayIcon fontSize="small" /> }
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
            value={value || 'DAY'}
            onChange={handleChange}
            sx={{ m: 0, p: 0 }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                api.setCellMode(id, field, 'view');
              }
            }}
        >
          {shiftOptions.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.icon} {option.label}
              </MenuItem>
          ))}
        </Select>
      </FormControl>
  );
};

export default ShiftTypeEditor;