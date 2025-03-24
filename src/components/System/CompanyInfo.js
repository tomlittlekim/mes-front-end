import React, { useState, useEffect } from 'react';
import './CompanyInfo.css';
import { useForm, Controller } from 'react-hook-form';
import { 
  TextField, 
  Button, 
  Grid, 
  Box, 
  Typography, 
  useTheme,
  Stack,
  Paper,
  Divider,
  InputAdornment,
  Avatar
} from '@mui/material';
import { SearchCondition } from '../Common';
import SaveIcon from '@mui/icons-material/Save';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Swal from 'sweetalert2';
import { useDomain, DOMAINS } from '../../contexts/DomainContext';
import { styled } from '@mui/material/styles';
import { ThemeContext } from '../../contexts/ThemeContext';

// 이미지 업로드를 위한 스타일 컴포넌트
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const CompanyInfo = (props) => {
  // 현재 테마 가져오기
  const theme = useTheme();
  const { domain } = useDomain();
  const isDarkMode = theme.palette.mode === 'dark';
  
  // 도메인별 색상 설정
  const getTextColor = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? '#f0e6d9' : 'rgba(0, 0, 0, 0.87)';
    }
    return isDarkMode ? '#b3c5e6' : 'rgba(0, 0, 0, 0.87)';
  };
  
  const getBgColor = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? 'rgba(45, 30, 15, 0.5)' : 'rgba(252, 235, 212, 0.6)';
    }
    return isDarkMode ? 'rgba(0, 27, 63, 0.5)' : 'rgba(232, 244, 253, 0.6)';
  };
  
  const getBorderColor = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? '#3d2814' : '#f5e8d7';
    }
    return isDarkMode ? '#1e3a5f' : '#e0e0e0';
  };
  
  // 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [logoImage, setLogoImage] = useState(null);
  const [companyInfo, setCompanyInfo] = useState(null);
  
  // React Hook Form 설정
  const { control, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      companyName: '',
      businessNumber: '',
      ceoName: '',
      industry: '',
      businessType: '',
      email: '',
      website: '',
      phone: '',
      fax: '',
      zipCode: '',
      address: '',
      detailAddress: '',
      establishedDate: '',
      employeeCount: '',
      annualRevenue: ''
    }
  });

  // 회사 정보 불러오기 (API 대신 더미 데이터 사용)
  const loadCompanyInfo = () => {
    // 실제 API 호출로 대체 예정
    const dummyData = {
      companyName: '(주)아이모스',
      businessNumber: '123-45-67890',
      ceoName: '홍길동',
      industry: '제조업',
      businessType: '전자부품 제조',
      email: 'contact@imos.com',
      website: 'www.imos.com',
      phone: '02-1234-5678',
      fax: '02-1234-5679',
      zipCode: '12345',
      address: '서울특별시 강남구 테헤란로 123',
      detailAddress: '아이모스빌딩 10층',
      establishedDate: '2010-01-15',
      employeeCount: '250',
      annualRevenue: '150억'
    };
    
    setCompanyInfo(dummyData);
    
    // 폼에 데이터 설정
    Object.keys(dummyData).forEach(key => {
      setValue(key, dummyData[key]);
    });
    
    setIsLoading(false);
  };
  
  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadCompanyInfo();
  }, []);
  
  // 로고 이미지 업로드 핸들러
  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // 수정 모드 토글
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };
  
  // 저장 핸들러
  const handleSave = (data) => {
    console.log('저장 데이터:', data);
    
    // 회사 정보 업데이트 (실제로는 API 호출)
    setCompanyInfo(data);
    setIsEditing(false);
    
    Swal.fire({
      icon: 'success',
      title: '성공',
      text: '회사 정보가 성공적으로 저장되었습니다.',
      confirmButtonText: '확인'
    });
  };

  return (
    <Box sx={{ p: 0, minHeight: '100vh' }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 2,
        borderBottom: `1px solid ${getBorderColor()}`,
        pb: 1
      }}>
        <Typography 
          variant="h5" 
          component="h2" 
          sx={{ 
            fontWeight: 600,
            color: getTextColor()
          }}
        >
          회사정보
        </Typography>
      </Box>
      
      {!isLoading && (
        <form onSubmit={handleSubmit(handleSave)}>
          <Paper 
            sx={{ 
              p: 3, 
              mb: 3, 
              boxShadow: theme.shadows[2],
              borderRadius: 1
            }}
          >
            <Grid container spacing={3}>
              {/* 로고 영역 */}
              <Grid item xs={12} sm={4} md={3} display="flex" flexDirection="column" alignItems="center">
                <Box mb={2}>
                  <Avatar
                    src={logoImage}
                    alt="Company Logo"
                    sx={{ 
                      width: 150, 
                      height: 150, 
                      border: `1px solid ${theme.palette.divider}`
                    }}
                  >
                    {!logoImage && companyInfo?.companyName?.charAt(0)}
                  </Avatar>
                </Box>
                
                {isEditing && (
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    size="small"
                  >
                    로고 업로드
                    <VisuallyHiddenInput 
                      type="file" 
                      accept="image/*"
                      onChange={handleLogoUpload}
                    />
                  </Button>
                )}
              </Grid>
              
              {/* 기본 정보 영역 */}
              <Grid item xs={12} sm={8} md={9}>
                <Typography variant="h6" mb={2}>기본 정보</Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="companyName"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="회사명"
                          variant="outlined"
                          size="small"
                          fullWidth
                          disabled={!isEditing}
                          required
                        />
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="businessNumber"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="사업자번호"
                          variant="outlined"
                          size="small"
                          fullWidth
                          disabled={!isEditing}
                          required
                        />
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="ceoName"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="대표자명"
                          variant="outlined"
                          size="small"
                          fullWidth
                          disabled={!isEditing}
                          required
                        />
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="industry"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="업종"
                          variant="outlined"
                          size="small"
                          fullWidth
                          disabled={!isEditing}
                        />
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="businessType"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="업태"
                          variant="outlined"
                          size="small"
                          fullWidth
                          disabled={!isEditing}
                        />
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="establishedDate"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="설립일"
                          variant="outlined"
                          size="small"
                          fullWidth
                          disabled={!isEditing}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>
              
              {/* 연락처 정보 */}
              <Grid item xs={12}>
                <Typography variant="h6" mb={2}>연락처 정보</Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Controller
                      name="email"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="이메일"
                          variant="outlined"
                          size="small"
                          fullWidth
                          disabled={!isEditing}
                        />
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <Controller
                      name="phone"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="전화번호"
                          variant="outlined"
                          size="small"
                          fullWidth
                          disabled={!isEditing}
                        />
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <Controller
                      name="fax"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="팩스"
                          variant="outlined"
                          size="small"
                          fullWidth
                          disabled={!isEditing}
                        />
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <Controller
                      name="website"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="웹사이트"
                          variant="outlined"
                          size="small"
                          fullWidth
                          disabled={!isEditing}
                          InputProps={{
                            startAdornment: field.value ? <InputAdornment position="start">http://</InputAdornment> : null
                          }}
                        />
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={2}>
                    <Controller
                      name="zipCode"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="우편번호"
                          variant="outlined"
                          size="small"
                          fullWidth
                          disabled={!isEditing}
                        />
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={12} md={6}>
                    <Controller
                      name="address"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="주소"
                          variant="outlined"
                          size="small"
                          fullWidth
                          disabled={!isEditing}
                        />
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Controller
                      name="detailAddress"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="상세주소"
                          variant="outlined"
                          size="small"
                          fullWidth
                          disabled={!isEditing}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>
              
              {/* 추가 정보 */}
              <Grid item xs={12}>
                <Typography variant="h6" mb={2}>추가 정보</Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="employeeCount"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="임직원 수"
                          variant="outlined"
                          size="small"
                          fullWidth
                          disabled={!isEditing}
                          InputProps={{
                            endAdornment: <InputAdornment position="end">명</InputAdornment>
                          }}
                        />
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="annualRevenue"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="연간 매출액"
                          variant="outlined"
                          size="small"
                          fullWidth
                          disabled={!isEditing}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Grid>
              
              {/* 버튼 영역 */}
              <Grid item xs={12} display="flex" justifyContent="flex-end" mt={2}>
                {isEditing ? (
                  <>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={toggleEditMode}
                      sx={{ mr: 1 }}
                    >
                      취소
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      type="submit"
                      startIcon={<SaveIcon />}
                    >
                      저장
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={toggleEditMode}
                  >
                    수정
                  </Button>
                )}
              </Grid>
            </Grid>
          </Paper>
        </form>
      )}
      
      {/* 하단 정보 영역 */}
      <Box mt={2} p={2} sx={{ 
        bgcolor: getBgColor(), 
        borderRadius: 1,
        border: `1px solid ${getBorderColor()}`
      }}>
        <Stack spacing={1}>
          <Typography variant="body2" color={getTextColor()}>
            • 회사정보는 시스템 내에서 사용되는 기본 정보로, 시스템 관리자만 수정할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()}>
            • 회사 로고는 시스템 상단과 보고서 출력 시 사용됩니다. (권장 크기: 300x300 픽셀)
          </Typography>
          <Typography variant="body2" color={getTextColor()}>
            • 회사정보 변경 시 시스템 일부 기능에 영향을 줄 수 있으니 주의하시기 바랍니다.
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
};

export default CompanyInfo; 