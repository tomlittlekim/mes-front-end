import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  IconButton,
  Box
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

const ProductFilterDialog = ({
  open,
  onClose,
  searchParams,
  onFilterChange,
  onResetFilters,
  onApplyFilters,
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
              <TextField
                  label="제품ID"
                  name="userMaterialId"
                  value={searchParams.userMaterialId}
                  onChange={onFilterChange}
                  variant="outlined"
                  size="medium"
                  fullWidth
                  placeholder="제품ID를 입력하세요"
                  InputProps={{
                    sx: { fontSize: '1.2rem', py: 0.5 }
                  }}
                  InputLabelProps={{
                    sx: { fontSize: '1.2rem' }
                  }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                  label="제품명"
                  name="materialName"
                  value={searchParams.materialName}
                  onChange={onFilterChange}
                  variant="outlined"
                  size="medium"
                  fullWidth
                  placeholder="제품명을 입력하세요"
                  InputProps={{
                    sx: { fontSize: '1.2rem', py: 0.5 }
                  }}
                  InputLabelProps={{
                    sx: { fontSize: '1.2rem' }
                  }}
              />
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

export default ProductFilterDialog;