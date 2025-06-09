import React from 'react';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

/**
 * DataGrid 날짜시간 필드용 커스텀 에디터 컴포넌트
 *
 * @param {Object} props - 컴포넌트 속성 (DataGrid에서 전달되는 props)
 * @returns {JSX.Element}
 */
const CustomDateTimeEditor = (props) => {
  const { id, field, value, api } = props;

  const handleChange = (newValue) => {
    // DataGrid API를 사용하여 셀 값을 업데이트
    api.setEditCellValue({ id, field, value: newValue });

    // 변경 후 자동으로 편집 모드 종료
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
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DateTimePicker
            value={value ? new Date(value) : null}
            onChange={handleChange}
            format="yyyy-MM-dd HH:mm"
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

export default CustomDateTimeEditor; 