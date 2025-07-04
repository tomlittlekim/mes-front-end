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
  Box,
  useTheme,
  Autocomplete,
  Paper,
  FormHelperText
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ko from "date-fns/locale/ko";
import CloseIcon from '@mui/icons-material/Close';
import Swal from 'sweetalert2';

/**
 * 독립 생산실적 등록 모달 컴포넌트
 * 작업지시 없이 독립적으로 생산실적을 등록하기 위한 모달
 *
 * @param {Object} props - 컴포넌트 속성
 * @returns {JSX.Element}
 */
const IndependentProductionModal = ({
  open,
  onClose,
  onSave,
  equipmentOptions = [],
  productOptions = [],
  warehouseOptions = []
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  // 기본값으로 초기화된 생산실적 데이터
  const [productionData, setProductionData] = useState({
    id: `temp_${Date.now()}`,
    workOrderId: null, // 작업지시 없음
    prodResultId: null, // 서버에서 생성될 ID
    productId: "", // 제품ID (필수)
    goodQty: 0, // 양품수량
    defectQty: 0, // 불량수량
    equipmentId: "", // 설비ID
    warehouseId: "", // 창고 추가
    prodStartTime: null, // 생산시작일시
    prodEndTime: null, // 생산종료일시
    flagActive: true
  });

  // 선택된 제품 정보 상태
  const [selectedProduct, setSelectedProduct] = useState(null);

  // 유효성 검증 상태
  const [isValid, setIsValid] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    productId: false,
    warehouseId: false,
    quantity: false,
    date: false
  });

  // 데이터 변경 시 유효성 검증
  useEffect(() => {
    // 필수 입력 항목 검증
    const productIdValid = !!productionData.productId;
    const warehouseIdValid = !!productionData.warehouseId;

    // 수량이 음수가 아닌지 검증
    const quantityValid =
        (productionData.goodQty >= 0 || productionData.goodQty === "") &&
        (productionData.defectQty >= 0 || productionData.defectQty === "");

    // 양품수량과 불량수량이 모두 0인지 검증
    const totalQuantityValid = 
        (Number(productionData.goodQty) + Number(productionData.defectQty)) > 0;

    // 날짜가 비어있지 않은지, 그리고 시작일시가 종료일시보다 이후인지 검증
    let dateValid = productionData.prodStartTime !== null && productionData.prodEndTime !== null;
    if (dateValid && productionData.prodStartTime && productionData.prodEndTime) {
      dateValid = new Date(productionData.prodStartTime) <= new Date(productionData.prodEndTime);
    }

    // 전체 유효성 상태 업데이트
    setIsValid(productIdValid && quantityValid && dateValid && warehouseIdValid && totalQuantityValid);

    // 유효성 오류 메시지 상태 업데이트
    setValidationErrors({
      productId: !productIdValid,
      quantity: !quantityValid || !totalQuantityValid,
      date: !dateValid,
      warehouseId: !warehouseIdValid
    });
  }, [productionData]);

  // 모달 열릴 때 데이터 초기화
  useEffect(() => {
    if (open) {
      console.log("창고 옵션 목록:", warehouseOptions);
      
      // 현재 시간으로 ID 갱신
      setProductionData({
        id: `temp_${Date.now()}`,
        workOrderId: null,
        prodResultId: null,
        productId: "",
        goodQty: 0,
        defectQty: 0,
        equipmentId: "",
        warehouseId: "",
        prodStartTime: null,
        prodEndTime: null,
        flagActive: true
      });
      setSelectedProduct(null);
      // 유효성 오류 초기화
      setValidationErrors({
        productId: false,
        warehouseId: false,
        quantity: false,
        date: false
      });
    }
  }, [open, warehouseOptions]);

  // 입력 필드 변경 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // 수량 필드에 숫자만 허용
    if (name === 'goodQty' || name === 'defectQty') {
      // 빈 문자열이거나 숫자인 경우만 허용
      if (value === '' || (!isNaN(value) && Number(value) >= 0)) {
        setProductionData({
          ...productionData,
          [name]: value === '' ? 0 : Number(value)
        });
      }
    } else {
      setProductionData({
        ...productionData,
        [name]: value
      });
    }
  };

  // 날짜 필드 변경 핸들러
  const handleDateChange = (name, date) => {
    setProductionData({
      ...productionData,
      [name]: date
    });
  };

  // 제품 선택 핸들러
  const handleProductSelect = (event, newValue) => {
    if (newValue) {
      setSelectedProduct(newValue);
      setProductionData({
        ...productionData,
        productId: newValue.systemMaterialId // 실제 저장되는 값은 systemMaterialId
      });
    } else {
      setSelectedProduct(null);
      setProductionData({
        ...productionData,
        productId: ""
      });
    }
  };

  // 저장 핸들러
  const handleSave = () => {
    // 유효성 검증 실패 시 사용자에게 알림
    if (!isValid) {
      let errorMessage = '';

      if (validationErrors.productId) {
        errorMessage = '제품ID는 필수 입력 항목입니다.\n';
      }
      if (validationErrors.warehouseId) {
        errorMessage += '창고는 필수 입력 항목입니다.\n';
      }
      if (validationErrors.quantity) {
        if (productionData.goodQty < 0 || productionData.defectQty < 0) {
          errorMessage += '양품수량과 불량수량은 0 이상이어야 합니다.\n';
        } else if ((Number(productionData.goodQty) + Number(productionData.defectQty)) <= 0) {
          errorMessage += '양품수량과 불량수량의 합이 1 이상이어야 합니다.\n';
        }
      }
      if (validationErrors.date) {
        errorMessage += '생산종료일시는 생산시작일시 이후여야 합니다.\n';
      }

      Swal.fire({
        title: '입력 오류',
        text: errorMessage,
        icon: 'warning',
        confirmButtonText: '확인'
      });

      return;
    }

    // 저장할 데이터 준비 - 날짜는 Date 객체 그대로 유지
    const dataToSave = {
      ...productionData,
      // 날짜 데이터는 Date 객체 그대로 전달 (그리드에서 올바르게 처리되도록)
      prodStartTime: productionData.prodStartTime,
      prodEndTime: productionData.prodEndTime
    };

    // 부모 컴포넌트의 저장 함수 호출
    if (onSave) {
      onSave(dataToSave);
    }

    // 모달 닫기
    onClose();
  };

  // 닫기 핸들러
  const handleClose = (event, reason) => {
    console.log('handleClose 함수 호출됨', { event, reason });
    
    if (onClose) {
      onClose();
    }
  };

  return (
      <Dialog
          open={open}
          onClose={handleClose}
          fullWidth
          maxWidth="md"
          PaperProps={{
            sx: {
              minHeight: '60vh'
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
            독립 생산실적 등록
          </Typography>
          <IconButton
              onClick={handleClose}
              aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* 안내 메시지 */}
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 2, mb: 2, bgcolor: isDarkMode ? 'rgba(66, 66, 66, 0.2)' : 'rgba(240, 240, 240, 0.5)' }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  독립 생산실적 등록 안내
                </Typography>
                <Typography variant="body2">
                  작업지시 없이 독립적으로 생산실적을 등록하는 화면입니다. 제품ID는 필수 입력 항목입니다.
                </Typography>
              </Paper>
            </Grid>

            {/* 첫 번째 줄: 제품ID만 표시 (전체 너비 사용) */}
            <Grid item xs={12}>
              <Autocomplete
                  value={selectedProduct}
                  onChange={handleProductSelect}
                  options={productOptions || []}
                  getOptionLabel={(option) => `${option.userMaterialId || ''} ${option.materialName ? `(${option.materialName})` : ''}`}
                  isOptionEqualToValue={(option, value) => option.systemMaterialId === value.systemMaterialId}
                  renderOption={(props, option) => (
                      <li {...props} key={option.systemMaterialId}>
                        <Box>
                          <strong>{option.userMaterialId || ''}</strong> - {option.materialName}
                          {option.materialStandard && <span style={{ color: 'gray', marginLeft: '8px' }}>({option.materialStandard})</span>}
                        </Box>
                      </li>
                  )}
                  groupBy={(option) => {
                    // materialType을 한글명으로 표시
                    const typeDisplay = option.materialTypeDisplay || '기타';
                    const categoryDisplay = option.materialCategory || '일반';
                    return `${typeDisplay} > ${categoryDisplay}`;
                  }}
                  renderInput={(params) => (
                      <TextField
                          {...params}
                          label="제품ID (필수)"
                          error={validationErrors.productId}
                          helperText={validationErrors.productId ? "제품ID는 필수 입력 항목입니다" : ""}
                          fullWidth
                          required
                      />
                  )}
                  fullWidth
              />
            </Grid>

            {/* 두 번째 줄: 설비ID와 창고 */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="equipment-label">설비ID</InputLabel>
                <Select
                    labelId="equipment-label"
                    name="equipmentId"
                    value={productionData.equipmentId}
                    onChange={handleInputChange}
                    label="설비ID"
                >
                  <MenuItem value="">선택안함</MenuItem>
                  {equipmentOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                        {option.factoryName && option.lineName ? (
                            <Typography variant="caption" color="textSecondary" style={{ display: 'block' }}>
                              {option.factoryName} &gt; {option.lineName}
                            </Typography>
                        ) : null}
                      </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={validationErrors.warehouseId}>
                <InputLabel id="warehouse-label">창고 (필수)</InputLabel>
                <Select
                    labelId="warehouse-label"
                    name="warehouseId"
                    value={productionData.warehouseId}
                    onChange={handleInputChange}
                    label="창고 (필수)"
                >
                  <MenuItem value="">선택하세요</MenuItem>
                  {warehouseOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                  ))}
                </Select>
                {validationErrors.warehouseId && (
                  <FormHelperText>창고는 필수 입력 항목입니다</FormHelperText>
                )}
              </FormControl>
            </Grid>

            {/* 세 번째 줄: 생산시작일시, 생산종료일시 */}
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
                <DateTimePicker
                    label="생산시작일시 (필수)"
                    value={productionData.prodStartTime}
                    onChange={(newValue) => handleDateChange('prodStartTime', newValue)}
                    format="yyyy-MM-dd HH:mm"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        variant: 'outlined',
                        required: true
                      }
                    }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
                <DateTimePicker
                    label="생산종료일시 (필수)"
                    value={productionData.prodEndTime}
                    onChange={(newValue) => handleDateChange('prodEndTime', newValue)}
                    format="yyyy-MM-dd HH:mm"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        variant: 'outlined',
                        required: true,
                        error: validationErrors.date,
                        helperText: validationErrors.date ? "종료일시는 시작일시 이후여야 합니다" : ""
                      }
                    }}
                />
              </LocalizationProvider>
            </Grid>

            {/* 네 번째 줄: 양품수량, 불량수량 */}
            <Grid item xs={12} sm={6}>
              <TextField
                  name="goodQty"
                  label="양품수량"
                  type="number"
                  value={productionData.goodQty}
                  onChange={handleInputChange}
                  fullWidth
                  InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                  name="defectQty"
                  label="불량수량"
                  type="number"
                  value={productionData.defectQty}
                  onChange={handleInputChange}
                  fullWidth
                  InputProps={{ inputProps: { min: 0 } }}
                  helperText="불량수량이 1 이상인 경우 저장 시 불량정보를 추가로 입력해야 합니다"
              />
            </Grid>

            {/* 생산수량 합계 (계산된 필드) */}
            <Grid item xs={12}>
              <Paper elevation={3} sx={{ p: 2, bgcolor: theme.palette.background.paper }}>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Typography variant="subtitle2">총 생산수량:</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {Number(productionData.goodQty || 0) + Number(productionData.defectQty || 0)}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="subtitle2">양품수량:</Typography>
                    <Typography variant="h6" color="success.main">
                      {Number(productionData.goodQty || 0)}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="subtitle2">불량수량:</Typography>
                    <Typography variant="h6" color={productionData.defectQty > 0 ? "error.main" : "text.primary"}>
                      {Number(productionData.defectQty || 0)}
                    </Typography>
                  </Grid>
                </Grid>
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
                validationErrors.productId ?
                    '제품ID는 필수 입력 항목입니다.' :
                    validationErrors.warehouseId ?
                        '창고는 필수 입력 항목입니다.' :
                        !productionData.prodStartTime ? 
                            '생산시작일시는 필수 입력 항목입니다.' :
                            !productionData.prodEndTime ?
                                '생산종료일시는 필수 입력 항목입니다.' :
                                validationErrors.date ?
                                    '종료일시는 시작일시 이후여야 합니다.' :
                                    '입력 정보를 확인해주세요.'}
          </Typography>
          <Box>
            <Button 
              onClick={handleClose}
              sx={{ mr: 1 }}>
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

export default IndependentProductionModal;