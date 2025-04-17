import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Typography,
  Box
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

const ProductionResultFilterDialog = ({
  open,
  onClose,
  searchParams,
  onFilterChange,
  onResetFilters,
  onApplyFilters,
  equipmentList,
  productList,
  getAccentColor
}) => {
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
              <FormControl variant="outlined" size="medium" fullWidth>
                <InputLabel sx={{ fontSize: '1.2rem' }}>설비</InputLabel>
                <Select
                    name="equipmentId"
                    value={searchParams.equipmentId}
                    onChange={onFilterChange}
                    label="설비"
                    sx={{ fontSize: '1.2rem' }}
                >
                  <MenuItem value="" sx={{ fontSize: '1.2rem' }}>전체</MenuItem>
                  {equipmentList.map(equipment => (
                      <MenuItem key={equipment.id} value={equipment.id} sx={{ fontSize: '1.2rem' }}>
                        {equipment.name}
                      </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl variant="outlined" size="medium" fullWidth>
                <InputLabel sx={{ fontSize: '1.2rem' }}>제품</InputLabel>
                <Select
                    name="productId"
                    value={searchParams.productId}
                    onChange={onFilterChange}
                    label="제품"
                    sx={{ fontSize: '1.2rem' }}
                >
                  <MenuItem value="" sx={{ fontSize: '1.2rem' }}>전체</MenuItem>
                  {productList.map(product => (
                      <MenuItem key={product.id} value={product.id} sx={{ fontSize: '1.2rem' }}>
                        {product.name}
                      </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                    variant="outlined"
                    onClick={onResetFilters}
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
              onClick={onApplyFilters}
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