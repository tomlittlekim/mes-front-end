import React, { useEffect, useState } from 'react';
import './AuthorityManagement.css';
import { Controller, useForm } from 'react-hook-form';
import {
  alpha,
  Box,
  Button,
  Checkbox,
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
import {EnhancedDataGridWrapper, MuiDataGridWrapper, SearchCondition} from '../Common';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import Swal from 'sweetalert2';
import { DOMAINS, useDomain } from '../../contexts/DomainContext';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HelpModal from '../Common/HelpModal';
import { getRoles, upsertUserRole, deleteUserRole, getRolesForSelect } from '../../api/userRoleApi';
import { getMenuRoleGroup, upsertMenuRole } from '../../api/menuRoleApi';
import useLocalStorageVO from '../Common/UseLocalStorageVO';
import {getCompanySelect, getInitialCodes, getMenuSelect, getSite} from '../../api/utilApi';

const AuthorityManagement = (props) => {
  // 현재 테마 가져오기
  const theme = useTheme();
  const { domain } = useDomain();
  const isDarkMode = theme.palette.mode === 'dark';
  const { loginUser } = useLocalStorageVO();

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
  const [roleList, setRoleList] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // 메뉴 권한 상태 관리
  const [menuRoleList, setMenuRoleList] = useState([]);
  const [originalMenuRoleList, setOriginalMenuRoleList] = useState([]);
  const [isMenuRoleModified, setIsMenuRoleModified] = useState(false);

  // 회사, 사이트 옵션 상태 추가
  const [companyOptions, setCompanyOptions] = useState([]);
  const [siteOptions, setSiteOptions] = useState([]);

  // 권한 레벨 옵션 상태 추가
  const [priorityLevelOptions, setPriorityLevelOptions] = useState([]);

  //메뉴 셀렉트 옵션 상태 추가
  const [menuOptions, setMenuOptions] = useState([]);

  const [updatedRows, setUpdatedRows] = useState([]); // 수정된 필드만 저장하는 객체
  const [addRows,setAddRows] = useState([]);

  // 검색 조건 상태 관리
  const [searchCondition, setSearchCondition] = useState({
    site: null,
    compCd: null,
    priorityLevel: null
  });

  // 상세 정보 상태 관리
  const [detailInfo, setDetailInfo] = useState({
    roleId: null,
    site: null,
    compCd: null,
    priorityLevel: null,
    roleName: null,
    flagDefault: false,
    sequence: null
  });

  // 상세 정보 변경 핸들러
  const handleDetailChange = (field, value) => {
    setDetailInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 검색 조건이 변경될 때마다 검색 실행
  useEffect(() => {
    handleSearch(searchCondition);
  }, [searchCondition]);

  // 권한 목록 검색
  const handleSearch = async (data) => {
    setIsLoading(true);
    try {
      const response = await getRoles(data);
      const rolesWithId = (response.getRoles ?? []).map(role => ({
        ...role,
        id: role.roleId
      }));
      setRoleList(rolesWithId);
      setSelectedRole(null);
      setIsEditMode(false);
    } catch (error) {
      console.error('권한 목록 조회 중 오류 발생:', error);
      Swal.fire({
        icon: 'error',
        title: '오류',
        text: '권한 목록을 불러오는 중 오류가 발생했습니다.',
        confirmButtonText: '확인'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 검색 조건 변경 핸들러
  const handleSearchChange = (field, value) => {
    setSearchCondition(prev => ({
      ...prev,
      [field]: value === '' ? null : value
    }));
  };

  // 초기화 핸들러
  const onReset = () => {
    if (isEditMode) {
      if (selectedRole) {
        handleRoleSelect({ id: selectedRole.id });
      } else {
        setDetailInfo({
          roleId: null,
          site: null,
          compCd: null,
          priorityLevel: null,
          roleName: '',
          flagDefault: false,
          sequence: null
        });
      }
      setIsEditMode(false);
    } else {
      setSearchCondition({
        site: null,
        compCd: null,
        priorityLevel: null
      });
    }
  };

  // 취소 핸들러
  const handleCancel = () => {
    if (selectedRole) {
      handleRoleSelect({ id: selectedRole.id });
    } else {
      setDetailInfo({
        roleId: null,
        site: null,
        compCd: null,
        priorityLevel: null,
        roleName: null,
        flagDefault: false,
        sequence: null
      });
    }
    setIsEditMode(false);
  };

  // 초기 데이터 로드 (회사, 사이트, 권한 레벨 옵션)
  useEffect(() => {
    const loadSelectOptions = async () => {
      try {
        if (loginUser.priorityLevel === 5) {
          const companyData = await getCompanySelect();
          setCompanyOptions(companyData);

          const siteData = await getSite();
          setSiteOptions(siteData);
        }

        const menuData = await getMenuSelect();
        setMenuOptions(menuData.getMenus ?? []);

        const rolesData = await getRolesForSelect();
        // compCd가 'default'인 권한만 필터링
        const filteredRoles = (rolesData.getRolesForSelect ?? [])
            .filter(role => role.compCd === 'default' && role.priorityLevel !== 5);
        setPriorityLevelOptions(filteredRoles);
      } catch (error) {
        console.error('옵션 데이터 로드 중 오류 발생:', error);
      }
    };
    loadSelectOptions();
  }, [loginUser]);

  // 컬럼 정의 - 권한 목록
  const roleColumns = [
    { field: 'roleName', headerName: '권한 이름', flex: 1 },
    {
      field: 'site',
      headerName: '지역',
      flex: 1,
      renderCell: (params) => {
        if (!params.row.site) return '-';
        const pos = siteOptions.find(p => p.codeId === params.row.site);
        return pos?.codeName || '-';
      }
    },
    {
      field: 'compCd',
      headerName: '회사',
      flex: 1,
      renderCell: (params) => {
        if (!params.row.compCd) return '-';
        const pos = companyOptions.find(p => p.compCd === params.row.compCd);
        return pos?.companyName || '-';
      }
    },
    { field: 'priorityLevel', headerName: '권한 레벨', flex: 0.7 },
    { 
      field: 'flagDefault', 
      headerName: '기본 권한', 
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

  // 권한 목록 그리드 버튼
  const roleGridButtons = [
    {
      icon: <PersonAddIcon />,
      label: '권한 추가',
      onClick: () => handleAddRole()
    },
    {
      icon: <DeleteIcon />,
      label: '권한 삭제',
      onClick: () => handleDeleteRole(),
      disabled: !selectedRole
    }
  ];

  // 권한 선택 핸들러
  const handleRoleSelect = async (params) => {
    const role = roleList.find(r => r.id === params.id);
    setSelectedRole(role);
    setIsEditMode(false);

    if (role) {
      // site와 compCd 값 설정
      const site = loginUser.priorityLevel === 5 ? role.site : loginUser.site;
      const compCd = loginUser.priorityLevel === 5 ? role.compCd : loginUser.compCd;

      setDetailInfo({
        roleId: role.roleId || null,
        site: site || null,
        compCd: compCd || null,
        priorityLevel: role.priorityLevel || null,
        roleName: role.roleName || '',
        flagDefault: role.flagDefault || false,
        sequence: role.sequence || null
      });

      try {
        const response = await getMenuRoleGroup(role.roleId);
        const menuRoles = response.getMenuRoleGroup.map((role, index) => ({
          ...role,
          id: `${role.roleId}_${role.menuId}_${index}`
        }));
        setMenuRoleList(menuRoles);
        setOriginalMenuRoleList(JSON.parse(JSON.stringify(menuRoles)));
        setIsMenuRoleModified(false);
      } catch (error) {
        console.error('메뉴 권한 조회 중 오류 발생:', error);
        Swal.fire({
          icon: 'error',
          title: '오류',
          text: '메뉴 권한 정보를 불러오는 중 오류가 발생했습니다.',
          confirmButtonText: '확인'
        });
      }
    }
  };

  // 권한 추가 핸들러
  const handleAddRole = () => {
    setDetailInfo({
      roleId: null,
      site: null,
      compCd: null,
      priorityLevel: null,
      roleName: '',
      flagDefault: false,
      sequence: null
    });
    setSelectedRole(null);
    setIsEditMode(true);
  };

  // 권한 삭제 핸들러
  const handleDeleteRole = () => {
    if (!selectedRole) {
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
      text: `'${selectedRole.roleName}' 권한을 정말 삭제하시겠습니까?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: '삭제',
      cancelButtonText: '취소'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await deleteUserRole(selectedRole.roleId);
          await Swal.fire({
            icon: 'success',
            title: '성공',
            text: '권한이 성공적으로 삭제되었습니다.',
            confirmButtonText: '확인'
          });
          
          setSelectedRole(null);
          setDetailInfo({
            roleId: null,
            site: null,
            compCd: null,
            priorityLevel: null,
            roleName: '',
            flagDefault: false,
            sequence: null
          });
          
          handleSearch({});
        } catch (error) {
          console.error('권한 삭제 중 오류 발생:', error);
          Swal.fire({
            icon: 'error',
            title: '오류',
            text: error.message || '권한 삭제 중 오류가 발생했습니다.',
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
      // priorityLevel과 일치하는 default 권한의 roleId를 찾아서 fixRoleId로 설정
      const defaultRole = priorityLevelOptions.find(role => 
        role.compCd === 'default' && role.priorityLevel === detailInfo.priorityLevel
      );

      const response = await upsertUserRole({
        roleId: detailInfo.roleId,
        site: detailInfo.site,
        compCd: detailInfo.compCd,
        fixRoleId: defaultRole?.roleId || null,
        roleName: detailInfo.roleName,
        flagDefault: detailInfo.flagDefault,
        sequence: detailInfo.sequence
      });

      await Swal.fire({
        icon: 'success',
        title: '성공',
        text: '권한이 성공적으로 저장되었습니다.',
        confirmButtonText: '확인'
      });

      setIsEditMode(false);
      handleSearch({});
    } catch (error) {
      console.error('권한 저장 중 오류 발생:', error);
      Swal.fire({
        icon: 'error',
        title: '오류',
        text: error.message || '권한 저장 중 오류가 발생했습니다.',
        confirmButtonText: '확인'
      });
    }
  };

  // 메뉴 권한 변경 핸들러
  const handleMenuRoleChange = (menuId, field, value) => {
    setMenuRoleList(prev => {
      const newList = prev.map(menuRole => {
        if (menuRole.menuId === menuId) {
          return { ...menuRole, [field]: value };
        }
        return menuRole;
      });

      // 원본과 비교하여 수정 여부 확인
      const isModified = JSON.stringify(newList) !== JSON.stringify(originalMenuRoleList);
      setIsMenuRoleModified(isModified);

      return newList;
    });
  };

  // 메뉴 권한 저장 핸들러
  const handleMenuRoleSave = async () => {
    try {
      // 수정된 항목만 필터링
      const modifiedMenuRoles = menuRoleList.filter(menuRole => {
        const original = originalMenuRoleList.find(orig => orig.menuId === menuRole.menuId);
        return !original || JSON.stringify(menuRole) !== JSON.stringify(original);
      });

      if (modifiedMenuRoles.length === 0) {
        Swal.fire({
          icon: 'info',
          title: '알림',
          text: '수정된 메뉴 권한이 없습니다.',
          confirmButtonText: '확인'
        });
        return;
      }

      // id 필드 제거하고 API 요청
      const requestData = modifiedMenuRoles.map(({ id, ...rest }) => rest);
      const response = await upsertMenuRole(requestData);

      await Swal.fire({
        icon: 'success',
        title: '성공',
        text: response,
        confirmButtonText: '확인'
      });

      // 권한 목록 새로고침
      const updatedResponse = await getMenuRoleGroup(selectedRole.roleId);
      const updatedMenuRoles = updatedResponse.getMenuRoleGroup.map((role, index) => ({
        ...role,
        id: `${role.roleId}_${role.menuId}_${index}` // roleId와 menuId를 조합하여 고유한 id 생성
      }));
      setMenuRoleList(updatedMenuRoles);
      setOriginalMenuRoleList(JSON.parse(JSON.stringify(updatedMenuRoles)));
      setIsMenuRoleModified(false);
    } catch (error) {
      console.error('메뉴 권한 저장 중 오류 발생:', error);
      Swal.fire({
        icon: 'error',
        title: '오류',
        text: error.message || '메뉴 권한 저장 중 오류가 발생했습니다.',
        confirmButtonText: '확인'
      });
    }
  };

  // 메뉴 권한 컬럼 정의
  const menuRoleColumns = [
    {
      field: 'menuId',
      headerName: '메뉴명',
      flex: 1,
      renderCell: (params) => {
        if (!params.row.menuId) return '-';
        const dept = menuOptions.find(m => m.menuId === params.row.menuId);
        return dept.menuName || '-';
      }
    },
    {
      field: 'isOpen',
      headerName: '화면',
      flex: 0.5,
      renderCell: (params) => (
        <Checkbox
          checked={params.row.isOpen || false}
          onChange={(e) => handleMenuRoleChange(params.row.menuId, 'isOpen', e.target.checked)}
          disabled={!selectedRole}
        />
      )
    },
    {
      field: 'isSelect',
      headerName: '조회',
      flex: 0.5,
      renderCell: (params) => (
        <Checkbox
          checked={params.row.isSelect || false}
          onChange={(e) => handleMenuRoleChange(params.row.menuId, 'isSelect', e.target.checked)}
          disabled={!selectedRole}
        />
      )
    },
    {
      field: 'isInsert',
      headerName: '입력',
      flex: 0.5,
      renderCell: (params) => (
        <Checkbox
          checked={params.row.isInsert || false}
          onChange={(e) => handleMenuRoleChange(params.row.menuId, 'isInsert', e.target.checked)}
          disabled={!selectedRole}
        />
      )
    },
    {
      field: 'isUpdate',
      headerName: '수정',
      flex: 0.5,
      renderCell: (params) => (
        <Checkbox
          checked={params.row.isUpdate || false}
          onChange={(e) => handleMenuRoleChange(params.row.menuId, 'isUpdate', e.target.checked)}
          disabled={!selectedRole}
        />
      )
    },
    {
      field: 'isDelete',
      headerName: '삭제',
      flex: 0.5,
      renderCell: (params) => (
        <Checkbox
          checked={params.row.isDelete || false}
          onChange={(e) => handleMenuRoleChange(params.row.menuId, 'isDelete', e.target.checked)}
          disabled={!selectedRole}
        />
      )
    },
    {
      field: 'isAdd',
      headerName: '추가',
      flex: 0.5,
      renderCell: (params) => (
        <Checkbox
          checked={params.row.isAdd || false}
          onChange={(e) => handleMenuRoleChange(params.row.menuId, 'isAdd', e.target.checked)}
          disabled={!selectedRole}
        />
      )
    },
    {
      field: 'isPopup',
      headerName: '팝업',
      flex: 0.5,
      renderCell: (params) => (
        <Checkbox
          checked={params.row.isPopup || false}
          onChange={(e) => handleMenuRoleChange(params.row.menuId, 'isPopup', e.target.checked)}
          disabled={!selectedRole}
        />
      )
    },
    {
      field: 'isPrint',
      headerName: '출력',
      flex: 0.5,
      renderCell: (params) => (
        <Checkbox
          checked={params.row.isPrint || false}
          onChange={(e) => handleMenuRoleChange(params.row.menuId, 'isPrint', e.target.checked)}
          disabled={!selectedRole}
        />
      )
    }
  ];

  function handleProcessRowUpdate(newRow, oldRow) {
    const isNewRow = oldRow.id.startsWith('NEW_');

    roleList((prev) => {
      return prev.map((row) =>
          //기존 행이면 덮어씌우기 새로운행이면 새로운행 추가
          row.roleId === oldRow.roleId ? { ...row, ...newRow } : row
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
          권한 관리
        </Typography>
        <IconButton
          color="primary"
          onClick={() => setIsHelpModalOpen(true)}
          size="small"
        >
          <HelpOutlineIcon />
        </IconButton>
      </Box>

      <Paper sx={{
        p: 2,
        mb: 2,
        boxShadow: theme.shadows[2],
        borderRadius: 1,
        bgcolor: getBgColor(),
        border: `1px solid ${getBorderColor()}`
      }}>
        <SearchCondition
          title="권한 검색"
          onSearch={() => {}} // 검색 버튼 클릭 시 아무 동작도 하지 않음 (자동 검색)
          onReset={onReset}
        >
          <Grid container spacing={2}>
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
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>회사</InputLabel>
                <Select
                  label="회사"
                  name="compCd"
                  value={searchCondition.compCd || ''}
                  onChange={(e) => handleSearchChange('compCd', e.target.value)}
                >
                  <MenuItem value="">전체</MenuItem>
                  {(companyOptions || []).map((option) => (
                    <MenuItem key={option.compCd} value={option.compCd}>
                      {option.companyName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>권한 레벨</InputLabel>
                <Select
                  label="권한 레벨"
                  name="priorityLevel"
                  value={searchCondition.priorityLevel || ''}
                  onChange={(e) => handleSearchChange('priorityLevel', e.target.value)}
                >
                  <MenuItem value="">전체</MenuItem>
                  {(priorityLevelOptions || []).map((option) => (
                    <MenuItem key={option.roleId} value={option.priorityLevel}>
                      {option.roleName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </SearchCondition>
      </Paper>

      {!isLoading && (
        <Grid container spacing={2}>
          {/* 권한 목록 그리드 */}
          <Grid item xs={12} md={8}>
            <EnhancedDataGridWrapper
              title="권한 목록"
              rows={roleList}
              columns={roleColumns}
              buttons={roleGridButtons}
              height={450}
              onRowClick={handleRoleSelect}
              tabId={props.id + "-users"}
              gridProps={{
                editMode: 'cell',
                onProcessUpdate: handleProcessRowUpdate
              }}
            />
          </Grid>

          {/* 권한 상세 정보 영역 */}
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
                  권한 상세 정보
                </Typography>
                {selectedRole && !isEditMode && (
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
                {(selectedRole || isEditMode) ? (
                  <Grid container spacing={1}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="권한 이름"
                        value={detailInfo.roleName || ''}
                        onChange={(e) => handleDetailChange('roleName', e.target.value)}
                        disabled={!isEditMode}
                        required
                        size="small"
                        sx={{
                          bgcolor: !isEditMode && detailInfo.roleName ? alpha('#fff', 0.1) : 'transparent',
                          '& .MuiInputBase-input.Mui-disabled': {
                            WebkitTextFillColor: !isEditMode && detailInfo.roleName ? getTextColor() : '#666',
                          }
                        }}
                      />
                    </Grid>
                    {isEditMode && !selectedRole && loginUser.priorityLevel === 5 && (
                      <>
                        <Grid item xs={12}>
                          <FormControl fullWidth size="small">
                            <InputLabel id="site-label">지역</InputLabel>
                            <Select
                              labelId="site-label"
                              label="지역"
                              value={detailInfo.site || ''}
                              onChange={(e) => handleDetailChange('site', e.target.value)}
                              required
                            >
                              {siteOptions.map((option) => (
                                <MenuItem key={option.codeId} value={option.codeId}>
                                  {option.codeName}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                          <FormControl fullWidth size="small">
                            <InputLabel id="company-label">회사</InputLabel>
                            <Select
                              labelId="company-label"
                              label="회사"
                              value={detailInfo.compCd || ''}
                              onChange={(e) => handleDetailChange('compCd', e.target.value)}
                              required
                            >
                              {companyOptions.filter(c=> c.compCd !== 'default').map((option) => (
                                <MenuItem key={option.compCd} value={option.compCd}>
                                  {option.companyName}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                      </>
                    )}
                    <Grid item xs={12}>
                      {isEditMode ? (
                        <FormControl fullWidth size="small">
                          <InputLabel id="priority-level-label">권한 레벨</InputLabel>
                          <Select
                            labelId="priority-level-label"
                            label="권한 레벨"
                            value={detailInfo.priorityLevel || ''}
                            onChange={(e) => handleDetailChange('priorityLevel', e.target.value)}
                            required
                          >
                            {priorityLevelOptions.map((option) => (
                              <MenuItem key={option.priorityLevel} value={option.priorityLevel}>
                                {option.roleName}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      ) : (
                        <TextField
                          fullWidth
                          label="권한 레벨"
                          value={priorityLevelOptions.find(opt => opt.priorityLevel === detailInfo.priorityLevel)?.roleName || ''}
                          disabled
                          size="small"
                          sx={{
                            bgcolor: detailInfo.priorityLevel ? alpha('#fff', 0.1) : 'transparent',
                            '& .MuiInputBase-input.Mui-disabled': {
                              WebkitTextFillColor: detailInfo.priorityLevel ? getTextColor() : '#666',
                            }
                          }}
                        />
                      )}
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
                        <InputLabel id="flag-default-label">기본 권한</InputLabel>
                        <Select
                          labelId="flag-default-label"
                          label="기본 권한"
                          value={detailInfo.flagDefault}
                          onChange={(e) => handleDetailChange('flagDefault', e.target.value)}
                          disabled={!isEditMode}
                          sx={{
                            bgcolor: !isEditMode && detailInfo.flagDefault !== null ? alpha('#fff', 0.1) : 'transparent',
                            '& .MuiInputBase-input.Mui-disabled': {
                              WebkitTextFillColor: !isEditMode && detailInfo.flagDefault !== null ? getTextColor() : '#666',
                            }
                          }}
                        >
                          <MenuItem value={true}>예</MenuItem>
                          <MenuItem value={false}>아니오</MenuItem>
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
                      권한을 선택하면 상세 정보가 표시됩니다.
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* 메뉴 권한 그리드 */}
          {selectedRole && (
            <Grid item xs={12}>
              <Paper sx={{
                p: 2,
                boxShadow: theme.shadows[2],
                borderRadius: 1,
                bgcolor: getBgColor(),
                border: `1px solid ${getBorderColor()}`
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ color: getTextColor() }}>
                    메뉴 권한 설정
                  </Typography>
                  {isMenuRoleModified && (
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<SaveIcon />}
                      onClick={handleMenuRoleSave}
                    >
                      저장
                    </Button>
                  )}
                </Box>
                <MuiDataGridWrapper
                  rows={menuRoleList}
                  columns={menuRoleColumns}
                  height={400}
                  pagination={true}
                  pageSize={10}
                  rowsPerPageOptions={[10, 20, 30]}
                  disableSelectionOnClick
                />
              </Paper>
            </Grid>
          )}
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
            • 권한관리에서는 시스템의 권한을 관리할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()}>
            • 권한별로 우선순위 레벨을 설정하여 권한의 중요도를 관리할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()}>
            • 기본 권한으로 설정된 권한은 신규 사용자 등록 시 자동으로 부여됩니다.
          </Typography>
        </Stack>
      </Box>

      {/* 도움말 모달 */}
      <HelpModal
        open={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        title="권한 관리 도움말"
        content={
          <div>
            <Typography variant="body1" paragraph>
              권한 관리 페이지에서는 시스템의 권한을 관리할 수 있습니다.
            </Typography>
            <Typography variant="body1" paragraph>
              주요 기능:
            </Typography>
            <ul>
              <li>권한 목록 조회</li>
              <li>권한 추가/수정/삭제</li>
              <li>권한별 기본 설정</li>
            </ul>
            <Typography variant="body1" paragraph>
              권한 추가 시 필수 입력 항목:
            </Typography>
            <ul>
              <li>권한 이름</li>
              <li>사이트</li>
              <li>회사 코드</li>
              <li>권한 레벨</li>
              <li>정렬 순서</li>
            </ul>
          </div>
        }
      />
    </Box>
  );
};

export default AuthorityManagement;