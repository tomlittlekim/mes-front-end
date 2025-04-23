import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Box,
  useTheme
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Swal from 'sweetalert2';

/**
 * 불량정보 등록 모달 컴포넌트
 *
 * @param {Object} props - 컴포넌트 속성
 * @returns {JSX.Element}
 */
const DefectInfoModal = ({
  open,
  onClose,
  onSave,
  productionResult,
  selectedWorkOrder,
  defectTypes = []
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  // 상태 관리
  const [defectInfoList, setDefectInfoList] = useState([]);
  const [currentDefect, setCurrentDefect] = useState({
    defectQty: 0,
    defectCause: '',
    resultInfo: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [editIndex, setEditIndex] = useState(-1);
  const [totalDefectQty, setTotalDefectQty] = useState(0);
  const [isValid, setIsValid] = useState(false);

  // 생산실적 변경 시 초기화
  useEffect(() => {
    if (productionResult) {
      // 불량수량이 0보다 큰 경우에만 모달 표시
      if (productionResult.defectQty && productionResult.defectQty > 0) {
        setTotalDefectQty(productionResult.defectQty);
      } else {
        setTotalDefectQty(0);
      }
      setDefectInfoList([]);
    }
  }, [productionResult]);

  // 불량정보 목록 변경 시 유효성 검증
  useEffect(() => {
    validateDefectInfoList();
  }, [defectInfoList, totalDefectQty]);

  // 불량정보 유효성 검증
  const validateDefectInfoList = () => {
    // 불량정보 목록이 비어있으면 유효하지 않음
    if (defectInfoList.length === 0) {
      setIsValid(false);
      return;
    }

    // 총 불량수량 계산
    const totalDefectInfoQty = defectInfoList.reduce((sum, item) => {
      return sum + (Number(item.defectQty) || 0);
    }, 0) || 0;

    // 총 불량수량이 생산실적의 불량수량과 같은지 확인
    const isQtyValid = Math.abs(totalDefectInfoQty - totalDefectQty) < 0.001;

    // 모든 불량정보가 유효한지 확인
    const isAllValid = defectInfoList.every(item =>
        item.defectQty > 0 &&
        item.defectCause
    );

    setIsValid(isQtyValid && isAllValid);
  };

  // 불량정보 추가 버튼 클릭 핸들러
  const handleAddDefect = () => {
    // 유효성 검증
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
    const existingTotal = defectInfoList.reduce((sum, item, index) =>
        index !== editIndex ? sum + (Number(item.defectQty) || 0) : sum, 0);
    const newTotal = existingTotal + Number(currentDefect.defectQty);

    if (newTotal > totalDefectQty) {
      Swal.fire({
        title: '불량수량 초과',
        text: `총 불량수량(${totalDefectQty})을 초과할 수 없습니다. 현재 입력된 총량: ${newTotal}`,
        icon: 'warning',
        confirmButtonText: '확인'
      });
      return;
    }

    // 편집 모드인 경우 해당 인덱스의 항목 업데이트
    if (editMode && editIndex !== -1) {
      const updatedList = [...defectInfoList];
      updatedList[editIndex] = { ...currentDefect };
      setDefectInfoList(updatedList);
      setEditMode(false);
      setEditIndex(-1);
    } else {
      // 신규 추가
      setDefectInfoList([...defectInfoList, { ...currentDefect }]);
    }

    // 입력 필드 초기화
    setCurrentDefect({
      defectQty: 0,
      defectCause: '',
      resultInfo: ''
    });
  };

  // 불량정보 편집 버튼 클릭 핸들러
  const handleEditDefect = (index) => {
    setCurrentDefect({ ...defectInfoList[index] });
    setEditMode(true);
    setEditIndex(index);
  };

  // 불량정보 삭제 버튼 클릭 핸들러
  const handleDeleteDefect = (index) => {
    Swal.fire({
      title: '삭제 확인',
      text: '해당 불량정보를 삭제하시겠습니까?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: '삭제',
      cancelButtonText: '취소'
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedList = [...defectInfoList];
        updatedList.splice(index, 1);
        setDefectInfoList(updatedList);

        // 편집 중이던 항목이 삭제된 경우 편집 모드 해제
        if (editMode && editIndex === index) {
          setEditMode(false);
          setEditIndex(-1);
          setCurrentDefect({
            defectQty: 0,
            defectCause: '',
            resultInfo: ''
          });
        }
      }
    });
  };

  // 입력 필드 변경 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'defectQty') {
      // 불량수량은 숫자만 허용하고 음수는 허용하지 않음
      // 입력값이 빈 문자열이거나 숫자가 아닌 경우 처리
      if (value === '' || isNaN(value)) {
        setCurrentDefect({ ...currentDefect, [name]: '' });
        return;
      }
      
      // 앞에 0이 붙는 것을 방지(예: 011 -> 11)
      const numValue = parseInt(value, 10);
      if (numValue < 0) return;
      
      setCurrentDefect({ ...currentDefect, [name]: numValue });
    } else {
      setCurrentDefect({ ...currentDefect, [name]: value });
    }
  };

  // 모달 닫기 확인 핸들러
  const handleCloseConfirm = () => {
    // 변경 사항이 있는 경우 확인 대화상자 표시
    if (defectInfoList.length > 0) {
      Swal.fire({
        title: '변경 사항 취소',
        text: '입력한 불량정보가 저장되지 않습니다. 계속하시겠습니까?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: '확인',
        cancelButtonText: '취소'
      }).then((result) => {
        if (result.isConfirmed) {
          // onClose 함수를 직접 호출하여 모달 닫기
          if (typeof onClose === 'function') {
            onClose();
          }
        }
      });
    } else {
      // 변경 사항이 없으면 바로 닫기
      if (typeof onClose === 'function') {
        onClose();
      }
    }
  };

  // 저장 버튼 클릭 핸들러
  const handleSave = () => {
    if (!isValid) {
      let errorMessage = '';

      if (defectInfoList.length === 0) {
        errorMessage = '불량정보를 최소 1개 이상 등록해야 합니다.';
      } else {
        const totalDefectInfoQty = defectInfoList.reduce((sum, item) => sum + (Number(item.defectQty) || 0), 0);

        if (Math.abs(totalDefectInfoQty - totalDefectQty) >= 0.001) {
          errorMessage = `총 불량수량(${totalDefectQty})과 등록된 불량정보의 합(${totalDefectInfoQty})이 일치해야 합니다.`;
        }
      }

      Swal.fire({
        title: '저장 오류',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: '확인'
      });
      return;
    }

    // 작업지시 정보 또는 생산실적 정보 가져오기 (작업지시 없이도 동작하도록 수정)
    const workOrderId = selectedWorkOrder?.workOrderId || productionResult?.workOrderId || null;
    const productId = productionResult?.productId || selectedWorkOrder?.productId || null;

    // 불량정보 리스트 서버 형식으로 변환
    const defectInfos = defectInfoList.map(item => ({
      workOrderId: workOrderId,
      prodResultId: productionResult.prodResultId,
      productId: productId,
      defectQty: Number(item.defectQty),
      defectType: 'OTHER', // 기본값으로 'OTHER' 설정
      defectCause: item.defectCause,
      resultInfo: item.resultInfo || item.defectCause,
      state: 'NEW',
      flagActive: true
    }));

    // 부모 컴포넌트의 저장 함수 호출
    if (typeof onSave === 'function') {
      onSave(defectInfos);
    }
  };

  // 작업지시 정보 또는 생산실적 정보 가져오기
  const productInfo = {
    workOrderId: selectedWorkOrder?.workOrderId || productionResult?.workOrderId || null,
    productId: productionResult?.productId || selectedWorkOrder?.productId || null
  };

  return (
      <Dialog
          open={open}
          onClose={handleCloseConfirm}
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
          bgcolor: isDarkMode ? theme.palette.grey[900] : theme.palette.primary.light,
          color: isDarkMode ? theme.palette.grey[100] : theme.palette.primary.contrastText
        }}>
          <Typography variant="h6" component="div">
            불량정보 등록
          </Typography>
          <IconButton
              onClick={handleCloseConfirm}
              aria-label="close"
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
                  {productInfo.workOrderId && (
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2">
                          <strong>작업지시ID:</strong> {productInfo.workOrderId}
                        </Typography>
                      </Grid>
                  )}
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2">
                      <strong>제품ID:</strong> {productInfo.productId}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2">
                      <strong>불량수량:</strong> {productionResult?.defectQty || 0}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* 불량정보 입력 폼 */}
            <Grid item xs={12}>
              <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  {editMode ? '불량정보 수정' : '불량정보 추가'}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                        name="defectQty"
                        label="불량수량"
                        type="number"
                        value={currentDefect.defectQty}
                        onChange={handleInputChange}
                        fullWidth
                        size="small"
                        InputProps={{ 
                          inputProps: { 
                            min: 0, 
                            step: 1,
                            pattern: '[0-9]*' 
                          } 
                        }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                        name="defectCause"
                        label="불량원인"
                        value={currentDefect.defectCause}
                        onChange={handleInputChange}
                        fullWidth
                        size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                        name="resultInfo"
                        label="상세내용(선택)"
                        value={currentDefect.resultInfo}
                        onChange={handleInputChange}
                        fullWidth
                        size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={1} display="flex" alignItems="center" justifyContent="center">
                    <Button
                        variant="contained"
                        color={editMode ? "primary" : "success"}
                        onClick={handleAddDefect}
                        startIcon={editMode ? <EditIcon /> : <AddIcon />}
                        size="small"
                        sx={{
                          minWidth: '80px',
                          height: '36px',
                          padding: '6px 16px',
                          fontWeight: 'medium'
                        }}
                    >
                      {editMode ? '수정' : '추가'}
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
                        <TableCell align="center" width="10%">번호</TableCell>
                        <TableCell align="center" width="20%">불량수량</TableCell>
                        <TableCell align="center" width="30%">불량원인</TableCell>
                        <TableCell align="center" width="30%">상세내용</TableCell>
                        <TableCell align="center" width="10%">관리</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {defectInfoList.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} align="center">
                              <Typography variant="body2" sx={{ py: 2, color: 'text.secondary' }}>
                                등록된 불량정보가 없습니다. 불량정보를 추가해주세요.
                              </Typography>
                            </TableCell>
                          </TableRow>
                      ) : (
                          defectInfoList.map((defect, index) => (
                              <TableRow key={index} sx={{
                                '&:nth-of-type(odd)': {
                                  bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
                                }
                              }}>
                                <TableCell align="center">{index + 1}</TableCell>
                                <TableCell align="center">{defect.defectQty}</TableCell>
                                <TableCell>{defect.defectCause}</TableCell>
                                <TableCell>{defect.resultInfo || '-'}</TableCell>
                                <TableCell align="center">
                                  <Box display="flex" justifyContent="center">
                                    <IconButton
                                        size="small"
                                        color="primary"
                                        onClick={() => handleEditDefect(index)}
                                        sx={{ mr: 1 }}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => handleDeleteDefect(index)}
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Box>
                                </TableCell>
                              </TableRow>
                          ))
                      )}

                      {/* 합계 행 */}
                      {defectInfoList.length > 0 && (
                          <TableRow sx={{
                            bgcolor: isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)'
                          }}>
                            <TableCell colSpan={1} align="right">
                              <Typography variant="subtitle2">합계</Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Typography variant="subtitle2">
                                {defectInfoList.reduce((sum, item) => sum + (Number(item.defectQty) || 0), 0)}
                              </Typography>
                            </TableCell>
                            <TableCell colSpan={3} />
                          </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* 검증 상태 표시 */}
                {defectInfoList.length > 0 && (
                    <Box mt={2} p={1} sx={{
                      bgcolor: isValid ?
                          (isDarkMode ? 'rgba(76, 175, 80, 0.1)' : 'rgba(76, 175, 80, 0.1)') :
                          (isDarkMode ? 'rgba(244, 67, 54, 0.1)' : 'rgba(244, 67, 54, 0.1)'),
                      borderRadius: 1,
                      border: `1px solid ${isValid ?
                          (isDarkMode ? 'rgba(76, 175, 80, 0.5)' : 'rgba(76, 175, 80, 0.5)') :
                          (isDarkMode ? 'rgba(244, 67, 54, 0.5)' : 'rgba(244, 67, 54, 0.5)')}`
                    }}>
                      <Typography variant="body2" color={isValid ? 'success.main' : 'error.main'}>
                        {isValid ?
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
          <Typography variant="body2" color={isValid ? 'success.main' : 'error.main'} sx={{ ml: 2 }}>
            {isValid ?
                '✓ 저장할 준비가 완료되었습니다.' :
                defectInfoList.length === 0 ?
                    '최소 1개 이상의 불량정보를 등록해야 합니다.' :
                    `불량수량 합계가 ${defectInfoList.reduce((sum, item) => sum + (Number(item.defectQty) || 0), 0)}/${totalDefectQty}입니다.`}
          </Typography>
          <Box>
            <Button onClick={onClose} sx={{ mr: 1 }}>
              취소
            </Button>
            <Button
                onClick={handleSave}
                variant="contained"
                color="primary"
                disabled={!isValid}
            >
              저장
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
  );
};

export default DefectInfoModal;