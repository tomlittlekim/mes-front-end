import React from 'react';
import { Grid, TextField } from '@mui/material';
// import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker'; // Pro 버전 필요
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'; // Adapter 설치 필요
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Controller } from 'react-hook-form';

/**
 * 계획 대비 실적 조회 검색 폼
 *
 * @param {object} props - { control, handleDateRangeChange }
 * @returns {JSX.Element}
 */
const SearchForm = ({ control, handleDateRangeChange }) => {
  return (
    // <LocalizationProvider dateAdapter={AdapterDateFns}> {/* Date Picker 사용시 */} 
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={6} md={4}>
          {/* 계획일자 범위 (실제 구현에서는 DateRangePicker 또는 개별 DatePicker 사용) */} 
          <Controller
            name="planDateRange"
            control={control}
            render={({ field }) => (
              // <DateRangePicker
              //   localeText={{ start: '시작일', end: '종료일' }}
              //   value={field.value}
              //   onChange={(newValue) => {
              //     field.onChange(newValue);
              //     if (handleDateRangeChange) handleDateRangeChange(newValue);
              //   }}
              //   renderInput={(startProps, endProps) => (
              //     <React.Fragment>
              //       <TextField {...startProps} fullWidth helperText=""/>
              //       <Box sx={{ mx: 2 }}> to </Box>
              //       <TextField {...endProps} fullWidth helperText=""/>
              //     </React.Fragment>
              //   )}
              // />
              <TextField 
                {...field} 
                label="계획일자 범위 (시작일)" // 임시 텍스트 필드
                type="date" 
                fullWidth 
                InputLabelProps={{ shrink: true }}
                // value={field.value[0]} // 실제 DatePicker 사용 시 배열 처리 필요
                onChange={(e) => { // 임시 로직
                  const startDate = e.target.value;
                  const endDate = field.value ? field.value[1] : null;
                  field.onChange([startDate, endDate]);
                  if (handleDateRangeChange) handleDateRangeChange([startDate, endDate]);
                }} 
              />
            )}
          />
        </Grid>
         <Grid item xs={12} sm={6} md={4}>
          <Controller
            name="planEndDate"
            control={control}
            render={({ field }) => (
              <TextField 
                {...field} 
                label="계획일자 범위 (종료일)" // 임시 텍스트 필드
                type="date" 
                fullWidth 
                InputLabelProps={{ shrink: true }}
                // value={field.value[1]} // 실제 DatePicker 사용 시 배열 처리 필요
                 onChange={(e) => { // 임시 로직
                  const endDate = e.target.value;
                  const startDate = field.value ? field.value[0] : null;
                  field.onChange([startDate, endDate]);
                  if (handleDateRangeChange) handleDateRangeChange([startDate, endDate]);
                }} 
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          {/* 품목 선택 (Autocomplete 또는 Select 필요) */} 
          <Controller
            name="item"
            control={control}
            defaultValue="" // 기본값 설정
            render={({ field }) => (
              <TextField
                {...field}
                label="품목"
                fullWidth
                placeholder="품목 코드 또는 이름"
                InputLabelProps={{ shrink: true }}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          {/* 설비 선택 (Autocomplete 또는 Select 필요) */} 
          <Controller
            name="equipment"
            control={control}
            defaultValue="" // 기본값 설정
            render={({ field }) => (
              <TextField
                {...field}
                label="설비"
                fullWidth
                placeholder="설비 코드 또는 이름"
                InputLabelProps={{ shrink: true }}
              />
            )}
          />
        </Grid>
      </Grid>
    // </LocalizationProvider>
  );
};

export default SearchForm; 