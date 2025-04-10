import React from 'react';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

/**
 * DataGrid 날짜 필드용 커스텀 에디터 컴포넌트
 *
 * @param {Object} props - 컴포넌트 속성 (DataGrid에서 전달)
 * @returns {JSX.Element}
 */
const CustomDateEditor = (props) => {
  const { id, field, value, api } = props;

  const handleChange = (newValue) => {
    // DataGrid API를 사용하여 셀 값을 업데이트
    api.setEditCellValue({ id, field, value: newValue });

    // 변경 후 자동으로 편집 모드 종료 (선택적)
    setTimeout(() => {
      api.commitCellChange({ id, field });
      api.setCellMode(id, field, 'view');
    }, 200);
  };

  return (
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
            value={value ? new Date(value) : null}
            onChange={handleChange}
            format="yyyy-MM-dd"
            slotProps={{
              textField: {
                fullWidth: true,
                variant: 'outlined',
                size: 'small',
                sx: { m: 0, p: 0 },
                // 키보드 상호작용 처리
                onKeyDown: (e) => {
                  if (e.key === 'Escape') {
                    api.setCellMode(id, field, 'view');
                  }
                }
              },
              // 포퍼(팝업) 스타일 조정
              popper: {
                sx: {
                  zIndex: 9999 // 다른 요소 위에 표시되도록
                }
              }
            }}
        />
      </LocalizationProvider>
  );
};

export default CustomDateEditor;