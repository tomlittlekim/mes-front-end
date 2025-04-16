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
  onDefectInfoButtonClick,
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
      >
        <DialogTitle sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: getAccentColor(),
          color: 'white'
        }}>
          {editMode ? '생산실적 수정' : '신규 생산실적 등록'}
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
              <FormControl variant="outlined" size="small" fullWidth required>
                <InputLabel>설비</InputLabel>
                <Select
                    name="equipmentId"
                    value={production.equipmentId || ''}
                    onChange={onEquipmentChange}
                    label="설비"
                >
                  <MenuItem value="">선택</MenuItem>
                  {equipmentList.map(equipment => (
                      <MenuItem key={equipment.id} value={equipment.id}>
                        {equipment.name}
                      </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl variant="outlined" size="small" fullWidth required>
                <InputLabel>제품</InputLabel>
                <Select
                    name="productId"
                    value={production.productId || ''}
                    onChange={onProductChange}
                    label="제품"
                >
                  <MenuItem value="">선택</MenuItem>
                  {productList.map(product => (
                      <MenuItem key={product.id} value={product.id}>
                        {product.name} ({product.code})
                      </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl variant="outlined" size="small" fullWidth>
                <InputLabel>작업지시</InputLabel>
                <Select
                    name="workOrderId"
                    value={production.workOrderId || ''}
                    onChange={onWorkOrderChange}
                    label="작업지시"
                >
                  <MenuItem value="">선택 안함</MenuItem>
                  {workOrderList.map(workOrder => (
                      <MenuItem key={workOrder.id} value={workOrder.id}>
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
                    slotProps={{ textField: { size: 'small', fullWidth: true, required: true } }}
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
                  size="small"
                  fullWidth
                  required
                  InputProps={{ inputProps: { min: 0 } }}
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
                  size="small"
                  fullWidth
                  InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl variant="outlined" size="small" fullWidth>
                <InputLabel>근무타입</InputLabel>
                <Select
                    name="shiftType"
                    value={production.shiftType || 'DAY'}
                    onChange={onInputChange}
                    label="근무타입"
                >
                  {SHIFT_TYPES.map(option => (
                      <MenuItem key={option.value} value={option.value}>
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
                  size="small"
                  fullWidth
                  placeholder="작업자 이름을 입력하세요"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                  label="메모"
                  name="memo"
                  value={production.memo || ''}
                  onChange={onInputChange}
                  variant="outlined"
                  size="small"
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="추가 정보나 특이사항을 입력하세요"
              />
            </Grid>

            {production.defectQty > 0 && (
                <Grid item xs={12}>
                  <Box
                      sx={{
                        p: 2,
                        bgcolor: isDarkMode ? 'rgba(255, 0, 0, 0.1)' : 'rgba(255, 235, 235, 1)',
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        border: '1px solid',
                        borderColor: 'error.light'
                      }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <WarningAmberIcon sx={{ color: 'error.main', mr: 1 }} />
                      <Typography variant="body2" color="error.main">
                        불량수량이 있는 경우 불량정보를 등록해야 합니다.
                      </Typography>
                    </Box>
                    <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={onDefectInfoButtonClick}
                    >
                      {defectInfos.length > 0 ? '불량정보 수정' : '불량정보 등록'}
                    </Button>
                  </Box>
                </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
              variant="outlined"
              onClick={onClose}
              startIcon={<CloseIcon />}
              fullWidth
          >
            취소
          </Button>
          <Button
              variant="contained"
              onClick={onSave}
              startIcon={<SaveIcon />}
              sx={{ bgcolor: getAccentColor() }}
              fullWidth
              disabled={production?.defectQty > 0 && !isDefectInfoValid()}
          >
            저장
          </Button>
        </DialogActions>
      </Dialog>
  );
};

export default ProductionResultEditDialog;