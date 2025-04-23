import React, { useMemo } from 'react';
import { Grid, TextField, FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material';
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
 * @param {Array} props.productOptions - 제품 옵션 목록
 * @returns {Array} 검색 요소 배열
 */
const SearchForm = ({ control, handleDateRangeChange, onSearch, productOptions = [] }) => {
  // 엔터키 핸들러
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (onSearch) {
        onSearch();
      }
    }
  };

  // MaterialType 코드값을 한글로 변환하는 함수
  const getMaterialTypeDisplay = (typeCode) => {
    const materialTypeMap = {
      'COMPLETE_PRODUCT': '완제품',
      'HALF_PRODUCT': '반제품',
      'RAW_MATERIAL': '원자재',
      'SUB_MATERIAL': '부자재'
    };
    return materialTypeMap[typeCode] || typeCode || '';
  };

  // 제품 목록 필터링: 완제품과 반제품만 표시
  const filteredProductOptions = useMemo(() => {
    return productOptions.filter(product => 
      product.materialType === 'COMPLETE_PRODUCT' || product.materialType === 'HALF_PRODUCT'
    );
  }, [productOptions]);

  // 제품 목록에서 고유한 materialCategory 값들을 추출하여 옵션 목록 생성
  // 필터링된 제품 목록에서만 카테고리 추출
  const materialCategoryOptions = useMemo(() => {
    const categories = [...new Set(filteredProductOptions
      .filter(product => product.materialCategory)
      .map(product => product.materialCategory))];
    
    return categories.map(category => ({
      value: category,
      label: category
    }));
  }, [filteredProductOptions]);

  // 개별 요소를 배열로 반환하여 SearchCondition의 더보기 기능이 작동하도록 함
  return [
    <Grid item xs={12} sm={6} md={3} key="prodPlanId">
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
              <FormControl variant="outlined" size="small" fullWidth>
                <InputLabel id="product-label">제품ID</InputLabel>
                <Select
                    {...field}
                    labelId="product-label"
                    label="제품ID"
                    onKeyDown={handleKeyDown}
                >
                  <MenuItem value="">전체</MenuItem>
                  {filteredProductOptions.map(option => (
                      <MenuItem
                          key={option.systemMaterialId}
                          value={option.systemMaterialId}
                      >
                        {/* 보여지는 값은 userMaterialId(제품ID) */}
                        {option.userMaterialId || ''}
                        {option.materialType ? (
                            <Typography variant="caption" color="textSecondary" style={{ display: 'block' }}>
                              {getMaterialTypeDisplay(option.materialType)}
                            </Typography>
                        ) : null}
                      </MenuItem>
                  ))}
                </Select>
              </FormControl>
          )}
      />
    </Grid>,
    <Grid item xs={12} sm={6} md={3} key="productName">
      <Controller
          name="productName"
          control={control}
          render={({ field }) => (
              <FormControl variant="outlined" size="small" fullWidth>
                <InputLabel id="productName-label">제품명</InputLabel>
                <Select
                    {...field}
                    labelId="productName-label"
                    label="제품명"
                    onKeyDown={handleKeyDown}
                >
                  <MenuItem value="">전체</MenuItem>
                  {filteredProductOptions.map(option => (
                      <MenuItem
                          key={option.systemMaterialId}
                          value={option.materialName || ''}
                      >
                        {/* 보여지는 값은 materialName(제품명)과 userMaterialId(제품ID) */}
                        {option.materialName || ''} {option.userMaterialId ? `(${option.userMaterialId})` : ''}
                        {option.materialType ? (
                            <Typography variant="caption" color="textSecondary" style={{ display: 'block' }}>
                              {getMaterialTypeDisplay(option.materialType)}
                            </Typography>
                        ) : null}
                      </MenuItem>
                  ))}
                </Select>
              </FormControl>
          )}
      />
    </Grid>,
    <Grid item xs={12} sm={6} md={3} key="materialCategory">
      <Controller
          name="materialCategory"
          control={control}
          render={({ field }) => (
              <FormControl variant="outlined" size="small" fullWidth>
                <InputLabel id="materialCategory-label">제품유형</InputLabel>
                <Select
                    {...field}
                    labelId="materialCategory-label"
                    label="제품유형"
                    onKeyDown={handleKeyDown}
                >
                  <MenuItem value="">전체</MenuItem>
                  {materialCategoryOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                  ))}
                </Select>
              </FormControl>
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