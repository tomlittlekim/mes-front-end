import React, { useState, useEffect } from 'react';
import './NoticeBoard.css';
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
  Chip,
  Button,
  Paper,
  Divider
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { MuiDataGridWrapper, SearchCondition } from '../Common';
import Swal from 'sweetalert2';
import { useDomain, DOMAINS } from '../../contexts/DomainContext';

const NoticeBoard = (props) => {
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
  
  // React Hook Form 설정
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      title: '',
      noticeType: '',
      writer: '',
      startDate: null,
      endDate: null,
    }
  });

  // 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [noticeList, setNoticeList] = useState([]);
  const [selectedNotice, setSelectedNotice] = useState(null);

  // 초기화 함수
  const handleReset = () => {
    reset({
      title: '',
      noticeType: '',
      writer: '',
      startDate: null,
      endDate: null,
    });
  };

  // 검색 실행 함수
  const handleSearch = (data) => {
    console.log('검색 조건:', data);
    
    // API 호출 대신 더미 데이터 사용
    const dummyData = [
      { id: 1, title: '시스템 점검 안내 (6월 15일 예정)', noticeType: '시스템', important: true, writer: '관리자', department: '시스템관리부', viewCount: 156, createdDate: '2024-06-10', updatedDate: '2024-06-10', content: `안녕하세요, 시스템 관리부입니다.\n\n6월 15일(토) 오전 2시부터 오전 6시까지 시스템 정기 점검이 진행될 예정입니다.\n점검 시간 동안에는 시스템 접속 및 이용이 제한될 수 있으니 양해 부탁드립니다.\n\n주요 점검 내용:\n1. 데이터베이스 성능 최적화\n2. 보안 업데이트 적용\n3. 신규 기능 추가\n\n문의사항이 있으신 경우 시스템관리부(내선: 1234)로 연락주시기 바랍니다.\n\n감사합니다.` },
      { id: 2, title: '3분기 생산 목표 관련 공지', noticeType: '업무', important: true, writer: '김생산', department: '생산관리부', viewCount: 98, createdDate: '2024-06-09', updatedDate: '2024-06-09', content: `안녕하세요, 생산관리부입니다.\n\n3분기 생산 목표와 관련하여 아래와 같이 안내드립니다.\n\n1. 3분기 전체 생산 목표량: 전분기 대비 15% 증가\n2. 주요 제품별 목표:\n   - 제품A: 5,000개\n   - 제품B: 3,500개\n   - 제품C: 7,000개\n\n각 생산라인별 세부 목표는 부서장을 통해 전달될 예정입니다.\n목표 달성을 위한 임직원 여러분의 협조 부탁드립니다.\n\n감사합니다.` },
      { id: 3, title: '신규 사원 교육 일정 안내', noticeType: '교육', important: false, writer: '이인사', department: '인사부', viewCount: 45, createdDate: '2024-06-07', updatedDate: '2024-06-07', content: `안녕하세요, 인사부입니다.\n\n6월 신규 입사자 대상 교육 일정을 아래와 같이 안내드립니다.\n\n일시: 2024년 6월 20일(목) 09:00 ~ 18:00\n장소: 본사 4층 교육장\n대상: 6월 입사자 전원\n\n교육 내용:\n- 회사 소개 및 조직 구조 안내\n- 사내 시스템 사용법 교육\n- 보안 교육\n- 안전 교육\n\n문의사항은 인사부 교육담당자(내선: 3456)에게 연락 바랍니다.\n\n감사합니다.` },
      { id: 4, title: '하계 휴가 신청 안내', noticeType: '인사', important: false, writer: '이인사', department: '인사부', viewCount: 211, createdDate: '2024-06-05', updatedDate: '2024-06-05', content: `안녕하세요, 인사부입니다.\n\n2024년 하계 휴가 신청과 관련하여 아래와 같이 안내드립니다.\n\n1. 신청 기간: 2024년 6월 10일 ~ 6월 24일\n2. 휴가 사용 가능 기간: 2024년 7월 15일 ~ 8월 31일\n3. 신청 방법: 사내 포털 > 인사관리 > 휴가신청 메뉴에서 신청\n\n부서별 업무 공백이 발생하지 않도록 부서장과 사전 협의 후 신청해주시기 바랍니다.\n개인별 잔여 휴가일수는 사내 포털에서 확인 가능합니다.\n\n문의사항은 인사부(내선: 3412)로 연락주시기 바랍니다.\n\n감사합니다.` },
      { id: 5, title: '6월 품질관리 워크숍 개최 안내', noticeType: '교육', important: false, writer: '박품질', department: '품질관리부', viewCount: 78, createdDate: '2024-06-03', updatedDate: '2024-06-03', content: `안녕하세요, 품질관리부입니다.\n\n6월 품질관리 워크숍을 아래와 같이 개최합니다.\n\n일시: 2024년 6월 25일(화) 13:00 ~ 17:00\n장소: 본사 3층 대회의실\n대상: 각 부서 품질담당자\n\n주요 내용:\n- 최근 품질 이슈 분석 및 대응방안 논의\n- 품질개선 사례 공유\n- 품질관리 시스템 개선 제안\n\n참석 여부를 6월 20일까지 품질관리부(내선: 5678)로 회신 바랍니다.\n\n감사합니다.` }
    ];
    
    setNoticeList(dummyData);
    setSelectedNotice(null);
  };

  // 공지사항 선택 핸들러
  const handleNoticeSelect = (params) => {
    const notice = noticeList.find(n => n.id === params.id);
    setSelectedNotice(notice);
  };

  // 새 공지사항 작성 핸들러
  const handleCreate = () => {
    Swal.fire({
      icon: 'info',
      title: '공지사항 작성',
      text: '새 공지사항 작성 화면으로 이동합니다.',
      confirmButtonText: '확인'
    });
  };

  // 공지사항 수정 핸들러
  const handleEdit = () => {
    if (!selectedNotice) {
      Swal.fire({
        icon: 'warning',
        title: '알림',
        text: '수정할 공지사항을 선택해주세요.',
        confirmButtonText: '확인'
      });
      return;
    }
    
    Swal.fire({
      icon: 'info',
      title: '공지사항 수정',
      text: '공지사항 수정 화면으로 이동합니다.',
      confirmButtonText: '확인'
    });
  };

  // 공지사항 삭제 핸들러
  const handleDelete = () => {
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
      text: '정말 삭제하시겠습니까?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: '삭제',
      cancelButtonText: '취소'
    }).then((result) => {
      if (result.isConfirmed) {
        // 삭제 로직 (실제로는 API 호출)
        const updatedList = noticeList.filter(notice => notice.id !== selectedNotice.id);
        setNoticeList(updatedList);
        setSelectedNotice(null);
        
        Swal.fire({
          icon: 'success',
          title: '성공',
          text: '삭제되었습니다.',
          confirmButtonText: '확인'
        });
      }
    });
  };

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    // 약간의 딜레이를 주어 DOM 요소가 완전히 렌더링된 후에 그리드 데이터를 설정
    const timer = setTimeout(() => {
      handleSearch({});
      setIsLoading(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // 공지사항 목록 그리드 컬럼 정의
  const noticeColumns = [
    { 
      field: 'important', 
      headerName: '중요', 
      width: 70,
      renderCell: (params) => (
        params.value ? <Chip label="중요" size="small" color="error" /> : null
      )
    },
    { field: 'title', headerName: '제목', width: 350, flex: 1 },
    { field: 'noticeType', headerName: '분류', width: 100 },
    { field: 'writer', headerName: '작성자', width: 100 },
    { field: 'department', headerName: '부서', width: 120 },
    { field: 'viewCount', headerName: '조회수', width: 80, type: 'number' },
    { field: 'createdDate', headerName: '등록일', width: 110 }
  ];

  // 공지사항 목록 그리드 버튼
  const noticeGridButtons = [
    { label: '조회', onClick: handleSubmit(handleSearch), icon: <SearchIcon /> },
    { label: '등록', onClick: handleCreate, icon: <AddIcon /> },
    { label: '수정', onClick: handleEdit, icon: <EditIcon /> },
    { label: '삭제', onClick: handleDelete, icon: <DeleteIcon /> }
  ];

  return (
    <Box sx={{ p: 2, minHeight: '100vh' }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 3,
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
          공지사항
        </Typography>
      </Box>

      {/* 검색 조건 영역 - 공통 컴포넌트 사용 */}
      <SearchCondition 
        onSearch={handleSubmit(handleSearch)}
        onReset={handleReset}
      >
        <Grid item xs={12} sm={6} md={4}>
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="제목"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="제목을 입력하세요"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Controller
            name="writer"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="작성자"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="작성자를 입력하세요"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Controller
            name="noticeType"
            control={control}
            render={({ field }) => (
              <FormControl variant="outlined" size="small" fullWidth>
                <InputLabel id="notice-type-label">분류</InputLabel>
                <Select
                  {...field}
                  labelId="notice-type-label"
                  label="분류"
                >
                  <MenuItem value="">전체</MenuItem>
                  <MenuItem value="시스템">시스템</MenuItem>
                  <MenuItem value="업무">업무</MenuItem>
                  <MenuItem value="인사">인사</MenuItem>
                  <MenuItem value="교육">교육</MenuItem>
                  <MenuItem value="기타">기타</MenuItem>
                </Select>
              </FormControl>
            )}
          />
        </Grid>
        <Grid item xs={12} sm={12} md={8}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Controller
                name="startDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    label="시작일"
                    slotProps={{
                      textField: {
                        size: "small",
                        fullWidth: true
                      }
                    }}
                  />
                )}
              />
              <Typography variant="body2" sx={{ mx: 1 }}>~</Typography>
              <Controller
                name="endDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    label="종료일"
                    slotProps={{
                      textField: {
                        size: "small",
                        fullWidth: true
                      }
                    }}
                  />
                )}
              />
            </Stack>
          </LocalizationProvider>
        </Grid>
      </SearchCondition>
      
      {/* 그리드 영역 */}
      {!isLoading && (
        <Grid container spacing={2}>
          {/* 공지사항 목록 그리드 */}
          <Grid item xs={12} md={6}>
            <MuiDataGridWrapper
              title="공지사항 목록"
              rows={noticeList}
              columns={noticeColumns}
              buttons={noticeGridButtons}
              height={450}
              onRowClick={handleNoticeSelect}
            />
          </Grid>
          
          {/* 공지사항 상세 내용 */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ 
              height: 450, 
              p: 2, 
              overflow: 'auto',
              boxShadow: theme.shadows[2],
              borderRadius: 1 
            }}>
              <Typography variant="h6" mb={1}>
                {selectedNotice ? (
                  <Box display="flex" alignItems="center">
                    <span>{selectedNotice.title}</span>
                    {selectedNotice.important && (
                      <Chip 
                        label="중요" 
                        size="small" 
                        color="error" 
                        sx={{ ml: 1 }} 
                      />
                    )}
                  </Box>
                ) : '공지사항 상세보기'}
              </Typography>
              
              <Divider sx={{ my: 1 }} />
              
              {selectedNotice ? (
                <Box>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    mb: 2, 
                    bgcolor: isDarkMode ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.03)', 
                    p: 1,
                    borderRadius: 1
                  }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        작성자: {selectedNotice.writer} ({selectedNotice.department})
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        등록일: {selectedNotice.createdDate}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        분류: {selectedNotice.noticeType}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        조회수: {selectedNotice.viewCount}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ 
                    p: 1, 
                    minHeight: 300, 
                    whiteSpace: 'pre-line',
                    overflowWrap: 'break-word'
                  }}>
                    {selectedNotice.content}
                  </Box>
                </Box>
              ) : (
                <Box 
                  display="flex" 
                  flexDirection="column" 
                  alignItems="center" 
                  justifyContent="center" 
                  sx={{ height: 350 }}
                >
                  <Typography variant="body1" color="text.secondary">
                    공지사항을 선택하면 상세내용이 표시됩니다.
                  </Typography>
                </Box>
              )}
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
            • 공지사항은 시스템, 업무, 인사, 교육 등의 분류별로 조회할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()}>
            • 중요 공지사항은 '중요' 태그로 표시됩니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()}>
            • 공지사항 등록 및 수정은 관리자 권한이 있는 사용자만 가능합니다.
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
};

export default NoticeBoard; 