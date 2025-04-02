import React, { useState, useEffect } from 'react';
import './CustomerManagement.css';
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
  Stack
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import { MuiDataGridWrapper, SearchCondition } from '../Common';
import Swal from 'sweetalert2';
import { useDomain, DOMAINS } from '../../contexts/DomainContext';
import {GRAPHQL_URL} from "../../config";

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
  const { control, handleSubmit, reset,getValues } = useForm({
    defaultValues: {
      vendorId: '',
      vendorName: '',
      ceoName: '',
      businessType: '',
      flagActive: null
    }
  });

  // 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [vendorList, setVendorList] = useState([]);
  const [updatedRows, setUpdatedRows] = useState([]); // 수정된 필드만 저장하는 객체
  const [addRows,setAddRows] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);

  //거래처 유형 리스트 불러오기
  const [vendorTypeOptions, setVendorTypeOptions] = useState([]);


  // 초기화 함수
  const handleReset = () => {
    reset({
      vendorId: '',
      vendorName: '',
      ceoName: '',
      businessType: '',
      flagActive: null
    });
  };

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


  // 검색 실행 함수
  const handleSearch = (data) => {
    // 검색후 업데이트 로우 초기화
    setUpdatedRows([]);
    setAddRows([]);

    const query = `
      query getVendors($filter: VendorFilter) {
        getVendors(filter: $filter) {
          vendorId
          vendorName
          vendorType
          businessRegNo
          ceoName
          businessType
          address
          telNo
          flagActive
          createUser
          createDate
          updateUser
          updateDate
        }
      }
    `;

    fetchGraphQL(
        GRAPHQL_URL,
        query,
        data
    ).then((data) => {
      if (data.errors) {
      } else {
        const rowsWithId = data.data.getVendors.map((row, index) => ({
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
    flagActive: row.flagActive
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
    flagActive: row.flagActive
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

    const createVendorMutation = `
      mutation SaveVendor($createdRows: [VendorInput], $updatedRows: [VendorUpdate]) {
        saveVendor(createdRows: $createdRows, updatedRows: $updatedRows)
    }
  `;

    const createdVendorInputs = addRows.map(transformRowForMutation);
    const updatedVendorInputs = updatedRows.map(transformRowForUpdate);

    fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // 쿠키 자동 전송 설정
      body: JSON.stringify({
        query: createVendorMutation,
        variables: {
          createdRows: createdVendorInputs,
          updatedRows: updatedVendorInputs,
        }
      })
    })
        .then((res) => res.json())
        .then((data) => {
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

    const deleteVendorMutation = `
      mutation DeleteVendor($vendorId: String!) {
        deleteVendor(vendorId: $vendorId)
      }
    `;


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
        fetch(GRAPHQL_URL, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          credentials: 'include', // 쿠키 자동 전송 설정
          body: JSON.stringify({
            query: deleteVendorMutation,
            variables: {vendorId: selectedVendor.vendorId}
          })
        })
            .then((res) => res.json())
            .then((data) => {
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
      flagActive: 'Y',
      createUser: '자동입력',
      createDate: '자동입력',
      updateUser: '자동입력',
      updateDate: '자동입력'
    };

    setVendorList([newVendor, ...vendorList]);
    setSelectedVendor(newVendor);
  };


  useEffect(() => {
    const query = `
      query getGridCodes($codeClassId: String!) {
        getGridCodes(codeClassId: $codeClassId) {
          codeId
          codeName
        }
      }
    `;

    // filter 객체에 vendor type 코드 그룹을 지정합니다.
    const variables = {
      codeClassId: "CD20250331110039125"
    };

    fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // 쿠키 자동 전송 설정
      body: JSON.stringify({
        query,
        variables
      })
    })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          if (data.errors) {
            console.error(data.errors);
          } else {
            // API에서 받은 데이터를 select 옵션 배열로 가공합니다.
            const options = data.data.getGridCodes.map((row) => ({
              value: row.codeId,
              label: row.codeName
            }));
            setVendorTypeOptions(options);
          }
        })
        .catch((err) => console.error(err));
  }, []);

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    // 약간의 딜레이를 주어 DOM 요소가 완전히 렌더링된 후에 그리드 데이터를 설정
    const timer = setTimeout(() => {
      const query = `
      query getVendors($filter: VendorFilter) {
        getVendors(filter: $filter) {
          vendorId
          vendorName
          vendorType
          businessRegNo
          ceoName
          businessType
          address
          telNo
          flagActive
          createUser
          createDate
          updateUser
          updateDate
        }
      }
    `;

      fetchGraphQL(
          GRAPHQL_URL,
          query,
          getValues()
      ).then((data) => {
        if (data.errors) {
        } else {
          const rowsWithId = data.data.getVendors.map((row, index) => ({
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
    { field: 'vendorId', headerName: '거래처코드', width: 120 },
    { field: 'vendorName', headerName: '거래처명', width: 120 , editable: true},
    {
      field: 'vendorType',
      headerName: '거래처 유형',
      width: 100,
      editable: true,
      type: 'singleSelect',
      valueOptions: vendorTypeOptions
    },
    { field: 'businessRegNo', headerName: '사업자등록 번호', width: 100, editable: true },
    { field: 'ceoName', headerName: '대표자명', width: 100, editable: true },
    { field: 'businessType', headerName: '업종/업태', width: 100, editable: true },
    { field: 'address', headerName: '주소', width: 200, flex:1 ,editable: true  },
    { field: 'telNo', headerName: '전화번호', width: 130, editable: true },
    {
      field: 'flagActive',
      headerName: '사용여부',
      width: 90,
      editable: true,
      type: 'singleSelect',
      valueOptions: [
        { value: 'Y', label: '사용' },
        { value: 'N', label: '미사용' }
      ]
    },
    { field: 'createUser', headerName: '작성자', width: 100},
    { field: 'createDate', headerName: '작성일', width: 200},
    { field: 'updateUser', headerName: '수정자', width: 100},
    { field: 'updateDate', headerName: '수정일', width: 200}
  ];

  // 거래처 목록 그리드 버튼
  const customerGridButtons = [
    { label: '등록', onClick: handleAdd, icon: <AddIcon /> },
    { label: '저장', onClick: handleSave, icon: <SaveIcon /> },
    { label: '삭제', onClick: handleDelete, icon: <DeleteIcon /> }
  ];

  /**
   * 공통 GraphQL API 호출 함수
   * @param {string} url - GraphQL 엔드포인트 URL
   * @param {string} query - GraphQL 쿼리 문자열
   * @param {object} filter - 쿼리에 전달할 filter 객체
   * @returns {Promise<object>} - GraphQL 응답 JSON
   */
  function fetchGraphQL(url, query, filter) {
    const variables = { filter };
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // 쿠키 자동 전송 설정
      body: JSON.stringify({ query, variables })
    })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        });
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
          <Grid item xs={12} sm={6} md={2.4}>
            <Controller
                name="flagActive"
                control={control}
                render={({ field }) => (
                    <FormControl variant="outlined" size="small" fullWidth>
                      <InputLabel id="flagActive-label" shrink>사용여부</InputLabel>
                      <Select
                          {...field}
                          labelId="flagActive-label"
                          label="사용여부"
                          displayEmpty
                          notched
                      >
                        <MenuItem value={null}>전체</MenuItem>
                        <MenuItem value="Y">사용</MenuItem>
                        <MenuItem value="N">미사용</MenuItem>
                      </Select>
                    </FormControl>
                )}
            />
          </Grid>
        </SearchCondition>

        {/* 그리드 영역 */}
        {!isLoading && (
            <Grid item xs={12} md={6}>
              <MuiDataGridWrapper
                  title="거래처 목록"
                  rows={vendorList}
                  columns={customerColumns}
                  buttons={customerGridButtons}
                  height={450}
                  onRowClick={handleCustomerSelect}
                  gridProps={{
                    editMode: 'cell',
                    onProcessUpdate: handleProcessRowUpdate
                  }}
              />
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
              • 고객사관리에서는 거래처 및 고객사의 정보를 등록, 수정, 삭제할 수 있습니다.
            </Typography>
            <Typography variant="body2" color={getTextColor()}>
              • 고객사를 선택하면 해당 거래처의 상세 정보를 확인하고 관리할 수 있습니다.
            </Typography>
            <Typography variant="body2" color={getTextColor()}>
              • 고객사 등록 시 기본정보, 연락처, 주소, 담당자, 거래조건 등의 정보를 입력할 수 있습니다.
            </Typography>
          </Stack>
        </Box>
      </Box>
  );
};

export default CustomerManagement;