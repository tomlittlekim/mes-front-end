import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  IconButton,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Paper,
  Card,
  CardContent,
  Fab,
  InputAdornment,
  Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import { NEW_DEFECT_INFO } from '../ProductionResultConstants';

// 상위 컴포넌트에서 총 불량수량 제한값을 전달받음
const DefectInfoDialog = ({
  open,
  onClose,
  defectInfos = [],
  onSave,
  getAccentColor,
  maxDefectQty = null // 최대 불량수량 (생산실적의 불량수량)
}) => {
  const [localDefectInfos, setLocalDefectInfos] = useState([]);
  const [currentDefectInfo, setCurrentDefectInfo] = useState({ ...NEW_DEFECT_INFO });
  const [errors, setErrors] = useState({});
  const [isAdding, setIsAdding] = useState(false);

  // 다이얼로그가 열릴 때 데이터 설정
  useEffect(() => {
    if (open) {
      setLocalDefectInfos([...defectInfos]);
      setCurrentDefectInfo({ ...NEW_DEFECT_INFO });
      setErrors({});
      setIsAdding(false);
    }
  }, [open, defectInfos]);

  // 현재 등록된 불량수량 총합 계산
  const totalDefectQty = useMemo(() => {
    return localDefectInfos.reduce((sum, info) => sum + (parseFloat(info.defectQty) || 0), 0);
  }, [localDefectInfos]);

  // 추가 가능한 불량수량 계산
  const remainingDefectQty = useMemo(() => {
    if (maxDefectQty === null) return null; // 제한이 없는 경우
    return Math.max(0, maxDefectQty - totalDefectQty);
  }, [maxDefectQty, totalDefectQty]);

  // 불량정보 입력 핸들러
  const handleDefectInfoChange = (e) => {
    const { name, value } = e.target;
    setCurrentDefectInfo(prev => ({
      ...prev,
      [name]: name === 'defectQty' ? parseFloat(value) || 0 : value
    }));
    
    // 유효성 검사 오류 초기화
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // 불량정보 추가 모드 토글
  const toggleAddMode = () => {
    setIsAdding(!isAdding);
    setCurrentDefectInfo({ ...NEW_DEFECT_INFO });
    setErrors({});
  };

  // 불량정보 추가
  const handleAddDefectInfo = () => {
    // 유효성 검사
    const newErrors = {};
    
    if (!currentDefectInfo.defectQty && currentDefectInfo.defectQty !== 0) {
      newErrors.defectQty = '불량 수량을 입력해주세요.';
    } else if (currentDefectInfo.defectQty <= 0) {
      newErrors.defectQty = '불량 수량은 0보다 커야 합니다.';
    }
    
    // 최대 불량수량 검사
    if (maxDefectQty !== null) {
      const newTotal = totalDefectQty + (parseFloat(currentDefectInfo.defectQty) || 0);
      if (newTotal > maxDefectQty) {
        newErrors.defectQty = `총 불량수량(${newTotal})이 생산실적의 불량수량(${maxDefectQty})을 초과할 수 없습니다.`;
      }
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // 불량정보 추가
    const updatedDefectInfo = {
      ...currentDefectInfo,
      defectReason: currentDefectInfo.resultInfo || '', // defectReason 필드도 설정해서 호환성 유지
    };

    // 불량정보 추가
    setLocalDefectInfos(prev => [...prev, updatedDefectInfo]);
    setCurrentDefectInfo({ ...NEW_DEFECT_INFO });
    setIsAdding(false);
  };

  // 불량정보 삭제
  const handleDeleteDefectInfo = (index) => {
    setLocalDefectInfos(prev => prev.filter((_, i) => i !== index));
  };

  // 불량정보 저장
  const handleSave = () => {
    // 최대 불량수량 검사
    if (maxDefectQty !== null && totalDefectQty > maxDefectQty) {
      setErrors({
        total: `총 불량수량(${totalDefectQty})이 생산실적의 불량수량(${maxDefectQty})을 초과할 수 없습니다.`
      });
      return;
    }
    
    onSave(localDefectInfos);
    onClose();
  };

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
        불량정보 등록
        <IconButton
          size="large"
          onClick={onClose}
          sx={{ color: 'white' }}
        >
          <CloseIcon sx={{ fontSize: '1.8rem' }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 5, px: 3, mt: 2 }}>
        {/* 수량 정보 요약 */}
        {maxDefectQty !== null && (
          <Box sx={{ mb: 3 }}>
            <Alert severity="info" variant="outlined" sx={{ fontSize: '1.1rem' }}>
              불량수량 정보: {totalDefectQty} / {maxDefectQty} 
              {remainingDefectQty !== null && remainingDefectQty > 0 && ` (추가 가능: ${remainingDefectQty})`}
            </Alert>
          </Box>
        )}
        
        {/* 오류 메시지 */}
        {errors.total && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.total}
          </Alert>
        )}

        {/* 불량정보 목록 */}
        {localDefectInfos.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.2rem' }}>
              등록된 불량정보가 없습니다
            </Typography>
          </Box>
        ) : (
          <List sx={{ mb: 3 }}>
            {localDefectInfos.map((defectInfo, index) => (
              <Card 
                key={index} 
                variant="outlined" 
                sx={{ mb: 2, borderRadius: 1.5 }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Grid container spacing={1}>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>불량수량</Typography>
                      <Typography variant="body1" color="error" sx={{ fontSize: '1.1rem', fontWeight: 'medium' }}>
                        {defectInfo.defectQty || 0}
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>불량 요인</Typography>
                      <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>{defectInfo.defectCause || '-'}</Typography>
                    </Grid>
                    <Grid item xs={12} sx={{ mt: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>불량 정보</Typography>
                      <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>{defectInfo.resultInfo || '-'}</Typography>
                    </Grid>
                  </Grid>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <IconButton 
                      onClick={() => handleDeleteDefectInfo(index)}
                      color="error"
                      size="large"
                      sx={{ padding: '8px' }}
                    >
                      <DeleteIcon sx={{ fontSize: '1.5rem' }} />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </List>
        )}

        {/* 불량정보 추가 폼 */}
        {isAdding ? (
          <Box sx={{ mt: 2, mb: 4 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', fontSize: '1.2rem' }}>
              새 불량정보 등록
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="불량수량"
                  name="defectQty"
                  type="number"
                  value={currentDefectInfo.defectQty || ''}
                  onChange={handleDefectInfoChange}
                  fullWidth
                  variant="outlined"
                  required
                  error={!!errors.defectQty}
                  helperText={errors.defectQty}
                  InputProps={{
                    inputProps: { min: 1 },
                    sx: { fontSize: '1.2rem', py: 0.5 }
                  }}
                  InputLabelProps={{
                    sx: { fontSize: '1.2rem' }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="불량 요인"
                  name="defectCause"
                  value={currentDefectInfo.defectCause || ''}
                  onChange={handleDefectInfoChange}
                  fullWidth
                  variant="outlined"
                  placeholder="불량이 발생한 원인을 입력하세요"
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
                  label="불량 정보"
                  name="resultInfo"
                  value={currentDefectInfo.resultInfo || ''}
                  onChange={handleDefectInfoChange}
                  fullWidth
                  variant="outlined"
                  multiline
                  rows={3}
                  placeholder="불량에 대한 상세 정보를 입력하세요"
                  InputProps={{
                    sx: { fontSize: '1.2rem' }
                  }}
                  InputLabelProps={{
                    sx: { fontSize: '1.2rem' }
                  }}
                />
              </Grid>
            </Grid>
            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button
                variant="contained"
                onClick={handleAddDefectInfo}
                fullWidth
                sx={{ 
                  bgcolor: getAccentColor(), 
                  fontSize: '1.2rem',
                  py: 1.5,
                  height: '50px'
                }}
              >
                추가
              </Button>
              <Button
                variant="outlined"
                onClick={toggleAddMode}
                fullWidth
                sx={{ fontSize: '1.2rem', py: 1.5, height: '50px' }}
              >
                취소
              </Button>
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={toggleAddMode}
              sx={{ 
                bgcolor: getAccentColor(), 
                fontSize: '1.2rem',
                py: 1.5,
                px: 4,
                height: '50px'
              }}
            >
              불량정보 추가
            </Button>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
        <Button
          variant="contained"
          onClick={handleSave}
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

export default DefectInfoDialog; 