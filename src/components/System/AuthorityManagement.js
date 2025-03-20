import React, { useState, useEffect } from 'react';
import './AuthorityManagement.css';
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
  Tabs,
  Tab,
  Button,
  Checkbox,
  FormControlLabel,
  Paper
} from '@mui/material';
import { MuiDataGridWrapper, SearchCondition } from '../Common';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Swal from 'sweetalert2';
import { useDomain, DOMAINS } from '../../contexts/DomainContext';

const AuthorityManagement = () => {
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
  const [activeTab, setActiveTab] = useState(0);
  const [authorityList, setAuthorityList] = useState([]);
  const [selectedAuthority, setSelectedAuthority] = useState(null);
  const [menuPermissions, setMenuPermissions] = useState([]);
  
  // React Hook Form 설정
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      authorityName: '',
      authorityLevel: ''
    }
  });

  // 초기화 함수
  const handleReset = () => {
    reset({
      authorityName: '',
      authorityLevel: ''
    });
  };

  // 탭 변경 핸들러
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // 권한 목록 검색
  const handleSearch = (data) => {
    console.log('검색 조건:', data);
    
    // API 호출 대신 더미 데이터 사용
    const dummyData = [
      { id: 1, authorityName: '총관리자', authorityLevel: 10, memberCount: 3, description: '모든 메뉴에 대한 권한을 가진 최고 관리자', createdDate: '2024-01-10', createdBy: '시스템관리자' },
      { id: 2, authorityName: '관리자', authorityLevel: 7, memberCount: 5, description: '대부분의 메뉴에 대한 권한을 가진 일반 관리자', createdDate: '2024-01-15', createdBy: '시스템관리자' },
      { id: 3, authorityName: '공지사항관리자', authorityLevel: 5, memberCount: 2, description: '공지사항 관리 권한을 가진 사용자', createdDate: '2024-02-05', createdBy: '총관리자' },
      { id: 4, authorityName: '일반사용자', authorityLevel: 3, memberCount: 15, description: '기본 메뉴 조회 권한을 가진 일반 사용자', createdDate: '2024-01-20', createdBy: '시스템관리자' },
      { id: 5, authorityName: '게스트', authorityLevel: 1, memberCount: 8, description: '제한된 조회 권한만 가진 게스트 사용자', createdDate: '2024-02-10', createdBy: '총관리자' }
    ];
    
    setAuthorityList(dummyData);
    setSelectedAuthority(null);
    setMenuPermissions([]);
  };

  // 권한 선택 핸들러
  const handleAuthoritySelect = (params) => {
    const authority = authorityList.find(a => a.id === params.id);
    setSelectedAuthority(authority);
    
    if (!authority) return;
    
    // 선택된 권한의 메뉴 권한 정보 가져오기 (실제로는 API 호출)
    const dummyMenuPermissions = [
      { id: 1, menuName: '메인화면', permission: true, view: true, create: true, update: true, delete: true, approval: true, export: true },
      { id: 2, menuName: '공지사항', permission: true, view: true, create: true, update: true, delete: true, approval: false, export: true },
      { id: 3, menuName: '권한관리', permission: true, view: true, create: true, update: true, delete: true, approval: false, export: false },
      { id: 4, menuName: '사용자관리', permission: true, view: true, create: true, update: true, delete: true, approval: false, export: true },
      { id: 5, menuName: '회사정보', permission: true, view: true, create: false, update: false, delete: false, approval: false, export: false },
      { id: 6, menuName: '생산계획관리', permission: true, view: true, create: true, update: true, delete: true, approval: true, export: true },
      { id: 7, menuName: '작업지시관리', permission: true, view: true, create: true, update: true, delete: true, approval: true, export: true },
      { id: 8, menuName: '생산실적등록', permission: true, view: true, create: true, update: true, delete: true, approval: true, export: true },
      { id: 9, menuName: '생산실적조회', permission: true, view: true, create: false, update: false, delete: false, approval: false, export: true },
      { id: 10, menuName: '불량조회', permission: true, view: true, create: false, update: false, delete: false, approval: false, export: true }
    ];
    
    setMenuPermissions(dummyMenuPermissions);
  };

  // 새 권한 생성 핸들러
  const handleCreate = () => {
    Swal.fire({
      title: '새 권한 등록',
      html: `
        <div class="swal2-input-container">
          <input id="authority-name" class="swal2-input" placeholder="권한명">
          <input id="authority-level" class="swal2-input" placeholder="권한레벨" type="number" min="1" max="10">
          <textarea id="authority-desc" class="swal2-textarea" placeholder="권한 설명"></textarea>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: '등록',
      cancelButtonText: '취소',
      preConfirm: () => {
        const authorityName = document.getElementById('authority-name').value;
        const authorityLevel = document.getElementById('authority-level').value;
        const description = document.getElementById('authority-desc').value;
        
        if (!authorityName || !authorityLevel) {
          Swal.showValidationMessage('권한명과 권한레벨은 필수 입력 항목입니다.');
          return false;
        }
        
        return { authorityName, authorityLevel, description };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const { authorityName, authorityLevel, description } = result.value;
        
        // 새 권한 추가 (실제로는 API 호출)
        const newAuthority = {
          id: Date.now(),
          authorityName,
          authorityLevel: Number(authorityLevel),
          description,
          memberCount: 0,
          createdDate: new Date().toISOString().split('T')[0],
          createdBy: 'Current User'
        };
        
        setAuthorityList([...authorityList, newAuthority]);
        
        Swal.fire({
          icon: 'success',
          title: '성공',
          text: '권한이 등록되었습니다.',
          confirmButtonText: '확인'
        });
      }
    });
  };

  // 권한 삭제 핸들러
  const handleDelete = () => {
    if (!selectedAuthority) {
      Swal.fire({
        icon: 'warning',
        title: '알림',
        text: '삭제할 권한을 선택해주세요.',
        confirmButtonText: '확인'
      });
      return;
    }
    
    Swal.fire({
      title: '삭제 확인',
      text: `'${selectedAuthority.authorityName}' 권한을 정말 삭제하시겠습니까?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: '삭제',
      cancelButtonText: '취소'
    }).then((result) => {
      if (result.isConfirmed) {
        // 권한 삭제 (실제로는 API 호출)
        const updatedList = authorityList.filter(authority => authority.id !== selectedAuthority.id);
        setAuthorityList(updatedList);
        setSelectedAuthority(null);
        setMenuPermissions([]);
        
        Swal.fire({
          icon: 'success',
          title: '성공',
          text: '삭제되었습니다.',
          confirmButtonText: '확인'
        });
      }
    });
  };

  // 권한 저장 핸들러
  const handleSave = () => {
    if (!selectedAuthority) {
      Swal.fire({
        icon: 'warning',
        title: '알림',
        text: '저장할 권한을 선택해주세요.',
        confirmButtonText: '확인'
      });
      return;
    }
    
    Swal.fire({
      icon: 'success',
      title: '성공',
      text: '권한 정보가 저장되었습니다.',
      confirmButtonText: '확인'
    });
  };

  // 메뉴 권한 변경 핸들러
  const handlePermissionChange = (menuId, field, value) => {
    setMenuPermissions(prevPermissions => 
      prevPermissions.map(menu => 
        menu.id === menuId ? { ...menu, [field]: value } : menu
      )
    );
  };

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch({});
      setIsLoading(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // 권한 목록 그리드 컬럼 정의
  const authorityColumns = [
    { field: 'authorityName', headerName: '권한 명', width: 150, flex: 1 },
    { field: 'authorityLevel', headerName: '권한 레벨', width: 120 },
    { field: 'memberCount', headerName: '사용자 수', width: 100, type: 'number' },
    { field: 'description', headerName: '설명', width: 250 },
    { field: 'createdDate', headerName: '등록일', width: 110 },
    { field: 'createdBy', headerName: '등록자', width: 120 }
  ];

  // 권한 목록 그리드 버튼
  const authorityGridButtons = [
    { label: '조회', onClick: handleSubmit(handleSearch), icon: <SearchIcon /> },
    { label: '등록', onClick: handleCreate, icon: <AddIcon /> },
    { label: '저장', onClick: handleSave, icon: <SaveIcon /> },
    { label: '삭제', onClick: handleDelete, icon: <DeleteIcon /> }
  ];

  return (
    <Box sx={{ p: 2, minHeight: '100vh' }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 3,
        borderBottom: `1px solid ${isDarkMode ? '#2d4764' : '#e0e0e0'}`,
        pb: 1
      }}>
        <Typography 
          variant="h5" 
          component="h2" 
          sx={{ 
            fontWeight: 600,
            color: isDarkMode ? '#b3c5e6' : 'inherit'
          }}
        >
          권한관리
        </Typography>
      </Box>

      {/* 탭 영역 */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="업체 구분" />
          <Tab label="사이트 구분" />
        </Tabs>
      </Box>

      {/* 검색 조건 영역 */}
      <SearchCondition 
        onSearch={handleSubmit(handleSearch)}
        onReset={handleReset}
      >
        <Grid item xs={12} sm={6} md={6}>
          <Controller
            name="authorityName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="권한명"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="권한명을 입력하세요"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={6}>
          <Controller
            name="authorityLevel"
            control={control}
            render={({ field }) => (
              <FormControl variant="outlined" size="small" fullWidth>
                <InputLabel id="authority-level-label">권한레벨</InputLabel>
                <Select
                  {...field}
                  labelId="authority-level-label"
                  label="권한레벨"
                >
                  <MenuItem value="">전체</MenuItem>
                  <MenuItem value="10">10 (최고관리자)</MenuItem>
                  <MenuItem value="7">7 (관리자)</MenuItem>
                  <MenuItem value="5">5 (중간권한)</MenuItem>
                  <MenuItem value="3">3 (일반사용자)</MenuItem>
                  <MenuItem value="1">1 (게스트)</MenuItem>
                </Select>
              </FormControl>
            )}
          />
        </Grid>
      </SearchCondition>
      
      {/* 그리드 영역 */}
      {!isLoading && (
        <Grid container spacing={2}>
          {/* 권한 목록 그리드 */}
          <Grid item xs={12} md={6}>
            <MuiDataGridWrapper
              title="권한 목록"
              rows={authorityList}
              columns={authorityColumns}
              buttons={authorityGridButtons}
              height={450}
              onRowClick={handleAuthoritySelect}
            />
          </Grid>
          
          {/* 메뉴 권한 설정 영역 */}
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
                  {selectedAuthority ? `메뉴 권한 설정 - ${selectedAuthority.authorityName}` : '메뉴 권한 설정'}
                </Typography>
                {selectedAuthority && (
                  <Box>
                    <Button
                      variant="contained"
                      size="small"
                      color="primary"
                      startIcon={<SaveIcon />}
                      onClick={handleSave}
                      sx={{ mr: 1 }}
                    >
                      저장
                    </Button>
                  </Box>
                )}
              </Box>
              
              <Box sx={{ flex: 1, overflow: 'auto' }}>
                {selectedAuthority ? (
                  <table className="permission-table">
                    <thead>
                      <tr>
                        <th>메뉴명</th>
                        <th>허용</th>
                        <th>조회</th>
                        <th>삽입</th>
                        <th>저장</th>
                        <th>삭제</th>
                        <th>등록</th>
                        <th>출력</th>
                      </tr>
                    </thead>
                    <tbody>
                      {menuPermissions.map(menu => (
                        <tr key={menu.id}>
                          <td>{menu.menuName}</td>
                          <td>
                            <Checkbox
                              checked={menu.permission}
                              onChange={(e) => handlePermissionChange(menu.id, 'permission', e.target.checked)}
                              color="primary"
                              size="small"
                            />
                          </td>
                          <td>
                            <Checkbox
                              checked={menu.view}
                              onChange={(e) => handlePermissionChange(menu.id, 'view', e.target.checked)}
                              color="primary"
                              size="small"
                              disabled={!menu.permission}
                            />
                          </td>
                          <td>
                            <Checkbox
                              checked={menu.create}
                              onChange={(e) => handlePermissionChange(menu.id, 'create', e.target.checked)}
                              color="primary"
                              size="small"
                              disabled={!menu.permission}
                            />
                          </td>
                          <td>
                            <Checkbox
                              checked={menu.update}
                              onChange={(e) => handlePermissionChange(menu.id, 'update', e.target.checked)}
                              color="primary"
                              size="small"
                              disabled={!menu.permission}
                            />
                          </td>
                          <td>
                            <Checkbox
                              checked={menu.delete}
                              onChange={(e) => handlePermissionChange(menu.id, 'delete', e.target.checked)}
                              color="primary"
                              size="small"
                              disabled={!menu.permission}
                            />
                          </td>
                          <td>
                            <Checkbox
                              checked={menu.approval}
                              onChange={(e) => handlePermissionChange(menu.id, 'approval', e.target.checked)}
                              color="primary"
                              size="small"
                              disabled={!menu.permission}
                            />
                          </td>
                          <td>
                            <Checkbox
                              checked={menu.export}
                              onChange={(e) => handlePermissionChange(menu.id, 'export', e.target.checked)}
                              color="primary"
                              size="small"
                              disabled={!menu.permission}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <Box 
                    display="flex" 
                    flexDirection="column" 
                    alignItems="center" 
                    justifyContent="center" 
                    height="100%"
                  >
                    <Typography variant="body1" color="text.secondary">
                      권한을 선택하면 메뉴별 권한 설정이 표시됩니다.
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
            • 권한관리에서는 사용자 그룹별 시스템 접근 권한을 설정할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()}>
            • 메뉴별로 조회, 삽입, 저장, 삭제, 등록, 출력 권한을 세부적으로 설정할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()}>
            • 권한 레벨이 높을수록 더 많은 권한을 가집니다. (10: 최고관리자, 1: 게스트)
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
};

export default AuthorityManagement; 