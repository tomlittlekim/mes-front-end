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
  IconButton
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import { UNIT_OPTIONS, CATEGORY_OPTIONS } from './ProductConstants';

const ProductEditDialog = ({
  open,
  onClose,
  material,
  editMode,
  onInputChange,
  onSave,
  getAccentColor
}) => {
  if (!material) return null;

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
          {editMode ? '제품 수정' : '신규 제품 등록'}
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
                  value={material.userMaterialId}
                  onChange={onInputChange}
                  variant="outlined"
                  size="small"
                  fullWidth
                  required
                  placeholder="제품ID를 입력하세요"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                  label="제품명"
                  name="materialName"
                  value={material.materialName}
                  onChange={onInputChange}
                  variant="outlined"
                  size="small"
                  fullWidth
                  required
                  placeholder="제품명을 입력하세요"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl variant="outlined" size="small" fullWidth>
                <InputLabel>자재유형</InputLabel>
                <Select
                    name="materialCategory"
                    value={material.materialCategory}
                    onChange={onInputChange}
                    label="자재유형"
                >
                  {CATEGORY_OPTIONS.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                  label="규격"
                  name="materialStandard"
                  value={material.materialStandard}
                  onChange={onInputChange}
                  variant="outlined"
                  size="small"
                  fullWidth
                  placeholder="규격을 입력하세요"
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl variant="outlined" size="small" fullWidth>
                <InputLabel>단위</InputLabel>
                <Select
                    name="unit"
                    value={material.unit}
                    onChange={onInputChange}
                    label="단위"
                >
                  {UNIT_OPTIONS.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                  label="기본수량"
                  name="baseQuantity"
                  type="number"
                  value={material.baseQuantity}
                  onChange={onInputChange}
                  variant="outlined"
                  size="small"
                  fullWidth
                  InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                  label="보관창고"
                  name="materialStorage"
                  value={material.materialStorage}
                  onChange={onInputChange}
                  variant="outlined"
                  size="small"
                  fullWidth
                  placeholder="보관창고 정보를 입력하세요"
              />
            </Grid>
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
          >
            저장
          </Button>
        </DialogActions>
      </Dialog>
  );
};

export default ProductEditDialog;