import React, { useEffect, useState } from 'react';
import {
  alpha,
  Avatar,
  Box,
  Button,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  useTheme
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { MuiDataGridWrapper, SearchCondition } from '../Common';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HelpModal from '../Common/HelpModal';
import { DOMAINS, useDomain } from '../../contexts/DomainContext';
import useLocalStorageVO from '../Common/UseLocalStorageVO';
import { getCompanies, getCompanyDetails, upsertCompany, deleteCompany } from '../../api/companyApi';
import { getSite } from '../../api/utilApi';
import { getUserDetail } from '../../api/userApi';
import Swal from 'sweetalert2';

const CompanyInfo = () => {
  const theme = useTheme();
  const { domain } = useDomain();
  const isDarkMode = theme.palette.mode === 'dark';
  const { loginUser } = useLocalStorageVO();
  const isDeveloper = loginUser.priorityLevel === 5;

  // 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [companyList, setCompanyList] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [siteOptions, setSiteOptions] = useState([]);

  // 상세 정보 상태 관리
  const [detailInfo, setDetailInfo] = useState({
    id: null,
    site: null,
    compCd: null,
    businessRegistrationNumber: null,
    corporateRegistrationNumber: null,
    companyName: null,
    imagePath: null,
    businessAddress: null,
    businessType: null,
    businessItem: null,
    paymentDate: null,
    expiredDate: null,
    flagSubscription: false,
    loginId: null,
    phoneNumber: null,
    userName: null,
    userEmail: null,
    userImagePath: null
  });

  // 초기 데이터 로드 함수를 컴포넌트 레벨로 이동
  const loadInitialData = async () => {
    try {
      const siteData = await getSite();
      setSiteOptions(siteData || []);

      if (isDeveloper) {
        const response = await getCompanies();
        const companiesWithId = response.getCompanies.map(company => ({
          ...company,
          id: company.id
        }));
        setCompanyList(companiesWithId);
      } else {
        const response = await getCompanyDetails();
        const companyDetails = response.getCompanyDetails;
        
        // 회사 대표 정보 조회
        if (companyDetails.loginId) {
          const userData = await getUserDetail(companyDetails.loginId);

          setDetailInfo({
            ...companyDetails,
            userName: userData.userName,
            userEmail: userData.email,
            userImagePath: userData.imagePath
          });
        } else {
          setDetailInfo(companyDetails);
        }
      }
    } catch (error) {
      console.error('데이터 로드 중 오류 발생:', error);
      Swal.fire({
        icon: 'error',
        title: '오류',
        text: '데이터를 불러오는 중 오류가 발생했습니다.',
        confirmButtonText: '확인'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    loadInitialData();
  }, [isDeveloper]);

  // 테마 관련 함수
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

  // 상세 정보 변경 핸들러
  const handleDetailChange = (field, value) => {
    setDetailInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 회사 선택 핸들러
  const handleCompanySelect = (params) => {
    const company = companyList.find(c => c.id === params.id);
    setSelectedCompany(company);
    setDetailInfo(company);
    setIsEditMode(false);
  };

  // 저장 핸들러
  const handleSave = async () => {
    try {
      const response = await upsertCompany({
        ...detailInfo,
        flagSubscription: Boolean(detailInfo.flagSubscription)
      });

      await Swal.fire({
        icon: 'success',
        title: '성공',
        text: response.upsertCompany,
        confirmButtonText: '확인'
      });

      setIsEditMode(false);
      if (isDeveloper) {
        const companiesResponse = await getCompanies();
        setCompanyList(companiesResponse.getCompanies);
      }
    } catch (error) {
      console.error('저장 중 오류 발생:', error);
      Swal.fire({
        icon: 'error',
        title: '오류',
        text: error.message || '저장 중 오류가 발생했습니다.',
        confirmButtonText: '확인'
      });
    }
  };

  // 삭제 핸들러
  const handleDelete = async () => {
    if (!selectedCompany) {
      Swal.fire({
        icon: 'warning',
        title: '알림',
        text: '삭제할 회사를 선택해주세요.',
        confirmButtonText: '확인'
      });
      return;
    }

    const result = await Swal.fire({
      title: '삭제 확인',
      text: `'${selectedCompany.companyName}' 회사를 정말 삭제하시겠습니까?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: '삭제',
      cancelButtonText: '취소'
    });

    if (result.isConfirmed) {
      try {
        const response = await deleteCompany(selectedCompany.id);
        if (response.deleteCompany) {
          await Swal.fire({
            icon: 'success',
            title: '성공',
            text: '회사가 성공적으로 삭제되었습니다.',
            confirmButtonText: '확인'
          });

          const companiesResponse = await getCompanies();
          setCompanyList(companiesResponse.getCompanies);
          setSelectedCompany(null);
          setDetailInfo({
            id: null,
            site: null,
            compCd: null,
            businessRegistrationNumber: null,
            corporateRegistrationNumber: null,
            companyName: null,
            imagePath: null,
            businessAddress: null,
            businessType: null,
            businessItem: null,
            paymentDate: null,
            expiredDate: null,
            flagSubscription: false,
            loginId: null,
            phoneNumber: null,
            userName: null,
            userEmail: null,
            userImagePath: null
          });
        }
      } catch (error) {
        console.error('삭제 중 오류 발생:', error);
        Swal.fire({
          icon: 'error',
          title: '오류',
          text: error.message || '삭제 중 오류가 발생했습니다.',
          confirmButtonText: '확인'
        });
      }
    }
  };

  // 회사 추가 핸들러
  const handleAddCompany = () => {
    setSelectedCompany(null);
    setDetailInfo({
      id: null,
      site: null,
      compCd: null,
      businessRegistrationNumber: null,
      corporateRegistrationNumber: null,
      companyName: null,
      imagePath: null,
      businessAddress: null,
      businessType: null,
      businessItem: null,
      paymentDate: null,
      expiredDate: null,
      flagSubscription: false,
      loginId: null,
      phoneNumber: null,
      userName: null,
      userEmail: null,
      userImagePath: null
    });
    setIsEditMode(true);
  };

  // 취소 핸들러
  const handleCancel = () => {
    setIsEditMode(false);
    if (isDeveloper && selectedCompany) {
      setDetailInfo(selectedCompany);
    } else if (!isDeveloper) {
      loadInitialData(); // 초기 데이터 다시 로드
    }
  };

  // 컬럼 정의
  const columns = [
    { field: 'companyName', headerName: '회사명', flex: 1 },
    {
      field: 'site',
      headerName: '지역',
      flex: 1,
      renderCell: (params) => {
        const site = (siteOptions || []).find(s => s.codeId === params.value);
        return site ? site.codeName : '-';
      }
    },
    { field: 'businessRegistrationNumber', headerName: '사업자등록번호', flex: 1 },
    { field: 'phoneNumber', headerName: '연락처', flex: 1 },
    {
      field: 'flagSubscription',
      headerName: '구독 여부',
      flex: 0.5,
      renderCell: (params) => (
        <span className={`status-badge ${params.value ? 'active' : 'inactive'}`}>
          {params.value ? '예' : '아니오'}
        </span>
      )
    }
  ];

  // 그리드 버튼
  const gridButtons = [
    {
      icon: <AddIcon />,
      label: '회사 추가',
      onClick: handleAddCompany
    },
    {
      icon: <DeleteIcon />,
      label: '회사 삭제',
      onClick: handleDelete,
      disabled: !selectedCompany
    }
  ];

  return (
    <Box sx={{ p: 0, minHeight: '100vh' }}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 2
      }}>
        <Typography variant="h5" sx={{ color: getTextColor() }}>
          회사 정보
        </Typography>
        <IconButton
          color="primary"
          onClick={() => setIsHelpModalOpen(true)}
          size="small"
        >
          <HelpOutlineIcon />
        </IconButton>
      </Box>

      {!isLoading && (
        <Grid container spacing={2}>
          {isDeveloper ? (
            <>
              {/* 회사 목록 그리드 */}
              <Grid item xs={12} md={8}>
                <MuiDataGridWrapper
                  rows={companyList}
                  columns={columns}
                  height={450}
                  buttons={gridButtons}
                  onRowClick={handleCompanySelect}
                />
              </Grid>

              {/* 회사 상세 정보 */}
              <Grid item xs={12} md={4}>
                <Paper sx={{
                  height: '100%',
                  p: 2,
                  boxShadow: theme.shadows[2],
                  borderRadius: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  bgcolor: getBgColor()
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ color: getTextColor() }}>
                      회사 상세 정보
                    </Typography>
                    {selectedCompany && !isEditMode && (
                      <IconButton
                        color="primary"
                        onClick={() => setIsEditMode(true)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                    )}
                  </Box>

                  <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                    <CompanyDetailForm
                      detailInfo={detailInfo}
                      isEditMode={isEditMode}
                      handleDetailChange={handleDetailChange}
                      siteOptions={siteOptions}
                      getTextColor={getTextColor}
                    />
                  </Box>

                  {isEditMode && (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={handleCancel}
                        sx={{ mr: 1 }}
                      >
                        취소
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<SaveIcon />}
                        onClick={handleSave}
                      >
                        저장
                      </Button>
                    </Box>
                  )}
                </Paper>
              </Grid>
            </>
          ) : (
            /* 일반 사용자용 회사 정보 표시 */
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Paper sx={{
                  p: 2,
                  boxShadow: theme.shadows[2],
                  borderRadius: 1,
                  bgcolor: getBgColor(),
                  height: '100%',
                  minHeight: 300,
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  {/* 회사 로고 영역 */}
                  <Box sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2
                  }}>
                    <Box
                      component="div"
                      sx={{
                        width: '100%',
                        height: 150,
                        borderRadius: 1,
                        border: `1px dashed ${getBorderColor()}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        bgcolor: alpha(theme.palette.background.paper, 0.05)
                      }}
                    >
                      {detailInfo.imagePath ? (
                        <img
                          src={detailInfo.imagePath}
                          alt="회사 로고"
                          style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain'
                          }}
                        />
                      ) : (
                        <Typography variant="body2" sx={{ color: getTextColor(), opacity: 0.7 }}>
                          회사 로고 이미지
                        </Typography>
                      )}
                    </Box>
                    {isEditMode && (
                      <Button
                        variant="outlined"
                        component="label"
                        size="small"
                        sx={{ mb: 2 }}
                      >
                        이미지 업로드
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const imageUrl = URL.createObjectURL(file);
                              handleDetailChange('imagePath', imageUrl);
                            }
                          }}
                        />
                      </Button>
                    )}
                  </Box>

                  {/* 회사 대표 정보 영역 */}
                  <Box sx={{
                    pt: 2,
                    borderTop: `1px solid ${getBorderColor()}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2
                  }}>
                    <Typography variant="subtitle2" sx={{ color: getTextColor(), opacity: 0.9, fontWeight: 600 }}>
                      회사 대표 정보
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                      <Avatar
                        src={detailInfo.userImagePath}
                        alt={detailInfo.userName}
                        sx={{ 
                          width: 80, 
                          height: 80,
                          border: `2px solid ${getBorderColor()}`
                        }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ color: getTextColor(), opacity: 0.7, minWidth: 70 }}>
                          이름
                        </Typography>
                        <Typography variant="body2" sx={{ color: getTextColor() }}>
                          {detailInfo.userName || '-'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ color: getTextColor(), opacity: 0.7, minWidth: 70 }}>
                          이메일
                        </Typography>
                        <Typography variant="body2" sx={{ color: getTextColor() }}>
                          {detailInfo.userEmail || '-'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ color: getTextColor(), opacity: 0.7, minWidth: 70 }}>
                          연락처
                        </Typography>
                        <Typography variant="body2" sx={{ color: getTextColor() }}>
                          {detailInfo.phoneNumber || '-'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={8}>
                <Paper sx={{
                  p: 2,
                  boxShadow: theme.shadows[2],
                  borderRadius: 1,
                  bgcolor: getBgColor(),
                  height: '100%'
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ color: getTextColor() }}>
                      회사 정보
                    </Typography>
                    {!isEditMode && (
                      <IconButton
                        color="primary"
                        onClick={() => setIsEditMode(true)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                    )}
                  </Box>

                  <CompanyDetailForm
                    detailInfo={detailInfo}
                    isEditMode={isEditMode}
                    handleDetailChange={handleDetailChange}
                    siteOptions={siteOptions}
                    getTextColor={getTextColor}
                  />

                  {isEditMode && (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={handleCancel}
                        sx={{ mr: 1 }}
                      >
                        취소
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<SaveIcon />}
                        onClick={handleSave}
                      >
                        저장
                      </Button>
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>
          )}
        </Grid>
      )}

      {/* 도움말 모달 */}
      <HelpModal
        open={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        title="회사 정보 도움말"
        content={
          <div>
            <Typography variant="body1" paragraph>
              회사 정보 페이지에서는 회사의 기본 정보를 관리할 수 있습니다.
            </Typography>
            <Typography variant="body1" paragraph>
              주요 기능:
            </Typography>
            <ul>
              <li>회사 정보 조회</li>
              <li>회사 정보 수정</li>
              {isDeveloper && (
                <>
                  <li>회사 추가/삭제</li>
                  <li>여러 회사 정보 관리</li>
                </>
              )}
            </ul>
          </div>
        }
      />
    </Box>
  );
};

// 회사 상세 정보 폼 컴포넌트
const CompanyDetailForm = ({ detailInfo, isEditMode, handleDetailChange, siteOptions = null, getTextColor }) => {
  return (
    <Grid container spacing={1}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="회사명"
          value={detailInfo.companyName || ''}
          onChange={(e) => handleDetailChange('companyName', e.target.value)}
          disabled={!isEditMode}
          required
          size="small"
          sx={{
            bgcolor: !isEditMode ? alpha('#fff', 0.1) : 'transparent',
            '& .MuiInputBase-input.Mui-disabled': {
              WebkitTextFillColor: getTextColor(),
            }
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <FormControl fullWidth size="small">
          <InputLabel>지역</InputLabel>
          <Select
            label="지역"
            value={detailInfo.site || ''}
            onChange={(e) => handleDetailChange('site', e.target.value)}
            disabled={!isEditMode}
            required
          >
            {(siteOptions || []).map((option) => (
              <MenuItem key={option.codeId} value={option.codeId}>
                {option.codeName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="사업자등록번호"
          value={detailInfo.businessRegistrationNumber || ''}
          onChange={(e) => handleDetailChange('businessRegistrationNumber', e.target.value)}
          disabled={!isEditMode}
          required
          size="small"
          sx={{
            bgcolor: !isEditMode ? alpha('#fff', 0.1) : 'transparent',
            '& .MuiInputBase-input.Mui-disabled': {
              WebkitTextFillColor: getTextColor(),
            }
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="법인등록번호"
          value={detailInfo.corporateRegistrationNumber || ''}
          onChange={(e) => handleDetailChange('corporateRegistrationNumber', e.target.value)}
          disabled={!isEditMode}
          size="small"
          sx={{
            bgcolor: !isEditMode ? alpha('#fff', 0.1) : 'transparent',
            '& .MuiInputBase-input.Mui-disabled': {
              WebkitTextFillColor: getTextColor(),
            }
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="사업장 주소"
          value={detailInfo.businessAddress || ''}
          onChange={(e) => handleDetailChange('businessAddress', e.target.value)}
          disabled={!isEditMode}
          size="small"
          sx={{
            bgcolor: !isEditMode ? alpha('#fff', 0.1) : 'transparent',
            '& .MuiInputBase-input.Mui-disabled': {
              WebkitTextFillColor: getTextColor(),
            }
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="업태"
          value={detailInfo.businessType || ''}
          onChange={(e) => handleDetailChange('businessType', e.target.value)}
          disabled={!isEditMode}
          size="small"
          sx={{
            bgcolor: !isEditMode ? alpha('#fff', 0.1) : 'transparent',
            '& .MuiInputBase-input.Mui-disabled': {
              WebkitTextFillColor: getTextColor(),
            }
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="종목"
          value={detailInfo.businessItem || ''}
          onChange={(e) => handleDetailChange('businessItem', e.target.value)}
          disabled={!isEditMode}
          size="small"
          sx={{
            bgcolor: !isEditMode ? alpha('#fff', 0.1) : 'transparent',
            '& .MuiInputBase-input.Mui-disabled': {
              WebkitTextFillColor: getTextColor(),
            }
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="결제일"
          type="date"
          value={detailInfo.paymentDate || ''}
          onChange={(e) => handleDetailChange('paymentDate', e.target.value)}
          disabled={!isEditMode}
          size="small"
          InputLabelProps={{ shrink: true }}
          sx={{
            bgcolor: !isEditMode ? alpha('#fff', 0.1) : 'transparent',
            '& .MuiInputBase-input.Mui-disabled': {
              WebkitTextFillColor: getTextColor(),
            }
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="만료일"
          type="date"
          value={detailInfo.expiredDate || ''}
          onChange={(e) => handleDetailChange('expiredDate', e.target.value)}
          disabled={!isEditMode}
          size="small"
          InputLabelProps={{ shrink: true }}
          sx={{
            bgcolor: !isEditMode ? alpha('#fff', 0.1) : 'transparent',
            '& .MuiInputBase-input.Mui-disabled': {
              WebkitTextFillColor: getTextColor(),
            }
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <FormControl fullWidth size="small">
          <InputLabel>구독 여부</InputLabel>
          <Select
            label="구독 여부"
            value={detailInfo.flagSubscription || false}
            onChange={(e) => handleDetailChange('flagSubscription', e.target.value)}
            disabled={!isEditMode}
          >
            <MenuItem value={true}>예</MenuItem>
            <MenuItem value={false}>아니오</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      {isEditMode && (
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="로그인 ID"
            value={detailInfo.loginId || ''}
            onChange={(e) => handleDetailChange('loginId', e.target.value)}
            required
            size="small"
            sx={{
              bgcolor: !isEditMode ? alpha('#fff', 0.1) : 'transparent',
              '& .MuiInputBase-input.Mui-disabled': {
                WebkitTextFillColor: getTextColor(),
              }
            }}
          />
        </Grid>
      )}
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="연락처"
          value={detailInfo.phoneNumber || ''}
          onChange={(e) => handleDetailChange('phoneNumber', e.target.value)}
          disabled={!isEditMode}
          size="small"
          sx={{
            bgcolor: !isEditMode ? alpha('#fff', 0.1) : 'transparent',
            '& .MuiInputBase-input.Mui-disabled': {
              WebkitTextFillColor: getTextColor(),
            }
          }}
        />
      </Grid>
    </Grid>
  );
};

export default CompanyInfo; 