import React from 'react';
import { Grid, TextField, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { Controller } from 'react-hook-form';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ko from "date-fns/locale/ko";
import DateRangePicker from '../../Common/DateRangePicker';

/**
 * 생산실적 검색 폼 컴포넌트
 * SearchCondition 컴포넌트의 더보기 기능을 위해 개별 요소를 반환
 *
 * @param {Object} props - 컴포넌트 속성
 * @param {Object} props.control - React Hook Form control 객체
 * @param {Function} props.handleDateRangeChange - 날짜 범위 변경 핸들러
 * @returns {Array} 검색 요소 배열
 */
const SearchForm = ({ control, handleDateRangeChange }) => {
  // 개별 요소를 배열로 반환하여 SearchCondition의 더보기 기능이 작동하도록 함
  return [
    <Grid item xs={12} sm={6} md={3} key="dateRange">
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
        <Controller
            name="dateRange"
            control={control}
            render={({ field }) => (
                <DateRangePicker
                    startDate={field.value.startDate}
                    endDate={field.value.endDate}
                    onRangeChange={handleDateRangeChange}
                    startLabel="시작일"
                    endLabel="종료일"
                    label="생산일자"
                    size="small"
                />
            )}
        />
      </LocalizationProvider>
    </Grid>,
    <Grid item xs={12} sm={6} md={3} key="prodResultId">
      <Controller
          name="prodResultId"
          control={control}
          render={({ field }) => (
              <TextField
                  {...field}
                  label="생산실적ID"
                  variant="outlined"
                  size="small"
                  fullWidth
                  placeholder="생산실적ID 입력"
              />
          )}
      />
    </Grid>,
    <Grid item xs={12} sm={6} md={3} key="workOrderId">
      <Controller
          name="workOrderId"
          control={control}
          render={({ field }) => (
              <TextField
                  {...field}
                  label="작업지시ID"
                  variant="outlined"
                  size="small"
                  fullWidth
                  placeholder="작업지시ID 입력"
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
                  placeholder="제품ID 입력"
              />
          )}
      />
    </Grid>,
    <Grid item xs={12} sm={6} md={3} key="status">
      <Controller
          name="status"
          control={control}
          render={({ field }) => (
              <FormControl fullWidth size="small">
                <InputLabel id="status-label">상태</InputLabel>
                <Select
                    {...field}
                    labelId="status-label"
                    label="상태"
                    placeholder="상태"
                >
                  <MenuItem value="">전체</MenuItem>
                  <MenuItem value="PLANNED">계획</MenuItem>
                  <MenuItem value="INPROGRESS">진행중</MenuItem>
                  <MenuItem value="COMPLETED">완료</MenuItem>
                  <MenuItem value="CANCELED">취소</MenuItem>
                </Select>
              </FormControl>
          )}
      />
    </Grid>,
    <Grid item xs={12} sm={6} md={3} key="equipmentId">
      <Controller
          name="equipmentId"
          control={control}
          render={({ field }) => (
              <TextField
                  {...field}
                  label="설비ID"
                  variant="outlined"
                  size="small"
                  fullWidth
                  placeholder="설비ID 입력"
              />
          )}
      />
    </Grid>
  ];
};

export default SearchForm;