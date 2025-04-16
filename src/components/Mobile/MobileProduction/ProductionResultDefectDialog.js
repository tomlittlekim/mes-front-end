import React, { useState } from 'react';
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
  TextField,
  IconButton,
  Typography,
  Box,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  useTheme
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import { DEFECT_TYPES } from './ProductionResultConstants';
import Swal from 'sweetalert2';

const ProductionResultDefectDialog = ({
  open,
  onClose,
  onSave,
  defectInfos,
  setDefectInfos,
  selectedProduction,
  getAccentColor
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  // 신규 불량정보 폼
  const [currentDefect, setCurrentDefect] = useState({
    defectType: '',
    defectQty: 0,
    defectCause: '',
    resultInfo: ''
  });

  // 불량정보가 생산실적의 불량수량과 일치하는지 확인
  const isDefectInfoValid = () => {
    if (selectedProduction?.defectQty <= 0) return true; // 불량이 없으면 유효함

    if (defectInfos.length === 0) return false; // 불량이 있는데 정보가 없으면 유효하지 않음

    // 총 불량수량 계산
    const totalDefectInfoQty = defectInfos.reduce((sum, item) => sum + (Number(item.defectQty) || 0), 0);

    // 총 불량수량이 생산실적의 불량수량과 같은지 확인
    return Math.abs(totalDefectInfoQty - selectedProduction.defectQty) < 0.001;
  };

  // 입력 폼 변경 핸들러
  const handleDefectInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'defectQty') {
      // 불량수량은 숫자만 허용하고 음수는 허용하지 않음
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < 0) return;

      setCurrentDefect({ ...currentDefect, [name]: numValue });
    } else {
      setCurrentDefect({ ...currentDefect, [name]: value });
    }
  };

  // 불량정보 추가 핸들러
  const handleAddDefect = () => {
    // 유효성 검증
    if (!currentDefect.defectType) {
      Swal.fire({
        title: '입력 오류',
        text: '불량유형을 선택해주세요.',
        icon: 'warning',
        confirmButtonText: '확인'
      });
      return;
    }

    if (!currentDefect.defectQty || currentDefect.defectQty <= 0) {
      Swal.fire({
        title: '입력 오류',
        text: '불량수량은 0보다 커야 합니다.',
        icon: 'warning',
        confirmButtonText: '확인'
      });
      return;
    }

    if (!currentDefect.defectCause) {
      Swal.fire({
        title: '입력 오류',
        text: '불량원인을 입력해주세요.',
        icon: 'warning',
        confirmButtonText: '확인'
      });
      return;
    }

    // 총 불량수량 확인
    const existingTotal = defectInfos.reduce((sum, item) => sum + (Number(item.defectQty) || 0), 0);
    const newTotal = existingTotal + Number(currentDefect.defectQty);

    if (newTotal > selectedProduction.defectQty) {
      Swal.fire({
        title: '불량수량 초과',
        text: `총 불량수량(${selectedProduction.defectQty})을 초과할 수 없습니다. 현재 입력된 총량: ${newTotal}`,
        icon: 'warning',
        confirmButtonText: '확인'
      });
      return;
    }

    // 새 불량정보 형식으로 변환
    const newDefectInfo = {
      productId: selectedProduction.productId,
      defectQty: Number(currentDefect.defectQty),
      defectType: currentDefect.defectType,
      defectCause: currentDefect.defectCause,
      resultInfo: currentDefect.resultInfo || currentDefect.defectType,
      state: 'NEW',
      flagActive: true
    };

    // 불량정보 배열에 추가
    setDefectInfos([...defectInfos, newDefectInfo]);

    // 입력 필드 초기화
    setCurrentDefect({
      defectType: '',
      defectQty: 0,
      defectCause: '',
      resultInfo: ''
    });
  };

  // 불량정보 삭제 핸들러
  const handleDeleteDefect = (index) => {
    const updatedDefectInfos = [...defectInfos];
    updatedDefectInfos.splice(index, 1);
    setDefectInfos(updatedDefectInfos);
  };

  return (
      <Dialog
          open={open}
          onClose={onClose}
          fullWidth
          maxWidth="md"
          PaperProps={{
            sx: {
              minHeight: '70vh'
            }
          }}
      >
        <DialogTitle sx={{
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: getAccentColor(),
          color: 'white'
        }}>
          <Typography variant="h6" component="div">
            불량정보 등록
          </Typography>
          <IconButton
              onClick={onClose}
              sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* 생산실적 정보 */}
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 2, mb: 3, bgcolor: isDarkMode ? 'rgba(66, 66, 66, 0.2)' : 'rgba(240, 240, 240, 0.5)' }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  생산실적 정보
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2">
                      <strong>제품:</strong> {selectedProduction?.productName || ''}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2">
                      <strong>설비:</strong> {selectedProduction?.equipmentName || ''}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2">
                      <strong>불량수량:</strong> {selectedProduction?.defectQty || 0}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* 불량정보 입력 폼 */}
            <Grid item xs={12}>
              <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  불량정보 추가
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel id="defect-type-label">불량유형</InputLabel>
                      <Select
                          labelId="defect-type-label"
                          name="defectType"
                          value={currentDefect.defectType}
                          onChange={handleDefectInputChange}
                          label="불량유형"
                      >
                        {DEFECT_TYPES.map(option => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <TextField
                        name="defectQty"
                        label="불량수량"
                        type="number"
                        value={currentDefect.defectQty}
                        onChange={handleDefectInputChange}
                        fullWidth
                        size="small"
                        InputProps={{ inputProps: { min: 0 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                        name="defectCause"
                        label="불량원인"
                        value={currentDefect.defectCause}
                        onChange={handleDefectInputChange}
                        fullWidth
                        size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                        name="resultInfo"
                        label="상세내용(선택)"
                        value={currentDefect.resultInfo}
                        onChange={handleDefectInputChange}
                        fullWidth
                        size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={1} display="flex" alignItems="center" justifyContent="center">
                    <Button
                        variant="contained"
                        color="success"
                        onClick={handleAddDefect}
                        startIcon={<AddIcon />}
                        sx={{
                          minWidth: '80px',
                          height: '36px',
                          fontWeight: 'medium',
                          bgcolor: getAccentColor()
                        }}
                    >
                      추가
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* 불량정보 목록 */}
            <Grid item xs={12}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                  불량정보 목록
                </Typography>

                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{
                        bgcolor: isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)'
                      }}>
                        <TableCell align="center" width="8%">번호</TableCell>
                        <TableCell align="center" width="22%">불량유형</TableCell>
                        <TableCell align="center" width="15%">불량수량</TableCell>
                        <TableCell align="center" width="25%">불량원인</TableCell>
                        <TableCell align="center" width="20%">상세내용</TableCell>
                        <TableCell align="center" width="10%">관리</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {defectInfos.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} align="center">
                              <Typography variant="body2" sx={{ py: 2, color: 'text.secondary' }}>
                                등록된 불량정보가 없습니다. 불량정보를 추가해주세요.
                              </Typography>
                            </TableCell>
                          </TableRow>
                      ) : (
                          defectInfos.map((defect, index) => {
                            const defectType = DEFECT_TYPES.find(type => type.value === defect.defectType);
                            return (
                                <TableRow key={index} sx={{
                                  '&:nth-of-type(odd)': {
                                    bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
                                  }
                                }}>
                                  <TableCell align="center">{index + 1}</TableCell>
                                  <TableCell>{defectType ? defectType.label : defect.defectType}</TableCell>
                                  <TableCell align="center">{defect.defectQty}</TableCell>
                                  <TableCell>{defect.defectCause}</TableCell>
                                  <TableCell>{defect.resultInfo || '-'}</TableCell>
                                  <TableCell align="center">
                                    <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => handleDeleteDefect(index)}
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </TableCell>
                                </TableRow>
                            );
                          })
                      )}

                      {/* 합계 행 */}
                      {defectInfos.length > 0 && (
                          <TableRow sx={{
                            bgcolor: isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)'
                          }}>
                            <TableCell colSpan={2} align="right">
                              <Typography variant="subtitle2">합계</Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Typography variant="subtitle2">
                                {defectInfos.reduce((sum, item) => sum + (Number(item.defectQty) || 0), 0)}
                              </Typography>
                            </TableCell>
                            <TableCell colSpan={3} />
                          </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* 검증 상태 표시 */}
                {defectInfos.length > 0 && (
                    <Box mt={2} p={1} sx={{
                      bgcolor: isDefectInfoValid() ?
                          (isDarkMode ? 'rgba(76, 175, 80, 0.1)' : 'rgba(76, 175, 80, 0.1)') :
                          (isDarkMode ? 'rgba(244, 67, 54, 0.1)' : 'rgba(244, 67, 54, 0.1)'),
                      borderRadius: 1,
                      border: `1px solid ${isDefectInfoValid() ?
                          (isDarkMode ? 'rgba(76, 175, 80, 0.5)' : 'rgba(76, 175, 80, 0.5)') :
                          (isDarkMode ? 'rgba(244, 67, 54, 0.5)' : 'rgba(244, 67, 54, 0.5)')}`
                    }}>
                      <Typography variant="body2" color={isDefectInfoValid() ? 'success.main' : 'error.main'}>
                        {isDefectInfoValid() ?
                            '✓ 모든 불량정보가 올바르게 입력되었습니다.' :
                            '✗ 총 불량수량과 등록된 불량정보의 합이 일치해야 합니다.'}
                      </Typography>
                    </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{
          borderTop: `1px solid ${theme.palette.divider}`,
          p: 2,
          justifyContent: 'space-between',
          bgcolor: isDarkMode ? theme.palette.grey[900] : theme.palette.grey[100]
        }}>
          <Typography variant="body2" color={isDefectInfoValid() ? 'success.main' : 'error.main'} sx={{ ml: 2 }}>
            {isDefectInfoValid() ?
                '✓ 저장할 준비가 완료되었습니다.' :
                defectInfos.length === 0 ?
                    '최소 1개 이상의 불량정보를 등록해야 합니다.' :
                    `불량수량 합계가 ${defectInfos.reduce((sum, item) => sum + (Number(item.defectQty) || 0), 0)}/${selectedProduction?.defectQty || 0}입니다.`}
          </Typography>
          <Box>
            <Button onClick={onClose} sx={{ mr: 1 }}>
              취소
            </Button>
            <Button
                onClick={() => onSave(defectInfos)}
                variant="contained"
                color="primary"
                disabled={!isDefectInfoValid()}
                sx={{ bgcolor: getAccentColor() }}
            >
              저장
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
  );
};

export default ProductionResultDefectDialog;