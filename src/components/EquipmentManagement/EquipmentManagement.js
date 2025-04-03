import React, { useState, useEffect } from 'react';
import './EquipmentManagement.css';
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
  IconButton,
  alpha
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { MuiDataGridWrapper, SearchCondition } from '../Common';
import Swal from 'sweetalert2';
import { useDomain, DOMAINS } from '../../contexts/DomainContext';
import HelpModal from '../Common/HelpModal';
import {GRAPHQL_URL} from "../../config";

const EquipmentManagement = (props) => {
  // 현재 테마 가져오기
  const theme = useTheme();
  const { domain } = useDomain();
  const isDarkMode = theme.palette.mode === 'dark';
  
  // React Hook Form 설정
  const { control, handleSubmit, reset,getValues } = useForm({
    defaultValues: {
      factoryId: '',
      factoryName: '',
      lineId: '',
      lineName: '',
      equipmentId: '',
      equipmentName: '',
      equipmentSn: '',
      equipmentType: '',
      flagActive: null
    }
  });

  // 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [equipmentList, setEquipmentList] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [addRows, setAddRows] = useState([]);
  const [updatedRows, setUpdatedRows] = useState([]);

  const [factoryTypeOptions, setFactoryTypeOptions] = useState([]);
  const [factoryModel,setFactoryModel] = useState([]);

  const [lineOptions, setLineOptions] = useState([]);
  const [equipmentTypeOptions, setEquipmentTypeOptions] = useState([]);
  const [equipmentStatusOptions, setEquipmentStatusOptions] = useState([]);

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

  // 초기화 함수
  const handleReset = () => {
    reset({
      factoryId: '',
      factoryName: '',
      lineId: '',
      lineName: '',
      equipmentId: '',
      equipmentName: '',
      equipmentSn: '',
      equipmentType: '',
      flagActive: null
    });
  };

  function handleProcessRowUpdate(newRow, oldRow) {
    const isNewRow = oldRow.id.startsWith('NEW_');

    if (newRow.factoryId !== oldRow.factoryId) {
      const selectedFactory = factoryModel.find(opt => opt.factoryId === newRow.factoryId);
      if (selectedFactory) {
        newRow = {
          ...newRow,
          factoryName: selectedFactory.factoryName,
          factoryCode: selectedFactory.factoryCode,
        };
      }
    }

    if (newRow.lineId !== oldRow.lineId) {
      const selectedLine = lineOptions.find(opt => opt.lineId === newRow.lineId);
      if (selectedLine) {
        newRow = {
          ...newRow,
          lineName: selectedLine.lineName,
        };
      }
    }

    setEquipmentList((prev) => {
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
        const existingIndex = prevUpdatedRows.findIndex(row => row.equipmentId === newRow.equipmentId);

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

    return { ...oldRow, ...newRow };
  }

  // 검색 실행 함수
  const handleSearch = (data) => {
    setUpdatedRows([]);
    setAddRows([]);

    const query = `
      query getEquipments($filter: EquipmentFilter) {
        getEquipments(filter: $filter) {
          factoryId
          factoryName
          lineId
          lineName
          equipmentId
          equipmentSn
          equipmentType
          equipmentName
          equipmentStatus
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
        const rowsWithId = data.data.getEquipments.map((row, index) => ({
          ...row,
          id: row.equipmentId
        }));
        setEquipmentList(rowsWithId);
        // setRefreshKey(prev => prev + 1);
      }
      setIsLoading(false);
    }).catch((err) => {
      setIsLoading(false);
    });
  };

  // 설비 선택 핸들러
  const handleEquipmentSelect = (params) => {
    const equipment = equipmentList.find(e => e.id === params.id);
    setSelectedEquipment(equipment);
  };


  const transformRowForMutation = (row) => ({
    factoryId: row.factoryId,
    lineId: row.lineId,
    equipmentSn: row.equipmentSn,
    equipmentType: row.equipmentType,
    equipmentName: row.equipmentName,
    equipmentStatus: row.equipmentStatus,
    flagActive: row.flagActive
  });

  const transformRowForUpdate = (row) => ({
    factoryId: row.factoryId,
    lineId: row.lineId,
    equipmentId: row.equipmentId,
    equipmentSn: row.equipmentSn,
    equipmentType: row.equipmentType,
    equipmentName: row.equipmentName,
    equipmentStatus: row.equipmentStatus,
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

    const createEquipmentMutation = `
      mutation saveEquipment($createdRows: [EquipmentInput], $updatedRows: [EquipmentUpdate]) {
        saveEquipment(createdRows: $createdRows, updatedRows: $updatedRows)
    }
  `;

    const createdEquipmentInputs = addRows.map(transformRowForMutation);
    const updatedEquipmentInputs = updatedRows.map(transformRowForUpdate);

    fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // 쿠키 자동 전송 설정
      body: JSON.stringify({
        query: createEquipmentMutation,
        variables: {
          createdRows: createdEquipmentInputs,
          updatedRows: updatedEquipmentInputs,
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
          console.error("Error save Equipment:", error);
        });
  };

  // 삭제 버튼 클릭 핸들러
  const handleDelete = () => {
    if (!selectedEquipment) {
      Swal.fire({
        icon: 'warning',
        title: '알림',
        text: '삭제할 설비를 선택해주세요.',
        confirmButtonText: '확인'
      });
      return;
    }

    const deleteEquipmentMutation = `
      mutation deleteEquipment($equipmentId: String!) {
        deleteEquipment(equipmentId: $equipmentId)
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
            query: deleteEquipmentMutation,
            variables: {equipmentId: selectedEquipment.equipmentId}
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
                const updatedList = equipmentList.filter(f => f.id !== selectedEquipment.id);
                setEquipmentList(updatedList);
                setSelectedEquipment(null);
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
    const newEquipment = {
      id: `NEW_${Date.now()}`,
      factoryId: '',
      factoryName: '',
      lineId: '',
      lineName: '',
      equipmentId: '자동입력',
      equipmentSn: '',
      equipmentType: '',
      equipmentName: '',
      status: '',
      flagActive: null,
      createdUser: '자동입력',
      createdDate: '자동입력',
      updatedUser: '자동입력',
      updatedDate: '자동입력'
    };
    
    setEquipmentList([newEquipment, ...equipmentList]);
    setSelectedEquipment(newEquipment);
  };

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    // 약간의 딜레이를 주어 DOM 요소가 완전히 렌더링된 후에 그리드 데이터를 설정
    const timer = setTimeout(() => {
      const query = `
      query getEquipments($filter: EquipmentFilter) {
        getEquipments(filter: $filter) {
          factoryId
          factoryName
          lineId
          lineName
          equipmentId
          equipmentSn
          equipmentType
          equipmentName
          equipmentStatus
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
          const rowsWithId = data.data.getEquipments.map((row, index) => ({
            ...row,
            id: row.equipmentId
          }));
          setEquipmentList(rowsWithId);
        }
        setIsLoading(false);
      })
          .catch((err) => {
            setIsLoading(false);
          });
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  //공장 정보 불러오기
  useEffect(() => {
    const query = `
      query getGridFactory {
        getGridFactory {
          factoryId
          factoryName
          factoryCode
        }
      }
    `;

    fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // 쿠키 자동 전송 설정
      body: JSON.stringify({
        query
      })
    }).then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    }).then((data) => {
      if (data.errors) {
        console.error(data.errors);
      } else {
        // API에서 받은 데이터를 select 옵션 배열로 가공합니다.
        const options = data.data.getGridFactory.map((row) => ({
          value: row.factoryId,
          label: row.factoryId
        }));
        setFactoryTypeOptions(options);

        const models = data.data.getGridFactory.map((row) => ({
          factoryId: row.factoryId,
          factoryName: row.factoryName,
          factoryCode: row.factoryCode
        }));
        setFactoryModel(models);

      }
    }).catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    const query = `
    query getLineOptions {
      getLineOptions {
        factoryId
        lineId
        lineName
      }
    }
  `;
    fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // 쿠키 자동 전송 설정
      body: JSON.stringify({ query }),
    })
        .then((res) => res.json())
        .then((data) => {
          if (!data.errors) {
            setLineOptions(data.data.getLineOptions);
          }
        })
        .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    fetchGridCodesByCodeClassId("CD20250402135319458", setEquipmentStatusOptions);
    fetchGridCodesByCodeClassId("CD20250402135319708", setEquipmentTypeOptions);
  }, []);


  useEffect(()=>{
    console.log("addRows: ", addRows )
  },[addRows])


  useEffect(()=>{
    console.log("updatedRows: ", updatedRows )
  },[updatedRows])


  // 설비 목록 그리드 컬럼 정의
  const equipmentColumns = [
    {
      field: 'factoryId',
      headerName: '공장 ID',
      width: 100,
      editable: true,
      type: 'singleSelect',
      valueOptions: factoryTypeOptions,
      flex:1
    },
    { field: 'factoryName', headerName: '공장 명', width: 100 },
    {
      field: 'lineId',
      headerName: '라인 ID',
      width: 100,
      editable: true,
      type: 'singleSelect',
      flex:1,
      valueOptions: (params) => {
        // 각 행의 factoryId에 따라 라인 옵션 필터링
        const factoryId = params.row.factoryId;
        return lineOptions
            .filter((line) => line.factoryId === factoryId)
            .map((line) => ({ value: line.lineId, label: line.lineId }));
      },
    },
    { field: 'lineName', headerName: '라인 명', width: 90 },
    { field: 'equipmentId', headerName: '설비 ID', width: 100, flex: 1 },
    { field: 'equipmentSn', headerName: '설비 S/N', width: 100 , editable: true },
    {
      field: 'equipmentType',
      headerName: '설비 유형', width: 90,
      editable: true,
      type: 'singleSelect',
      valueOptions: equipmentTypeOptions,
      flex:1
    },
    { field: 'equipmentName', headerName: '설비 명', width: 120, editable: true },
    {
      field: 'equipmentStatus' ,
      headerName: '상태' , width: 90,
      editable: true,
      type: 'singleSelect',
      valueOptions: equipmentStatusOptions,
      flex:1
    },
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
    { field: 'createdUser', headerName: '등록자', width: 90 },
    { field: 'createdDate', headerName: '등록일', width: 130 },
    { field: 'updatedUser', headerName: '수정자', width: 90 },
    { field: 'updatedDate', headerName: '수정일', width: 130 }
  ];

  // 설비 목록 그리드 버튼
  const equipmentGridButtons = [
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

  function fetchGridCodesByCodeClassId(codeClassId, setOptions) {
    const query = `
    query getGridCodes($codeClassId: String!) {
      getGridCodes(codeClassId: $codeClassId) {
        codeId
        codeName
      }
    }
  `;
    const variables = { codeClassId };

    fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // 쿠키 자동 전송 설정
      body: JSON.stringify({ query, variables }),
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
            const options = data.data.getGridCodes.map((row) => ({
              value: row.codeId,
              label: row.codeName,
            }));
            setOptions(options);
          }
        })
        .catch((err) => console.error(err));
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
          설비관리
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
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="factoryId"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="공장 ID"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="공장ID를 입력하세요"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="factoryName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="공장 명"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="공장명을 입력하세요"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="lineId"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="라인 ID"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="라인ID를 입력하세요"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="lineName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="라인 명"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="라인명을 입력하세요"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="equipmentId"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="설비 ID"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="설비ID를 입력하세요"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="equipmentName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="설비 명"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="설비명을 입력하세요"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="equipmentSn"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="설비 S/N"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="설비 S/N을 입력하세요"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="equipmentType"
            control={control}
            render={({ field }) => (
              <FormControl variant="outlined" size="small" fullWidth>
                <InputLabel id="equipmentType-label">설비 유형</InputLabel>
                <Select
                  {...field}
                  labelId="equipmentType-label"
                  label="설비 유형"
                >
                  <MenuItem value="">전체</MenuItem>
                  {equipmentTypeOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
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
            <MuiDataGridWrapper
              title="설비 목록"
              rows={equipmentList}
              columns={equipmentColumns}
              buttons={equipmentGridButtons}
              height={450}
              onRowClick={handleEquipmentSelect}
              gridProps={{
                editMode: 'cell',
                onProcessUpdate: handleProcessRowUpdate
              }}
            />
      )}
      
      {/* 하단 정보 영역 */}
      <Box mt={2} p={2} sx={{ 
        bgcolor: getBgColor(), 
        borderRadius: 1,
        border: `1px solid ${getBorderColor()}`
      }}>
        <Stack spacing={1}>
          <Typography variant="body2" color={getTextColor()}>
            • 설비관리에서는 공장 내 생산에 필요한 설비 정보를 등록, 수정, 삭제할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()}>
            • 설비를 선택하면 해당 설비의 상세 정보를 관리할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()}>
            • 설비 등록 시 설비코드, 설비명, 설치위치, 상태 등의 정보를 입력해야 합니다.
          </Typography>
        </Stack>
      </Box>

      {/* 도움말 모달 */}
      <HelpModal
        open={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        title="설비관리 도움말"
      >
        <Typography variant="body2" color={getTextColor()}>
          • 설비관리에서는 생산 설비의 정보를 등록하고 관리할 수 있습니다.
        </Typography>
        <Typography variant="body2" color={getTextColor()}>
          • 설비코드, 설비명, 공장 정보, 가동 상태 등을 관리하여 설비를 체계적으로 관리할 수 있습니다.
        </Typography>
        <Typography variant="body2" color={getTextColor()}>
          • 설비 정보는 생산 계획, 작업 지시, 생산 실적 관리 등에서 활용됩니다.
        </Typography>
      </HelpModal>
    </Box>
  );
};

export default EquipmentManagement; 