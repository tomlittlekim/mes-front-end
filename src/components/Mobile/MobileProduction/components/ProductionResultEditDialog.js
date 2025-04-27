import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  IconButton,
  Box,
  Stack,
  Chip,
  Divider,
  Alert,
  Snackbar,
  Paper
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ko from 'date-fns/locale/ko';
import { format } from 'date-fns';

const ProductionResultEditDialog = ({
  open,
  onClose,
  onSave,
  onChange,
  productionResult,
  editMode,
  productOptions,
  equipmentOptions,
  warehouseOptions,
  onOpenDefectInfo,
  defectInfos,
  getAccentColor,
  onStartProduction,  // 생산 시작 이벤트 핸들러
  onEndProduction     // 생산 종료 이벤트 핸들러
}) => {
  const [localResult, setLocalResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [productionState, setProductionState] = useState('IDLE'); // IDLE, STARTED, ENDED
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });

  // 생산실적 수정 시 데이터 초기화 및 설정
  useEffect(() => {
    if (open && productionResult) {
      // 데이터 로깅
      console.log('제품 목록 데이터:', productOptions?.length || 0, '개 항목');
      console.log('설비 목록 데이터:', equipmentOptions?.length || 0, '개 항목');
      console.log('창고 목록 데이터:', warehouseOptions?.length || 0, '개 항목');
      
      // 날짜 문자열을 Date 객체로 변환
      const result = {
        ...productionResult,
        prodStartTime: productionResult.prodStartTime ? new Date(productionResult.prodStartTime) : null,
        prodEndTime: productionResult.prodEndTime ? new Date(productionResult.prodEndTime) : null
      };
      setLocalResult(result);
      setErrors({});
      setSnackbar({ open: false, message: '', severity: 'error' });
      
      // 생산 상태 설정
      if (result.prodStartTime && result.prodEndTime) {
        setProductionState('ENDED');
      } else if (result.prodStartTime) {
        setProductionState('STARTED');
      } else {
        setProductionState('IDLE');
      }
    }
  }, [open, productionResult, productOptions, equipmentOptions, warehouseOptions]);

  // Snackbar 닫기 핸들러
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // 생산 수량 계산 (양품 + 불량)
  const totalQuantity = useMemo(() => {
    if (!localResult) return 0;
    const goodQty = parseFloat(localResult.goodQty) || 0;
    const defectQty = parseFloat(localResult.defectQty) || 0;
    return goodQty + defectQty;
  }, [localResult?.goodQty, localResult?.defectQty]);

  // 입력 필드 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalResult(prev => ({ ...prev, [name]: value }));
    
    // 유효성 검사 오류 초기화
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // 날짜 변경 핸들러
  const handleDateChange = (name, date) => {
    setLocalResult(prev => ({ ...prev, [name]: date }));
  };

  // 생산 시작 버튼 핸들러
  const handleStartProduction = async () => {
    if (!localResult.productId) {
      setErrors({
        ...errors,
        productId: '제품을 선택해주세요.'
      });
      return;
    }

    if (!localResult.warehouseId) {
      setErrors({
        ...errors,
        warehouseId: '창고를 선택해주세요.'
      });
      return;
    }

    const now = new Date();
    setLocalResult(prev => ({
      ...prev,
      prodStartTime: now,
      prodEndTime: null
    }));
    setProductionState('STARTED');

    // 생산시작 기록을 서버에 저장
    if (onStartProduction) {
      try {
        const prodResultId = await onStartProduction({
          ...localResult,
          prodStartTime: now,
          prodEndTime: null
        });
        
        // 백엔드에서 반환된 생산실적 ID를 설정
        if (prodResultId) {
          console.log('생산실적 ID 할당:', prodResultId);
          setLocalResult(prev => ({
            ...prev,
            prodResultId: prodResultId
          }));
        }
      } catch (error) {
        console.error('생산 시작 기록 저장 실패:', error);
      }
    }
  };

  // 생산 종료 버튼 핸들러
  const handleEndProduction = () => {
    const now = new Date();
    console.log('생산 종료 시간 설정:', now);
    
    setLocalResult(prev => ({
      ...prev,
      prodEndTime: now
    }));
    setProductionState('ENDED');

    // 생산종료 콜백 실행
    if (onEndProduction) {
      onEndProduction(now);
    }
  };

  // 불량정보 버튼 클릭 핸들러
  const handleOpenDefectInfo = () => {
    // 불량정보 다이얼로그 열기 전에 오류 상태를 초기화
    if (errors.defectInfos) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.defectInfos;
        return newErrors;
      });
    }
    
    // 불량정보 다이얼로그 열기
    onOpenDefectInfo();
  };

  // 유효성 검사
  const validate = () => {
    const newErrors = {};
    
    if (!localResult.productId) {
      newErrors.productId = '제품을 선택해주세요.';
    }
    
    if (!localResult.warehouseId) {
      newErrors.warehouseId = '창고를 선택해주세요.';
    }
    
    if (productionState !== 'ENDED') {
      newErrors.productionState = '생산을 완료해야 저장할 수 있습니다.';
    }
    
    if (!localResult.goodQty && localResult.goodQty !== 0) {
      newErrors.goodQty = '양품 수량을 입력해주세요.';
    }
    
    if (!localResult.defectQty && localResult.defectQty !== 0) {
      newErrors.defectQty = '불량 수량을 입력해주세요.';
    }
    
    // 불량 수량이 0보다 크면 불량 정보가 필요
    if (parseFloat(localResult.defectQty) > 0 && (!defectInfos || defectInfos.length === 0)) {
      newErrors.defectInfos = '불량 수량이 있는 경우 불량 정보를 입력해야 합니다.';
    }

    // 불량정보 수량의 합과 불량수량이 일치하는지 검증
    if (parseFloat(localResult.defectQty) > 0 && defectInfos && defectInfos.length > 0) {
      const totalDefectInfoQty = defectInfos.reduce((sum, info) => sum + (parseFloat(info.defectQty) || 0), 0);
      // 소수점 비교 시 오차 허용
      const diff = Math.abs(totalDefectInfoQty - parseFloat(localResult.defectQty));
      if (diff > 0.001) {
        newErrors.defectInfos = `불량 수량(${localResult.defectQty})과 불량정보 수량의 합(${totalDefectInfoQty})이 일치해야 합니다.`;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 저장 버튼 핸들러
  const handleSave = () => {
    if (!validate()) {
      // 유효성 검사 실패
      setSnackbar({
        open: true,
        message: '입력값을 확인해주세요.',
        severity: 'error'
      });
      return;
    }
    
    if (onSave) {
      onSave(localResult);
    }
  };

  // 불량정보 요약 렌더링
  const renderDefectSummary = () => {
    if (!defectInfos || defectInfos.length === 0) {
      return null;
    }
    
    // 불량수량 합계 계산
    const totalDefectQty = defectInfos.reduce((sum, info) => sum + (parseFloat(info.defectQty) || 0), 0);
    
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" fontWeight="bold" color="text.secondary">
          등록된 불량정보 ({defectInfos.length}건, 총 {totalDefectQty}개)
        </Typography>
      </Box>
    );
  };

  // 날짜 포맷팅 함수
  const formatDateTime = (dateObj) => {
    if (!dateObj) return '-';
    try {
      // 한국 시간 형식으로 표시
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      const hours = String(dateObj.getHours()).padStart(2, '0');
      const minutes = String(dateObj.getMinutes()).padStart(2, '0');
      
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    } catch (e) {
      return '-';
    }
  };

  if (!localResult) return null;

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
        {editMode ? '생산실적 수정' : '생산실적 등록'}
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
            <FormControl fullWidth required variant="outlined" size="medium" error={!!errors.productId}>
              <InputLabel id="product-select-label" sx={{ fontSize: '1.2rem' }}>제품</InputLabel>
              <Select
                labelId="product-select-label"
                name="productId"
                value={localResult.productId || ""}
                onChange={handleChange}
                label="제품"
                disabled={editMode && localResult.prodStartTime}
                sx={{ fontSize: '1.2rem', py: 0.5 }}
              >
                <MenuItem value="" sx={{ fontSize: '1.2rem' }}>
                  <em>선택하세요</em>
                </MenuItem>
                {productOptions && productOptions.map((product) => (
                  <MenuItem key={product.systemMaterialId} value={product.systemMaterialId} sx={{ fontSize: '1.2rem' }}>
                    {product.userMaterialId} ({product.materialName})
                  </MenuItem>
                ))}
              </Select>
              {errors.productId && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  {errors.productId}
                </Typography>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth required variant="outlined" size="medium" error={!!errors.warehouseId}>
              <InputLabel id="warehouse-select-label" sx={{ fontSize: '1.2rem' }}>창고</InputLabel>
              <Select
                labelId="warehouse-select-label"
                name="warehouseId"
                value={localResult.warehouseId || ""}
                onChange={handleChange}
                label="창고"
                disabled={editMode && localResult.prodStartTime}
                sx={{ fontSize: '1.2rem', py: 0.5 }}
              >
                <MenuItem value="" sx={{ fontSize: '1.2rem' }}>
                  <em>선택하세요</em>
                </MenuItem>
                {warehouseOptions && warehouseOptions.map((warehouse) => (
                  <MenuItem key={warehouse.value} value={warehouse.value} sx={{ fontSize: '1.2rem' }}>
                    {warehouse.label}
                  </MenuItem>
                ))}
              </Select>
              {errors.warehouseId && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  {errors.warehouseId}
                </Typography>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth variant="outlined" size="medium" error={!!errors.equipmentId}>
              <InputLabel id="equipment-select-label" sx={{ fontSize: '1.2rem' }}>설비</InputLabel>
              <Select
                labelId="equipment-select-label"
                name="equipmentId"
                value={localResult.equipmentId || ""}
                onChange={handleChange}
                label="설비"
                disabled={editMode && localResult.prodStartTime}
                sx={{ fontSize: '1.2rem', py: 0.5 }}
              >
                <MenuItem value="" sx={{ fontSize: '1.2rem' }}>
                  <em>선택하세요</em>
                </MenuItem>
                {equipmentOptions && equipmentOptions.map((equipment) => (
                  <MenuItem key={equipment.value} value={equipment.value} sx={{ fontSize: '1.2rem' }}>
                    {equipment.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              border: '1px solid', 
              borderColor: 'divider', 
              borderRadius: 1,
              p: 2,
              mb: 1
            }}>
              <Box sx={{ mb: 1, display: 'flex', justifyContent: 'center' }}>
                {productionState === 'ENDED' ? (
                  <Chip 
                    label="생산 완료"
                    color="success"
                    size="medium"
                    sx={{ fontSize: '1.1rem', py: 1 }}
                  />
                ) : (
                  <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem', fontWeight: 'medium' }}>
                    {productionState === 'IDLE' ? '대기 중' : '생산 진행 중'}
                  </Typography>
                )}
              </Box>
              
              {productionState === 'IDLE' && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<PlayArrowIcon sx={{ fontSize: '1.8rem' }} />}
                  onClick={handleStartProduction}
                  sx={{ 
                    bgcolor: getAccentColor(),
                    py: 2,
                    height: '60px',
                    fontSize: '1.3rem'
                  }}
                  disabled={!localResult.productId || !localResult.warehouseId}
                  fullWidth
                >
                  생산 시작
                </Button>
              )}
              {productionState === 'STARTED' && (
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<StopIcon sx={{ fontSize: '1.8rem' }} />}
                  onClick={handleEndProduction}
                  sx={{ 
                    py: 2,
                    height: '60px',
                    fontSize: '1.3rem'
                  }}
                  fullWidth
                >
                  생산 종료
                </Button>
              )}
            </Box>
          </Grid>

          <Grid item xs={12} sx={{ mb: 1 }}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" fontSize="0.9rem">생산시작일시</Typography>
                  <Typography variant="body1" fontSize="1.1rem" fontWeight="medium">
                    {formatDateTime(localResult.prodStartTime)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" fontSize="0.9rem">생산종료일시</Typography>
                  <Typography variant="body1" fontSize="1.1rem" fontWeight="medium">
                    {formatDateTime(localResult.prodEndTime)}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, fontSize: '1.2rem' }}>
              생산 수량 정보
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="양품 수량"
                  name="goodQty"
                  type="number"
                  value={localResult.goodQty || ''}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  error={!!errors.goodQty}
                  helperText={errors.goodQty}
                  disabled={productionState !== 'ENDED'}
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
                <TextField
                  label="불량 수량"
                  name="defectQty"
                  type="number"
                  value={localResult.defectQty || ''}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  error={!!errors.defectQty || !!errors.defectInfos}
                  helperText={errors.defectQty || errors.defectInfos}
                  disabled={productionState !== 'ENDED'}
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
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 1, bgcolor: 'action.hover' }}>
                  <Typography variant="body2" color="text.secondary" fontSize="0.9rem">생산 수량 (합계)</Typography>
                  <Typography variant="h6" fontWeight="bold" color={getAccentColor()}>
                    {totalQuantity} {localResult.unit ? `${localResult.unit}` : '개'}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Grid>

          {parseFloat(localResult.defectQty) > 0 && (
            <Grid item xs={12}>
              <Button
                variant="outlined"
                color="error"
                fullWidth
                onClick={handleOpenDefectInfo}
                disabled={productionState !== 'ENDED'}
                sx={{ fontSize: '1.2rem', py: 1.5 }}
              >
                불량정보 등록
              </Button>
              {renderDefectSummary()}
            </Grid>
          )}
        </Grid>

        {Object.keys(errors).length > 0 && (
          <Alert severity="error" sx={{ mt: 2 }}>
            입력 내용에 오류가 있습니다. 수정 후 다시 시도해주세요.
          </Alert>
        )}

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
        <Button
          variant="contained"
          onClick={handleSave}
          startIcon={<SaveIcon sx={{ fontSize: '1.5rem' }} />}
          disabled={productionState !== 'ENDED' || Object.keys(errors).length > 0}
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