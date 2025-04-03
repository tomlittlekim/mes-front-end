import React, { useState, useEffect } from 'react';
import './WarehouseManagement.css';
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
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import {EnhancedDataGridWrapper, MuiDataGridWrapper, SearchCondition} from '../Common';
import Swal from 'sweetalert2';
import { useDomain, DOMAINS } from '../../contexts/DomainContext';
import {GRAPHQL_URL} from "../../config";

const WarehouseManagement = (props) => {
  // 현재 테마 가져오기
  const theme = useTheme();
  const { domain } = useDomain();
  const isDarkMode = theme.palette.mode === 'dark';
  
  // React Hook Form 설정
  const { control, handleSubmit, reset,getValues } = useForm({
    defaultValues: {
      factoryId: '',
      factoryName: '',
      warehouseId: '',
      warehouseName: '',
      flagActive: null
    }
  });

  // 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [warehouseList, setWarehouseList] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [addRows, setAddRows] = useState([]);
  const [updatedRows, setUpdatedRows] = useState([]);

  const [warehouseTypeOptions, setWarehouseTypeOptions] = useState([]);
  const [factoryTypeOptions, setFactoryTypeOptions] = useState([]);
  const [factoryModel,setFactoryModel] = useState([]);


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
      warehouseId: '',
      warehouseName: '',
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

    setWarehouseList((prev) => {
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
        const existingIndex = prevUpdatedRows.findIndex(row => row.warehouseId === newRow.warehouseId);

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
      query getWarehouse($filter: WarehouseFilter) {
        getWarehouse(filter: $filter) {
          factoryId
          factoryName
          warehouseId
          warehouseName
          warehouseType
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
        const rowsWithId = data.data.getWarehouse.map((row, index) => ({
          ...row,
          id: row.warehouseId ,
          createDate: row.createDate ? row.createDate.replace("T", " ") : "",
          updateDate: row.updateDate ? row.updateDate.replace("T", " ") : ""
        }));
        setWarehouseList(rowsWithId);
        // setRefreshKey(prev => prev + 1);
      }
      setIsLoading(false);
    }).catch((err) => {
      setIsLoading(false);
    });
  };

  // 창고 선택 핸들러
  const handleWarehouseSelect = (params) => {
    const warehouse = warehouseList.find(w => w.id === params.id);
    setSelectedWarehouse(warehouse);
  };

  // 행 추가 핸들러
  const handleAddRow = () => {
    const newWarehouse = {
      id: `NEW_${Date.now()}`,
      factoryId: '',
      factoryName: '',
      warehouseId: '자동입력',
      warehouseName: '',
      warehouseType: '',
      flagActive: 'Y',
      createUser: '자동입력',
      createDate: '자동입력',
      updateUser: '자동입력',
      updateDate: '자동입력'
    };
    
    setWarehouseList([newWarehouse, ...warehouseList]);
  };


  const transformRowForMutation = (row) => ({
    factoryId: row.factoryId,
    warehouseName: row.warehouseName,
    warehouseType: row.warehouseType,
    flagActive: row.flagActive
  });

  const transformRowForUpdate = (row) => ({
    warehouseId: row.warehouseId,
    factoryId: row.factoryId,
    warehouseName: row.warehouseName,
    warehouseType: row.warehouseType,
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

    const createWarehouseMutation = `
      mutation saveWarehouse($createdRows: [WarehouseInput], $updatedRows: [WarehouseUpdate]) {
        saveWarehouse(createdRows: $createdRows, updatedRows: $updatedRows)
    }
  `;

    const createdWarehouseInputs = addRows.map(transformRowForMutation);
    const updatedWarehouseInputs = updatedRows.map(transformRowForUpdate);

    fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // 쿠키 자동 전송 설정
      body: JSON.stringify({
        query: createWarehouseMutation,
        variables: {
          createdRows: createdWarehouseInputs,
          updatedRows: updatedWarehouseInputs,
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
    if (!selectedWarehouse) {
      Swal.fire({
        icon: 'warning',
        title: '알림',
        text: '삭제할 창고를 선택해주세요.',
        confirmButtonText: '확인'
      });
      return;
    }

    const deleteWarehouseMutation = `
      mutation deleteWarehouse($warehouseId: String!) {
        deleteWarehouse(warehouseId: $warehouseId)
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
            query: deleteWarehouseMutation,
            variables: {warehouseId: selectedWarehouse.warehouseId}
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
                const updatedList = warehouseList.filter(f => f.id !== selectedWarehouse.id);
                setWarehouseList(updatedList);
                setSelectedWarehouse(null);
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

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    // 약간의 딜레이를 주어 DOM 요소가 완전히 렌더링된 후에 그리드 데이터를 설정
    const timer = setTimeout(() => {
      const query = `
      query getWarehouse($filter: WarehouseFilter) {
        getWarehouse(filter: $filter) {
          factoryId
          factoryName
          warehouseId
          warehouseName
          warehouseType
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
          const rowsWithId = data.data.getWarehouse.map((row, index) => ({
            ...row,
            id: row.warehouseId ,
            createDate: row.createDate ? row.createDate.replace("T", " ") : "",
            updateDate: row.updateDate ? row.updateDate.replace("T", " ") : ""
          }));
          setWarehouseList(rowsWithId);
        }
        setIsLoading(false);
      })
          .catch((err) => {
            setIsLoading(false);
          });
    }, 100);

    return () => clearTimeout(timer);
  }, []);

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
      codeClassId: "CD20250401114109083"
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
            setWarehouseTypeOptions(options);
          }
        })
        .catch((err) => console.error(err));
  }, []);

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

  // 창고 목록 그리드 컬럼 정의
  const warehouseColumns = [
    {
      field: 'factoryId',
      headerName: '공장 ID',
      width: 100,
      editable: true,
      type: 'singleSelect',
      valueOptions: factoryTypeOptions,
      flex:1
    },
    { field: 'factoryName', headerName: '공장명', width: 150 },
    { field: 'warehouseId', headerName: '창고 ID', width: 100, flex: 1 },
    { field: 'warehouseName', headerName: '창고 명', width: 100, editable: true },
    {
      field: 'warehouseType',
      headerName: '창고 유형',
      width: 150,
      editable: true,
      type: 'singleSelect',
      valueOptions: warehouseTypeOptions,
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
    { field: 'createUser', headerName: '등록자', width: 100 },
    { field: 'createDate', headerName: '등록일', width: 150 },
    { field: 'updateUser', headerName: '수정자', width: 100 },
    { field: 'updateDate', headerName: '수정일', width: 150 }
  ];

  // 창고 목록 그리드 버튼
  const warehouseGridButtons = [
    { label: '등록', onClick: handleAddRow, icon: <AddIcon /> },
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
          창고관리
        </Typography>
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
                placeholder="공장 ID를 입력하세요"
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
                label="공장명"
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
            name="warehouseId"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="창고 ID"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="창고 ID를 입력하세요"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="warehouseName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="창고명"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="창고명을 입력하세요"
              />
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
        //   {/* 창고 기본 정보 그리드 */}
          <Grid item xs={12} md={6}>
            <EnhancedDataGridWrapper
              title="창고 목록"
              rows={warehouseList}
              columns={warehouseColumns}
              buttons={warehouseGridButtons}
              height={450}
              onRowClick={handleWarehouseSelect}
              gridProps={{
                editMode: 'cell',
                onProcessUpdate: handleProcessRowUpdate
              }}
              tabId={props.tabId + "-warehouse"}
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
            • 창고관리에서는 공장 및 창고 정보를 등록, 수정, 삭제할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()}>
            • 창고를 선택하면 해당 창고의 상세 정보를 관리할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()}>
            • 창고 등록 시 창고코드, 창고명, 위치, 관리자 등의 정보를 입력해야 합니다.
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
};

export default WarehouseManagement;
