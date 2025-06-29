import React, {useEffect, useState} from 'react';
import './MenuManagement.css';
import {Controller, useForm} from 'react-hook-form';
import {
  alpha,
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
import {EnhancedDataGridWrapper, SearchCondition} from '../Common';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import Swal from 'sweetalert2';
import {DOMAINS, useDomain} from '../../contexts/DomainContext';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HelpModal from '../Common/HelpModal';
import {getMenus, upsertMenus, deleteMenu} from "../../api/menuApi";
import useLocalStorageVO from "../Common/UseLocalStorageVO";

const MenuManagement = (props) => {
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
  const [menuList, setMenuList] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const { loginUser } = useLocalStorageVO();

  // React Hook Form 설정 - 검색
  const { control: searchControl, handleSubmit: handleSearchSubmit, reset: resetSearch } = useForm({
    defaultValues: {
      menuId: '',
      menuName: ''
    }
  });

  // 상세 정보 상태 관리
  const [detailInfo, setDetailInfo] = useState({
    id: null,
    menuId: null,
    upMenuId: null,
    menuName: null,
    flagSubscribe: null,
    sequence: null,
    flagActive: null
  });

  // 상세 정보 변경 핸들러
  const handleDetailChange = (field, value) => {
    setDetailInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 메뉴 목록 검색
  const handleSearch = async (data) => {
    setIsLoading(true);
    try {
      // 검색 조건이 있는 경우에만 해당 값을 전달
      const menuId = data.menuId || null;
      const menuName = data.menuName || null;
      
      const res = await getMenus(menuId, menuName);
      const menus = res.getMenus ?? [];
      setMenuList(menus);
      setSelectedMenu(null);
      setIsEditMode(false);
    } catch (error) {
      console.error('API 호출 중 오류 발생:', error);
      Swal.fire({
        icon: 'error',
        title: '오류',
        text: '서버 통신 중 오류가 발생했습니다.',
        confirmButtonText: '확인'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 초기화 핸들러
  const onReset = () => {
    if (isEditMode) {
      if (selectedMenu) {
        handleMenuSelect({ id: selectedMenu.id });
      } else {
        setDetailInfo({
          id: null,
          menuId: null,
          upMenuId: null,
          menuName: null,
          flagSubscribe: null,
          sequence: null,
          flagActive: null
        });
      }
      setIsEditMode(false);
    } else {
      // 검색 조건 초기화
      resetSearch({
        menuId: '',
        menuName: ''
      });
      // 초기화 후 전체 목록 조회
      handleSearch({menuId: '', menuName: ''});
    }
  };

  // 취소 핸들러 추가
  const handleCancel = () => {
    if (selectedMenu) {
      handleMenuSelect({ id: selectedMenu.id });
    } else {
      setDetailInfo({
        id: null,
        menuId: null,
        upMenuId: null,
        menuName: null,
        flagSubscribe: null,
        sequence: null,
        flagActive: null
      });
    }
    setIsEditMode(false);
  };

  // 컬럼 정의 - 메뉴 목록
  const menuColumns = [
    { field: 'menuId', headerName: '메뉴 ID', flex: 1 },
    { field: 'menuName', headerName: '메뉴 이름', flex: 1 },
    { 
      field: 'upMenuId', 
      headerName: '상위 메뉴', 
      flex: 1,
      renderCell: (params) => {
        if (!params.value) return '-';
        const parentMenu = menuList.find(m => m.menuId === params.value);
        return parentMenu?.menuName || params.value;
      }
    },
    { 
      field: 'flagSubscribe', 
      headerName: '구독 필요', 
      flex: 0.7,
      renderCell: (params) => (
        <span className={`status-badge ${params.value ? 'active' : 'inactive'}`}>
          {params.value ? '예' : '아니오'}
        </span>
      )
    },
    { 
      field: 'sequence', 
      headerName: '정렬 순서', 
      flex: 0.7 
    }
  ];

  // 메뉴 목록 그리드 버튼
  const menuGridButtons = [
    {
      icon: <PersonAddIcon />,
      label: '메뉴 추가',
      onClick: () => handleAddMenu()
    },
    {
      icon: <DeleteIcon />,
      label: '메뉴 삭제',
      onClick: () => handleDeleteMenu(),
      disabled: !selectedMenu
    }
  ];

  // 초기 데이터 로드
  useEffect(() => {
    handleSearch({menuId: '', menuName: ''});
  }, []);

  // 메뉴 선택 핸들러
  const handleMenuSelect = (params) => {
    const menu = menuList.find(m => m.id === params.id);
    setSelectedMenu(menu);
    setIsEditMode(false);

    if (menu) {
      setDetailInfo({
        id: menu.id || null,
        menuId: menu.menuId || null,
        upMenuId: menu.upMenuId || null,
        menuName: menu.menuName || null,
        flagSubscribe: menu.flagSubscribe,
        sequence: menu.sequence || null,
        flagActive: menu.flagActive || null,
      });
    }
  };

  // 상위 메뉴 옵션 필터링
  const getParentMenuOptions = () => {
    if (!selectedMenu) return menuList;
    // 현재 선택된 메뉴와 그 하위 메뉴들을 제외한 메뉴 목록 반환
    return menuList.filter(menu => {
      // 자기 자신 제외
      if (menu.id === selectedMenu.id) return false;
      // 현재 메뉴의 하위 메뉴들 제외
      let current = menuList.find(m => m.menuId === menu.upMenuId);
      while (current) {
        if (current.id === selectedMenu.id) return false;
        current = menuList.find(m => m.menuId === current.upMenuId);
      }
      return true;
    });
  };

  // 메뉴 추가 핸들러
  const handleAddMenu = () => {
    setDetailInfo({
      id: null,
      menuId: null,
      upMenuId: null,
      menuName: null,
      flagSubscribe: null,
      sequence: null,
      flagActive: null,
    });
    setSelectedMenu(null);
    setIsEditMode(true);
  };

  // 메뉴 삭제 핸들러
  const handleDeleteMenu = () => {
    if (!selectedMenu) {
      Swal.fire({
        icon: 'warning',
        title: '알림',
        text: '삭제할 메뉴를 선택해주세요.',
        confirmButtonText: '확인'
      });
      return;
    }

    Swal.fire({
      title: '삭제 확인',
      text: `'${selectedMenu.menuName}' 메뉴를 정말 삭제하시겠습니까?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: '삭제',
      cancelButtonText: '취소'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await deleteMenu(selectedMenu.menuId);
          if (res.deleteMenu) {  // deleteCompany -> deleteMenu로 수정
            await Swal.fire({
              icon: 'success',
              title: '성공',
              text: '메뉴가 삭제되었습니다.',
              confirmButtonText: '확인'
            });
            
            // 상태 초기화 및 재조회
            setSelectedMenu(null);
            setDetailInfo({
              id: null,
              menuId: null,
              upMenuId: null,
              menuName: null,
              flagSubscribe: null,
              sequence: null,
              flagActive: null
            });
            
            // 전체 메뉴 목록 재조회
            await handleSearch({menuId: '', menuName: ''});
          } else {
            Swal.fire({
              icon: 'error',
              title: '오류',
              text: '메뉴 삭제 중 오류가 발생했습니다.',
              confirmButtonText: '확인'
            });
          }
        } catch (error) {
          console.error('메뉴 삭제 중 오류 발생:', error);
          Swal.fire({
            icon: 'error',
            title: '오류',
            text: '서버 통신 중 오류가 발생했습니다.',
            confirmButtonText: '확인'
          });
        }
      }
    });
  };

  // 수정 모드 전환
  const handleEdit = () => {
    setIsEditMode(true);
  };

  // 저장 핸들러
  const handleSave = async () => {
    try {
      const result = await upsertMenus(detailInfo);
      
      if (result) {
        Swal.fire({
          icon: 'success',
          title: '성공',
          text: result,
          confirmButtonText: '확인'
        }).then(() => {
          handleSearch({menuId: '', menuName: ''});
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: '오류',
          text: '메뉴 저장 중 오류가 발생했습니다.',
          confirmButtonText: '확인'
        });
      }
    } catch (error) {
      console.error('메뉴 저장 중 오류 발생:', error);
      Swal.fire({
        icon: 'error',
        title: '오류',
        text: error.message || '서버 통신 중 오류가 발생했습니다.',
        confirmButtonText: '확인'
      });
    }
  };

  return (
    <Box sx={{ p: 0, minHeight: '100vh' }}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 2
      }}>
        <Typography variant="h5" sx={{ color: getTextColor() }}>
          메뉴 관리
        </Typography>
        <IconButton
          color="primary"
          onClick={() => setIsHelpModalOpen(true)}
          size="small"
        >
          <HelpOutlineIcon />
        </IconButton>
      </Box>

        <SearchCondition
          title="메뉴 검색"
          onSearch={handleSearchSubmit(handleSearch)}
          onReset={onReset}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <Controller
                name="menuId"
                control={searchControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="메뉴 ID"
                    size="small"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Controller
                name="menuName"
                control={searchControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="메뉴 이름"
                    size="small"
                  />
                )}
              />
            </Grid>
          </Grid>
        </SearchCondition>

      {!isLoading && (
        <Grid container spacing={2}>
          {/* 메뉴 목록 그리드 */}
          <Grid item xs={12} md={8}>
              <EnhancedDataGridWrapper
                title="메뉴 목록"
                rows={menuList}
                columns={menuColumns}
                buttons={menuGridButtons}
                height={700}
                onRowClick={handleMenuSelect}
                tabId={props.id + "-menus"}
              />
          </Grid>

          {/* 메뉴 상세 정보 */}
          <Grid item xs={12} md={4}>
            <Paper sx={{
              height: '700px',
              p: 2,
              boxShadow: theme.shadows[2],
              borderRadius: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              bgcolor: getBgColor(),
              border: `1px solid ${getBorderColor()}`
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ color: getTextColor() }}>
                  메뉴 상세 정보
                </Typography>
                {selectedMenu && !isEditMode && (
                  <IconButton
                    color="primary"
                    onClick={handleEdit}
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                )}
              </Box>

              <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                {(selectedMenu || isEditMode) ? (
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="메뉴 ID"
                        value={detailInfo.menuId || ''}
                        onChange={(e) => handleDetailChange('menuId', e.target.value)}
                        disabled={!isEditMode}
                        required
                        size="small"
                        sx={{
                          bgcolor: !isEditMode && detailInfo.menuId ? alpha('#fff', 0.1) : 'transparent',
                          '& .MuiInputBase-input.Mui-disabled': {
                            WebkitTextFillColor: !isEditMode && detailInfo.menuId ? getTextColor() : '#666',
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="메뉴 이름"
                        value={detailInfo.menuName || ''}
                        onChange={(e) => handleDetailChange('menuName', e.target.value)}
                        disabled={!isEditMode}
                        required
                        size="small"
                        sx={{
                          bgcolor: !isEditMode && detailInfo.menuName ? alpha('#fff', 0.1) : 'transparent',
                          '& .MuiInputBase-input.Mui-disabled': {
                            WebkitTextFillColor: !isEditMode && detailInfo.menuName ? getTextColor() : '#666',
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth size="small">
                        <InputLabel>상위 메뉴</InputLabel>
                        <Select
                          label="상위 메뉴"
                          value={detailInfo.upMenuId || ''}
                          onChange={(e) => handleDetailChange('upMenuId', e.target.value)}
                          disabled={!isEditMode}
                          sx={{
                            bgcolor: !isEditMode && detailInfo.upMenuId ? alpha('#fff', 0.1) : 'transparent',
                            '& .MuiInputBase-input.Mui-disabled': {
                              WebkitTextFillColor: !isEditMode && detailInfo.upMenuId ? getTextColor() : '#666',
                            }
                          }}
                        >
                          <MenuItem value="">없음</MenuItem>
                          {menuList.map((menu) => (
                            <MenuItem key={menu.menuId} value={menu.menuId}>
                              {menu.menuName}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        type="number"
                        label="정렬 순서"
                        value={detailInfo.sequence || ''}
                        onChange={(e) => handleDetailChange('sequence', parseInt(e.target.value))}
                        disabled={!isEditMode}
                        required
                        size="small"
                        sx={{
                          bgcolor: !isEditMode && detailInfo.sequence ? alpha('#fff', 0.1) : 'transparent',
                          '& .MuiInputBase-input.Mui-disabled': {
                            WebkitTextFillColor: !isEditMode && detailInfo.sequence ? getTextColor() : '#666',
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth size="small">
                        <InputLabel>구독 필요</InputLabel>
                        <Select
                          label="구독 필요"
                          value={detailInfo.flagSubscribe}
                          onChange={(e) => handleDetailChange('flagSubscribe', e.target.value)}
                          disabled={!isEditMode}
                          sx={{
                            bgcolor: !isEditMode && detailInfo.flagSubscribe !== null ? alpha('#fff', 0.1) : 'transparent',
                            '& .MuiInputBase-input.Mui-disabled': {
                              WebkitTextFillColor: !isEditMode && detailInfo.flagSubscribe !== null ? getTextColor() : '#666',
                            }
                          }}
                        >
                          <MenuItem value={true}>예</MenuItem>
                          <MenuItem value={false}>아니오</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth size="small">
                        <InputLabel>상태</InputLabel>
                        <Select
                          label="상태"
                          value={detailInfo.flagActive}
                          onChange={(e) => handleDetailChange('flagActive', e.target.value)}
                          disabled={!isEditMode}
                          sx={{
                            bgcolor: !isEditMode && detailInfo.flagActive !== null ? alpha('#fff', 0.1) : 'transparent',
                            '& .MuiInputBase-input.Mui-disabled': {
                              WebkitTextFillColor: !isEditMode && detailInfo.flagActive !== null ? getTextColor() : '#666',
                            }
                          }}
                        >
                          <MenuItem value={true}>활성</MenuItem>
                          <MenuItem value={false}>비활성</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    {isEditMode && (
                      <Grid item xs={12} display="flex" justifyContent="flex-end" mt={2}>
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
                      메뉴를 선택하면 상세 정보가 표시됩니다.
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* 도움말 모달 */}
      <HelpModal
        open={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        title="메뉴 관리 도움말"
      >
        <Typography variant="body1" gutterBottom>
          메뉴 관리 페이지 사용 방법
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          1. 메뉴 목록 조회
        </Typography>
        <Typography variant="body2" paragraph>
          - 메뉴 ID와 메뉴 이름으로 검색이 가능합니다.
          - 메뉴 목록에서는 각 메뉴의 기본 정보를 확인할 수 있습니다.
          - 메뉴 ID, 메뉴 이름, 상위 메뉴, 구독 필요 여부, 정렬 순서, 상태 등을 표시합니다.
          - 목록에서 메뉴를 선택하면 우측에 상세 정보가 표시됩니다.
        </Typography>

        <Typography variant="h6" gutterBottom>
          2. 메뉴 추가
        </Typography>
        <Typography variant="body2" paragraph>
          - '메뉴 추가' 버튼을 클릭하여 새로운 메뉴를 생성할 수 있습니다.
          - 필수 입력 항목:
            • 메뉴 ID: 고유한 식별자
            • 메뉴 이름: 화면에 표시될 이름
            • 정렬 순서: 메뉴 표시 순서
          - 선택 입력 항목:
            • 상위 메뉴: 계층 구조 설정
            • 구독 필요: 구독이 필요한 메뉴인지 여부
            • 상태: 활성/비활성 여부
        </Typography>

        <Typography variant="h6" gutterBottom>
          3. 메뉴 수정
        </Typography>
        <Typography variant="body2" paragraph>
          - 메뉴 선택 후 우측 상단의 수정 아이콘을 클릭하여 수정 모드로 전환합니다.
          - 수정 가능한 모든 항목을 변경할 수 있습니다.
          - '저장' 버튼을 클릭하여 변경사항을 저장합니다.
          - '취소' 버튼을 클릭하여 수정을 취소할 수 있습니다.
        </Typography>

        <Typography variant="h6" gutterBottom>
          4. 메뉴 삭제
        </Typography>
        <Typography variant="body2" paragraph>
          - 메뉴 선택 후 '메뉴 삭제' 버튼을 클릭하여 삭제할 수 있습니다.
          - 삭제 전 확인 메시지가 표시됩니다.
          - 주의: 하위 메뉴가 있는 경우 삭제에 제한이 있을 수 있습니다.
        </Typography>

        <Typography variant="h6" gutterBottom>
          5. 메뉴 계층 구조
        </Typography>
        <Typography variant="body2" paragraph>
          - 상위 메뉴를 설정하여 계층 구조를 만들 수 있습니다.
          - 상위 메뉴 설정 시 순환 참조가 발생하지 않도록 주의해야 합니다.
          - 메뉴의 깊이에 따라 화면에서의 표시 위치가 결정됩니다.
        </Typography>

        <Typography variant="h6" gutterBottom>
          6. 주의사항
        </Typography>
        <Typography variant="body2" paragraph>
          - 메뉴 ID는 중복될 수 없습니다.
          - 정렬 순서는 같은 레벨의 메뉴들 간의 표시 순서를 결정합니다.
          - 비활성화된 메뉴는 시스템에서 표시되지 않습니다.
          - 구독이 필요한 메뉴는 구독 사용자만 접근할 수 있습니다.
        </Typography>
      </HelpModal>
    </Box>
  );
};

export default MenuManagement; 