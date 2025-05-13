import React from 'react';
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography
} from '@mui/material';
import { Controller } from 'react-hook-form';

/**
 * 생산실적 검색 폼 컴포넌트
 *
 * @param {Object} props - 컴포넌트 속성
 * @param {Object} props.control - React Hook Form control 객체
 * @param {Array} props.productOptions - 제품 옵션 목록
 * @param {Array} props.workTypeOptions - 근무타입 옵션 목록
 * @returns {JSX.Element}
 */
const SearchForm = ({ control, productOptions = [], workTypeOptions = [] }) => {
  return (
      <>
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
                  />
              )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Controller
              name="productId"
              control={control}
              render={({ field }) => (
                  <FormControl variant="outlined" size="small" fullWidth>
                    <InputLabel id="product-label">제품</InputLabel>
                    <Select
                        {...field}
                        labelId="product-label"
                        label="제품"
                    >
                      <MenuItem value="">전체</MenuItem>
                      {productOptions.map(option => (
                          <MenuItem
                              key={option.systemMaterialId}
                              value={option.systemMaterialId}  // value는 systemMaterialId(실제 값)
                          >
                            {/* 보여지는 값은 userMaterialId(제품ID)와 materialName(제품명) */}
                            {option.userMaterialId || ''} {option.materialName ? `(${option.materialName})` : ''}
                            {option.materialType ? (
                                <Typography variant="caption" color="textSecondary" style={{ display: 'block' }}>
                                  {option.materialTypeDisplay || option.materialType}
                                </Typography>
                            ) : null}
                          </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
              )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Controller
              name="workType"
              control={control}
              render={({ field }) => (
                  <FormControl variant="outlined" size="small" fullWidth>
                    <InputLabel id="workType-label">근무타입</InputLabel>
                    <Select
                        {...field}
                        labelId="workType-label"
                        label="근무타입"
                    >
                      <MenuItem value="">전체</MenuItem>
                      {workTypeOptions.map(option => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
              )}
          />
        </Grid>
      </>
  );
};

export default SearchForm;