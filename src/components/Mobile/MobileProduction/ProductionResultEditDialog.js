import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Box,
  Typography,
  useTheme
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ko from "date-fns/locale/ko";
import { SHIFT_TYPES } from './ProductionResultConstants';
import { format } from 'date-fns';

const ProductionResultEditDialog = ({
  open,
  onClose,
  production,
  editMode,
  onInputChange,
  onEquipmentChange,
  onProductChange,
  onWorkOrderChange,
  onDateChange,
  onSave,
  onOpenDefectInfo,
  defectInfos,
  isDefectInfoValid,
  productList,
  equipmentList,
  workOrderList,
  getAccentColor
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  if (!production) return null;

  return (
      <Dialog
          open={open}
          onClose={onClose}
          fullWidth
          maxWidth="sm"
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
          {editMode ? '생산실적 수정' : '신규 생산실적 등록'}
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
              <FormControl variant="outlined" size="medium" fullWidth required>
                <InputLabel sx={{ fontSize: '1.2rem' }}>설비</InputLabel>
                <Select
                    name="equipmentId"
                    value={production.equipmentId || ''}
                    onChange={onEquipmentChange}
                    label="설비"
                    sx={{ fontSize: '1.2rem' }}
                >
                  <MenuItem value="" sx={{ fontSize: '1.2rem' }}>선택</MenuItem>
                  {equipmentList.map(equipment => (
                      <MenuItem key={equipment.id} value={equipment.id} sx={{ fontSize: '1.2rem' }}>
                        {equipment.name}
                      </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl variant="outlined" size="medium" fullWidth required>
                <InputLabel sx={{ fontSize: '1.2rem' }}>제품</InputLabel>
                <Select
                    name="productId"
                    value={production.productId || ''}
                    onChange={onProductChange}
                    label="제품"
                    sx={{ fontSize: '1.2rem' }}
                >
                  <MenuItem value="" sx={{ fontSize: '1.2rem' }}>선택</MenuItem>
                  {productList.map(product => (
                      <MenuItem key={product.id} value={product.id} sx={{ fontSize: '1.2rem' }}>
                        {product.name} ({product.code})
                      </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl variant="outlined" size="medium" fullWidth>
                <InputLabel sx={{ fontSize: '1.2rem' }}>작업지시</InputLabel>
                <Select
                    name="workOrderId"
                    value={production.workOrderId || ''}
                    onChange={onWorkOrderChange}
                    label="작업지시"
                    sx={{ fontSize: '1.2rem' }}
                >
                  <MenuItem value="" sx={{ fontSize: '1.2rem' }}>선택 안함</MenuItem>
                  {workOrderList.map(workOrder => (
                      <MenuItem key={workOrder.id} value={workOrder.id} sx={{ fontSize: '1.2rem' }}>
                        {workOrder.id} - {workOrder.productName || workOrder.productId}
                      </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
                <DatePicker
                    label="생산일자"
                    value={production.prodDate ? new Date(production.prodDate) : null}
                    onChange={(date) => onDateChange(date ? format(date, 'yyyy-MM-dd') : null)}
                    slotProps={{ 
                      textField: { 
                        size: 'medium', 
                        fullWidth: true, 
                        required: true,
                        InputProps: {
                          sx: { fontSize: '1.2rem', py: 0.5 }
                        },
                        InputLabelProps: {
                          sx: { fontSize: '1.2rem' }
                        }
                      } 
                    }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={6}>
              <TextField
                  label="양품수량"
                  name="goodQty"
                  type="number"
                  value={production.goodQty}
                  onChange={onInputChange}
                  variant="outlined"
                  size="medium"
                  fullWidth
                  required
                  InputProps={{ 
                    inputProps: { min: 0 },
                    sx: { fontSize: '1.2rem', py: 0.5 }
                  }}
                  InputLabelProps={{
                    sx: { fontSize: '1.2rem' }
                  }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                  label="불량수량"
                  name="defectQty"
                  type="number"
                  value={production.defectQty}
                  onChange={onInputChange}
                  variant="outlined"
                  size="medium"
                  fullWidth
                  InputProps={{ 
                    inputProps: { min: 0 },
                    sx: { fontSize: '1.2rem', py: 0.5 }
                  }}
                  InputLabelProps={{
                    sx: { fontSize: '1.2rem' }
                  }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl variant="outlined" size="medium" fullWidth>
                <InputLabel sx={{ fontSize: '1.2rem' }}>근무타입</InputLabel>
                <Select
                    name="shiftType"
                    value={production.shiftType || 'DAY'}
                    onChange={onInputChange}
                    label="근무타입"
                    sx={{ fontSize: '1.2rem' }}
                >
                  {SHIFT_TYPES.map(option => (
                      <MenuItem key={option.value} value={option.value} sx={{ fontSize: '1.2rem' }}>
                        {option.label}
                      </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                  label="작업자"
                  name="workers"
                  value={production.workers || ''}
                  onChange={onInputChange}
                  variant="outlined"
                  size="medium"
                  fullWidth
                  placeholder="작업자 이름을 입력하세요"
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
                  label="메모"
                  name="memo"
                  value={production.memo || ''}
                  onChange={onInputChange}
                  variant="outlined"
                  size="medium"
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="추가 정보나 특이사항을 입력하세요"
                  InputProps={{
                    sx: { fontSize: '1.2rem' }
                  }}
                  InputLabelProps={{
                    sx: { fontSize: '1.2rem' }
                  }}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                  variant="outlined"
                  color="primary"
                  onClick={onOpenDefectInfo}
                  fullWidth
                  size="large"
                  sx={{ fontSize: '1.1rem', py: 1.5, mt: 1 }}
              >
                불량정보 입력
              </Button>
              {Number(production.defectQty) > 0 && defectInfos.length === 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, color: theme.palette.error.main }}>
                    <WarningAmberIcon color="error" sx={{ mr: 1, fontSize: '1.2rem' }} />
                    <Typography variant="body2" sx={{ color: 'inherit', fontSize: '0.9rem' }}>
                      불량수량이 있을 경우 불량정보를 입력해주세요.
                    </Typography>
                  </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
          <Button
              variant="contained"
              onClick={onSave}
              startIcon={<SaveIcon sx={{ fontSize: '1.5rem' }} />}
              sx={{ bgcolor: getAccentColor(), fontSize: '1.2rem', py: 2, height: '56px' }}
              fullWidth
              size="large"
          >
            저장
          </Button>
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
        </DialogActions>
      </Dialog>
  );
};

export default ProductionResultEditDialog;