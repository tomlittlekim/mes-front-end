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
  Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ko from "date-fns/locale/ko";

const ProductionResultFilterDialog = ({
  open,
  onClose,
  searchParams,
  onFilterChange,
  onDateChange,
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
      >
        <DialogTitle sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: getAccentColor(),
          color: 'white'
        }}>
          <Typography variant="h6">검색 필터</Typography>
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
              <FormControl variant="outlined" size="small" fullWidth>
                <InputLabel>설비</InputLabel>
                <Select
                    name="equipmentId"
                    value={searchParams.equipmentId}
                    onChange={onFilterChange}
                    label="설비"
                >
                  <MenuItem value="">전체</MenuItem>
                  {equipmentList.map(equipment => (
                      <MenuItem key={equipment.id} value={equipment.id}>
                        {equipment.name}
                      </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl variant="outlined" size="small" fullWidth>
                <InputLabel>제품</InputLabel>
                <Select
                    name="productId"
                    value={searchParams.productId}
                    onChange={onFilterChange}
                    label="제품"
                >
                  <MenuItem value="">전체</MenuItem>
                  {productList.map(product => (
                      <MenuItem key={product.id} value={product.id}>
                        {product.name}
                      </MenuItem>
                  ))}
                </Select>
              </FormControl>
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

export default ProductionResultFilterDialog;