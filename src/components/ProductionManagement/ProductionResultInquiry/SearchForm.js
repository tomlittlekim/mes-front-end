import React from 'react';
import { Grid, TextField, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { Controller } from 'react-hook-form';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ko from "date-fns/locale/ko";
import DateRangePicker from '../../Common/DateRangePicker';

/**
 * 생산실적조회 검색 폼 컴포넌트
 *
 * @param {Object} props - 컴포넌트 속성
 * @param {Object} props.control - React Hook Form control 객체
 * @param {Array} props.equipmentOptions - 설비 옵션 목록
 * @param {Function} props.handleDateRangeChange - 날짜 범위 변경 핸들러
 * @returns {JSX.Element}
 */
const SearchForm = ({ control, equipmentOptions, handleDateRangeChange }) => {
  return (
      <>
        <Grid item xs={12} sm={6} md={3}>
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
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
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
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Controller
              name="equipmentId"
              control={control}
              render={({ field }) => (
                  <FormControl variant="outlined" size="small" fullWidth>
                    <InputLabel id="equipment-label">설비</InputLabel>
                    <Select
                        {...field}
                        labelId="equipment-label"
                        label="설비"
                    >
                      <MenuItem value="">전체</MenuItem>
                      {equipmentOptions.map(option => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
              )}
          />
        </Grid>
        <Grid item xs={12} sm={12} md={3}>
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
                        label="작업일자"
                        size="small"
                    />
                )}
            />
          </LocalizationProvider>
        </Grid>
      </>
  );
};

export default SearchForm;