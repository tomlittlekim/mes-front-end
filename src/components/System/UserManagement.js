import React, { useState, useEffect } from 'react';
import './UserManagement.css';
import { useForm, Controller } from 'react-hook-form';
import { 
  TextField, 
  FormControl, 
  InputLabel, 
  MenuItem, 
  Select,
  Grid, 
  Box, 
  Typography, 
  useTheme,
  Stack,
  Button,
  Paper,
  Avatar,
  IconButton,
  Divider
} from '@mui/material';
import { MuiDataGridWrapper, SearchCondition } from '../Common';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import KeyIcon from '@mui/icons-material/Key';
import Swal from 'sweetalert2';
import { useDomain, DOMAINS } from '../../contexts/DomainContext';

const UserManagement = () => {
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
  
  // React Hook Form 설정 - 검색
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      userId: '',
      userName: '',
      departmentName: '',
      authorityName: ''
    }
  });

  // React Hook Form 설정 - 상세 정보
  const { control: detailControl, handleSubmit: handleDetailSubmit, reset: resetDetail, setValue } = useForm({
    defaultValues: {
      userId: '',
      userName: '',
      password: '',
      email: '',
      phoneNumber: '',
      departmentName: '',
      position: '',
      authorityName: '',
      isActive: 'Y'
    }
  });

  // 컬럼 정의 - 사용자 목록
  const userColumns = [
    { field: 'id', headerName: 'ID', width: 70, hide: true },
    { field: 'userId', headerName: '사용자 ID', flex: 1 },
    { field: 'userName', headerName: '이름', flex: 1 },
    { field: 'departmentName', headerName: '부서', flex: 1 },
    { field: 'position', headerName: '직책', flex: 1 },
    { field: 'authorityName', headerName: '권한', flex: 1 },
    { field: 'lastLoginDate', headerName: '최근 로그인', flex: 1 },
    { 
      field: 'isActive', 
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

  // 초기화 함수 - 검색
  const handleReset = () => {
    reset({
      userId: '',
      userName: '',
      departmentName: '',
      authorityName: ''
    });
  };

  // 초기화 함수 - 상세 정보
  const handleDetailReset = () => {
    resetDetail();
    setIsEditMode(false);
  };

  // 사용자 목록 검색
  const handleSearch = (data) => {
    console.log('검색 조건:', data);
    
    // API 호출 대신 더미 데이터 사용
    const dummyData = [
      { id: 1, userId: 'admin', userName: '관리자', departmentName: '시스템관리팀', position: '팀장', authorityName: '총관리자', email: 'admin@example.com', phoneNumber: '010-1234-5678', lastLoginDate: '2024-03-25 14:30:22', isActive: 'Y' },
      { id: 2, userId: 'user1', userName: '김철수', departmentName: '생산관리팀', position: '과장', authorityName: '관리자', email: 'user1@example.com', phoneNumber: '010-2345-6789', lastLoginDate: '2024-03-24 09:15:47', isActive: 'Y' },
      { id: 3, userId: 'user2', userName: '이영희', departmentName: '품질관리팀', position: '대리', authorityName: '일반사용자', email: 'user2@example.com', phoneNumber: '010-3456-7890', lastLoginDate: '2024-03-23 16:45:33', isActive: 'Y' },
      { id: 4, userId: 'user3', userName: '박지민', departmentName: '영업팀', position: '주임', authorityName: '일반사용자', email: 'user3@example.com', phoneNumber: '010-4567-8901', lastLoginDate: '2024-03-22 11:20:15', isActive: 'Y' },
      { id: 5, userId: 'user4', userName: '최준호', departmentName: '구매팀', position: '사원', authorityName: '일반사용자', email: 'user4@example.com', phoneNumber: '010-5678-9012', lastLoginDate: '2024-03-21 13:55:01', isActive: 'Y' },
      { id: 6, userId: 'user5', userName: '정민서', departmentName: '재무팀', position: '과장', authorityName: '관리자', email: 'user5@example.com', phoneNumber: '010-6789-0123', lastLoginDate: '2024-03-20 10:10:42', isActive: 'N' }
    ];
    
    setUserList(dummyData);
    setSelectedUser(null);
    setIsEditMode(false);
    setIsLoading(false);
  };

  // 초기 데이터 로드
  useEffect(() => {
    handleSearch({});
  }, []);

  // 사용자 선택 핸들러
  const handleUserSelect = (params) => {
    const user = userList.find(u => u.id === params.id);
    setSelectedUser(user);
    
    if (user) {
      // 상세 정보 폼에 데이터 설정
      Object.keys(user).forEach(key => {
        if (key !== 'id' && key !== 'lastLoginDate') {
          setValue(key, user[key]);
        }
      });
      setIsEditMode(false);
    }
  };

  // 사용자 추가 핸들러
  const handleAddUser = () => {
    setSelectedUser(null);
    resetDetail({
      userId: '',
      userName: '',
      password: '',
      email: '',
      phoneNumber: '',
      departmentName: '',
      position: '',
      authorityName: '',
      isActive: 'Y'
    });
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
        resetDetail();
        
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
  const handleResetPassword = () => {
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
  const handleSave = (data) => {
    console.log('저장 데이터:', data);
    
    // 신규 사용자 추가
    if (!selectedUser) {
      const newUser = {
        id: userList.length + 1,
        ...data,
        lastLoginDate: '-'
      };
      
      setUserList([...userList, newUser]);
      setSelectedUser(newUser);
    } 
    // 기존 사용자 수정
    else {
      const updatedList = userList.map(user => 
        user.id === selectedUser.id ? { ...user, ...data } : user
      );
      
      setUserList(updatedList);
      setSelectedUser({ ...selectedUser, ...data });
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
    <Box p={3}>
      <Typography variant="h5" gutterBottom>사용자관리</Typography>
      
      {/* 검색 영역 */}
      <SearchCondition 
        title="검색 조건" 
        onSubmit={handleSubmit(handleSearch)}
        onReset={handleReset}
      >
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="userId"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="사용자 ID"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="사용자 ID를 입력하세요"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="userName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="이름"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="이름을 입력하세요"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="departmentName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="부서"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="부서명을 입력하세요"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="authorityName"
            control={control}
            render={({ field }) => (
              <FormControl variant="outlined" size="small" fullWidth>
                <InputLabel id="authority-label">권한</InputLabel>
                <Select
                  {...field}
                  labelId="authority-label"
                  label="권한"
                >
                  <MenuItem value="">전체</MenuItem>
                  <MenuItem value="총관리자">총관리자</MenuItem>
                  <MenuItem value="관리자">관리자</MenuItem>
                  <MenuItem value="일반사용자">일반사용자</MenuItem>
                  <MenuItem value="게스트">게스트</MenuItem>
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
                      onClick={handleResetPassword}
                      size="small"
                    >
                      <KeyIcon />
                    </IconButton>
                  </Box>
                )}
              </Box>
              
              <Box sx={{ flex: 1, overflow: 'auto' }}>
                {(selectedUser || isEditMode) ? (
                  <form onSubmit={handleDetailSubmit(handleSave)}>
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
                        <Controller
                          name="userId"
                          control={detailControl}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="사용자 ID"
                              variant="outlined"
                              size="small"
                              fullWidth
                              disabled={selectedUser && !isEditMode}
                              required
                            />
                          )}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Controller
                          name="userName"
                          control={detailControl}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="이름"
                              variant="outlined"
                              size="small"
                              fullWidth
                              disabled={!isEditMode}
                              required
                            />
                          )}
                        />
                      </Grid>
                      
                      {!selectedUser && (
                        <Grid item xs={12}>
                          <Controller
                            name="password"
                            control={detailControl}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                label="비밀번호"
                                type="password"
                                variant="outlined"
                                size="small"
                                fullWidth
                                required
                              />
                            )}
                          />
                        </Grid>
                      )}
                      
                      <Grid item xs={12} sm={6}>
                        <Controller
                          name="email"
                          control={detailControl}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="이메일"
                              variant="outlined"
                              size="small"
                              fullWidth
                              disabled={!isEditMode}
                            />
                          )}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Controller
                          name="phoneNumber"
                          control={detailControl}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="전화번호"
                              variant="outlined"
                              size="small"
                              fullWidth
                              disabled={!isEditMode}
                            />
                          )}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Controller
                          name="departmentName"
                          control={detailControl}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="부서"
                              variant="outlined"
                              size="small"
                              fullWidth
                              disabled={!isEditMode}
                            />
                          )}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Controller
                          name="position"
                          control={detailControl}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="직책"
                              variant="outlined"
                              size="small"
                              fullWidth
                              disabled={!isEditMode}
                            />
                          )}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Controller
                          name="authorityName"
                          control={detailControl}
                          render={({ field }) => (
                            <FormControl variant="outlined" size="small" fullWidth disabled={!isEditMode}>
                              <InputLabel id="user-authority-label">권한</InputLabel>
                              <Select
                                {...field}
                                labelId="user-authority-label"
                                label="권한"
                              >
                                <MenuItem value="총관리자">총관리자</MenuItem>
                                <MenuItem value="관리자">관리자</MenuItem>
                                <MenuItem value="일반사용자">일반사용자</MenuItem>
                                <MenuItem value="게스트">게스트</MenuItem>
                              </Select>
                            </FormControl>
                          )}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Controller
                          name="isActive"
                          control={detailControl}
                          render={({ field }) => (
                            <FormControl variant="outlined" size="small" fullWidth disabled={!isEditMode}>
                              <InputLabel id="user-status-label">상태</InputLabel>
                              <Select
                                {...field}
                                labelId="user-status-label"
                                label="상태"
                              >
                                <MenuItem value="Y">활성</MenuItem>
                                <MenuItem value="N">비활성</MenuItem>
                              </Select>
                            </FormControl>
                          )}
                        />
                      </Grid>
                      
                      {isEditMode && (
                        <Grid item xs={12} display="flex" justifyContent="flex-end" mt={2}>
                          <Button
                            variant="outlined"
                            color="secondary"
                            onClick={handleDetailReset}
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
                  </form>
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
    </Box>
  );
};

export default UserManagement; 