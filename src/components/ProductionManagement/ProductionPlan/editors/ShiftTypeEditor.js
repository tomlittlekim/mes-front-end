import React from 'react';
import { Select, MenuItem } from '@mui/material';

/**
 * DataGrid 주/야간 필드용 커스텀 에디터 컴포넌트
 *
 * @param {Object} props - 컴포넌트 속성 (DataGrid에서 전달되는 props)
 * @returns {JSX.Element}
 */
const ShiftTypeEditor = (props) => {
  const { id, field, value, api } = props;

  const handleChange = (event) => {
    const newValue = event.target.value;
    api.setEditCellValue({ id, field, value: newValue });

    // 변경 후 자동으로 편집 모드 종료
    setTimeout(() => {
      api.commitCellChange({ id, field });
      api.setCellMode(id, field, 'view');
    }, 200);
  };

  return (
      <Select
          value={value || 'DAY'}
          onChange={handleChange}
          fullWidth
          size="small"
          sx={{ m: 0, p: 0 }}
      >
        <MenuItem value="DAY">주간</MenuItem>
        <MenuItem value="NIGHT">야간</MenuItem>
      </Select>
  );
};

export default ShiftTypeEditor;