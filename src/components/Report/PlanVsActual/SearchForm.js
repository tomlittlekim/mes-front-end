import React from 'react';
import { Grid, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { Controller } from 'react-hook-form';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ko from "date-fns/locale/ko"; 
import DateRangePicker from '../../Common/DateRangePicker';

/**
 * 계획대비 실적조회 검색 폼 컴포넌트
 * 
 * @param {Object} props - 컴포넌트 속성
 * @param {Object} props.control - React Hook Form control 객체
 * @param {Function} props.handleDateRangeChange - 날짜 범위 변경 핸들러
 * @returns {JSX.Element}
 */
const SearchForm = ({ control, handleDateRangeChange }) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
      <Grid container spacing={2} alignItems="center">
        {/* 날짜 범위 필드 */}
        <Grid item xs={12} sm={12} md={12}>
          <Controller
            name="dateRange"
            control={control}
            defaultValue={[null, null]}
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
                label="계획일자"
                size="small"
              />
            )}
          />
        </Grid>
        
        {/* 상태 선택 필드 */}
        <Grid item xs={12} sm={12} md={12}>
          <Controller
            name="state"
            control={control}
            defaultValue="COMPLETED"
            render={({ field }) => (
              <FormControl fullWidth size="small">
                <InputLabel>상태</InputLabel>
                <Select
                  {...field}
                  label="상태"
                >
                  <MenuItem value="COMPLETED">완료됨</MenuItem>
                  <MenuItem value="IN_PROGRESS">진행중</MenuItem>
                  <MenuItem value="ALL">전체</MenuItem>
                </Select>
              </FormControl>
            )}
          />
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
};

export default SearchForm; 