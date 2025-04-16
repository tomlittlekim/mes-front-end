import React, { useState, useEffect } from 'react';
import './CommonCodeManagement.css';
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
  FormHelperText, alpha, IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import { SearchCondition, EnhancedDataGridWrapper } from '../Common';
import Swal from 'sweetalert2';
import { useDomain, DOMAINS } from '../../contexts/DomainContext';
import Message from "../../utils/message/Message";
import {graphFetch} from "../../api/fetchConfig";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import HelpModal from "../Common/HelpModal";
import {deleteCode, getCodeClass, getCodeList, saveCode, saveCodeClass} from "../../api/standardInfo/commonCodeApi";

const CommonCodeManagement = (props) => {
  // 현재 테마 가져오기
  const theme = useTheme();
  const { domain } = useDomain();
  const isDarkMode = theme.palette.mode === 'dark';

  // React Hook Form 설정
  const { control, handleSubmit, reset,getValues } = useForm({
    defaultValues: {
      codeClassId: '',
      codeClassName: ''
    }
  });

  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // 상태 관리
  const [isLoading, setIsLoading] = useState(true);

  // 코드 그룹 데이터
  const [codeGroups, setCodeGroups] = useState([]);

  // 코드 데이터
  const [codes, setCodes] = useState([]);

  // 선택된 코드 그룹
  const [selectedCodeGroup, setSelectedCodeGroup] = useState(null);
  //선택된 코드
  const [selectedCode, setSelectedCode] = useState(null);

  const [addCodeClassRows,setAddCodeClassRows] = useState([]); // 추가된 코드클레스 필드만 저장하는 객체
  const [updatedCodeClassRows, setUpdatedCodeClassRows] = useState([]); // 수정된 코드클레스 필드만 저장하는 객체

  const [addCodeRows,setAddCodeRows] = useState([]); // 추가된 코드클레스 필드만 저장하는 객체
  const [updatedCodeRows, setUpdatedCodeRows] = useState([]); // 수정된 코드클레스 필드만 저장하는 객체

  useEffect(() => {
    // 약간의 딜레이를 주어 DOM 요소가 완전히 렌더링된 후에 그리드 데이터를 설정
    const timer = setTimeout(() => {

      getCodeClass(
          getValues()
      ).then((data) => {
        if (data.errors) {
        } else {
          const rowsWithId = data.map((row, index) => ({
            ...row,
            id: row.codeClassId  // 또는 row.factoryId || index + 1
          }));
          setCodeGroups(rowsWithId)
        }
        setIsLoading(false);
      }).catch((err) => {
            setIsLoading(false);
      });
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // 검색 실행 함수
  const onSubmit = (data) => {
    setUpdatedCodeClassRows([]);
    setUpdatedCodeRows([]);
    setAddCodeClassRows([]);
    setAddCodeRows([]);

    getCodeClass(
        data
    ).then((data) => {
      if (data.errors) {
      } else {
        const rowsWithId = data.map((row, index) => ({
          ...row,
          id: row.codeClassId  // 또는 row.factoryId || index + 1
        }));
        setCodeGroups(rowsWithId)
      }
      setIsLoading(false);
    }).catch((err) => {
          setIsLoading(false);
        });
  };

  // 검색 조건 초기화
  const handleReset = () => {
    reset({
      codeClassId: '',
      codeClassName: '',
    });
  };

  //코드 클레스 행 변화 (추가, 수정)
  function codeClassRowUpdate(newRow, oldRow) {
    const isNewRow = oldRow.id.startsWith('NEW_');

    setCodeGroups((prev)=>{
      return prev.map((row) =>
          //기존 행이면 덮어씌우기 새로운행이면 새로운행 추가
          row.id === oldRow.id ? { ...row, ...newRow } : row
      );
    });

    if (isNewRow) {
      // 신규 행인 경우 addRows 상태에 추가 (같은 id가 있으면 덮어씀)
      setAddCodeClassRows((prevAddRows) => {
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
      setUpdatedCodeClassRows(prevUpdatedRows => {
        // 같은 factoryId를 가진 기존 행이 있는지 확인
        const existingIndex = prevUpdatedRows.findIndex(row => row.codeClassId === newRow.codeClassId);

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

  //코드 행 변화 (추가, 수정)
  function codeRowUpdate(newRow, oldRow) {
    const isNewRow = oldRow.id.startsWith('NEW_');

    setCodes((prev)=>{
      return prev.map((row) =>
          //기존 행이면 덮어씌우기 새로운행이면 새로운행 추가
          row.id === oldRow.id ? { ...row, ...newRow } : row
      );
    });

    if (isNewRow) {
      // 신규 행인 경우 addRows 상태에 추가 (같은 id가 있으면 덮어씀)
      setAddCodeRows((prevAddRows) => {
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
      setUpdatedCodeRows(prevUpdatedRows => {
        // 같은 factoryId를 가진 기존 행이 있는지 확인
        const existingIndex = prevUpdatedRows.findIndex(row => row.codeId === newRow.codeId);

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


  // 코드 그룹 저장 핸들러
  const handleSaveCodeGroup = () => {
    // 필수 필드 검증 함수
    const validateRequiredFields = (rows, fieldMapping) => {
      for (const row of rows) {
        for (const field of Object.keys(fieldMapping)) {
          if (row[field] === undefined || row[field] === null || row[field] === '') {
            Message.showError({ message: `${fieldMapping[field]} 필드는 필수 입력값입니다.` });
            return false;
          }
        }
      }
      return true;
    };

    // 필수 필드 검증
    const requiredFields = {
      codeClassName: '코드그룹명'
    };

    if (!validateRequiredFields(addCodeClassRows, requiredFields) ||
        !validateRequiredFields(updatedCodeClassRows, requiredFields)) {
      return;
    }

    const createdCodeClassInputs = addCodeClassRows.map(transformRowForMutation);
    const updatedCodeClassInputs = updatedCodeClassRows.map(transformRowForUpdate);

    const addRowQty =  addCodeClassRows.length;
    const updateRowQty = updatedCodeClassRows.length;

    if(addRowQty + updateRowQty === 0 ){
      Swal.fire({
        icon: 'warning',
        title: '알림',
        text: '변경사항이 존재하지 않습니다.',
        confirmButtonText: '확인'
      });
      return;
    }

    saveCodeClass(
        {
          createdRows: createdCodeClassInputs,
          updatedRows: updatedCodeClassInputs,
        }
    ).then((data) => {
          if (data.errors) {
            console.error("GraphQL errors:", data.errors);
          } else {
            onSubmit(getValues());
            Swal.fire({
              icon: 'success',
              title: '성공',
              text: '저장되었습니다.',
              confirmButtonText: '확인'
            });
          }
        })
        .catch((error) => {
          console.error("Error save factory:", error);
        });
  };

  // 코드 그룹 선택 시 이벤트 핸들러 - 우측 그리드 조회
  const handleCodeGroupSelect = (params) => {
    const codeGroup = codeGroups.find(cg => cg.id === params.id);
    setSelectedCodeGroup(codeGroup);

    setAddCodeRows([]);
    setUpdatedCodeRows([]);

    getCodeList(
        { codeClassId: codeGroup.codeClassId }
    ).then((data) => {
          if (data.errors) {
            console.error("GraphQL Errors:", data.errors);
          } else {
            const rowsWithId = data.map((row) => ({
              ...row,
              id: row.codeId
            }));
            setCodes(rowsWithId);
          }
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Fetch failed:", err);
          setIsLoading(false);
        });
  };

  //코드 선택 핸들러
  const handleCodeSelect = (params) => {
    const code = codes.find(c => c.id === params.id);
    setSelectedCode(code);
  }


  // 코드 추가 핸들러
  const handleAddCode = () => {
    if (!selectedCodeGroup) {
      Swal.fire({
        icon: 'warning',
        title: '알림',
        text: '코드 그룹을 먼저 선택해주세요.',
        confirmButtonText: '확인'
      });
      return;
    }

    const newCode = {
      id: `NEW_${Date.now()}`, // 임시 ID
      codeClassId: selectedCodeGroup.codeClassId,
      codeId: '자동입력',
      codeName: '',
      codeDesc: '',
      sortOrder: 0,
      // flagActive: 'Y',
      createUser: '자동입력',
      createDate: '자동입력',
      updateUser: '자동입력',
      updateDate: '자동입력',
    };

    setCodes([newCode, ...codes]);
  };

  // 코드 저장 핸들러
  const handleSaveCode = () => {
    const addRowQty =  addCodeRows.length;
    const updateRowQty = updatedCodeRows.length;

    if(addRowQty + updateRowQty === 0 ){
      Swal.fire({
        icon: 'warning',
        title: '알림',
        text: '변경사항이 존재하지 않습니다.',
        confirmButtonText: '확인'
      });
      return;
    }

    // 필수 필드 검증 함수
    const validateRequiredFields = (rows, fieldMapping) => {
      for (const row of rows) {
        for (const field of Object.keys(fieldMapping)) {
          if (row[field] === undefined || row[field] === null || row[field] === '') {
            Message.showError({ message: `${fieldMapping[field]} 필드는 필수 입력값입니다.` });
            return false;
          }
        }
      }
      return true;
    };

    // 필수 필드 검증
    const requiredFields = {
      codeName: '코드명'
    };

    if (!validateRequiredFields(addCodeRows, requiredFields) ||
        !validateRequiredFields(updatedCodeRows, requiredFields)) {
      return;
    }

    const createdCodeInputs = addCodeRows.map(transformCodeRowForMutation);
    const updatedCodeInputs = updatedCodeRows.map(transformCodeRowForUpdate);

    saveCode(
        {
          createdRows: createdCodeInputs,
          updatedRows: updatedCodeInputs,
        }
    ).then((data) => {
          if (data.errors) {
            console.error("GraphQL errors:", data.errors);
          } else {
            handleCodeGroupSelect(selectedCodeGroup);
            Swal.fire({
              icon: 'success',
              title: '성공',
              text: '저장되었습니다.',
              confirmButtonText: '확인'
            });
          }
        })
        .catch((error) => {
          console.error("Error save factory:", error);
        });
  };

  // 코드 삭제 핸들러
  const handleDeleteCode = () => {

    if (!selectedCode) {
      Swal.fire({
        icon: 'warning',
        title: '알림',
        text: '삭제할 코드를 선택해주세요.',
        confirmButtonText: '확인'
      });
      return;
    }

    const isDeleteAddRows = addCodeRows.find(f => f.id === selectedCode.id)
    const isDeleteUpdateRows = updatedCodeRows.find(f => f.id === selectedCode.id)

    if(isDeleteAddRows) {
      const updateAddList = addCodeRows.filter(f => f.id !== selectedCode.id);
      setAddCodeRows(updateAddList);
    }

    if(isDeleteUpdateRows) {
      const updatedRowsLit = updatedCodeRows.filter(f => f.id !== selectedCode.id);
      setUpdatedCodeRows(updatedRowsLit)
    }

    Swal.fire({
      title: '삭제 확인',
      text: '선택한 코드를 삭제하시겠습니까?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: '삭제',
      cancelButtonText: '취소'
    }).then((result) => {
      if (result.isConfirmed) {
        // 백엔드 삭제 요청 (GraphQL)
        deleteCode(
            { codeId: selectedCode.codeId }
        ).then((data) => {
              if (data.errors) {
                console.error("GraphQL errors:", data.errors);
                Swal.fire({
                  icon: 'error',
                  title: '삭제 실패',
                  text: '삭제 중 오류가 발생했습니다.'
                });
              } else {
                // 삭제 성공 시, 로컬 상태 업데이트
                const updatedList = codes.filter(f => f.id !== selectedCode.id);
                setCodes(updatedList);
                Swal.fire({
                  icon: 'success',
                  title: '성공',
                  text: '삭제되었습니다.',
                  confirmButtonText: '확인'
                });
                setSelectedCode(null);
              }
            })
            .catch((error) => {
              console.error("Error deleting factory:", error);
              Swal.fire({
                icon: 'error',
                title: '삭제 실패',
                text: '삭제 중 예외가 발생했습니다.'
              });
            });
      }
    });
  };

  // 코드 그룹 등록 핸들러
  const handleAddCodeGroup = () => {
    const newCodeGroup = {
      id: `NEW_${Date.now()}`, // 임시 ID
      codeClassId: '자동입력',
      codeClassName: '',
      codeClassDesc: '',
    };

    setCodeGroups([newCodeGroup,...codeGroups]);
  };

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    // 약간의 딜레이를 주어 DOM 요소가 완전히 렌더링된 후에 그리드 데이터를 설정
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // 코드 그룹 DataGrid 컬럼 정의
  const codeGroupColumns = [
    { field: 'codeClassId', headerName: '코드그룹 ID', width: 130, flex: 1 },
    {
      field: 'codeClassName',
      headerName: '코드그룹명',
      width: 130,
      editable: true,
      renderCell: (params) => {
        // 새로 추가된 행인지 확인 (id가 NEW_로 시작하는지)
        const isNewRow = params.row.id?.toString().startsWith('NEW_');

        // 새로 추가된 행이고 값이 없는 경우에만 '필수 입력' 표시
        const showRequired = isNewRow && (!params.value || params.value === '');

        return (
            <Typography variant="body2" sx={{color: showRequired ? '#f44336' : 'inherit'}}>
              {showRequired ? '필수 입력' : params.value || ''}
            </Typography>
        );
      }
    },
    { field: 'codeClassDesc', headerName: '설명', width: 200, flex: 1,editable: true },
  ];

  // 코드 DataGrid 컬럼 정의
  const codeColumns = [
    { field: 'codeClassId', headerName: '코드그룹 ID', width: 150 },
    { field: 'codeId', headerName: '코드ID', width: 150 },
    {
      field: 'codeName',
      headerName: '코드명',
      width: 80,
      editable: true
      ,
      renderCell: (params) => {
        // 새로 추가된 행인지 확인 (id가 NEW_로 시작하는지)
        const isNewRow = params.row.id?.toString().startsWith('NEW_');

        // 새로 추가된 행이고 값이 없는 경우에만 '필수 입력' 표시
        const showRequired = isNewRow && (!params.value || params.value === '');

        return (
            <Typography variant="body2" sx={{color: showRequired ? '#f44336' : 'inherit'}}>
              {showRequired ? '필수 입력' : params.value || ''}
            </Typography>
        );
      }
    },
    { field: 'codeDesc', headerName: '설명', width: 150, editable: true },
    // {
    //   field: 'flagActive',
    //   headerName: '사용여부',
    //   width: 85,
    //   editable: true,
    //   type: 'singleSelect',
    //   valueOptions: [
    //     { value: 'Y', label: '사용' },
    //     { value: 'N', label: '미사용' }
    //   ]
    // },
    { field: 'sortOrder', headerName: '정렬순서', width: 90, type: 'number', editable: true },
    { field: 'createUser', headerName: '작성자', width: 90},
    { field: 'createDate', headerName: '작성일', width: 135},
    { field: 'updateUser', headerName: '수정자', width: 90},
    { field: 'updateDate', headerName: '수정일', width: 135}
  ];

  // 코드 그룹 그리드 버튼
  const codeGroupButtons = [
    { label: '등록', onClick: handleAddCodeGroup, icon: <AddIcon /> },
    { label: '저장', onClick: handleSaveCodeGroup, icon: <SaveIcon /> }
  ];

  // 코드 그리드 버튼
  const codeButtons = [
    { label: '등록', onClick: handleAddCode, icon: <AddIcon /> },
    { label: '저장', onClick: handleSaveCode, icon: <SaveIcon /> },
    { label: '삭제', onClick: handleDeleteCode, icon: <DeleteIcon /> }
  ];

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


  const transformRowForMutation = (row) => ({
    codeClassName: row.codeClassName,
    codeClassDesc: row.codeClassDesc,
  });

  const transformCodeRowForMutation = (row) => ({
    codeClassId: row.codeClassId,
    codeName: row.codeName,
    codeDesc: row.codeDesc,
    sortOrder: row.sortOrder,
    // flagActive: row.flagActive
  });

  const transformRowForUpdate = (row) => ({
    codeClassId: row.codeClassId,
    codeClassName: row.codeClassName,
    codeClassDesc: row.codeClassDesc,
  });

  const transformCodeRowForUpdate = (row) => ({
    codeClassId: row.codeClassId,
    codeId: row.codeId,
    codeName: row.codeName,
    codeDesc: row.codeDesc,
    sortOrder: row.sortOrder,
    // flagActive: row.flagActive
  });

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
            공통코드관리
          </Typography>
          <IconButton
              onClick={() => setIsHelpModalOpen(true)}
              sx={{
                ml: 1,
                color: isDarkMode ? theme.palette.primary.light
                    : theme.palette.primary.main,
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

        {/* 검색 조건 영역 - 공통 컴포넌트 사용 */}
        <SearchCondition
            onSearch={handleSubmit(onSubmit)}
            onReset={handleReset}
        >
          <Grid item xs={12} sm={6} md={6}>
            <Controller
                name="codeClassId"
                control={control}
                render={({ field }) => (
                    <TextField
                        {...field}
                        label="코드그룹ID"
                        variant="outlined"
                        size="small"
                        fullWidth
                        placeholder="코드그룹ID를 입력하세요"
                    />
                )}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <Controller
                name="codeClassName"
                control={control}
                render={({ field }) => (
                    <TextField
                        {...field}
                        label="코드그룹명"
                        variant="outlined"
                        size="small"
                        fullWidth
                        placeholder="코드그룹명을 입력하세요"
                    />
                )}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            {/*<Controller*/}
            {/*  name="useYn"*/}
            {/*  control={control}*/}
            {/*  render={({ field }) => (*/}
            {/*    <FormControl variant="outlined" size="small" fullWidth>*/}
            {/*      <InputLabel id="useYn-label">사용여부</InputLabel>*/}
            {/*      <Select*/}
            {/*        {...field}*/}
            {/*        labelId="useYn-label"*/}
            {/*        label="사용여부"*/}
            {/*      >*/}
            {/*        <MenuItem value="all">전체</MenuItem>*/}
            {/*        <MenuItem value="Y">사용</MenuItem>*/}
            {/*        <MenuItem value="N">미사용</MenuItem>*/}
            {/*      </Select>*/}
            {/*    </FormControl>*/}
            {/*  )}*/}
            {/*/>*/}
          </Grid>
        </SearchCondition>

        {/* 그리드 영역 */}
        {!isLoading && (
            <Grid container spacing={2}>
              {/* 코드 그룹 그리드 */}
              <Grid item xs={12} md={4}>
                <EnhancedDataGridWrapper
                    title="코드 그룹"
                    rows={codeGroups}
                    columns={codeGroupColumns}
                    buttons={codeGroupButtons}
                    height={630}
                    gridProps={{
                      editMode: 'cell',
                      onProcessUpdate: codeClassRowUpdate
                    }}
                    onRowClick={handleCodeGroupSelect}
                    tabId={props.tabId + "-codegroup"}
                />
              </Grid>

              {/* 코드 그리드 */}
              <Grid item xs={12} md={8}>
                <EnhancedDataGridWrapper
                    title={`코드 목록 ${selectedCodeGroup ? '- ' + selectedCodeGroup.codeClassName : ''}`}
                    rows={codes}
                    columns={codeColumns}
                    buttons={codeButtons}
                    height={630}
                    gridProps={{
                      editMode: 'cell',
                      onProcessUpdate: codeRowUpdate
                    }}
                    onRowClick={handleCodeSelect}
                    tabId={props.tabId + "-codes"}
                />
              </Grid>
            </Grid>
        )}

        {/* 하단 정보 영역 */}
        {/*<Box mt={2} p={2} sx={{*/}
        {/*  bgcolor: getBgColor(),*/}
        {/*  borderRadius: 1,*/}
        {/*  border: `1px solid ${getBorderColor()}`*/}
        {/*}}>*/}
        {/*  <Stack spacing={1}>*/}
        {/*    <Typography variant="body2" color={getTextColor()}>*/}
        {/*      • 공통코드관리에서는 시스템에서 사용하는 코드 그룹 및 코드 정보를 등록, 수정, 삭제할 수 있습니다.*/}
        {/*    </Typography>*/}
        {/*    <Typography variant="body2" color={getTextColor()}>*/}
        {/*      • 코드 그룹을 선택하면 해당 그룹에 속한 코드 목록을 확인하고 관리할 수 있습니다.*/}
        {/*    </Typography>*/}
        {/*    <Typography variant="body2" color={getTextColor()}>*/}
        {/*      • 코드는 시스템 전반에서 사용되므로 코드 값과 명칭을 명확하게 입력하고 관리해야 합니다.*/}
        {/*    </Typography>*/}
        {/*  </Stack>*/}
        {/*</Box>*/}

        {/* 도움말 모달 */}
        <HelpModal
            open={isHelpModalOpen}
            onClose={() => setIsHelpModalOpen(false)}
            title="공통코드관리 도움말"
        >
          <Typography component="div" color={getTextColor()} paragraph>
            • 공통코드관리에서는 시스템에서 사용하는 코드 그룹 및 코드 정보를 등록, 수정, 삭제할 수 있습니다.
          </Typography>
          <Typography component="div" color={getTextColor()} paragraph>
            • 코드 그룹을 선택하면 해당 그룹에 속한 코드 목록을 확인하고 관리할 수 있습니다.
          </Typography>
          <Typography component="div" color={getTextColor()} paragraph>
            • 코드는 시스템 전반에서 사용되므로 코드 값과 명칭을 명확하게 입력하고 관리해야 합니다.
          </Typography>
        </HelpModal>
      </Box>
  );
};

export default CommonCodeManagement;