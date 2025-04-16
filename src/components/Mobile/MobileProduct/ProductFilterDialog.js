import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ko from "date-fns/locale/ko";

const ProductFilterDialog = ({
  open,
  onClose,
  searchParams,
  onFilterChange,
  onDateChange,
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
      >
        <DialogTitle sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: getAccentColor(),
          color: 'white'
        }}>
          검색 필터
          <IconButton
              size="small"
              onClick={onClose}
              sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2, mt: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                  label="제품 ID"
                  name="userMaterialId"
                  value={searchParams.userMaterialId}
                  onChange={onFilterChange}
                  variant="outlined"
                  size="small"
                  fullWidth
                  placeholder="제품ID를 입력하세요"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                  label="제품명"
                  name="materialName"
                  value={searchParams.materialName}
                  onChange={onFilterChange}
                  variant="outlined"
                  size="small"
                  fullWidth
                  placeholder="제품명을 입력하세요"
              />
            </Grid>
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
                <DatePicker
                    label="시작일"
                    value={searchParams.fromDate}
                    onChange={(date) => onDateChange('fromDate', date)}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
                <DatePicker
                    label="종료일"
                    value={searchParams.toDate}
                    onChange={(date) => onDateChange('toDate', date)}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
              variant="outlined"
              onClick={onResetFilters}
              startIcon={<CloseIcon />}
              fullWidth
          >
            초기화
          </Button>
          <Button
              variant="contained"
              onClick={onApplyFilters}
              startIcon={<SearchIcon />}
              sx={{ bgcolor: getAccentColor() }}
              fullWidth
          >
            검색
          </Button>
        </DialogActions>
      </Dialog>
  );
};

export default ProductFilterDialog;