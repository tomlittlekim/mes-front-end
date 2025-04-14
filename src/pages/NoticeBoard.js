import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllNotice, upReadCountForNotice, deleteNotice, upsertNotice } from '../api/noticeApi';
import {
  Button,
  TextField,
  Box,
  Typography,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  useTheme, alpha
} from '@mui/material';
import { Add, Help, Edit, Delete, Upload, Download } from '@mui/icons-material';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { EnhancedDataGridWrapper, SearchCondition } from '../components/Common';
import useLocalStorageVO from "../components/Common/UseLocalStorageVO";
import { Controller, useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import useSystemStatusManager from '../hook/UseSystemStatusManager';
import HelpModal from '../components/Common/HelpModal';
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

const NoticeBoard = () => {
  const theme = useTheme();
  const { loginUser } = useLocalStorageVO();
  const { userGroup, userRoleGroup, compCdGroup, siteGroup, commonData } = useSystemStatusManager();
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const isDarkMode = theme.palette.mode === 'dark';

  // 상태 관리
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [detailInfo, setDetailInfo] = useState({
    noticeId: null,
    noticeTitle: null,
    noticeContents: null,
    noticeWriter: null,
    priorityLevel: 1,
    noticeTtl: null,
    attachmentPath: null,
    readCount: 0
  });
  const [roles, setRoles] = useState([]);
  const [fileInput, setFileInput] = useState(null);

  // React Hook Form 설정 - 검색
  const { control, handleSubmit, reset, getValues } = useForm({
    defaultValues: {
      fromDate: null,
      toDate: null
    }
  });

  // 상세 정보 변경 핸들러
  const handleDetailChange = (field, value) => {
    setDetailInfo(prev => ({
      ...prev,
      [field]: value || null
    }));
  };

  // 검색 핸들러
  const onSearch = (data) => {
    handleSearch(data);
  };

  // 초기화 핸들러
  const onReset = () => {
    if (isEditMode) {
      if (selectedNotice) {
        handleNoticeSelect({ id: selectedNotice.noticeId });
      } else {
        setDetailInfo({
          noticeId: null,
          noticeTitle: null,
          noticeContents: null,
          noticeWriter: null,
          priorityLevel: 1,
          noticeTtl: null,
          attachmentPath: null,
          readCount: 0
        });
      }
      setIsEditMode(false);
    } else {
      reset({
        fromDate: null,
        toDate: null
      });
      handleSearch({});
    }
  };

  // 컬럼 정의
  const columns = [
    { field: 'noticeTitle', headerName: '제목', width: 300 },
    {
      field: 'noticeWriter',
      headerName: '작성자',
      width: 120,
      renderCell: (params) => {
        if (!params.value) return '-';
        const user = userGroup.find(u => u.loginId === params.value);
        return user?.userName || params.value;
      }
    },
    { 
      field: 'createDate', 
      headerName: '작성일', 
      width: 150,
      renderCell: (params) => {
        try {
          if (!params?.value) return '';
          return format(new Date(params.value), 'yyyy-MM-dd HH:mm', { locale: ko });
        } catch (error) {
          return '';
        }
      }
    },
    { field: 'readCount', headerName: '조회수', width: 100 },
    { 
      field: 'priorityLevel', 
      headerName: '우선순위', 
      width: 100,
      renderCell: (params) => {
        if (!params?.value) return '-';
        return userRoleGroup.find(r=>r.priorityLevel === params.value)?.roleName || '일반';
      }
    },
    { 
      field: 'noticeTtl', 
      headerName: '만료일', 
      width: 150,
      renderCell: (params) => {
        try {
          if (!params?.value) return '';
          return format(new Date(params.value), 'yyyy-MM-dd', { locale: ko });
        } catch (error) {
          return '';
        }
      }
    }
  ];

  // 공지사항 추가 핸들러
  const handleAddNotice = () => {
    setDetailInfo({
      noticeId: null,
      noticeTitle: null,
      noticeContents: null,
      noticeWriter: null,
      priorityLevel: 1,
      noticeTtl: null,
      attachmentPath: null,
      readCount: 0
    });
    setSelectedNotice(null);
    setIsEditMode(true);
  };

  // 알림 설정
  const showMessage = (type, message) => {
    const options = {
      title: type === 'error' ? '오류' : type === 'warning' ? '경고' : '알림',
      text: message,
      icon: type,
      confirmButtonText: '확인'
    };

    if (type === 'confirm') {
      return Swal.fire({
        ...options,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: '확인',
        cancelButtonText: '취소'
      });
    }

    return Swal.fire(options);
  };

  // 공지사항 목록 조회
  const handleSearch = async (data) => {
    try {
      setLoading(true);
      const response = await getAllNotice(data);
      const noticesWithId = (response || []).map(notice => ({
        ...notice,
        id: notice.noticeId
      }));
      setNotices(noticesWithId);
      setSelectedNotice(null);
      setIsEditMode(false);
    } catch (error) {
      console.error('공지사항 조회 실패:', error);
      showMessage('error', '공지사항 조회 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      try {
        await handleSearch({});
      } catch (error) {
        showMessage('error', '데이터 조회 중 오류가 발생했습니다.');
      }
    };

    initializeData();
  }, []);

  useEffect(() => {
    const initializeData = async () => {
      if (userRoleGroup.length>0 && userRoleGroup[0].roleId !== null) {
        const roleData = await userRoleGroup
        const initialRoles = await commonData(roleData)
        setRoles(initialRoles);
      }
    }

    initializeData();
  }, [userRoleGroup])

  // 공지사항 선택 핸들러
  const handleNoticeSelect = async (params) => {
    try {
      if (!params?.id) return;
      
      const notice = notices.find(n => n.id === params.id);
      if (notice) {
        await upReadCountForNotice(notice.noticeId);
        setSelectedNotice(notice);
        setIsEditMode(false);
        setDetailInfo({
          noticeId: notice.noticeId || null,
          noticeTitle: notice.noticeTitle || null,
          noticeContents: notice.noticeContents || null,
          noticeWriter: notice.noticeWriter || null,
          priorityLevel: notice.priorityLevel || 1,
          noticeTtl: notice.noticeTtl || null,
          attachmentPath: notice.attachmentPath || null,
          readCount: notice.readCount || 0
        });
      }
    } catch (error) {
      console.error('공지사항 조회 실패:', error);
      showMessage('error', '공지사항 조회 중 오류가 발생했습니다.');
    }
  };

  // 수정 모드 전환
  const handleEdit = () => {
    setIsEditMode(true);
  };

  // 파일 변경 핸들러
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileInput(file);
      handleDetailChange('attachmentPath', file.name);
    }
  };

  // 저장 핸들러 수정
  const handleSave = async () => {
    try {
      const noticeData = {
        noticeId: detailInfo.noticeId || null,
        noticeTitle: detailInfo.noticeTitle || null,
        noticeContents: detailInfo.noticeContents || null,
        noticeWriter: loginUser.userName,
        priorityLevel: detailInfo.priorityLevel || 1,
        noticeTtl: detailInfo.noticeTtl || null,
      };

      await upsertNotice(noticeData);
      showMessage('success', '저장되었습니다.');
      setIsEditMode(false);
      setFileInput(null);
      handleSearch(getValues());
    } catch (error) {
      console.error('공지사항 저장 실패:', error);
      showMessage('error', '공지사항 저장 중 오류가 발생했습니다.');
    }
  };

  // 공지사항 삭제 핸들러
  const handleDeleteNotice = () => {
    if (!selectedNotice) {
      showMessage('warning', '삭제할 공지사항을 선택해주세요.');
      return;
    }

    showMessage('confirm', '선택한 공지사항을 정말 삭제하시겠습니까?').then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteNotice(selectedNotice.noticeId);
          showMessage('success', '삭제되었습니다.');
          setSelectedNotice(null);
          handleSearch(getValues());
        } catch (error) {
          console.error('공지사항 삭제 실패:', error);
          showMessage('error', '공지사항 삭제 중 오류가 발생했습니다.');
        }
      }
    });
  };

  // 공지사항 목록 그리드 버튼 정의
  const gridButtons = [
    {
      icon: <Add />,
      label: '추가',
      onClick: handleAddNotice,
      variant: 'contained',
      color: 'primary',
      sx: { mr: 1 }
    },
    {
      icon: <Delete />,
      label: '삭제',
      onClick: handleDeleteNotice,
      disabled: !selectedNotice,
      variant: 'contained',
      color: 'error',
      sx: { mr: 1 }
    }
  ];

  // useMemo로 권한에 따른 버튼 필터링
  const noticeGridButtons = useMemo(() => {
    return loginUser?.priorityLevel === 5 ? gridButtons : [];
  }, [loginUser?.priorityLevel, selectedNotice]);

  return (
    <Box sx={{ p: 3, minHeight: '100vh' }}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3
      }}>
        <Typography variant="h5" component="h1">
          공지사항
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

      {/* 검색 조건 */}
      <SearchCondition
        onSubmit={handleSubmit(onSearch)}
        onReset={onReset}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={6}>
            <Controller
              name="fromDate"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="시작일"
                  type="date"
                  size="small"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value || null)}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <Controller
              name="toDate"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="종료일"
                  type="date"
                  size="small"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value || null)}
                />
              )}
            />
          </Grid>
        </Grid>
      </SearchCondition>

      {/* 그리드 영역 */}
      {!loading && (
        <Grid container spacing={2}>
          {/* 공지사항 목록 그리드 */}
          <Grid item xs={12} md={6}>
            <EnhancedDataGridWrapper
              title="공지사항 목록"
              rows={notices}
              columns={columns}
              buttons={noticeGridButtons}
              height={700}
              onRowClick={handleNoticeSelect}
              pagination={true}
              pageSize={10}
              rowsPerPageOptions={[10, 20, 30]}
              disableSelectionOnClick
            />
          </Grid>

          {/* 공지사항 상세 정보 영역 */}
          <Grid item xs={12} md={6}>
            <Paper sx={{
              height: '700px',
              p: 2,
              boxShadow: theme.shadows[2],
              borderRadius: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  공지사항 상세 정보
                </Typography>
                {selectedNotice && !isEditMode && loginUser?.priorityLevel === 5 && (
                  <IconButton
                    color="primary"
                    onClick={handleEdit}
                    size="small"
                  >
                    <Edit />
                  </IconButton>
                )}
              </Box>

              <Box sx={{ flex: 1, overflow: 'auto' }}>
                {(selectedNotice || isEditMode) ? (
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        label="제목"
                        variant="outlined"
                        size="small"
                        fullWidth
                        disabled={!isEditMode}
                        required
                        value={detailInfo.noticeTitle || ''}
                        onChange={(e) => handleDetailChange('noticeTitle', e.target.value)}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="작성자"
                        variant="outlined"
                        size="small"
                        fullWidth
                        disabled={true}
                        required
                        value={detailInfo.noticeWriter || ''}
                        sx={{
                          "& .MuiInputBase-input.Mui-disabled": {
                            WebkitTextFillColor: "#666",
                          }
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl variant="outlined" size="small" fullWidth disabled={!isEditMode}>
                        <InputLabel>권한 레벨</InputLabel>
                        <Select
                          label="권한 레벨"
                          value={detailInfo.priorityLevel || 1}
                          onChange={(e) => handleDetailChange('priorityLevel', e.target.value)}
                        >
                          {roles.map((role) => (
                            <MenuItem key={role.priorityLevel} value={role.priorityLevel}>
                              {role.roleName}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                      {isEditMode ? (
                        <TextField
                          label="만료일"
                          type="date"
                          variant="outlined"
                          size="small"
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                          value={detailInfo.noticeTtl || ''}
                          onChange={(e) => handleDetailChange('noticeTtl', e.target.value)}
                        />
                      ) : (
                        <TextField
                          label="생성일"
                          variant="outlined"
                          size="small"
                          fullWidth
                          disabled
                          value={selectedNotice ? format(new Date(selectedNotice.createDate), 'yyyy-MM-dd', { locale: ko }) : ''}
                        />
                      )}
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        label="내용"
                        variant="outlined"
                        size="small"
                        fullWidth
                        multiline
                        rows={10}
                        disabled={!isEditMode}
                        required
                        value={detailInfo.noticeContents || ''}
                        onChange={(e) => handleDetailChange('noticeContents', e.target.value)}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      {isEditMode ? (
                        <input
                          type="file"
                          onChange={handleFileChange}
                          style={{ display: 'none' }}
                          id="notice-file-input"
                        />
                      ) : null}
                      {isEditMode ? (
                        <label htmlFor="notice-file-input">
                          <Button
                            variant="outlined"
                            component="span"
                            fullWidth
                            startIcon={<Upload />}
                          >
                            {fileInput ? fileInput.name : '파일 선택'}
                          </Button>
                        </label>
                      ) : (
                        detailInfo.attachmentPath && (
                          <Button
                            variant="text"
                            fullWidth
                            startIcon={<Download />}
                            // onClick={() => handleFileDownload(detailInfo.attachmentPath)}
                          >
                            {detailInfo.attachmentPath}
                          </Button>
                        )
                      )}
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
                      공지사항을 선택하면 상세 정보가 표시됩니다.
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
        title="공지사항 도움말"
      >
        <Typography variant="body2">
          공지사항 페이지 사용 방법
        </Typography>
        <Typography paragraph>
          1. 공지사항 목록 조회
        </Typography>
        <Typography variant="body2">
          - 공지사항 목록에서 제목, 작성자, 작성일, 중요도를 확인할 수 있습니다.
          - 중요도가 높은 공지사항은 상단에 표시됩니다.
        </Typography>
        <Typography paragraph>
          2. 공지사항 상세보기
        </Typography>
        <Typography variant="body2">
          - 목록에서 공지사항을 클릭하면 상세 내용을 확인할 수 있습니다.
          - 제목, 내용, 작성자, 작성일, 중요도 등의 정보를 확인할 수 있습니다.
        </Typography>
        {loginUser?.priorityLevel === 5 && (
          <>
            <Typography paragraph>
              3. 공지사항 관리 (관리자 전용)
            </Typography>
            <Typography variant="body2">
              - 공지사항 작성: "공지사항 작성" 버튼을 클릭하여 새로운 공지사항을 등록할 수 있습니다.
              - 공지사항 수정: 목록에서 공지사항을 선택한 후 수정 버튼을 클릭하여 내용을 수정할 수 있습니다.
              - 공지사항 삭제: 목록에서 공지사항을 선택한 후 삭제 버튼을 클릭하여 공지사항을 삭제할 수 있습니다.
              - 중요도 설정: 공지사항 작성/수정 시 중요도를 설정하여 상단에 고정할 수 있습니다.
            </Typography>
          </>
        )}
      </HelpModal>
    </Box>
  );
};

export default NoticeBoard; 