import React from 'react';
import { Grid, TextField } from '@mui/material';
import { Controller } from 'react-hook-form';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ko from "date-fns/locale/ko";

/**
 * 일일 생산 수율 검색 폼
 *
 * @param {object} props - { control, handleDateChange }
 * @returns {JSX.Element}
 */
const SearchForm = ({ control, handleDateChange }) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={6} md={4}>
          {/* 생산일자 */}
          <Controller
            name="productionDate"
            control={control}
            defaultValue={new Date()}
            render={({ field }) => (
              <DatePicker
                label="생산일자"
                value={field.value ? new Date(field.value) : null}
                onChange={(newValue) => {
                  field.onChange(newValue ? newValue.toISOString().split('T')[0] : null);
                  if (handleDateChange) handleDateChange(newValue);
                }}
                renderInput={(params) => <TextField {...params} fullWidth size="small" InputLabelProps={{ shrink: true }} />}
                inputFormat="yyyy-MM-dd"
                mask="____-__-__"
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
                size="small"
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
            defaultValue=""
            render={({ field }) => (
              <TextField
                {...field}
                label="설비"
                fullWidth
                size="small"
                placeholder="설비 코드 또는 이름"
                InputLabelProps={{ shrink: true }}
              />
            )}
          />
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
};

export default SearchForm; 