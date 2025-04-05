import React, {useEffect, useState} from 'react';
import './UserManagement.css';
import {Controller, useForm} from 'react-hook-form';
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
import {MuiDataGridWrapper, SearchCondition} from '../Common';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import KeyIcon from '@mui/icons-material/Key';
import Swal from 'sweetalert2';
import {DOMAINS, useDomain} from '../../contexts/DomainContext';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HelpModal from '../Common/HelpModal';
import {getRoleGroup, getUserGroup} from "../../api/userApi";
import {getCodes} from "../../api/utilApi";

const UserManagement = (props) => {
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
  const [userList, setUserList] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [authorityOptions, setAuthorityOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [positionOptions, setPositionOptions] = useState([]);

  // 검색 조건 상태 관리
  const [searchCondition, setSearchCondition] = useState({
    userName: null,
    departmentId: null,
    positionId: null,
    roleId: null
  });

  // 상세 정보 상태 관리
  const [detailInfo, setDetailInfo] = useState({
    id: null,
    loginId: null,
    userName: null,
    userPwd: null,
    userEmail: null,
    phoneNum: null,
    departmentId: null,
    positionId: null,
    roleId: null,
    flagActive: 'Y'
  });

  // React Hook Form 설정 - 검색
  const { control: searchControl, handleSubmit: handleSearchSubmit, reset: resetSearch } = useForm({
    defaultValues: {
      userName: null,
      departmentId: null,
      positionId: null,
      roleId: null
    }
  });

  // 상세 정보 변경 핸들러
  const handleDetailChange = (field, value) => {
    setDetailInfo(prev => ({
      ...prev,
      [field]: value || null  // 빈 문자열은 null로 변환
    }));
  };

  // 검색 핸들러
  const onSearch = () => {
    handleSearch(searchCondition);
  };

  // 초기화 핸들러
  const onReset = () => {
    if (isEditMode) {
      if (selectedUser) {
        handleUserSelect({ id: selectedUser.id });
      } else {
        setDetailInfo({
          id: null,
          loginId: null,
          userName: null,
          userPwd: null,
          userEmail: null,
          phoneNum: null,
          departmentId: null,
          positionId: null,
          roleId: null,
          flagActive: 'Y'
        });
      }
      setIsEditMode(false);
    } else {
      // 검색 조건 초기화
      resetSearch({
        userName: null,
        departmentId: null,
        roleId: null,
        positionId: null
      });
      handleSearch({});
    }
  };

  // 컬럼 정의 - 사용자 목록
  const userColumns = [
    { field: 'loginId', headerName: '사용자 ID', flex: 1 },
    { field: 'userName', headerName: '이름', flex: 1 },
    { 
      field: 'departmentId', 
      headerName: '부서', 
      flex: 1,
      renderCell: (params) => {
        if (!params.row.departmentId) return '-';
        const dept = departmentOptions.find(d => d.codeId === params.row.departmentId);
        return dept?.codeName || '-';
      }
    },
    { 
      field: 'positionId', 
      headerName: '직책', 
      flex: 1,
      renderCell: (params) => {
        if (!params.row.positionId) return '-';
        const pos = positionOptions.find(p => p.codeId === params.row.positionId);
        return pos?.codeName || '-';
      }
    },
    { 
      field: 'roleId', 
      headerName: '권한', 
      flex: 1,
      renderCell: (params) => {
        if (!params.row.roleId) return '-';
        const role = authorityOptions.find(r => r.roleId === params.row.roleId);
        return role.roleName || '-';
      }
    },
    {
      field: 'flagActive',
      headerName: '상태',
      flex: 0.7,
      renderCell: (params) => (
        <span className={`status-badge ${params.value === 'Y' ? 'active' : 'inactive'}`}>
          {params.value === 'Y' ? '활성' : '비활성'}
        </span>
      )
    }
  ];

  // 사용자 목록 그리드 버튼
  const userGridButtons = [
    {
      icon: <PersonAddIcon />,
      label: '사용자 추가',
      onClick: () => handleAddUser()
    },
    {
      icon: <DeleteIcon />,
      label: '사용자 삭제',
      onClick: () => handleDeleteUser(),
      disabled: !selectedUser
    }
  ];

  // 사용자 목록 검색
  const handleSearch = (data) => {
    setIsLoading(true);

    getUserGroup(data).then((res) => {
      const userGroup = (res.getUserGroup ?? []).map(user => ({
        ...user,
        flagActive: user.flagActive === true ? 'Y' : 'N'
      }));

      setUserList(userGroup);
      setSelectedUser(null);
      setIsEditMode(false);
      setIsLoading(false);
    }).catch(error => {
      console.error('API 호출 중 오류 발생:', error);
      Swal.fire({
        icon: 'error',
        title: '오류',
        text: '서버 통신 중 오류가 발생했습니다.',
        confirmButtonText: '확인'
      });
      setIsLoading(false);
    });
  };

  // 초기 데이터 로드
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const roleData = await getRoleGroup();
        setAuthorityOptions(roleData.getRoles ?? []);

        const deptData = await getCodes('DEPARTMENT');
        setDepartmentOptions(deptData.getGridCodes ?? []);

        const posData = await getCodes('POSITION');
        setPositionOptions(posData.getGridCodes ?? []);
      } catch (error) {
        console.error('초기 데이터 로드 중 오류:', error);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    if (
        authorityOptions.length > 0 &&
        departmentOptions.length > 0 &&
        positionOptions.length > 0
    ) {
      handleSearch({});
    }
  }, [authorityOptions, departmentOptions, positionOptions]);

  // 사용자 선택 핸들러
  const handleUserSelect = (params) => {
    const user = userList.find(u => u.id === params.id);
    setSelectedUser(user);
    setIsEditMode(false);

    if (user) {
      setDetailInfo({
        id: user.id || null,
        loginId: user.loginId || null,
        userName: user.userName || null,
        userEmail: user.userEmail || null,
        phoneNum: user.phoneNum || null,
        departmentId: user.departmentId || null,
        positionId: user.positionId || null,
        roleId: user.roleId || null,
        flagActive: user.flagActive || 'Y'
      });
    }
  };

  // 사용자 추가 핸들러
  const handleAddUser = () => {
    setDetailInfo({
      id: null,
      loginId: null,
      userName: null,
      userPwd: null,
      userEmail: null,
      phoneNum: null,
      departmentId: null,
      positionId: null,
      roleId: null,
      flagActive: 'Y'
    });
    setSelectedUser(null);
    setIsEditMode(true);
  };

  // 사용자 삭제 핸들러
  const handleDeleteUser = () => {
    if (!selectedUser) {
      Swal.fire({
        icon: 'warning',
        title: '알림',
        text: '삭제할 사용자를 선택해주세요.',
        confirmButtonText: '확인'
      });
      return;
    }

    Swal.fire({
      title: '삭제 확인',
      text: `'${selectedUser.userName}' 사용자를 정말 삭제하시겠습니까?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: '삭제',
      cancelButtonText: '취소'
    }).then((result) => {
      if (result.isConfirmed) {
        // 사용자 삭제 (실제로는 API 호출)
        const updatedList = userList.filter(user => user.id !== selectedUser.id);
        setUserList(updatedList);
        setSelectedUser(null);

        Swal.fire({
          icon: 'success',
          title: '성공',
          text: '삭제되었습니다.',
          confirmButtonText: '확인'
        });
      }
    });
  };

  // 수정 모드 전환
  const handleEdit = () => {
    setIsEditMode(true);
  };

  // 비밀번호 초기화
  const handleResetuserPwd = () => {
    if (!selectedUser) return;

    Swal.fire({
      title: '비밀번호 초기화',
      text: `'${selectedUser.userName}' 사용자의 비밀번호를 초기화하시겠습니까?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: '초기화',
      cancelButtonText: '취소'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          icon: 'success',
          title: '성공',
          text: '비밀번호가 초기화되었습니다.',
          confirmButtonText: '확인'
        });
      }
    });
  };

  // 저장 핸들러
  const handleSave = () => {
    if (!selectedUser) {
      const newUser = {
        id: userList.length + 1,
        ...detailInfo,
        lastLoginDate: '-'
      };

      setUserList([...userList, newUser]);
      setSelectedUser(newUser);
    } else {
      const updatedUser = {
        ...selectedUser,
        ...detailInfo
      };

      const updatedList = userList.map(user =>
        user.id === selectedUser.id ? updatedUser : user
      );

      setUserList(updatedList);
      setSelectedUser(updatedUser);
    }

    setIsEditMode(false);

    Swal.fire({
      icon: 'success',
      title: '성공',
      text: '저장되었습니다.',
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
            사용자관리
          </Typography>
          <IconButton
              onClick={() => setIsHelpModalOpen(true)}
              sx={{
                ml: 1,
                color: isDarkMode ? theme.palette.primary.light : theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: isDarkMode
                      ? alpha(theme.palette.primary.light, 0.1)
                      : alpha(theme.palette.primary.main, 0.05)
                }
              }}
          >
            <HelpOutlineIcon />
          </IconButton>
        </Box>

        {/* 검색 영역 */}
        <SearchCondition
            onSearch={handleSearchSubmit(onSearch)}
            onReset={onReset}
        >
          <Grid item xs={12} sm={6} md={3}>
            <Controller
                name="userName"
                control={searchControl}
                render={({ field }) => (
                    <TextField
                        {...field}
                        label="이름"
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === '' ? null : value);
                        }}
                        InputLabelProps={{
                          shrink: field.value ? true : undefined
                        }}
                    />
                )}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Controller
                name="departmentId"
                control={searchControl}
                render={({ field }) => (
                    <FormControl variant="outlined" size="small" fullWidth>
                      <InputLabel id="department-label">부서</InputLabel>
                      <Select
                          {...field}
                          value={field.value ?? ''}
                          labelId="department-label"
                          label="부서"
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value === '' ? null : value);
                          }}
                      >
                        <MenuItem value="">
                          <em>선택</em>
                        </MenuItem>
                        {Array.isArray(departmentOptions) && departmentOptions.map((item) => (
                            <MenuItem key={item.codeId} value={item.codeId}>
                              {item.codeName}
                            </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                )}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Controller
                name="positionId"
                control={searchControl}
                render={({ field }) => (
                    <FormControl variant="outlined" size="small" fullWidth>
                      <InputLabel id="position-label">직책</InputLabel>
                      <Select
                          {...field}
                          value={field.value ?? ''}
                          labelId="position-label"
                          label="직책"
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value === '' ? null : value);
                          }}
                      >
                        <MenuItem value="">
                          <em>선택</em>
                        </MenuItem>
                        {Array.isArray(positionOptions) && positionOptions.map((item) => (
                            <MenuItem key={item.codeId} value={item.codeId}>
                              {item.codeName}
                            </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                )}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Controller
                name="roleId"
                control={searchControl}
                render={({ field }) => (
                    <FormControl variant="outlined" size="small" fullWidth>
                      <InputLabel id="authority-label">권한</InputLabel>
                      <Select
                          {...field}
                          labelId="authority-label"
                          label="권한"
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value === '' ? null : parseInt(value, 10));
                          }}
                          value={field.value ?? ''}
                      >
                        <MenuItem value="">
                          <em>선택</em>
                        </MenuItem>
                        {Array.isArray(authorityOptions) && authorityOptions.map((item) => (
                            <MenuItem key={item.roleId} value={item.roleId}>
                              {item.roleName}
                            </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                )}
            />
          </Grid>
        </SearchCondition>

        {/* 그리드 영역 */}
        {!isLoading && (
            <Grid container spacing={2}>
              {/* 사용자 목록 그리드 */}
              <Grid item xs={12} md={6}>
                <MuiDataGridWrapper
                    title="사용자 목록"
                    rows={userList}
                    columns={userColumns}
                    buttons={userGridButtons}
                    height={450}
                    onRowClick={handleUserSelect}
                />
              </Grid>

              {/* 사용자 상세 정보 영역 */}
              <Grid item xs={12} md={6}>
                <Paper sx={{
                  height: '100%',
                  p: 2,
                  boxShadow: theme.shadows[2],
                  borderRadius: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden'
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      사용자 상세 정보
                    </Typography>
                    {selectedUser && !isEditMode && (
                        <Box>
                          <IconButton
                              color="primary"
                              onClick={handleEdit}
                              size="small"
                              sx={{ mr: 1 }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                              color="warning"
                              onClick={handleResetuserPwd}
                              size="small"
                          >
                            <KeyIcon />
                          </IconButton>
                        </Box>
                    )}
                  </Box>

                  <Box sx={{ flex: 1, overflow: 'auto' }}>
                    {(selectedUser || isEditMode) ? (
                          <Grid container spacing={2}>
                            <Grid item xs={12} display="flex" justifyContent="center" mt={2} mb={2}>
                              <Avatar
                                  sx={{
                                    width: 80,
                                    height: 80,
                                    bgcolor: theme.palette.primary.main,
                                    fontSize: '2rem'
                                  }}
                              >
                                {selectedUser?.userName?.charAt(0) || '?'}
                              </Avatar>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                              <TextField
                                label="사용자 ID"
                                variant="outlined"
                                size="small"
                                fullWidth
                                disabled={selectedUser && !isEditMode}
                                required
                                value={detailInfo.loginId || ''}
                                onChange={(e) => handleDetailChange('loginId', e.target.value)}
                              />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                              <TextField
                                label="이름"
                                variant="outlined"
                                size="small"
                                fullWidth
                                disabled={!isEditMode}
                                required
                                value={detailInfo.userName || ''}
                                onChange={(e) => handleDetailChange('userName', e.target.value)}
                              />
                            </Grid>

                            {!selectedUser && (
                                <Grid item xs={12}>
                                  <TextField
                                    label="비밀번호"
                                    type="password"
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    required
                                    value={detailInfo.userPwd || ''}
                                    onChange={(e) => handleDetailChange('userPwd', e.target.value)}
                                  />
                                </Grid>
                            )}

                            <Grid item xs={12} sm={6}>
                              <TextField
                                label="이메일"
                                variant="outlined"
                                size="small"
                                fullWidth
                                disabled={!isEditMode}
                                value={detailInfo.userEmail || ''}
                                onChange={(e) => handleDetailChange('userEmail', e.target.value)}
                              />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                              <TextField
                                label="전화번호"
                                variant="outlined"
                                size="small"
                                fullWidth
                                disabled={!isEditMode}
                                value={detailInfo.phoneNum || ''}
                                onChange={(e) => handleDetailChange('phoneNum', e.target.value)}
                              />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                              <FormControl variant="outlined" size="small" fullWidth disabled={!isEditMode}>
                                <InputLabel id="department-label">부서</InputLabel>
                                <Select
                                  labelId="department-label"
                                  label="부서"
                                  value={detailInfo.departmentId === null ? '' : detailInfo.departmentId}
                                  onChange={(e) => handleDetailChange('departmentId', e.target.value)}
                                >
                                  <MenuItem value="">
                                    <em>선택</em>
                                  </MenuItem>
                                  {Array.isArray(departmentOptions) && departmentOptions.map((item) => (
                                    <MenuItem key={item.codeId} value={item.codeId}>
                                      {item.codeName}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                              <FormControl variant="outlined" size="small" fullWidth disabled={!isEditMode}>
                                <InputLabel id="position-label">직책</InputLabel>
                                <Select
                                  labelId="position-label"
                                  label="직책"
                                  value={detailInfo.positionId === null ? '' : detailInfo.positionId}
                                  onChange={(e) => handleDetailChange('positionId', e.target.value)}
                                >
                                  <MenuItem value="">
                                    <em>선택</em>
                                  </MenuItem>
                                  {Array.isArray(positionOptions) && positionOptions.map((item) => (
                                    <MenuItem key={item.codeId} value={item.codeId}>
                                      {item.codeName}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                              <FormControl variant="outlined" size="small" fullWidth disabled={!isEditMode}>
                                <InputLabel id="user-authority-label">권한</InputLabel>
                                <Select
                                  labelId="user-authority-label"
                                  label="권한"
                                  value={detailInfo.roleId === null ? '' : detailInfo.roleId}
                                  onChange={(e) => handleDetailChange('roleId', e.target.value)}
                                >
                                  <MenuItem value="">
                                    <em>선택</em>
                                  </MenuItem>
                                  {Array.isArray(authorityOptions) && authorityOptions.map((item) => (
                                    <MenuItem key={item.roleId} value={item.roleId}>
                                      {item.roleName}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                              <FormControl variant="outlined" size="small" fullWidth disabled={!isEditMode}>
                                <InputLabel id="user-status-label">상태</InputLabel>
                                <Select
                                  labelId="user-status-label"
                                  label="상태"
                                  value={detailInfo.flagActive}
                                  onChange={(e) => handleDetailChange('flagActive', e.target.value)}
                                >
                                  <MenuItem value="Y">활성</MenuItem>
                                  <MenuItem value="N">비활성</MenuItem>
                                </Select>
                              </FormControl>
                            </Grid>

                            {isEditMode && (
                                <Grid item xs={12} display="flex" justifyContent="flex-end" mt={2}>
                                  <Button
                                      variant="outlined"
                                      color="secondary"
                                      onClick={onReset}
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
                                </Grid>
                            )}
                          </Grid>
                    ) : (
                        <Box
                            display="flex"
                            flexDirection="column"
                            alignItems="center"
                            justifyContent="center"
                            height="100%"
                        >
                          <Typography variant="body1" color="text.secondary">
                            사용자를 선택하면 상세 정보가 표시됩니다.
                          </Typography>
                        </Box>
                    )}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
        )}

        {/* 하단 정보 영역 */}
        <Box mt={2} p={2} sx={{
          bgcolor: getBgColor(),
          borderRadius: 1,
          border: `1px solid ${getBorderColor()}`
        }}>
          <Stack spacing={1}>
            <Typography variant="body2" color={getTextColor()}>
              • 사용자관리에서는 시스템 사용자 정보를 등록하고 관리할 수 있습니다.
            </Typography>
            <Typography variant="body2" color={getTextColor()}>
              • 사용자별로 권한 그룹을 설정할 수 있으며, 권한은 '권한관리' 메뉴에서 상세 설정이 가능합니다.
            </Typography>
            <Typography variant="body2" color={getTextColor()}>
              • 비밀번호 초기화 시 기본 비밀번호로 변경되며, 사용자는 첫 로그인 시 비밀번호를 변경해야 합니다.
            </Typography>
          </Stack>
        </Box>

        {/* 도움말 모달 */}
        <HelpModal
            open={isHelpModalOpen}
            onClose={() => setIsHelpModalOpen(false)}
            title="사용자관리 도움말"
        >
          <Typography variant="body2" color={getTextColor()}>
            • 사용자관리에서는 시스템 사용자의 계정을 등록, 수정, 삭제할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()}>
            • 사용자별로 권한을 부여하여 시스템 접근 범위를 제한할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()}>
            • 비밀번호는 주기적으로 변경하여 보안을 강화해야 합니다.
          </Typography>
        </HelpModal>
      </Box>
  );
};

export default UserManagement; 