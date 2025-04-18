import React from 'react';
import { Grid, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Controller } from 'react-hook-form';
// DatePicker -> DateRangePicker 관련 import 추가
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ko from "date-fns/locale/ko"; 
import DateRangePicker from '../../Common/DateRangePicker'; // 사용자 정의 DateRangePicker 컴포넌트 경로

/**
 * 입출고 현황 검색 폼
 *
 * @param {object} props - { control, handleDateRangeChange }
 * @returns {JSX.Element}
 */
const SearchForm = ({ control, handleDateRangeChange }) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
      <Grid container spacing={2} alignItems="center">
        {/* 날짜 범위 필드 */} 
        <Grid item xs={12} sm={12} md={12}> {/* 전체 너비 사용 */} 
          <Controller
            name="movementDateRange"
            control={control}
            defaultValue={[null, null]} // 기본값 배열로 설정
            render={({ field }) => (
              <DateRangePicker
                  startDate={field.value?.[0]}
                  endDate={field.value?.[1]}
                  onRangeChange={(startDate, endDate) => {
                      field.onChange([startDate, endDate]); 
                      if (handleDateRangeChange) {
                        handleDateRangeChange([startDate, endDate]);
                      }
                  }}
                  startLabel="시작일"
                  endLabel="종료일"
                  label="입출고일자"
                  size="small"
              />
            )}
          />
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
};

export default SearchForm; 