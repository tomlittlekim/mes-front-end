import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Grid,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ko from "date-fns/locale/ko";
import DateRangePicker from "../../../Common/DateRangePicker";
import { SearchCondition } from "../../../Common";
import { format } from "date-fns";

/** 검색 조건 값 초기화 */
export const SEARCH_CONDITIONS = {
  materialType: '',
  userMaterialId: '',
  materialName: '',
  fromDate: null,
  toDate: null
};

// 검색조건 포메팅 함수
export const formatMaterialSearchParams = (data) => ({
  ...data,
  fromDate: data.fromDate ? format(data.fromDate, 'yyyy-MM-dd') : null,
  toDate: data.toDate ? format(data.toDate, 'yyyy-MM-dd') : null
});

const SearchForm = ({ onSearch }) => {
  const { control, handleSubmit, reset, setValue } = useForm({
    defaultValues: SEARCH_CONDITIONS
  });

  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null
  });

  // 검색조건 초기화
  const handleReset = () => {
    reset(SEARCH_CONDITIONS);
    setDateRange({ startDate: null, endDate: null });
  };

  // 날짜 범위 변경 핸들러
  const handleDateRangeChange = (startDate, endDate) => {
    setDateRange({ startDate, endDate });
    setValue('fromDate', startDate);
    setValue('toDate', endDate);
  };

  // 검색 핸들러
  const handleSearch = (data) => {
    const searchParams = formatMaterialSearchParams(data);
    onSearch(searchParams);
  };

  return (
    <SearchCondition
      onSearch={handleSubmit(handleSearch)}
      onReset={handleReset}
    >
      <Grid item xs={12} sm={6} md={3}>
        <Controller
          name="userMaterialId"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="제품 ID"
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
          name="materialName"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="제품명"
              variant="outlined"
              size="small"
              fullWidth
              placeholder="제품명을 입력하세요"
            />
          )}
        />
      </Grid>
      <Grid item xs={12} sm={12} md={6}>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
          <Controller
            name="dateRange"
            control={control}
            render={({ field }) => (
              <DateRangePicker
                startDate={dateRange.startDate}
                endDate={dateRange.endDate}
                onRangeChange={handleDateRangeChange}
                startLabel="시작일"
                endLabel="종료일"
                label="날짜"
                size="small"
              />
            )}
          />
        </LocalizationProvider>
      </Grid>
    </SearchCondition>
  );
};

export default SearchForm; 