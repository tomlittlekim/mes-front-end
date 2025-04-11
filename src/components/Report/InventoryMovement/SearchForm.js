import React from 'react';
import { Grid, TextField } from '@mui/material';
import { Controller } from 'react-hook-form';
// DatePicker 등 필요한 컴포넌트 추가 import 필요

/**
 * 입출고 현황 검색 폼
 *
 * @param {object} props - { control, handleDateRangeChange }
 * @returns {JSX.Element}
 */
const SearchForm = ({ control, handleDateRangeChange }) => {
  return (
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={12} sm={6} md={4}>
        {/* 입출고일자 범위 (DateRangePicker 필요) */}
        <Controller
          name="movementDateRange"
          control={control}
          render={({ field }) => (
            <TextField 
              {...field} 
              label="입출고일자 범위 (시작일)" // 임시
              type="date" 
              fullWidth 
              InputLabelProps={{ shrink: true }}
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
          name="movementEndDate"
          control={control}
          render={({ field }) => (
            <TextField 
              {...field} 
              label="입출고일자 범위 (종료일)" // 임시
              type="date" 
              fullWidth 
              InputLabelProps={{ shrink: true }}
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
    </Grid>
  );
};

export default SearchForm; 