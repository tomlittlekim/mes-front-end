import React from 'react';
import { Grid, TextField, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { Controller } from 'react-hook-form';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ko from "date-fns/locale/ko";
import DateRangePicker from '../../Common/DateRangePicker';

/**
 * 생산계획 검색 폼 컴포넌트
 * SearchCondition 컴포넌트의 더보기 기능을 위해 개별 요소를 반환
 *
 * @param {Object} props - 컴포넌트 속성
 * @param {Object} props.control - React Hook Form control 객체
 * @param {Function} props.handleDateRangeChange - 날짜 범위 변경 핸들러
 * @param {Function} props.onSearch - 검색 실행 함수
 * @returns {Array} 검색 요소 배열
 */
const SearchForm = ({ control, handleDateRangeChange, onSearch }) => {
  // 엔터키 핸들러
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (onSearch) {
        onSearch();
      }
    }
  };

  // 개별 요소를 배열로 반환하여 SearchCondition의 더보기 기능이 작동하도록 함
  return [
    <Grid item xs={12} sm={6} md={3} key="prodPlanId">
      <Controller
          name="prodPlanId"
          control={control}
          render={({ field }) => (
              <TextField
                  {...field}
                  label="계획ID"
                  variant="outlined"
                  size="small"
                  fullWidth
                  placeholder="계획ID를 입력하세요"
                  onKeyDown={handleKeyDown}
              />
          )}
      />
    </Grid>,
    <Grid item xs={12} sm={6} md={3} key="orderId">
      <Controller
          name="orderId"
          control={control}
          render={({ field }) => (
              <TextField
                  {...field}
                  label="주문번호"
                  variant="outlined"
                  size="small"
                  fullWidth
                  placeholder="주문번호를 입력하세요"
                  onKeyDown={handleKeyDown}
              />
          )}
      />
    </Grid>,
    <Grid item xs={12} sm={6} md={3} key="productId">
      <Controller
          name="productId"
          control={control}
          render={({ field }) => (
              <TextField
                  {...field}
                  label="제품ID"
                  variant="outlined"
                  size="small"
                  fullWidth
                  placeholder="제품ID를 입력하세요"
                  onKeyDown={handleKeyDown}
              />
          )}
      />
    </Grid>,
    <Grid item xs={12} sm={6} md={3} key="productName">
      <Controller
          name="productName"
          control={control}
          render={({ field }) => (
              <TextField
                  {...field}
                  label="제품명"
                  variant="outlined"
                  size="small"
                  fullWidth
                  placeholder="제품명을 입력하세요"
                  onKeyDown={handleKeyDown}
              />
          )}
      />
    </Grid>,
    <Grid item xs={12} sm={6} md={3} key="materialCategory">
      <Controller
          name="materialCategory"
          control={control}
          render={({ field }) => (
              <TextField
                  {...field}
                  label="제품유형"
                  variant="outlined"
                  size="small"
                  fullWidth
                  placeholder="제품유형을 입력하세요"
                  onKeyDown={handleKeyDown}
              />
          )}
      />
    </Grid>,
    <Grid item xs={12} sm={6} md={3} key="shiftType">
      <Controller
          name="shiftType"
          control={control}
          render={({ field }) => (
              <FormControl fullWidth size="small">
                <InputLabel id="shift-type-label">주/야간</InputLabel>
                <Select
                    {...field}
                    labelId="shift-type-label"
                    label="주/야간"
                    placeholder="주/야간"
                    onKeyDown={handleKeyDown}
                >
                  <MenuItem value="">전체</MenuItem>
                  <MenuItem value="DAY">주간</MenuItem>
                  <MenuItem value="NIGHT">야간</MenuItem>
                </Select>
              </FormControl>
          )}
      />
    </Grid>,
    <Grid item xs={12} sm={12} md={3} key="planStartDateRange">
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
        <Controller
            name="planStartDateRange"
            control={control}
            render={({ field }) => (
                <DateRangePicker
                    startDate={field.value.startDate}
                    endDate={field.value.endDate}
                    onRangeChange={(startDate, endDate) => handleDateRangeChange('planStartDateRange', startDate, endDate)}
                    startLabel="시작일"
                    endLabel="종료일"
                    label="계획시작일"
                    size="small"
                    onKeyDown={handleKeyDown}
                />
            )}
        />
      </LocalizationProvider>
    </Grid>,
    <Grid item xs={12} sm={12} md={3} key="planEndDateRange">
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
        <Controller
            name="planEndDateRange"
            control={control}
            render={({ field }) => (
                <DateRangePicker
                    startDate={field.value.startDate}
                    endDate={field.value.endDate}
                    onRangeChange={(startDate, endDate) => handleDateRangeChange('planEndDateRange', startDate, endDate)}
                    startLabel="시작일"
                    endLabel="종료일"
                    label="계획종료일"
                    size="small"
                    onKeyDown={handleKeyDown}
                />
            )}
        />
      </LocalizationProvider>
    </Grid>
  ];
};

export default SearchForm;