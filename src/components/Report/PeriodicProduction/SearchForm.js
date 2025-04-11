import React from 'react';
import { Grid, TextField } from '@mui/material';
import { Controller } from 'react-hook-form';
// DatePicker 등 필요한 컴포넌트 추가 import 필요

/**
 * 기간별 생산 실적 검색 폼
 *
 * @param {object} props - { control, handleDateRangeChange }
 * @returns {JSX.Element}
 */
const SearchForm = ({ control, handleDateRangeChange }) => {
  return (
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={12} sm={6} md={4}>
        {/* 생산일자 범위 (DateRangePicker 또는 개별 DatePicker 필요) */}
        <Controller
          name="productionDateRange"
          control={control}
          render={({ field }) => (
            // 실제 구현에서는 DateRangePicker 사용
            <TextField 
              {...field} 
              label="생산일자 범위 (시작일)" // 임시
              type="date" 
              fullWidth 
              InputLabelProps={{ shrink: true }}
              // 임시 onChange 핸들러
              onChange={(e) => {
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
          name="productionEndDate"
          control={control}
          render={({ field }) => (
            <TextField 
              {...field} 
              label="생산일자 범위 (종료일)" // 임시
              type="date" 
              fullWidth 
              InputLabelProps={{ shrink: true }}
               // 임시 onChange 핸들러
              onChange={(e) => {
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
        {/* 품목 선택 (Autocomplete 필요) */}
        <Controller
          name="item"
          control={control}
          defaultValue=""
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
        {/* 라인 선택 (Autocomplete 또는 Select 필요) */}
        <Controller
          name="line"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <TextField
              {...field}
              label="라인"
              fullWidth
              placeholder="라인 코드 또는 이름"
              InputLabelProps={{ shrink: true }}
            />
          )}
        />
      </Grid>
    </Grid>
  );
};

export default SearchForm; 