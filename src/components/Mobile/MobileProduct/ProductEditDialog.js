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
          {editMode ? '제품 수정' : '신규 제품 등록'}
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
                  value={material.userMaterialId}
                  onChange={onInputChange}
                  variant="outlined"
                  size="medium"
                  fullWidth
                  required
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
                  value={material.materialName}
                  onChange={onInputChange}
                  variant="outlined"
                  size="medium"
                  fullWidth
                  required
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
              <FormControl variant="outlined" size="medium" fullWidth>
                <InputLabel sx={{ fontSize: '1.2rem' }}>자재유형</InputLabel>
                <Select
                    name="materialCategory"
                    value={material.materialCategory}
                    onChange={onInputChange}
                    label="자재유형"
                    sx={{ fontSize: '1.2rem' }}
                >
                  {CATEGORY_OPTIONS.map(option => (
                      <MenuItem key={option.value} value={option.value} sx={{ fontSize: '1.2rem' }}>
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
                  size="medium"
                  fullWidth
                  placeholder="규격을 입력하세요"
                  InputProps={{
                    sx: { fontSize: '1.2rem', py: 0.5 }
                  }}
                  InputLabelProps={{
                    sx: { fontSize: '1.2rem' }
                  }}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl variant="outlined" size="medium" fullWidth>
                <InputLabel sx={{ fontSize: '1.2rem' }}>단위</InputLabel>
                <Select
                    name="unit"
                    value={material.unit}
                    onChange={onInputChange}
                    label="단위"
                    sx={{ fontSize: '1.2rem' }}
                >
                  {UNIT_OPTIONS.map(option => (
                      <MenuItem key={option.value} value={option.value} sx={{ fontSize: '1.2rem' }}>
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

export default ProductEditDialog;