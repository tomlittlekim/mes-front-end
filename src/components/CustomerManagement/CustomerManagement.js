import React, { useState, useEffect } from 'react';
import './CustomerManagement.css';
import { useForm, Controller } from 'react-hook-form';
import {
  TextField,
  Grid,
  Box,
  Typography,
  useTheme,
  Stack, IconButton, alpha
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import {EnhancedDataGridWrapper, SearchCondition} from '../Common';
import Swal from 'sweetalert2';
import { useDomain, DOMAINS } from '../../contexts/DomainContext';
import Message from '../../utils/message/Message';
import {graphFetch} from "../../api/fetchConfig";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import HelpModal from "../Common/HelpModal";
import {deleteVendor, getVendors, saveVendor} from "../../api/standardInfo/customerApi";
import {fetchGridCodesByCodeClassId} from "../../utils/grid/useGridRow"; // Message 유틸리티 클래스 임포트

const CustomerManagement = (props) => {
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

  const getBorderColor = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? '#3d2814' : '#f5e8d7';
    }
    return isDarkMode ? '#1e3a5f' : '#e0e0e0';
  };

  // React Hook Form 설정
  const { control, handleSubmit, reset,getValues } = useForm({
    defaultValues: {
      vendorId: '',
      vendorName: '',
      ceoName: '',
      businessType: '',
    }
  });

  // 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [vendorList, setVendorList] = useState([]);
  const [updatedRows, setUpdatedRows] = useState([]); // 수정된 필드만 저장하는 객체
  const [addRows,setAddRows] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  //거래처 유형 리스트 불러오기
  const [vendorTypeOptions, setVendorTypeOptions] = useState([]);

  useEffect(() => {
    fetchGridCodesByCodeClassId("CD20250331110039125",setVendorTypeOptions)
  }, []);

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    // 약간의 딜레이를 주어 DOM 요소가 완전히 렌더링된 후에 그리드 데이터를 설정
    const timer = setTimeout(() => {

      getVendors(
          getValues()
      ).then((data) => {
        if (data.errors) {
        } else {
          const rowsWithId = data.map((row, index) => ({
            ...row,
            id: row.vendorId  // 또는 row.factoryId || index + 1
          }));
          setVendorList(rowsWithId);
        }
        setIsLoading(false);
      })
          .catch((err) => {
            setIsLoading(false);
          });
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // 거래처 목록 그리드 컬럼 정의
  const customerColumns = [
    { field: 'vendorId', headerName: '거래처코드', width: 140, flex: 1 },
    {
      field: 'vendorName',
      headerName: '거래처명',
      width: 120 ,
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
    {
      field: 'vendorType',
      headerName: '거래처 유형',
      width: 100,
      editable: true,
      type: 'singleSelect',
      valueOptions: vendorTypeOptions
    },
    {
      field: 'businessRegNo',
      headerName: '사업자등록 번호',
      width: 100,
      editable: true,
      flex: 1,
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
    { field: 'ceoName', headerName: '대표자명', width: 100, editable: true },
    { field: 'businessType', headerName: '업종/업태', width: 100, editable: true },
    { field: 'address', headerName: '주소', width: 150 ,editable: true  },
    { field: 'telNo', headerName: '전화번호', width: 130, editable: true },
    { field: 'createUser', headerName: '작성자', width: 90},
    { field: 'createDate', headerName: '작성일', width: 150},
    { field: 'updateUser', headerName: '수정자', width: 90},
    { field: 'updateDate', headerName: '수정일', width: 150}
  ];

  // 초기화 함수
  const handleReset = () => {
    reset({
      vendorId: '',
      vendorName: '',
      ceoName: '',
      businessType: '',
    });
  };

  // 검색 실행 함수
  const handleSearch = (data) => {
    // 검색후 업데이트 로우 초기화
    setUpdatedRows([]);
    setAddRows([]);

    getVendors(
        data
    ).then((data) => {
      if (data.errors) {
      } else {
        const rowsWithId = data.map((row, index) => ({
          ...row,
          id: row.vendorId  // 또는 row.factoryId || index + 1
        }));
        setVendorList(rowsWithId);
        // setRefreshKey(prev => prev + 1);
      }
      setIsLoading(false);
    }).catch((err) => {
      setIsLoading(false);
    });
  };

  // 거래처 선택 핸들러
  const handleCustomerSelect = (params) => {
    const vendor = vendorList.find(c => c.id === params.id);
    setSelectedVendor(vendor);
  };

  const transformRowForMutation = (row) => ({
    vendorName: row.vendorName,
    vendorType: row.vendorType,
    businessRegNo: row.businessRegNo,
    ceoName: row.ceoName,
    businessType: row.businessType,
    address: row.address,
    telNo: row.telNo,
  });

  const transformRowForUpdate = (row) => ({
    vendorId: row.vendorId,
    vendorName: row.vendorName,
    vendorType: row.vendorType,
    businessRegNo: row.businessRegNo,
    ceoName: row.ceoName,
    businessType: row.businessType,
    address: row.address,
    telNo: row.telNo,
  });

  // 저장 버튼 클릭 핸들러
  const handleSave = () => {
    const addRowQty = addRows.length;
    const updateRowQty = updatedRows.length;

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
      vendorName: '거래처명',
      businessRegNo: '사업자등록 번호'
    };

    if (!validateRequiredFields(addRows, requiredFields) ||
        !validateRequiredFields(updatedRows, requiredFields)) {
      return;
    }

    const createdVendorInputs = addRows.map(transformRowForMutation);
    const updatedVendorInputs = updatedRows.map(transformRowForUpdate);


    saveVendor(
        {
          createdRows: createdVendorInputs,
          updatedRows: updatedVendorInputs,
        }
    ).then((data) => {
          if (data.errors) {
            console.error("GraphQL errors:", data.errors);
          } else {
            handleSearch(getValues());
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

  // 삭제 버튼 클릭 핸들러
  const handleDelete = () => {
    if (!selectedVendor) {
      Swal.fire({
        icon: 'warning',
        title: '알림',
        text: '삭제할 거래처를 선택해주세요.',
        confirmButtonText: '확인'
      });
      return;
    }

    const isDeleteAddRows = addRows.find(f => f.id === selectedVendor.id)
    const isDeleteUpdateRows = updatedRows.find(f => f.id === selectedVendor.id)

    if(isDeleteAddRows) {
      const updateAddList = addRows.filter(f => f.id !== selectedVendor.id);
      setAddRows(updateAddList);
    }

    if(isDeleteUpdateRows) {
      const updatedRowsLit = updatedRows.filter(f => f.id !== selectedVendor.id);
      setUpdatedRows(updatedRowsLit)
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
        // 백엔드 삭제 요청 (GraphQL)
        deleteVendor(
            {vendorId: selectedVendor.vendorId}
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
                const updatedList = vendorList.filter(f => f.id !== selectedVendor.id);
                setVendorList(updatedList);
                setSelectedVendor(null);
                Swal.fire({
                  icon: 'success',
                  title: '성공',
                  text: '삭제되었습니다.',
                  confirmButtonText: '확인'
                });
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

  // 등록 버튼 클릭 핸들러
  const handleAdd = () => {
    const newVendor = {
      id: `NEW_${Date.now()}`,
      vendorId: '자동입력',
      vendorName: '',
      vendorType: '',
      businessRegNo: '',
      ceoName: '',
      businessType: '',
      address: '',
      telNo: '',
      createUser: '자동입력',
      createDate: '자동입력',
      updateUser: '자동입력',
      updateDate: '자동입력'
    };

    setVendorList([newVendor, ...vendorList]);
    setSelectedVendor(newVendor);
  };

  // 거래처 목록 그리드 버튼
  const customerGridButtons = [
    { label: '등록', onClick: handleAdd, icon: <AddIcon /> },
    { label: '저장', onClick: handleSave, icon: <SaveIcon /> },
    { label: '삭제', onClick: handleDelete, icon: <DeleteIcon /> }
  ];

  function handleProcessRowUpdate(newRow, oldRow) {
    const isNewRow = oldRow.id.startsWith('NEW_');

    setVendorList((prev) => {
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
        const existingIndex = prevUpdatedRows.findIndex(row => row.vendorId === newRow.vendorId);

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
            거래처관리
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

        {/* 검색 조건 영역 - 공통 컴포넌트 사용 */}
        <SearchCondition
            onSearch={handleSubmit(handleSearch)}
            onReset={handleReset}
        >
          <Grid item xs={12} sm={6} md={2.4}>
            <Controller
                name="vendorId"
                control={control}
                render={({ field }) => (
                    <TextField
                        {...field}
                        label="거래처코드"
                        variant="outlined"
                        size="small"
                        fullWidth
                        placeholder="거래처코드를 입력하세요"
                    />
                )}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Controller
                name="vendorName"
                control={control}
                render={({ field }) => (
                    <TextField
                        {...field}
                        label="거래처명"
                        variant="outlined"
                        size="small"
                        fullWidth
                        placeholder="거래처명을 입력하세요"
                    />
                )}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Controller
                name="ceoName"
                control={control}
                render={({ field }) => (
                    <TextField
                        {...field}
                        label="대표자명"
                        variant="outlined"
                        size="small"
                        fullWidth
                        placeholder="대표자명을 입력하세요"
                    />
                )}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Controller
                name="businessType"
                control={control}
                render={({ field }) => (
                    <TextField
                        {...field}
                        label="업종"
                        variant="outlined"
                        size="small"
                        fullWidth
                        placeholder="업종을 입력하세요"
                    />
                )}
            />
          </Grid>
          {/*<Grid item xs={12} sm={6} md={2.4}>*/}
          {/*  <Controller*/}
          {/*      name="flagActive"*/}
          {/*      control={control}*/}
          {/*      render={({ field }) => (*/}
          {/*          <FormControl variant="outlined" size="small" fullWidth>*/}
          {/*            <InputLabel id="flagActive-label" shrink>사용여부</InputLabel>*/}
          {/*            <Select*/}
          {/*                {...field}*/}
          {/*                labelId="flagActive-label"*/}
          {/*                label="사용여부"*/}
          {/*                displayEmpty*/}
          {/*                notched*/}
          {/*            >*/}
          {/*              <MenuItem value={null}>전체</MenuItem>*/}
          {/*              <MenuItem value="Y">사용</MenuItem>*/}
          {/*              <MenuItem value="N">미사용</MenuItem>*/}
          {/*            </Select>*/}
          {/*          </FormControl>*/}
          {/*      )}*/}
          {/*  />*/}
          {/*</Grid>*/}
        </SearchCondition>

        {/* 그리드 영역 */}
        {!isLoading && (
            <Grid item xs={12} md={6}>
              <EnhancedDataGridWrapper
                  title="거래처 목록"
                  rows={vendorList}
                  columns={customerColumns}
                  buttons={customerGridButtons}
                  height={640}
                  onRowClick={handleCustomerSelect}
                  gridProps={{
                    editMode: 'cell',
                    onProcessUpdate: handleProcessRowUpdate
                  }}
                  tabId={props.tabId + "-customer"}
              />
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
        {/*      • 고객사관리에서는 거래처 및 고객사의 정보를 등록, 수정, 삭제할 수 있습니다.*/}
        {/*    </Typography>*/}
        {/*    <Typography variant="body2" color={getTextColor()}>*/}
        {/*      • 고객사를 선택하면 해당 거래처의 상세 정보를 확인하고 관리할 수 있습니다.*/}
        {/*    </Typography>*/}
        {/*    <Typography variant="body2" color={getTextColor()}>*/}
        {/*      • 고객사 등록 시 기본정보, 연락처, 주소, 담당자, 거래조건 등의 정보를 입력할 수 있습니다.*/}
        {/*    </Typography>*/}
        {/*  </Stack>*/}
        {/*</Box>*/}

        {/* 도움말 모달 */}
        <HelpModal
            open={isHelpModalOpen}
            onClose={() => setIsHelpModalOpen(false)}
            title="거래처관리 도움말"
        >
          <Typography variant="body2" color={getTextColor()}>
            • 거래처관리에서는 거래처 및 고객사의 정보를 등록, 수정, 삭제할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()}>
            • 거래처 등록 시 거래처명, 연락처, 주소 등의 정보를 입력할 수 있습니다.
          </Typography>
        </HelpModal>
      </Box>
  );
};

export default CustomerManagement;