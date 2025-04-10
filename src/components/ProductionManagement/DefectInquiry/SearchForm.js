import React from 'react';
import { Grid, TextField, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { Controller } from 'react-hook-form';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ko from "date-fns/locale/ko";
import DateRangePicker from '../../Common/DateRangePicker';

/**
 * 불량정보 검색 폼 컴포넌트
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
                  placeholder="작업지시ID를 입력하세요"
              />
          )}
      />
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
                  placeholder="생산실적ID를 입력하세요"
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
              />
          )}
      />
    </Grid>,
    <Grid item xs={12} sm={6} md={3} key="defectType">
      <Controller
          name="defectType"
          control={control}
          render={({ field }) => (
              <FormControl variant="outlined" size="small" fullWidth>
                <InputLabel id="defectType-label">불량유형</InputLabel>
                <Select
                    {...field}
                    labelId="defectType-label"
                    label="불량유형"
                >
                  <MenuItem value="">전체</MenuItem>
                  <MenuItem value="외관불량">외관불량</MenuItem>
                  <MenuItem value="기능불량">기능불량</MenuItem>
                  <MenuItem value="치수불량">치수불량</MenuItem>
                  <MenuItem value="재질불량">재질불량</MenuItem>
                  <MenuItem value="기타">기타</MenuItem>
                </Select>
              </FormControl>
          )}
      />
    </Grid>,
    <Grid item xs={12} sm={6} md={3} key="state">
      <Controller
          name="state"
          control={control}
          render={({ field }) => (
              <FormControl variant="outlined" size="small" fullWidth>
                <InputLabel id="state-label">상태</InputLabel>
                <Select
                    {...field}
                    labelId="state-label"
                    label="상태"
                >
                  <MenuItem value="">전체</MenuItem>
                  <MenuItem value="NEW">신규</MenuItem>
                  <MenuItem value="PROCESSING">처리중</MenuItem>
                  <MenuItem value="COMPLETED">완료됨</MenuItem>
                </Select>
              </FormControl>
          )}
      />
    </Grid>,
    <Grid item xs={12} sm={12} md={3} key="dateRange">
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
                    label="등록일자"
                    size="small"
                />
            )}
        />
      </LocalizationProvider>
    </Grid>
  ];
};

export default SearchForm;