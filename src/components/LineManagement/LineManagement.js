import React, { useState, useEffect } from 'react';
import './LineManagement.css';
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
import {EnhancedDataGridWrapper, MuiDataGridWrapper, SearchCondition} from '../Common';
import Swal from 'sweetalert2';
import { useDomain, DOMAINS } from '../../contexts/DomainContext';
import {GRAPHQL_URL} from "../../config";
import Message from "../../utils/message/Message";
import {graphFetch} from "../../api/fetchConfig";

const LineManagement = (props) => {
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
      lineId: '',
      lineName: '',
      flagActive: null
    }
  });

  // 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [lineList, setLineList] = useState([]);
  const [selectedLine, setSelectedLine] = useState(null);
  const [addRows, setAddRows] = useState([]);
  const [updatedRows, setUpdatedRows] = useState([]);
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
      factoryCode: '',
      lineId: '',
      lineName: '',
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

    setLineList((prev) => {
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
        const existingIndex = prevUpdatedRows.findIndex(row => row.lineId === newRow.lineId);

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
      query getLines($filter: LineFilter) {
        getLines(filter: $filter) {
          factoryId
          factoryName
          factoryCode
          lineId
          lineName
          lineDesc
          flagActive
          createUser
          createDate
          updateUser
          updateDate
        }
      }
    `;

    graphFetch(
        query,
        {filter: data}
    ).then((data) => {
      if (data.errors) {
      } else {
        const rowsWithId = data.getLines.map((row, index) => ({
          ...row,
          id: row.lineId ,
          createDate: row.createDate ? row.createDate.replace("T", " ") : "",
          updateDate: row.updateDate ? row.updateDate.replace("T", " ") : ""
        }));
        setLineList(rowsWithId);
        // setRefreshKey(prev => prev + 1);
      }
      setIsLoading(false);
    }).catch((err) => {
      setIsLoading(false);
    });
  };

  // 라인 선택 핸들러
  const handleLineSelect = (params) => {
    const line = lineList.find(l => l.id === params.id);
    setSelectedLine(line);
  };

  // 등록 버튼 클릭 핸들러
  const handleAdd = () => {
    const newLine = {
      id: `NEW_${Date.now()}`,
      factoryId: '',
      factoryName: '',
      factoryCode: '',
      lineId: '자동입력',
      lineName: '',
      lineDesc: '',
      flagActive: 'Y',
      createUser: '자동입력',
      createDate: '자동입력',
      updateUser: '자동입력',
      updateDate: '자동입력'
    };
    
    setLineList([newLine, ...lineList]);
  };

  const transformRowForMutation = (row) => ({
    factoryId: row.factoryId,
    lineName: row.lineName,
    lineDesc: row.lineDesc,
    flagActive: row.flagActive
  });

  const transformRowForUpdate = (row) => ({
    lineId: row.lineId,
    factoryId: row.factoryId,
    lineName: row.lineName,
    lineDesc: row.lineDesc,
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
      lineName: '라인명'
    };

    if (!validateRequiredFields(addRows, requiredFields) ||
        !validateRequiredFields(updatedRows, requiredFields)) {
      return;
    }


    const createLineMutation = `
      mutation saveLine($createdRows: [LineInput], $updatedRows: [LineUpdate]) {
        saveLine(createdRows: $createdRows, updatedRows: $updatedRows)
    }
  `;

    const createdLineInputs = addRows.map(transformRowForMutation);
    const updatedLineInputs = updatedRows.map(transformRowForUpdate);

    graphFetch(
        createLineMutation,
        {
          createdRows: createdLineInputs,
          updatedRows: updatedLineInputs,
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
    if (!selectedLine) {
      Swal.fire({
        icon: 'warning',
        title: '알림',
        text: '삭제할 라인을 선택해주세요.',
        confirmButtonText: '확인'
      });
      return;
    }

    const deleteLineMutation = `
      mutation DeleteLine($lineId: String!) {
        deleteLine(lineId: $lineId)
      }
    `;

    const isDeleteAddRows = addRows.find(f => f.id === selectedLine.id)
    const isDeleteUpdateRows = updatedRows.find(f => f.id === selectedLine.id)

    if(isDeleteAddRows) {
      const updateAddList = addRows.filter(f => f.id !== selectedLine.id);
      setAddRows(updateAddList);
    }

    if(isDeleteUpdateRows) {
      const updatedRowsLit = updatedRows.filter(f => f.id !== selectedLine.id);
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



        graphFetch(
            deleteLineMutation,
            { lineId: selectedLine.lineId }
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
                const updatedList = lineList.filter(f => f.id !== selectedLine.id);
                setLineList(updatedList);
                setSelectedLine(null);
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


    graphFetch(
        query
    ).then((data) => {
          if (data.errors) {
            console.error(data.errors);
          } else {
            // API에서 받은 데이터를 select 옵션 배열로 가공합니다.
            const options = data.getGridFactory.map((row) => ({
              value: row.factoryId,
              label: row.factoryId
            }));
            setFactoryTypeOptions(options);

            const models = data.getGridFactory.map((row) => ({
              factoryId: row.factoryId,
              factoryName: row.factoryName,
              factoryCode: row.factoryCode
            }));
            setFactoryModel(models);

          }
        }).catch((err) => console.error(err));

  }, []);

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    // 약간의 딜레이를 주어 DOM 요소가 완전히 렌더링된 후에 그리드 데이터를 설정
    const timer = setTimeout(() => {
      const query = `
      query getLines($filter: LineFilter) {
        getLines(filter: $filter) {
          factoryId
          factoryName
          factoryCode
          lineId
          lineName
          lineDesc
          flagActive
          createUser
          createDate
          updateUser
          updateDate
        }
      }
    `;

      graphFetch(
          query,
          {filter: getValues()}
      ).then((data) => {
        if (data.errors) {
        } else {
          const rowsWithId = data.getLines.map((row, index) => ({
            ...row,
            id: row.lineId,  // 또는 row.factoryId || index + 1
            createDate: row.createDate ? row.createDate.replace("T", " ") : "",
            updateDate: row.updateDate ? row.updateDate.replace("T", " ") : ""
          }));
          setLineList(rowsWithId);
        }
        setIsLoading(false);
      })
          .catch((err) => {
            setIsLoading(false);
          });
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // 라인 목록 그리드 컬럼 정의
  const lineColumns = [
    {
      field: 'factoryId',
      headerName: '공장 ID',
      width: 100,
      editable: true,
      type: 'singleSelect',
      valueOptions: factoryTypeOptions,
      flex: 1
    },
    { field: 'factoryName', headerName: '공장 명', width: 130 },
    { field: 'factoryCode', headerName: '공장 코드', width: 100 },
    { field: 'lineId', headerName: '라인 ID', width: 100, flex: 1 },
    {
      field: 'lineName',
      headerName: '라인 명',
      width: 100 ,
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
    // {
    //   field: 'status',
    //   headerName: '상태',
    //   width: 90,
    //   editable: true,
    //   renderCell: (params) => {
    //     let color = '';
    //     if (params.value === '가동중') color = 'green';
    //     else if (params.value === '대기중') color = 'orange';
    //     else if (params.value === '점검중') color = 'red';
    //
    //     return (
    //       <span style={{ color }}>{params.value}</span>
    //     );
    //   }
    // },
    { field: 'lineDesc', headerName: '라인 설명', width: 200, editable: true, flex:1},
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

  // 라인 목록 그리드 버튼
  const lineGridButtons = [
    { label: '등록', onClick: handleAdd, icon: <AddIcon /> },
    { label: '저장', onClick: handleSave, icon: <SaveIcon /> },
    { label: '삭제', onClick: handleDelete, icon: <DeleteIcon /> }
  ];

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
          라인정보관리
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
                placeholder="공장명을 입력하세요"
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
        {/*<Grid item xs={12} sm={6} md={3}>*/}
        {/*  <Controller*/}
        {/*    name="status"*/}
        {/*    control={control}*/}
        {/*    render={({ field }) => (*/}
        {/*      <FormControl variant="outlined" size="small" fullWidth>*/}
        {/*        <InputLabel id="status-label">상태</InputLabel>*/}
        {/*        <Select*/}
        {/*          {...field}*/}
        {/*          labelId="status-label"*/}
        {/*          label="상태"*/}
        {/*        >*/}
        {/*          <MenuItem value="">전체</MenuItem>*/}
        {/*          <MenuItem value="가동중">가동중</MenuItem>*/}
        {/*          <MenuItem value="대기중">대기중</MenuItem>*/}
        {/*          <MenuItem value="점검중">점검중</MenuItem>*/}
        {/*        </Select>*/}
        {/*      </FormControl>*/}
        {/*    )}*/}
        {/*  />*/}
        {/*</Grid>*/}
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="flagActive"
            control={control}
            render={({ field }) => (
              <FormControl variant="outlined" size="small" fullWidth>
                <InputLabel id="useYn-label" shrink>사용여부</InputLabel>
                <Select
                  {...field}
                  labelId="useYn-label"
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
        //   {/* 라인 목록 그리드 */}
          <Grid item xs={12} md={6}>
            <EnhancedDataGridWrapper
              title="라인 목록"
              rows={lineList}
              columns={lineColumns}
              buttons={lineGridButtons}
              height={450}
              onRowClick={handleLineSelect}
              gridProps={{
                editMode: 'cell',
                onProcessUpdate: handleProcessRowUpdate
              }}
              tabId={props.tabId + "-lines"}
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
            • 라인관리에서는 공장 내 생산라인의 정보를 등록, 수정, 삭제할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()}>
            • 라인을 선택하면 해당 라인의 상세 정보를 관리할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()}>
            • 라인 등록 시 라인코드, 라인명, 공장, 설비구성 등의 정보를 입력해야 합니다.
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
};

export default LineManagement; 