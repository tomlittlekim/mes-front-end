import React, {useState, useEffect, useCallback} from 'react';
import { GRAPHQL_URL } from '../../config';
import './FactoryManagement.css';
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
  FormHelperText
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import { MuiDataGridWrapper, SearchCondition, EnhancedDataGridWrapper } from '../Common';
import Swal from 'sweetalert2';
import { useDomain, DOMAINS } from '../../contexts/DomainContext';

const FactoryManagement = (props) => {
  // 현재 테마 가져오기
  const theme = useTheme();
  const { domain } = useDomain();
  const isDarkMode = theme.palette.mode === 'dark';

  // React Hook Form 설정
  const { control, handleSubmit, reset,getValues } = useForm({
    defaultValues: {
      factoryId: '',
      factoryName: '',
      factoryCode: '',
      flagActive: null
    }
  });
  
  // 상태 관리
  const [selectedFactory, setSelectedFactory] = useState(null);
  const [factoryDetail, setFactoryDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatedRows, setUpdatedRows] = useState([]); // 수정된 필드만 저장하는 객체
  const [addRows,setAddRows] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0); // 강제 리렌더링용 키


  // 더미 데이터
  const [factoryList, setFactoryList] = useState([]);

  // 검색 조건 변경 핸들러
  const handleSearch = (data) => {
   // 검색후 업데이트 로우 초기화
    setUpdatedRows([]);
    setAddRows([]);

    const query = `
      query getFactories($filter: FactoryFilter) {
        factories(filter: $filter) {
          factoryId
          factoryName
          factoryCode
          address
          telNo
          officerName
          flagActive
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
            const rowsWithId = data.data.factories.map((row, index) => ({
              ...row,
              id: row.factoryId  // 또는 row.factoryId || index + 1
            }));
            setFactoryList(rowsWithId);
            setRefreshKey(prev => prev + 1);
          }
          setIsLoading(false);
        })
        .catch((err) => {
          setIsLoading(false);
        });
  };

  // 초기화 함수
  const handleReset = () => {
    reset({
      factoryId: '',
      factoryName: '',
      factoryCode: '',
      flagActive: null
    });
  };


  function handleProcessRowUpdate(newRow, oldRow) {
    const isNewRow = oldRow.id.startsWith('NEW_');

    setFactoryList((prev) => {
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
        // 같은 factoryId를 가진 기존 행이 있는지 확인
        const existingIndex = prevUpdatedRows.findIndex(row => row.factoryId === newRow.factoryId);

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
      body: JSON.stringify({ query, variables })
    })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        });
  }


  // 공장 선택 핸들러
  const handleFactorySelect = (params) => {
    const factory = factoryList.find(f => f.id === params.id);
    setSelectedFactory(factory);
    
    // 공장 상세 정보 (실제로는 API 호출)
    const detailData = {
      ...factory,
      registDate: '2023-01-15',
      updateDate: '2023-06-20',
      registUser: '자동입력',
      updateUser: '자동입력',
      usagePurpose: '제조'
    };
    
    setFactoryDetail([detailData]);
  };

  // FactoryInput으로 보낼 데이터만 골라내는 함수
  const transformRowForMutation = (row) => ({
    factoryName: row.factoryName,
    factoryCode: row.factoryCode,
    address: row.address,
    telNo: row.telNo,
    officerName: row.officerName,
    flagActive: row.flagActive
  });

  // 저장 버튼 클릭 핸들러
  const handleSave = () => {
    const createFactoryMutation = `
      mutation CreateFactory($input: [FactoryInput]!) {
        createFactory(input: $input)
      }
    `;

    const factoryInputs = addRows.map(transformRowForMutation);

    fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: createFactoryMutation,
        variables: { input: factoryInputs }
      })
    })
        .then((res) => res.json())
        .then((data) => {
          if (data.errors) {
            console.error("GraphQL errors:", data.errors);
          } else {
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

  // 등록 버튼 클릭 핸들러
  const handleAdd = () => {
    const newFactory = {
      id: `NEW_${Date.now()}`,
      factoryId: '자동입력',
      factoryName: '',
      factoryCode: '',
      flagActive: 'Y',
      address: '',
      telNo: '',
      officerName: '',
    };

    setFactoryList([...factoryList, newFactory]);

  };

  // 삭제 버튼 클릭 핸들러
  const handleDelete = () => {
    if (!selectedFactory) {
      Swal.fire({
        icon: 'warning',
        title: '알림',
        text: '삭제할 공장을 선택해주세요.',
        confirmButtonText: '확인'
      });
      return;
    }

    const deleteFactoryMutation = `
      mutation DeleteFactory($factoryId: String!) {
        deleteFactory(factoryId: $factoryId)
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
          body: JSON.stringify({
            query: deleteFactoryMutation,
            variables: {factoryId: selectedFactory.factoryId} // 선택된 공장의 factoryId를 사용
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
                const updatedList = factoryList.filter(f => f.id !== selectedFactory.id);
                setFactoryList(updatedList);
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
      query getFactories($filter: FactoryFilter) {
        factories(filter: $filter) {
          factoryId
          factoryName
          factoryCode
          address
          telNo
          officerName
          flagActive
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
              const rowsWithId = data.data.factories.map((row, index) => ({
                ...row,
                id: row.factoryId  // 또는 row.factoryId || index + 1
              }));
              setFactoryList(rowsWithId);
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
    console.log('selected changed:', selectedFactory);
  }, [selectedFactory]);

  // 공장 목록 그리드 컬럼 정의
  const factoryColumns = [
    { field: 'factoryId', headerName: '공장 ID', width: 150 },
    { field: 'factoryName', headerName: '공장 명', width: 150 ,editable: true  },
    { field: 'factoryCode', headerName: '공장 코드', width: 100, editable: true  },
    {
      field: 'flagActive',
      headerName: '사용여부',
      width: 100,
      editable: true,
      type: 'singleSelect',
      valueOptions: [
          { value: 'Y', label: '사용' },
          { value: 'N', label: '미사용' }
      ]
    },
    { field: 'address', headerName: '주소', width: 200, flex: 1, editable: true },
    { field: 'telNo', headerName: '전화번호', width: 150, editable: true },
    { field: 'officerName', headerName: '담당자', width: 100},
    { field: 'createUser', headerName: '작성자', width: 100},
    { field: 'createDate', headerName: '작성일', width: 200},
    { field: 'updateUser', headerName: '수정자', width: 100},
    { field: 'updateDate', headerName: '수정일', width: 200},

  ];
  
  // 공장 상세 정보 그리드 컬럼 정의
  // const detailColumns = [
  //   { field: 'id', headerName: '공장ID', width: 100, editable: true },
  //   { field: 'name', headerName: '공장 명', width: 150, editable: true },
  //   { field: 'code', headerName: '공장코드', width: 100, editable: true },
  //   { field: 'address', headerName: '주소', width: 250, flex: 1, editable: true },
  //   { field: 'phone', headerName: '전화번호', width: 150, editable: true },
  //   { field: 'manager', headerName: '담당자 명', width: 100, editable: true },
  //   {
  //     field: 'flagActive',
  //     headerName: '사용 여부',
  //     width: 100,
  //     type: 'singleSelect',
  //     valueOptions: ['Y', 'N'],
  //     valueFormatter: (params) => params.value === 'Y' ? '사용' : '미사용',
  //     editable: true
  //   },
  //   { field: 'usagePurpose', headerName: '용도', width: 100, editable: true },
  //   { field: 'registUser', headerName: '등록자', width: 100 },
  //   { field: 'registDate', headerName: '등록일', width: 120 },
  //   { field: 'updateUser', headerName: '수정자', width: 100 },
  //   { field: 'updateDate', headerName: '수정일', width: 120 }
  // ];

  // 공장 목록 그리드 버튼
  const factoryGridButtons = [
    { label: '등록', onClick: handleAdd, icon: <AddIcon /> },
    { label: '저장', onClick: handleSave, icon: <SaveIcon /> },
    { label: '삭제', onClick: handleDelete, icon: <DeleteIcon /> }
  ];


  // 공장 상세 그리드 버튼
  // const detailGridButtons = [
  //   { label: '등록', onClick: handleAdd, icon: <AddIcon /> },
  //   { label: '저장', onClick: handleSave, icon: <SaveIcon /> },
  //   { label: '삭제', onClick: handleDelete, icon: <DeleteIcon /> }
  // ];

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
          공장정보관리
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
                placeholder="공장 명을 입력하세요"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="factoryCode"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="공장코드"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="공장코드를 입력하세요"
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
                <InputLabel id="flagActive-label">사용여부</InputLabel>
                <Select
                  {...field}
                  labelId="flagActive-label"
                  label="사용여부"
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
        // <Grid container spacing={2}>
        //   {/* 공장 목록 그리드 */}
        //   <Grid item xs={12} md={6}>
            <EnhancedDataGridWrapper
              title="공장 목록"
              key={refreshKey}  // refreshKey가 변경되면 전체 그리드가 재마운트됩니다.
              rows={factoryList}
              columns={factoryColumns}
              buttons={factoryGridButtons}
              height={450}
              onRowClick={handleFactorySelect}
              tabId={props.tabId + "-factories"}
              gridProps={{
                editMode: 'cell',
                // onCellEditStop: handleCellEditStop  // 여기서 전달
                onProcessUpdate: handleProcessRowUpdate
              }}
            />
         //   </Grid>
         //
         //  공장 상세 정보 그리드
         //  <Grid item xs={12} md={6}>
         //    <EnhancedDataGridWrapper
         //      title={`공장 상세 정보 ${selectedFactory ? '- ' + selectedFactory.name : ''}`}
         //      rows={factoryDetail || []}
         //      columns={detailColumns}
         //      buttons={detailGridButtons}
         //      height={450}
         //      gridProps={{
         //        editMode: 'row'
         //      }}
         //      tabId={props.tabId + "-factoryDetails"}
         //    />
         //  </Grid>
         // </Grid>
      )}
      
      {/* 하단 정보 영역 */}
      <Box mt={2} p={2} sx={{ 
        bgcolor: getBgColor(), 
        borderRadius: 1,
        border: `1px solid ${getBorderColor()}`
      }}>
        <Stack spacing={1}>
          <Typography variant="body2" color={getTextColor()}>
            • 공장관리에서는 기업의 공장 시설 정보를 등록, 수정, 삭제할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()}>
            • 공장 목록에서 공장을 선택하면 해당 공장의 상세 정보를 확인하고 관리할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()}>
            • 공장별 위치, 면적, 가동 상태 등 기본 정보를 관리하여 생산 환경을 효율적으로 관리할 수 있습니다.
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
};

export default FactoryManagement; 