import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { useGraphQL } from '../../../../apollo/useGraphQL';
import { GET_INITIAL_CODES_QUERY } from '../../../../graphql-queries/common/codeQueries';

// SweetAlert2 z-index 설정 (Material-UI Dialog보다 높게)
const swalConfig = {
  customClass: {
    container: 'swal-container-high-z-index'
  },
  didOpen: () => {
    // SweetAlert2 컨테이너의 z-index를 Material-UI Dialog보다 높게 설정
    const swalContainer = document.querySelector('.swal2-container');
    if (swalContainer) {
      swalContainer.style.zIndex = '9999';
    }
    // SweetAlert2 팝업의 z-index도 설정
    const swalPopup = document.querySelector('.swal2-popup');
    if (swalPopup) {
      swalPopup.style.zIndex = '10000';
    }
    // 백드롭도 설정
    const swalBackdrop = document.querySelector('.swal2-backdrop-show');
    if (swalBackdrop) {
      swalBackdrop.style.zIndex = '9998';
    }
  },
  willClose: () => {
    // 모달이 닫힐 때 z-index 정리 (선택사항)
    const swalContainer = document.querySelector('.swal2-container');
    if (swalContainer) {
      swalContainer.style.zIndex = '';
    }
  }
};

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
  const { executeQuery } = useGraphQL();

  // executeQuery를 ref로 저장하여 의존성 문제 해결
  const executeQueryRef = useRef(executeQuery);
  executeQueryRef.current = executeQuery;

  // 상태 관리
  const [defectInfoList, setDefectInfoList] = useState([]);
  const [currentDefect, setCurrentDefect] = useState({
    defectQty: 0,
    defectType: '',
    resultInfo: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [editIndex, setEditIndex] = useState(-1);
  const [totalDefectQty, setTotalDefectQty] = useState(0);
  const [isValid, setIsValid] = useState(false);
  const [defectCause, setDefectCause] = useState('');
  const [detailInfo, setDetailInfo] = useState('');
  const [defectTypeOptions, setDefectTypeOptions] = useState([]);

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

  // 불량유형 데이터 로드 함수를 useCallback으로 안정화
  const loadDefectTypes = useCallback(async () => {
    try {
      const response = await executeQueryRef.current({
        query: GET_INITIAL_CODES_QUERY,
        variables: { codeClassId: 'DEFECT_TYPE' }
      });
      
      if (response.data?.getInitialCodes) {
        const options = response.data.getInitialCodes.map(code => ({
          value: code.codeId,
          label: code.codeName,
          desc: code.codeDesc
        }));
        setDefectTypeOptions(options);
      }
    } catch (error) {
      console.error('불량유형 데이터 로드 실패:', error);
      Swal.fire({
        title: '데이터 로드 실패',
        text: '불량유형 데이터를 불러오는데 실패했습니다.',
        icon: 'error',
        confirmButtonText: '확인',
        ...swalConfig
      });
    }
  }, []); // 의존성 배열을 비워서 함수를 안정화

  // 불량유형 데이터 로드
  useEffect(() => {
    if (open) {
      loadDefectTypes();
    }
  }, [open, loadDefectTypes]);

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
        item.defectType
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
        confirmButtonText: '확인',
        ...swalConfig
      });
      return;
    }

    if (!currentDefect.defectType) {
      Swal.fire({
        title: '입력 오류',
        text: '불량유형을 입력해주세요.',
        icon: 'warning',
        confirmButtonText: '확인',
        ...swalConfig
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
        confirmButtonText: '확인',
        ...swalConfig
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
      defectType: '',
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
      cancelButtonText: '취소',
      ...swalConfig
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
            defectType: '',
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
        cancelButtonText: '취소',
        ...swalConfig
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
        confirmButtonText: '확인',
        ...swalConfig
      });
      return;
    }

    // 작업지시 정보 또는 생산실적 정보 가져오기 (작업지시 없이도 동작하도록 수정)
    const workOrderId = selectedWorkOrder?.workOrderId || productionResult?.workOrderId || null;
    const productId = productionResult?.productId || selectedWorkOrder?.productId || null;

    // 불량정보 리스트 서버 형식으로 변환
    const defectInfos = defectInfoList.map(item => ({
      workOrderId: workOrderId,
      prodResultId: productionResult?.prodResultId || null,
      productId: productId,
      defectQty: Number(item.defectQty),
      defectCause: item.defectType,
      resultInfo: item.resultInfo,
      state: 'NEW',
      flagActive: true
    }));
    
    if (defectInfos.length === 0 && productionResult?.defectQty > 0) {
      Swal.fire({
        title: '입력 오류',
        text: '불량수량이 입력되었으나 불량정보가 없습니다. 불량정보를 입력해주세요.',
        icon: 'warning',
        confirmButtonText: '확인',
        ...swalConfig
      });
      return;
    }

    // 부모 컴포넌트의 저장 함수 호출
    if (typeof onSave === 'function') {
      onSave(defectInfos);
    } else {
      console.error('onSave 함수가 전달되지 않았습니다.');
      Swal.fire({
        title: '저장 실패',
        text: '저장 기능이 정의되지 않았습니다. 관리자에게 문의하세요.',
        icon: 'error',
        confirmButtonText: '확인',
        ...swalConfig
      });
    }
  };

  // 작업지시 정보 또는 생산실적 정보 가져오기
  const productInfo = {
    workOrderId: selectedWorkOrder?.workOrderId || productionResult?.workOrderId || null,
    productId: productionResult?.productId || selectedWorkOrder?.productId || null
  };

  // 입력 필드 초기화 함수 수정
  const resetInputs = useCallback(() => {
    setDefectCause('');
    setDetailInfo('');
  }, []);

  // 불량원인 입력 핸들러
  const handleDefectCauseChange = e => {
    setDefectCause(e.target.value);
  };

  // 상세내용 입력 핸들러
  const handleDetailInfoChange = e => {
    setDetailInfo(e.target.value);
  };

  // 불량유형 코드를 이름으로 변환하는 함수
  const getDefectTypeName = (defectTypeCode) => {
    const option = defectTypeOptions.find(opt => opt.value === defectTypeCode);
    return option ? option.label : defectTypeCode;
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
          sx={{
            zIndex: 1300 // Material-UI Dialog 기본 z-index 명시적 설정
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
                  <Grid item xs={12} sm={3}>
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
                    <FormControl fullWidth size="small">
                      <InputLabel id="defect-type-label">불량유형</InputLabel>
                      <Select
                          labelId="defect-type-label"
                          name="defectType"
                          value={currentDefect.defectType}
                          label="불량유형"
                          onChange={handleInputChange}
                      >
                        <MenuItem value="">
                          <em>선택하세요</em>
                        </MenuItem>
                        {defectTypeOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    <TextField
                        name="resultInfo"
                        label="상세내용(선택)"
                        value={currentDefect.resultInfo}
                        onChange={handleInputChange}
                        fullWidth
                        size="small"
                    />
                  </Grid>
                </Grid>
                <Box display="flex" justifyContent="flex-end" mt={2}>
                  <Button
                      variant="contained"
                      color={editMode ? "primary" : "success"}
                      onClick={handleAddDefect}
                      size="medium"
                      sx={{
                        minWidth: '80px',
                        padding: '6px 16px',
                        fontWeight: 'medium'
                      }}
                  >
                    {editMode ? '수정' : '추가'}
                  </Button>
                </Box>
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
                        <TableCell align="center" width="30%">불량유형</TableCell>
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
                                <TableCell>{getDefectTypeName(defect.defectType)}</TableCell>
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