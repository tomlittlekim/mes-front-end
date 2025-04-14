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

    // 변경 후 자동으로 편집 모드 종료 - 수정된 부분
    setTimeout(() => {
      try {
        // 최신 버전의 DataGrid API 사용
        if (api.stopCellEditMode) {
          api.stopCellEditMode({ id, field });
        }
        // 이전 버전의 DataGrid API 사용을 시도
        else if (api.commitCellChange) {
          api.commitCellChange({ id, field });
          api.setCellMode(id, field, 'view');
        }
        // 둘 다 없는 경우에는 setCellMode만 시도
        else {
          api.setCellMode(id, field, 'view');
        }
      } catch (error) {
        console.error('셀 편집 모드 종료 중 오류:', error);
        // 오류 발생 시 적어도 셀 모드를 view로 전환 시도
        try {
          api.setCellMode(id, field, 'view');
        } catch {}
      }
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