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
import {EnhancedDataGridWrapper, MuiDataGridWrapper, SearchCondition} from '../Common';
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
import { getUserSummery } from '../../api/userApi';
import Swal from 'sweetalert2';

const CompanyInfo = (props) => {
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
  const [searchCondition, setSearchCondition] = useState({
    companyName: null,
    site: null
  });

  const [updatedRows, setUpdatedRows] = useState([]); // 수정된 필드만 저장하는 객체
  const [addRows,setAddRows] = useState([]);

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
    userImagePath: null,
    defaultUserPwd: null
  });

  // 초기 데이터 로드 함수를 컴포넌트 레벨로 이동
  const loadInitialData = async () => {
    try {
      const siteData = await getSite();
      setSiteOptions(siteData || []);

      if (isDeveloper) {
        // 검색 조건 정제
        const refinedSearchCondition = {
          companyName: searchCondition.companyName || null,
          site: searchCondition.site || null
        };

        const response = await getCompanies(refinedSearchCondition);
        const companiesWithId = Array.isArray(response) ? response.map(company => ({
          ...company,
          id: company.id
        })) : [];
        setCompanyList(companiesWithId);
      } else {
        const response = await getCompanyDetails();
        const companyDetails = response.getCompanyDetails;

        // 회사 대표 정보 조회
        if (companyDetails.loginId) {
          const userData = await getUserSummery(companyDetails.loginId);

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
        id: detailInfo.id,
        site: detailInfo.site,
        compCd: detailInfo.compCd,
        businessRegistrationNumber: detailInfo.businessRegistrationNumber,
        corporateRegistrationNumber: detailInfo.corporateRegistrationNumber,
        companyName: detailInfo.companyName,
        imagePath: detailInfo.imagePath,
        businessAddress: detailInfo.businessAddress,
        businessType: detailInfo.businessType,
        businessItem: detailInfo.businessItem,
        phoneNumber: detailInfo.phoneNumber,
        flagSubscription: Boolean(detailInfo.flagSubscription),
        defaultUserPwd: isDeveloper ? detailInfo.defaultUserPwd : null
      });

      await Swal.fire({
        icon: 'success',
        title: '성공',
        text: response.upsertCompany,
        confirmButtonText: '확인'
      });

      setIsEditMode(false);
      if (isDeveloper) {
        const companiesResponse = await getCompanies(searchCondition);
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

  // 검색 조건 변경 핸들러
  const handleSearchChange = (field, value) => {
    setSearchCondition(prev => ({
      ...prev,
      [field]: value === '' ? null : value
    }));
  };

  // 검색 실행 핸들러
  const handleSearch = () => {
    loadInitialData();
  };

  // 검색 조건 초기화 핸들러
  const handleSearchReset = () => {
    setSearchCondition({
      companyName: null,
      site: null
    });
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

          const companiesResponse = await getCompanies(searchCondition);
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
            userImagePath: null,
            defaultUserPwd: null
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
      userImagePath: null,
      defaultUserPwd: null
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

  function handleProcessRowUpdate(newRow, oldRow) {
    const isNewRow = oldRow.id.startsWith('NEW_');

    setCompanyList((prev) => {
      return prev.map((row) =>
          //기존 행이면 덮어씌우기 새로운행이면 새로운행 추가
          row.id === oldRow.id ? { ...row, ...newRow } : row
      );
    });

    if (isNewRow) {
      // 신규 행인 경우 addRows 상태에 추가 (같은 id가 있으면 덮어씀)
      setAddRows((prevAddRows) => {
        const existingIndex = prevAddRows.findIndex(
            (row) => row.id === newRow.id
        );
        if (existingIndex !== -1) {
          const updated = [...prevAddRows];
          updated[existingIndex] = newRow;
          return updated;
        } else {
          return [...prevAddRows, newRow];
        }
      });
    }else {
      setUpdatedRows(prevUpdatedRows => {
        // 같은 factoryId를 가진 기존 행이 있는지 확인
        const existingIndex = prevUpdatedRows.findIndex(row => row.id === newRow.id);

        if (existingIndex !== -1) {

          // 기존에 같은 factoryId가 있다면, 해당 객체를 새 값(newRow)으로 대체
          const updated = [...prevUpdatedRows];
          updated[existingIndex] = newRow;
          return updated;
        } else {

          // 없다면 새로 추가
          return [...prevUpdatedRows, newRow];
        }
      });
    }

    // processRowUpdate에서는 최종적으로 반영할 newRow(또는 updatedRow)를 반환해야 함
    return { ...oldRow, ...newRow };
  }

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
              {/* 검색 조건 */}
              <Grid item xs={12}>
                <SearchCondition
                  onSearch={handleSearch}
                  onReset={handleSearchReset}
                >
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        fullWidth
                        size="small"
                        label="회사명"
                        name="companyName"
                        value={searchCondition.companyName || ''}
                        onChange={(e) => handleSearchChange('companyName', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <FormControl fullWidth size="small">
                        <InputLabel>지역</InputLabel>
                        <Select
                          label="지역"
                          name="site"
                          value={searchCondition.site || ''}
                          onChange={(e) => handleSearchChange('site', e.target.value)}
                        >
                          <MenuItem value="">전체</MenuItem>
                          {(siteOptions || []).map((option) => (
                            <MenuItem key={option.codeId} value={option.codeId}>
                              {option.codeName}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </SearchCondition>
              </Grid>

              {/* 회사 목록 그리드 */}
              <Grid item xs={12} md={8}>
                <EnhancedDataGridWrapper
                  rows={companyList}
                  columns={columns}
                  height={600}
                  buttons={gridButtons}
                  onRowClick={handleCompanySelect}
                  tabId={props.id + "-companies"}
                  gridProps={{
                    editMode: 'cell',
                    onProcessUpdate: handleProcessRowUpdate
                  }}
                />
              </Grid>

              {/* 회사 상세 정보 */}
              <Grid item xs={12} md={4}>
                <Paper sx={{
                  height: 600,
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
              {/* 좌측 영역: 대표 정보 */}
              <Grid item xs={12} md={4}>
                <Paper sx={{
                  p: 3,
                  boxShadow: theme.shadows[2],
                  borderRadius: 1,
                  bgcolor: getBgColor(),
                  height: 'calc(100vh - 180px)',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <Typography variant="h6" sx={{ color: getTextColor(), mb: 3, pb: 2, borderBottom: `1px solid ${getBorderColor()}` }}>
                    회사 대표 정보
                  </Typography>

                  <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    mb: 4
                  }}>
                    <Avatar
                      src={detailInfo.userImagePath}
                      alt={detailInfo.userName}
                      sx={{
                        width: 160,
                        height: 160,
                        mb: 2,
                        border: `3px solid ${getBorderColor()}`
                      }}
                    />
                    <Typography variant="h5" sx={{ color: getTextColor(), mb: 1 }}>
                      {detailInfo.userName || '-'}
                    </Typography>
                    <Typography variant="subtitle1" sx={{ color: getTextColor(), opacity: 0.7 }}>
                      대표이사
                    </Typography>
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Stack spacing={3}>
                      <Box>
                        <Typography variant="body2" sx={{ color: getTextColor(), opacity: 0.7, mb: 1 }}>
                          이메일
                        </Typography>
                        <Typography variant="h6" sx={{ color: getTextColor() }}>
                          {detailInfo.userEmail || '-'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ color: getTextColor(), opacity: 0.7, mb: 1 }}>
                          연락처
                        </Typography>
                        <Typography variant="h6" sx={{ color: getTextColor() }}>
                          {detailInfo.phoneNumber || '-'}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Paper>
              </Grid>

              {/* 우측 영역: 회사 상세 정보 */}
              <Grid item xs={12} md={8}>
                <Paper sx={{
                  p: 3,
                  boxShadow: theme.shadows[2],
                  borderRadius: 1,
                  bgcolor: getBgColor(),
                  height: 'calc(100vh - 180px)'
                }}>
                  <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 3,
                    pb: 2,
                    borderBottom: `1px solid ${getBorderColor()}`
                  }}>
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

                  <Grid container spacing={3}>
                    {/* 로고 및 기본 정보 영역 */}
                    <Grid item xs={12}>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                          <Box
                            sx={{
                              width: '100%',
                              height: 200,
                              borderRadius: 1,
                              border: `1px dashed ${getBorderColor()}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              overflow: 'hidden',
                              bgcolor: alpha(theme.palette.background.paper, 0.05),
                              mb: 1
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
                              fullWidth
                              sx={{ mb: 3 }}
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
                        </Grid>
                        <Grid item xs={12} md={8}>
                          <Stack spacing={2}>
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
                            {isEditMode && isDeveloper && (
                              <TextField
                                fullWidth
                                label="기본 비밀번호"
                                type="password"
                                value={detailInfo.defaultUserPwd || ''}
                                onChange={(e) => handleDetailChange('defaultUserPwd', e.target.value)}
                                size="small"
                                sx={{
                                  bgcolor: 'transparent'
                                }}
                              />
                            )}
                          </Stack>
                        </Grid>
                      </Grid>
                    </Grid>

                    {/* 주소 영역 - 여백 추가 */}
                    <Grid item xs={12} sx={{ mt: 4 }}>
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

                    {/* 업태, 종목 영역 */}
                    <Grid item xs={12} md={6}>
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
                    <Grid item xs={12} md={6}>
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

                    {/* 결제일, 만료일 영역 */}
                    <Grid item xs={12} md={6}>
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
                    <Grid item xs={12} md={6}>
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

                    {/* 연락처, 구독여부 영역 */}
                    <Grid item xs={12} md={6}>
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
                    <Grid item xs={12} md={6}>
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
                  </Grid>

                  {isEditMode && (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
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
  const { loginUser } = useLocalStorageVO();
  const isDeveloper = loginUser.priorityLevel === 5;

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
      {isDeveloper && isEditMode && (
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="회사 코드"
            value={detailInfo.compCd || ''}
            onChange={(e) => handleDetailChange('compCd', e.target.value)}
            required
            size="small"
            sx={{
              bgcolor: 'transparent'
            }}
          />
        </Grid>
      )}
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
      {!isDeveloper && (
        <>
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
        </>
      )}
    </Grid>
  );
};

export default CompanyInfo; 