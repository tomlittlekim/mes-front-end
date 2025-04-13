import React, { useState, useEffect } from 'react';
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
  useTheme
} from '@mui/material';
import { Add, Help, Edit, Delete } from '@mui/icons-material';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { EnhancedDataGridWrapper, SearchCondition } from '../components/Common';
import useLocalStorageVO from "../components/Common/UseLocalStorageVO";
import { Controller, useForm } from 'react-hook-form';
import Swal from 'sweetalert2';

const NoticeBoard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { userRoleLevel } = useLocalStorageVO();
  
  // 상태 관리
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
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
    { field: 'noticeId', headerName: '번호', width: 80 },
    { field: 'noticeTitle', headerName: '제목', width: 300 },
    { field: 'noticeWriter', headerName: '작성자', width: 120 },
    { 
      field: 'createDate', 
      headerName: '작성일', 
      width: 150,
      valueFormatter: (params) => {
        if (!params.value) return '';
        return format(new Date(params.value), 'yyyy-MM-dd HH:mm', { locale: ko });
      }
    },
    { field: 'readCount', headerName: '조회수', width: 100 },
    { 
      field: 'priorityLevel', 
      headerName: '우선순위', 
      width: 100,
      valueFormatter: (params) => {
        const levels = ['일반', '중요', '긴급'];
        return levels[params.value - 1] || '일반';
      }
    },
    { 
      field: 'noticeTtl', 
      headerName: '만료일', 
      width: 150,
      valueFormatter: (params) => {
        if (!params.value) return '';
        return format(new Date(params.value), 'yyyy-MM-dd', { locale: ko });
      }
    }
  ];

  // 공지사항 목록 그리드 버튼
  const noticeGridButtons = [
    {
      icon: <Add />,
      label: '공지사항 추가',
      onClick: () => handleAddNotice(),
      show: userRoleLevel === 5
    },
    {
      icon: <Delete />,
      label: '공지사항 삭제',
      onClick: () => handleDeleteNotice(),
      disabled: !selectedNotice,
      show: userRoleLevel === 5
    }
  ];

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
      Swal.fire({
        icon: 'error',
        title: '오류',
        text: '서버 통신 중 오류가 발생했습니다.',
        confirmButtonText: '확인'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch({});
  }, []);

  // 공지사항 선택 핸들러
  const handleNoticeSelect = async (params) => {
    try {
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
      Swal.fire({
        icon: 'error',
        title: '오류',
        text: '공지사항 조회 중 오류가 발생했습니다.',
        confirmButtonText: '확인'
      });
    }
  };

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

  // 공지사항 삭제 핸들러
  const handleDeleteNotice = () => {
    if (!selectedNotice) {
      Swal.fire({
        icon: 'warning',
        title: '알림',
        text: '삭제할 공지사항을 선택해주세요.',
        confirmButtonText: '확인'
      });
      return;
    }

    Swal.fire({
      title: '삭제 확인',
      text: `선택한 공지사항을 정말 삭제하시겠습니까?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: '삭제',
      cancelButtonText: '취소'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteNotice(selectedNotice.noticeId);
          Swal.fire({
            icon: 'success',
            title: '성공',
            text: '삭제되었습니다.',
            confirmButtonText: '확인'
          });
          setSelectedNotice(null);
          handleSearch(getValues());
        } catch (error) {
          console.error('공지사항 삭제 실패:', error);
          Swal.fire({
            icon: 'error',
            title: '오류',
            text: '공지사항 삭제 중 오류가 발생했습니다.',
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
      await upsertNotice(detailInfo);
      Swal.fire({
        icon: 'success',
        title: '성공',
        text: '저장되었습니다.',
        confirmButtonText: '확인'
      });
      setIsEditMode(false);
      handleSearch(getValues());
    } catch (error) {
      console.error('공지사항 저장 실패:', error);
      Swal.fire({
        icon: 'error',
        title: '오류',
        text: '공지사항 저장 중 오류가 발생했습니다.',
        confirmButtonText: '확인'
      });
    }
  };

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
        <IconButton onClick={() => setHelpDialogOpen(true)} color="primary">
          <Help />
        </IconButton>
      </Box>

      {/* 검색 조건 */}
      <SearchCondition
        onSubmit={handleSubmit(onSearch)}
        onReset={onReset}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
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
          <Grid item xs={12} sm={6} md={3}>
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
              buttons={noticeGridButtons.filter(btn => btn.show)}
              height={600}
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
              height: '600px',
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
                {selectedNotice && !isEditMode && userRoleLevel === 5 && (
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
                        disabled={!isEditMode}
                        required
                        value={detailInfo.noticeWriter || ''}
                        onChange={(e) => handleDetailChange('noticeWriter', e.target.value)}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl variant="outlined" size="small" fullWidth disabled={!isEditMode}>
                        <InputLabel>우선순위</InputLabel>
                        <Select
                          label="우선순위"
                          value={detailInfo.priorityLevel || 1}
                          onChange={(e) => handleDetailChange('priorityLevel', e.target.value)}
                        >
                          <MenuItem value={1}>일반</MenuItem>
                          <MenuItem value={2}>중요</MenuItem>
                          <MenuItem value={3}>긴급</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        label="만료일"
                        type="date"
                        variant="outlined"
                        size="small"
                        fullWidth
                        disabled={!isEditMode}
                        InputLabelProps={{ shrink: true }}
                        value={detailInfo.noticeTtl || ''}
                        onChange={(e) => handleDetailChange('noticeTtl', e.target.value)}
                      />
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
                      <TextField
                        label="첨부파일"
                        variant="outlined"
                        size="small"
                        fullWidth
                        disabled={!isEditMode}
                        value={detailInfo.attachmentPath || ''}
                        onChange={(e) => handleDetailChange('attachmentPath', e.target.value)}
                      />
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

      {/* 하단 정보 영역 */}
      <Box mt={2} p={2} sx={{
        bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.05)',
        borderRadius: 1,
        border: `1px solid ${theme.palette.divider}`
      }}>
        <Stack spacing={1}>
          <Typography variant="body2">
            • 공지사항은 전체 사용자에게 공지되는 중요한 정보를 관리합니다.
          </Typography>
          <Typography variant="body2">
            • 우선순위에 따라 일반, 중요, 긴급으로 구분하여 관리할 수 있습니다.
          </Typography>
          <Typography variant="body2">
            • 만료일이 지난 공지사항은 자동으로 비활성화됩니다.
          </Typography>
        </Stack>
      </Box>

      {/* 도움말 모달 */}
      <Dialog
        open={helpDialogOpen}
        onClose={() => setHelpDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>공지사항 관리 도움말</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" gutterBottom>
            공지사항 관리 페이지 사용 방법
          </Typography>
          <Typography paragraph>
            1. 공지사항 목록 조회
          </Typography>
          <Typography variant="body2" paragraph>
            - 시작일과 종료일을 선택하여 해당 기간의 공지사항을 조회할 수 있습니다.
            - 공지사항을 클릭하면 상세 내용을 확인할 수 있습니다.
          </Typography>
          <Typography paragraph>
            2. 공지사항 상세보기
          </Typography>
          <Typography variant="body2" paragraph>
            - 공지사항의 제목, 작성자, 작성일, 조회수, 첨부파일, 내용을 확인할 수 있습니다.
            - 우측 상단의 뒤로가기 버튼을 클릭하면 목록으로 돌아갈 수 있습니다.
          </Typography>
          {userRoleLevel === 5 && (
            <>
              <Typography paragraph>
                3. 공지사항 관리 (관리자 전용)
              </Typography>
              <Typography variant="body2" paragraph>
                - 공지사항 등록: 우측 상단의 "공지사항 등록" 버튼을 클릭하여 새로운 공지사항을 등록할 수 있습니다.
                - 공지사항 수정: 목록에서 공지사항을 클릭하여 상세 내용을 확인한 후 수정할 수 있습니다.
                - 공지사항 삭제: 목록에서 공지사항을 클릭하여 상세 내용을 확인한 후 삭제할 수 있습니다.
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHelpDialogOpen(false)}>닫기</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NoticeBoard; 