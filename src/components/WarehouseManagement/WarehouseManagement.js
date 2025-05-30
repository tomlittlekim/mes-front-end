import React, { useState, useEffect } from 'react';
import './WarehouseManagement.css';
import { useForm, Controller } from 'react-hook-form';
import {
  TextField,
  Grid,
  Box,
  Typography,
  useTheme,
  alpha, IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import {EnhancedDataGridWrapper, SearchCondition} from '../Common';
import Swal from 'sweetalert2';
import { useDomain, DOMAINS } from '../../contexts/DomainContext';
import Message from "../../utils/message/Message";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import HelpModal from "../Common/HelpModal";
import {deleteWarehouse, getWarehouse, saveWarehouse} from "../../api/standardInfo/wareHouseApi";
import {
  fetchDefaultCodesByCodeClassId,
  fetchGridCodesByCodeClassId,
  useSelectionModel
} from "../../utils/grid/useGridRow";
import {getGridFactory} from "../../api/standardInfo/factoryApi";

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
    }
  });

  // 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [warehouseList, setWarehouseList] = useState([]);
  const [addRows, setAddRows] = useState([]);
  const [updatedRows, setUpdatedRows] = useState([]);

  const [warehouseTypeOptions, setWarehouseTypeOptions] = useState([]);
  const [factoryTypeOptions, setFactoryTypeOptions] = useState([]);
  const [factoryModel,setFactoryModel] = useState([]);

  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  const {
    selectionModel,            // 선택된 ID 배열
    onSelectionModelChange,    // DataGrid에 넘길 핸들러
    removeSelectedRows
  } = useSelectionModel([], setAddRows, setUpdatedRows, setWarehouseList);


  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    // 약간의 딜레이를 주어 DOM 요소가 완전히 렌더링된 후에 그리드 데이터를 설정
    const timer = setTimeout(() => {

      getWarehouse(
          getValues()
      ).then((res) => {
        if (res.errors) {
        } else {
          const rowsWithId = res.map((row) => ({
            ...row,
            id: row.warehouseId,
            createDate: row.createDate?.replace("T", " ") || "",
            updateDate: row.updateDate?.replace("T", " ") || ""
          }));
          setWarehouseList(rowsWithId);
        }
        setIsLoading(false);
      }).catch((err) => {
        setIsLoading(false);
      });
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetchDefaultCodesByCodeClassId("WAREHOUSE",setWarehouseTypeOptions)
  }, []);

  useEffect(() => {
    getGridFactory()
        .then((data) => {
          if (data.errors) {
            console.error(data.errors);
          } else {
            // API에서 받은 데이터를 select 옵션 배열로 가공합니다.
            const options = data.map((row) => ({
              value: row.factoryId,
              label: row.factoryId
            }));
            setFactoryTypeOptions(options);

            const models = data.map((row) => ({
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
    {
      field: 'warehouseName',
      headerName: '창고 명',
      width: 100,
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
      field: 'warehouseType',
      headerName: '창고 유형',
      width: 150,
      editable: true,
      type: 'singleSelect',
      valueOptions: warehouseTypeOptions,
    },
    { field: 'createUser', headerName: '등록자', width: 100 },
    { field: 'createDate', headerName: '등록일', width: 150 },
    { field: 'updateUser', headerName: '수정자', width: 100 },
    { field: 'updateDate', headerName: '수정일', width: 150 }
  ];

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

  // 초기화 함수
  const handleReset = () => {
    reset({
      factoryId: '',
      factoryName: '',
      warehouseId: '',
      warehouseName: '',
    });
  };

  // 검색 실행 함수
  const handleSearch = (data) => {
    setUpdatedRows([]);
    setAddRows([]);

    getWarehouse(data)
        .then((res) => {
          const rowsWithId = res.map((row) => ({
            ...row,
            id: row.warehouseId,
            createDate: row.createDate?.replace("T", " ") || "",
            updateDate: row.updateDate?.replace("T", " ") || ""
          }));
          setWarehouseList(rowsWithId);
        })
        .catch((err) => {
          console.error("창고 목록 불러오기 실패", err);
        })
        .finally(() => {
          setIsLoading(false);
        });
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
  });

  const transformRowForUpdate = (row) => ({
    warehouseId: row.warehouseId,
    factoryId: row.factoryId,
    warehouseName: row.warehouseName,
    warehouseType: row.warehouseType,
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
      warehouseName: '창고명'
    };

    if (!validateRequiredFields(addRows, requiredFields) ||
        !validateRequiredFields(updatedRows, requiredFields)) {
      return;
    }

    const createdWarehouseInputs = addRows.map(transformRowForMutation);
    const updatedWarehouseInputs = updatedRows.map(transformRowForUpdate);

    saveWarehouse(
        {
          createdRows: createdWarehouseInputs,
          updatedRows: updatedWarehouseInputs,
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
    if (selectionModel.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: '알림',
        text: '삭제할 창고를 선택해주세요.',
        confirmButtonText: '확인'
      });
      return;
    }

    Swal.fire({
      title: '삭제 확인',
      html: '정말 삭제하시겠습니까?<br> 연관된 정보가 모두 사라질 수 있습니다.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: '삭제',
      cancelButtonText: '취소'
    }).then((result) => {
      if (result.isConfirmed) {
        // 백엔드 삭제 요청 (GraphQL)
        deleteWarehouse(
            {warehouseIds: selectionModel}
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
                removeSelectedRows(selectionModel);
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

  // 창고 목록 그리드 버튼
  const warehouseGridButtons = [
    { label: '등록', onClick: handleAddRow, icon: <AddIcon /> },
    { label: '저장', onClick: handleSave, icon: <SaveIcon /> },
    { label: '삭제', onClick: handleDelete, icon: <DeleteIcon /> }
  ];

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
          창고정보관리
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
              height={640}
              gridProps={{
                checkboxSelection: true,
                onSelectionModelChange: onSelectionModelChange,
                editMode: 'cell',
                onProcessUpdate: handleProcessRowUpdate,
                isCellEditable: (params) => {
                  if (params.field === 'warehouseType') {
                    return params.row.id?.toString().startsWith('NEW_');
                  }
                  return true;
                },
              }}
              tabId={props.tabId + "-warehouse"}
            />
          </Grid>
      )}
      
      {/* 하단 정보 영역 */}
      {/*<Box mt={2} p={2} sx={{ */}
      {/*  bgcolor: getBgColor(), */}
      {/*  borderRadius: 1,*/}
      {/*  border: `1px solid ${getBorderColor()}`*/}
      {/*}}>*/}
      {/*  <Stack spacing={1}>*/}
      {/*    <Typography variant="body2" color={getTextColor()}>*/}
      {/*      • 창고관리에서는 공장 및 창고 정보를 등록, 수정, 삭제할 수 있습니다.*/}
      {/*    </Typography>*/}
      {/*    <Typography variant="body2" color={getTextColor()}>*/}
      {/*      • 창고 등록 시 창고코드, 창고명, 위치, 관리자 등의 정보를 입력해야 합니다.*/}
      {/*    </Typography>*/}
      {/*  </Stack>*/}
      {/*</Box>*/}

      {/* 도움말 모달 */}
      <HelpModal
          open={isHelpModalOpen}
          onClose={() => setIsHelpModalOpen(false)}
          title="창고정보관리 도움말"
      >
        <Typography variant="body2" color={getTextColor()}>
          • 창고관리에서는 공장 및 창고 정보를 등록, 수정, 삭제할 수 있습니다.
        </Typography>
        <Typography variant="body2" color={getTextColor()}>
          • 창고 등록 시 공장ID, 창고명, 창고유형 등의 정보를 입력해야 합니다.
        </Typography>
      </HelpModal>
    </Box>
  );
};

export default WarehouseManagement;
