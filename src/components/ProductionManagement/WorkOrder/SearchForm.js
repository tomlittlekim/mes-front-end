import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ko from "date-fns/locale/ko";
import { SearchCondition } from '../../Common';
import DateRangePicker from '../../Common/DateRangePicker';

/**
 * 작업지시관리 검색 폼 컴포넌트
 *
 * @param {Object} props - 컴포넌트 속성
 * @param {Function} props.onSearch - 검색 함수
 * @param {Function} props.onReset - 초기화 함수
 * @returns {JSX.Element}
 */
const SearchForm = ({ onSearch, onReset }) => {
  // 상태 옵션 정의
  const stateOptions = [
    { value: 'PLANNED', label: '계획됨' },
    { value: 'IN_PROGRESS', label: '진행중' },
    { value: 'COMPLETED', label: '완료됨' },
    { value: 'CANCELED', label: '취소됨' }
  ];

  // React Hook Form 설정
  const { control, handleSubmit, setValue } = useForm({
    defaultValues: {
      prodPlanId: '',
      productId: '',
      productName: '',
      materialCategory: '',
      workOrderId: '',
      state: '',
      planStartDateRange: {
        startDate: null,
        endDate: null
      },
      planEndDateRange: {
        startDate: null,
        endDate: null
      }
    }
  });

  // 날짜 범위 변경 핸들러
  const handleDateRangeChange = (fieldName, startDate, endDate) => {
    setValue(fieldName, { startDate, endDate });
  };

  // 엔터키 핸들러
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSubmit(onSearch)();
    }
  };

  return (
      <SearchCondition
          onSearch={handleSubmit(onSearch)}
          onReset={onReset}
      >
        <Grid item xs={12} sm={6} md={3}>
          <Controller
              name="prodPlanId"
              control={control}
              render={({ field }) => (
                  <TextField
                      {...field}
                      label="생산계획ID"
                      variant="outlined"
                      size="small"
                      fullWidth
                      placeholder="생산계획ID를 입력하세요"
                      onKeyDown={handleKeyDown}
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
                      onKeyDown={handleKeyDown}
                  />
              )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
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
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
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
        </Grid>
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
                      onKeyDown={handleKeyDown}
                  />
              )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Controller
              name="state"
              control={control}
              render={({ field }) => (
                  <FormControl fullWidth size="small">
                    <InputLabel id="state-select-label">상태</InputLabel>
                    <Select
                        {...field}
                        labelId="state-select-label"
                        label="상태"
                        onKeyDown={handleKeyDown}
                    >
                      <MenuItem value="">전체</MenuItem>
                      {stateOptions.map(option => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
              )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
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
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
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
      </SearchCondition>
  );
};

export default SearchForm;