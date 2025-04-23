import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  IconButton,
  Grid
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { SEARCH_CONDITIONS } from '../ProductionResultConstants';

const ProductionResultFilterDialog = ({ 
  open, 
  onClose, 
  filter, 
  onFilterChange, 
  onReset, 
  productOptions,
  getAccentColor
}) => {
  const [localFilter, setLocalFilter] = useState({...SEARCH_CONDITIONS});
  
  // 다이얼로그가 열릴 때 필터 값 설정
  useEffect(() => {
    if (open) {
      setLocalFilter({...filter});
    }
  }, [open, filter]);

  // 필터 변경 핸들러
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setLocalFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 필터 적용 핸들러
  const handleApply = () => {
    onFilterChange(localFilter);
  };

  // 필터 초기화 핸들러
  const handleReset = () => {
    setLocalFilter({...SEARCH_CONDITIONS});
    onReset();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          borderRadius: 2,
        }
      }}
    >
      <DialogTitle sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        bgcolor: getAccentColor(),
        color: 'white',
        py: 2,
        px: 3,
        fontSize: '1.5rem'
      }}>
        검색 필터
        <IconButton
          size="large"
          onClick={onClose}
          sx={{ color: 'white' }}
        >
          <CloseIcon sx={{ fontSize: '1.8rem' }} />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 5, px: 3, mt: 2 }}>
        <Grid container spacing={3} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <FormControl fullWidth variant="outlined" size="medium">
              <InputLabel id="product-select-label" sx={{ fontSize: '1.2rem' }}>제품</InputLabel>
              <Select
                labelId="product-select-label"
                name="productId"
                value={localFilter.productId || ""}
                onChange={handleFilterChange}
                label="제품"
                sx={{ fontSize: '1.2rem' }}
              >
                <MenuItem value="" sx={{ fontSize: '1.2rem' }}>전체</MenuItem>
                {productOptions && productOptions.length > 0 ? (
                  productOptions.map((product) => (
                    <MenuItem key={product.systemMaterialId} value={product.systemMaterialId} sx={{ fontSize: '1.2rem' }}>
                      {product.userMaterialId} {product.materialName ? `(${product.materialName})` : ''}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled sx={{ fontSize: '1.2rem' }}>
                    제품 데이터를 불러오는 중이거나 데이터가 없습니다
                  </MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="outlined"
                onClick={handleReset}
                startIcon={<RestartAltIcon sx={{ fontSize: '1.3rem' }} />}
                size="large"
                color="primary"
                sx={{ fontSize: '1.1rem', py: 1.5, px: 3, height: '48px' }}
              >
                초기화
              </Button>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          startIcon={<CloseIcon sx={{ fontSize: '1.5rem' }} />}
          fullWidth
          size="large"
          sx={{ fontSize: '1.2rem', py: 2, height: '56px' }}
        >
          취소
        </Button>
        <Button
          variant="contained"
          onClick={handleApply}
          startIcon={<SearchIcon sx={{ fontSize: '1.5rem' }} />}
          sx={{ bgcolor: getAccentColor(), fontSize: '1.2rem', py: 2, height: '56px' }}
          fullWidth
          size="large"
        >
          검색
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductionResultFilterDialog; 