import React from 'react';
import { Grid, TextField, FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import { Controller } from 'react-hook-form';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ko from "date-fns/locale/ko";
import DateRangePicker from '../../Common/DateRangePicker';

/**
 * 불량조회 검색 폼 컴포넌트
 * SearchCondition 컴포넌트의 더보기 기능을 위해 개별 요소를 반환
 *
 * @param {Object} props - 컴포넌트 속성
 * @param {Object} props.control - React Hook Form control 객체
 * @param {Array} props.equipmentOptions - 설비 옵션 목록
 * @param {Array} props.productOptions - 제품 옵션 목록
 * @param {Function} props.handleDateRangeChange - 날짜 범위 변경 핸들러
 * @param {Function} props.onSearch - 검색 실행 함수
 * @returns {Array} 검색 요소 배열
 */
const SearchForm = ({ 
  control, 
  equipmentOptions = [], 
  productOptions = [],
  handleDateRangeChange,
  onSearch
}) => {
  // 엔터키 핸들러
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (onSearch) {
        onSearch();
      }
    }
  };

  // 날짜 범위 변경 핸들러
  const handleDateChange = (fieldName, startDate, endDate) => {
    if (handleDateRangeChange) {
      handleDateRangeChange(fieldName, startDate, endDate);
    }
  };

  // 개별 요소를 배열로 반환하여 SearchCondition의 더보기 기능이 작동하도록 함
  return [
    <Grid item xs={12} sm={6} md={3} key="defectId">
      <Controller
        control={control}
        name="defectId"
        render={({
          field: { onChange, onBlur, value, ref },
          fieldState: { invalid, error }
        }) => (
          <TextField
            label="불량ID"
            variant="outlined"
            size="small"
            fullWidth
            value={value || ''}
            onChange={onChange}
            onBlur={onBlur}
            placeholder="불량ID를 입력하세요"
            error={invalid}
            helperText={error?.message}
            onKeyDown={handleKeyDown}
          />
        )}
      />
    </Grid>,
    <Grid item xs={12} sm={6} md={3} key="prodResultId">
      <Controller
        control={control}
        name="prodResultId"
        render={({
          field: { onChange, onBlur, value, ref },
          fieldState: { invalid, error }
        }) => (
          <TextField
            label="생산실적ID"
            variant="outlined"
            size="small"
            fullWidth
            value={value || ''}
            onChange={onChange}
            onBlur={onBlur}
            placeholder="생산실적ID를 입력하세요"
            error={invalid}
            helperText={error?.message}
            onKeyDown={handleKeyDown}
          />
        )}
      />
    </Grid>,
    <Grid item xs={12} sm={6} md={3} key="productId">
      <Controller
        control={control}
        name="productId"
        render={({
          field,
          fieldState: { invalid, error }
        }) => (
          <FormControl variant="outlined" size="small" fullWidth>
            <InputLabel id="product-label">제품</InputLabel>
            <Select
              {...field}
              labelId="product-label"
              label="제품"
              error={invalid}
              onKeyDown={handleKeyDown}
            >
              <MenuItem value="">전체</MenuItem>
              {productOptions.map(option => (
                <MenuItem
                  key={option.systemMaterialId}
                  value={option.systemMaterialId}
                >
                  {option.userMaterialId || ''} {option.materialName ? `(${option.materialName})` : ''}
                  {option.materialType ? (
                    <Typography variant="caption" color="textSecondary" style={{ display: 'block' }}>
                      {option.materialType === 'COMPLETE_PRODUCT' ? '완제품' :
                        option.materialType === 'HALF_PRODUCT' ? '반제품' :
                          option.materialType === 'RAW_MATERIAL' ? '원자재' :
                            option.materialType === 'SUB_MATERIAL' ? '부자재' : option.materialType}
                    </Typography>
                  ) : null}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      />
    </Grid>,
    <Grid item xs={12} sm={6} md={3} key="equipmentId">
      <Controller
        control={control}
        name="equipmentId"
        render={({
          field,
          fieldState: { invalid, error }
        }) => (
          <FormControl variant="outlined" size="small" fullWidth>
            <InputLabel id="equipment-label">설비</InputLabel>
            <Select
              {...field}
              labelId="equipment-label"
              label="설비"
              error={invalid}
              onKeyDown={handleKeyDown}
            >
              <MenuItem value="">전체</MenuItem>
              {equipmentOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                  {option.factoryName && option.lineName ? (
                    <Typography variant="caption" color="textSecondary" style={{ display: 'block' }}>
                      {option.factoryName} &gt; {option.lineName}
                    </Typography>
                  ) : null}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      />
    </Grid>,
    <Grid item xs={12} sm={6} md={3} key="dateRange">
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
        <Controller
          name="dateRange"
          control={control}
          render={({ field }) => (
            <DateRangePicker
              startDate={field.value?.startDate || null}
              endDate={field.value?.endDate || null}
              onRangeChange={(startDate, endDate) => handleDateChange('dateRange', startDate, endDate)}
              startLabel="시작일"
              endLabel="종료일"
              label="등록일시"
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