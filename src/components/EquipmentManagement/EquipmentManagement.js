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
import {EnhancedDataGridWrapper, MuiDataGridWrapper, SearchCondition} from '../Common';
import Swal from 'sweetalert2';
import { useDomain, DOMAINS } from '../../contexts/DomainContext';
import HelpModal from '../Common/HelpModal';
import {GRAPHQL_URL} from "../../config";
import Message from "../../utils/message/Message";
import {graphFetch} from "../../api/fetchConfig";
import {deleteEquipment, getEquipments, saveEquipment} from "../../api/standardInfo/equipmentApi";
import {getGridFactory} from "../../api/standardInfo/factoryApi";
import {getLineOptions} from "../../api/standardInfo/lineApi";
import {fetchGridCodesByCodeClassId, useSelectionModel} from "../../utils/grid/useGridRow";

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
    }
  });

  // 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [equipmentList, setEquipmentList] = useState([]);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [addRows, setAddRows] = useState([]);
  const [updatedRows, setUpdatedRows] = useState([]);

  const [factoryTypeOptions, setFactoryTypeOptions] = useState([]);
  const [factoryModel,setFactoryModel] = useState([]);

  const [lineOptions, setLineOptions] = useState([]);
  const [equipmentTypeOptions, setEquipmentTypeOptions] = useState([]);
  const [equipmentStatusOptions, setEquipmentStatusOptions] = useState([]);

  const {
    selectionModel,            // 선택된 ID 배열
    onSelectionModelChange,    // DataGrid에 넘길 핸들러
    removeSelectedRows
  } = useSelectionModel([], setAddRows, setUpdatedRows, setEquipmentList);

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

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    // 약간의 딜레이를 주어 DOM 요소가 완전히 렌더링된 후에 그리드 데이터를 설정
    const timer = setTimeout(() => {

      getEquipments(
          getValues()
      ).then((data) => {
        if (data.errors) {
        } else {
          const rowsWithId = data.map((row, index) => ({
            ...row,
            id: row.equipmentId,
            createDate: row.createDate ? row.createDate.replace("T", " ") : "",
            updateDate: row.updateDate ? row.updateDate.replace("T", " ") : ""
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

  useEffect(() => {
    getLineOptions()
        .then((data) => {
          if (!data.errors) {
            setLineOptions(data);
          }
        })
        .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    fetchGridCodesByCodeClassId("CD20250402135319458", setEquipmentStatusOptions);
    fetchGridCodesByCodeClassId("CD20250402135319708", setEquipmentTypeOptions);
  }, []);

  // 설비 목록 그리드 컬럼 정의
  const equipmentColumns = [
    {
      field: 'factoryId',
      headerName: '공장 ID',
      width: 140,
      editable: true,
      type: 'singleSelect',
      valueOptions: factoryTypeOptions
    },
    { field: 'factoryName', headerName: '공장 명', width: 100 },
    {
      field: 'lineId',
      headerName: '라인 ID',
      width: 140,
      editable: true,
      type: 'singleSelect',
      valueOptions: (params) => {
        // 각 행의 factoryId에 따라 라인 옵션 필터링
        const factoryId = params.row.factoryId;
        return lineOptions
            .filter((line) => line.factoryId === factoryId)
            .map((line) => ({ value: line.lineId, label: line.lineId }));
      },
    },
    { field: 'lineName', headerName: '라인 명', width: 90 },
    { field: 'equipmentId', headerName: '설비 ID', width: 140 },
    {
      field: 'equipmentBuyDate',
      headerName: '설비 구입일',
      width: 130,
      editable: true,
      renderEditCell: (params) => {
        const rawValue = params.value ? params.value.replace(/\D/g, '') : '';

        return (
            <TextField
                value={rawValue}
                onChange={(e) => {
                  params.api.setEditCellValue({
                    id: params.id,
                    field: params.field,
                    value: e.target.value
                  });
                }}
                placeholder="YYYYMMDD"
                size="small"
            />
        );
      }
    },
    { field: 'equipmentBuyVendor', headerName: '설비 구입처', width: 120, editable: true },
    { field: 'equipmentSn', headerName: '설비 S/N', width: 100 , editable: true },
    {
      field: 'equipmentType',
      headerName: '설비 유형', width: 90,
      editable: true,
      type: 'singleSelect',
      valueOptions: equipmentTypeOptions
    },
    {
      field: 'equipmentName',
      headerName: '설비 명',
      width: 120,
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
      field: 'equipmentStatus' ,
      headerName: '상태' , width: 90,
      editable: true,
      type: 'singleSelect',
      valueOptions: equipmentStatusOptions,
    },
    { field: 'remark', headerName: '비고', width: 100, editable: true},
    { field: 'createUser', headerName: '등록자', width: 90 },
    { field: 'createDate', headerName: '등록일', width: 130 },
    { field: 'updateUser', headerName: '수정자', width: 90 },
    { field: 'updateDate', headerName: '수정일', width: 130 }
  ];

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
    });
  };

  // 검색 실행 함수
  const handleSearch = (data) => {
    setUpdatedRows([]);
    setAddRows([]);

    getEquipments(
        data
    ).then((data) => {
      if (data.errors) {
      } else {
        const rowsWithId = data.map((row, index) => ({
          ...row,
          id: row.equipmentId,
          createDate: row.createDate ? row.createDate.replace("T", " ") : "",
          updateDate: row.updateDate ? row.updateDate.replace("T", " ") : ""
        }));
        setEquipmentList(rowsWithId);
        // setRefreshKey(prev => prev + 1);
      }
      setIsLoading(false);
    }).catch((err) => {
      setIsLoading(false);
    });
  };

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
      equipmentName: '설비명'
    };

    if (!validateRequiredFields(addRows, requiredFields) ||
        !validateRequiredFields(updatedRows, requiredFields)) {
      return;
    }

    const createdEquipmentInputs = addRows.map(transformRowForMutation);
    const updatedEquipmentInputs = updatedRows.map(transformRowForUpdate);

    saveEquipment(
        {
          createdRows: createdEquipmentInputs,
          updatedRows: updatedEquipmentInputs,
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
          console.error("Error save Equipment:", error);
        });
  };

  // 삭제 버튼 클릭 핸들러
  const handleDelete = () => {
    if (selectionModel.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: '알림',
        text: '삭제할 설비를 선택해주세요.',
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
        // 백엔드 삭제 요청 (GraphQL)

        deleteEquipment(
            {equipmentIds: selectionModel}
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

  // 등록 버튼 클릭 핸들러
  const handleAdd = () => {
    const newEquipment = {
      id: `NEW_${Date.now()}`,
      factoryId: '',
      factoryName: '',
      lineId: '',
      lineName: '',
      equipmentId: '자동입력',
      equipmentBuyDate: '',
      equipmentBuyVendor: '',
      equipmentSn: '',
      equipmentType: '',
      equipmentName: '',
      equipmentStatus: '',
      remark: '',
      createUser: '자동입력',
      createDate: '자동입력',
      updateUser: '자동입력',
      updateDate: '자동입력'
    };
    
    setEquipmentList([newEquipment, ...equipmentList]);
  };

  // 설비 목록 그리드 버튼
  const equipmentGridButtons = [
    { label: '등록', onClick: handleAdd, icon: <AddIcon /> },
    { label: '저장', onClick: handleSave, icon: <SaveIcon /> },
    { label: '삭제', onClick: handleDelete, icon: <DeleteIcon /> }
  ];

  const transformRowForMutation = (row) => ({
    factoryId: row.factoryId,
    lineId: row.lineId,
    equipmentBuyDate: row.equipmentBuyDate,
    equipmentBuyVendor: row.equipmentBuyVendor,
    equipmentSn: row.equipmentSn,
    equipmentType: row.equipmentType,
    equipmentName: row.equipmentName,
    equipmentStatus: row.equipmentStatus,
    remark: row.remark
  });

  const transformRowForUpdate = (row) => ({
    factoryId: row.factoryId,
    lineId: row.lineId,
    equipmentId: row.equipmentId,
    equipmentBuyDate: row.equipmentBuyDate,
    equipmentBuyVendor: row.equipmentBuyVendor,
    equipmentSn: row.equipmentSn,
    equipmentType: row.equipmentType,
    equipmentName: row.equipmentName,
    equipmentStatus: row.equipmentStatus,
    remark: row.remark
  });

  function handleProcessRowUpdate(newRow, oldRow) {
    const isNewRow = oldRow.id.startsWith('NEW_');

    if (newRow.equipmentBuyDate && /^\d{8}$/.test(newRow.equipmentBuyDate)) {
      const raw = newRow.equipmentBuyDate;
      newRow.equipmentBuyDate = `${raw.slice(0, 4)}/${raw.slice(4, 6)}/${raw.slice(6, 8)}`;
    } else if (newRow.equipmentBuyDate && newRow.equipmentBuyDate !== oldRow.equipmentBuyDate) {
      Message.showError({ message: `입력형식을 일치해주세요 (YYYYMMDD)` });
      return oldRow; // rollback
    }

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
          설비정보관리
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
        {/*<Grid item xs={12} sm={6} md={3}>*/}
        {/*  <Controller*/}
        {/*    name="flagActive"*/}
        {/*    control={control}*/}
        {/*    render={({ field }) => (*/}
        {/*      <FormControl variant="outlined" size="small" fullWidth>*/}
        {/*        <InputLabel id="flagActive-label" shrink>사용여부</InputLabel>*/}
        {/*        <Select*/}
        {/*          {...field}*/}
        {/*          labelId="flagActive-label"*/}
        {/*          label="사용여부"*/}
        {/*          displayEmpty*/}
        {/*          notched*/}
        {/*        >*/}
        {/*          <MenuItem value={null}>전체</MenuItem>*/}
        {/*          <MenuItem value="Y">사용</MenuItem>*/}
        {/*          <MenuItem value="N">미사용</MenuItem>*/}
        {/*        </Select>*/}
        {/*      </FormControl>*/}
        {/*    )}*/}
        {/*  />*/}
        {/*</Grid>*/}
      </SearchCondition>
      
      {/* 그리드 영역 */}
      {!isLoading && (
          <Grid item xs={12} md={6}>
            <EnhancedDataGridWrapper
              title="설비 목록"
              rows={equipmentList}
              columns={equipmentColumns}
              buttons={equipmentGridButtons}
              height={590}
              gridProps={{
                checkboxSelection: true,
                onSelectionModelChange: onSelectionModelChange,
                editMode: 'cell',
                onProcessUpdate: handleProcessRowUpdate
              }}
              tabId={props.tabId + "-equip"}
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
      {/*      • 설비관리에서는 공장 내 생산에 필요한 설비 정보를 등록, 수정, 삭제할 수 있습니다.*/}
      {/*    </Typography>*/}
      {/*    <Typography variant="body2" color={getTextColor()}>*/}
      {/*      • 설비를 선택하면 해당 설비의 상세 정보를 관리할 수 있습니다.*/}
      {/*    </Typography>*/}
      {/*    <Typography variant="body2" color={getTextColor()}>*/}
      {/*      • 설비 등록 시 설비코드, 설비명, 설치위치, 상태 등의 정보를 입력해야 합니다.*/}
      {/*    </Typography>*/}
      {/*  </Stack>*/}
      {/*</Box>*/}

      {/* 도움말 모달 */}
      <HelpModal
        open={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        title="설비정보관리 도움말"
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
        <Typography variant="body2" color={getTextColor()}>
          • 설비 구입일은 입력값이 8자리숫자(YYYYMMDD)의 형식과 일치해야 합니다.
        </Typography>
      </HelpModal>
    </Box>
  );
};

export default EquipmentManagement; 