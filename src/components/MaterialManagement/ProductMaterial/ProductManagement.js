import React, { useState, useEffect } from 'react';
import './ProductManagement.css';
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
  Checkbox,
  IconButton,
  alpha
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import Swal from 'sweetalert2';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import {DOMAINS, useDomain} from "../../../contexts/DomainContext";
import {EnhancedDataGridWrapper, MuiDataGridWrapper, SearchCondition} from "../../Common";
import HelpModal from "../../Common/HelpModal";
import {
  COMPLETE_MATERIAL_QUERY,
  DELETE_MUTATION,
  MATERIAL_MUTATION
} from "../../../graphql-queries/material-master/materialQueries";
import {gql} from "@apollo/client";
import {useGraphQL} from "../../../apollo/useGraphQL";
import {useGridUtils} from "../../../utils/grid/useGridUtils";
import {format} from "date-fns";
import Message from "../../../utils/message/Message";
import {useGridDataCall} from "../../../utils/grid/useGridDataCall";
import {useGridRow} from "../../../utils/grid/useGridRow";
import ko from "date-fns/locale/ko";
import DateRangePicker from "../../Common/DateRangePicker";

// GraphQL 쿼리 정의
const MATERIAL_GET = gql`${COMPLETE_MATERIAL_QUERY}`;
const MATERIAL_SAVE = gql`${MATERIAL_MUTATION}`;
const MATERIAL_DELETE = gql`${DELETE_MUTATION}`;

/** 검색 조건 값 초기화 */
const SEARCH_CONDITIONS = {
  materialType: '',
  userMaterialId: '',
  materialName: '',
  flagActive: null,
  fromDate: null,
  toDate: null
};

/** 그리드 컬럼을 정의 */
const COLUMNS = [
  {field: 'systemMaterialId', headerName: '시스템자재ID', width: 120},
  {field: 'materialCategory', headerName: '자재유형', width: 100, type: 'singleSelect',
    valueOptions: [
      { value: '잉크', label: '잉크' },
      { value: '포장재', label: '포장재' },
      // { value: 'HALF_PRODUCT', label: '반제품' },
      // { value: 'COMPLETE_PRODUCT', label: '완제품' }
    ], editable: true},
  {field: 'userMaterialId', headerName: '제품ID', width: 120, editable: true },
  {field: 'materialName', headerName: '자재명', width: 180, flex: 1, editable: true },
  {field: 'materialStandard', headerName: '규격', width: 120, editable: true },
  {field: 'unit', headerName: '단위', width: 70, type: 'singleSelect',
    valueOptions: [
      { value: 'EA', label: '개' },
      { value: 'roll', label: '롤' },
      { value: 'bottle', label: '병' },
      { value: 'pack', label: '팩' },
      { value: 'can', label: '캔' },
      { value: 'sheet', label: '장' },
      { value: 'set', label: '세트' },
      { value: 'ream', label: '연' },
      { value: 'pair', label: '쌍' },
    ], editable: true },
  {field: 'baseQuantity', headerName: '기본수량', width: 80, type: 'number', editable: true },
  {field: 'materialStorage', headerName: '보관창고', width: 120},
  {
    field: 'flagActive',
    headerName: '사용여부',
    width: 100,
    type: 'singleSelect',
    valueOptions: [
      { value: 'Y', label: '사용' },
      { value: 'N', label: '미사용' }
    ],
    editable: true,
    valueFormatter: (params) => params.value === 'Y' ? '사용' : '미사용'
  },
  { field: 'createUser', headerName: '작성자', width: 100},
  { field: 'createDate', headerName: '작성일', width: 200},
  { field: 'updateUser', headerName: '수정자', width: 100},
  { field: 'updateDate', headerName: '수정일', width: 200},
];

/** 신규 행추가 시 생성되는 구조 */
const NEW_ROW_STRUCTURE = {
  seq: null,
  materialType: 'COMPLETE_PRODUCT',
  materialCategory: '',
  systemMaterialId: '',
  userMaterialId: '',
  materialName: '',
  materialStandard: '',
  unit: '',
  baseQuantity: 0,
  materialStorage: '',
  flagActive: 'Y',
  createUser: '자동입력',
  createDate: '자동입력',
  updateUser: '자동입력',
  updateDate: '자동입력'
};

const ProductManagement = ({tabId}) => {
  // Theme 및 Context 관련
  const theme = useTheme();
  const { domain } = useDomain();
  const isDarkMode = theme.palette.mode === 'dark';
  const {executeQuery, executeMutation} = useGraphQL();

  // 스타일 관련 함수
  const getTextColor = () => domain === DOMAINS.PEMS ?
      (isDarkMode ? '#f0e6d9' : 'rgba(0, 0, 0, 0.87)') :
      (isDarkMode ? '#b3c5e6' : 'rgba(0, 0, 0, 0.87)');

  const getBgColor = () => domain === DOMAINS.PEMS ?
      (isDarkMode ? 'rgba(45, 30, 15, 0.5)' : 'rgba(252, 235, 212, 0.6)') :
      (isDarkMode ? 'rgba(0, 27, 63, 0.5)' : 'rgba(232, 244, 253, 0.6)');

  const getBorderColor = () => domain === DOMAINS.PEMS ?
      (isDarkMode ? '#3d2814' : '#f5e8d7') :
      (isDarkMode ? '#1e3a5f' : '#e0e0e0');

  // Form 관련
  const { control, handleSubmit, reset, setValue
    , getValues } = useForm({defaultValues: SEARCH_CONDITIONS});

  // Grid 관련 훅
  const { generateId, formatDateToYYYYMMDD, formatGridData } = useGridUtils();

  // 데이터 포맷팅 함수 정의
  const formatMaterialData = (data) => formatGridData(data, 'getCompleteMaterials', material => ({
    ...material,
    id: material.systemMaterialId || generateId('TEMP')
  }));

  // 새로운 행 생성 함수 정의
  const createNewMaterial = () => ({
    id: generateId('NEW'),
    ...NEW_ROW_STRUCTURE,
    createDate: formatDateToYYYYMMDD(new Date()),
    updateDate: formatDateToYYYYMMDD(new Date())
  });

  /** Input 타입으로 변환 */
  const transformRowForMutation = (row) => ({
    materialType: row.materialType || '',
    materialCategory: row.materialCategory || '',
    userMaterialId: row.userMaterialId || '',
    materialName: row.materialName || '',
    materialStandard: row.materialStandard || '',
    unit: row.unit || '',
    baseQuantity: row.baseQuantity || 0,
    materialStorage: row.materialStorage || '',
    flagActive: row.flagActive || 'Y'
  });

  /** Update 타입으로 변환 - 여기서는 Input + systemMaterialId */
  const transformRowForUpdate = (row) => ({
    systemMaterialId: row.systemMaterialId,
    ...transformRowForMutation(row)
  });

  /** Delete 타입으로 변환 - 여기서는 systemMaterialId를 가지고 삭제 */
  const transformRowForDelete = (row) => ({
    systemMaterialId: row.systemMaterialId
  });

  /**  그리드 데이터 호출 훅 (useGridDataCall) - API 호출과 데이터 관리 담당 */
  const {
    loading: isLoading,        // 로딩 상태
    refresh,                            // 데이터 새로고침 함수
    handleGridSearch,                   // 검색 API 호출
    handleGridSave,                     // 저장 API 호출
    handleGridDelete                    // 삭제 API 호출
  } = useGridDataCall({
    executeQuery,                       // GraphQL 쿼리 실행 함수
    executeMutation,                    // GraphQL 뮤테이션 실행 함수
    query: MATERIAL_GET,                // 조회 쿼리
    mutation: MATERIAL_SAVE,            // 저장 뮤테이션
    deleteMutation: MATERIAL_DELETE,    // 삭제 뮤테이션
    formatData: formatMaterialData,     // 데이터 포맷팅 함수
    defaultFilter: SEARCH_CONDITIONS,   // 기본 검색 조건
    onSuccess: async () => { // 성공 콜백
      const result = await refresh();
      setMaterialList(result);
    },
    clearAddRows: () => setAddRows([]),         // 신규 행 초기화
    clearUpdatedRows: () => setUpdatedRows([]) // 수정 행 초기화
  });

  /** 그리드 행 관리 훅 (useGridRow) - 그리드의 행 추가/수정/삭제/선택 관리 */
  const {
    selectedRows,      // 선택된 행들
    addRows,           // 추가된 행들
    updatedRows,       // 수정된 행들
    setAddRows,            // 추가 행 상태 업데이트
    setUpdatedRows,        // 수정 행 상태 업데이트
    handleRowSelect,       // 행 선택 핸들러
    handleRowUpdate,       // 행 수정 핸들러
    handleRowAdd,          // 행 추가 핸들러
    formatSaveData,        // 저장 데이터 포맷팅
    formatDeleteData       // 삭제 데이터 포맷팅
  } = useGridRow({
    createNewRow: createNewMaterial,         // 새 행 생성 함수
    formatNewRow: transformRowForMutation,   // 신규 행 포맷팅
    formatUpdatedRow: transformRowForUpdate, // 수정 행 포맷팅
    formatExistingRow: transformRowForDelete // 삭제 행 포맷팅
  });

  // 상태 관리
  const [materialList, setMaterialList] = useState([]);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null
  });

  // 행 선택 시 이벤트 핸들러
  const handleSelectionModelChange = (newSelection) => {
    handleRowSelect(newSelection, materialList);
  };

  // 행 업데이트 시 이벤트 핸들러
  const handleProcessRowUpdate = (newRow, oldRow) => {
    return handleRowUpdate(newRow, oldRow, setMaterialList);
  };

  // 검색조건 초기화
  const handleReset = () => reset(SEARCH_CONDITIONS);

  // 검색조건 포메팅
  const formatMaterialSearchParams = (data) => ({
    ...data,
    fromDate: data.fromDate ? format(data.fromDate, 'yyyy-MM-dd') : null,
    toDate: data.toDate ? format(data.toDate, 'yyyy-MM-dd') : null
  });

  // 날짜 범위 변경 핸들러 추가
  const handleDateRangeChange = (startDate, endDate) => {
    setDateRange({ startDate, endDate });
    setValue('fromDate', startDate);
    setValue('toDate', endDate);
  };

  /** CRUD 핸들러들 */
  const handleSearch = async (data) => {
    const searchParams = formatMaterialSearchParams(data);
    const result = await handleGridSearch(searchParams);
    setMaterialList(result);
  };

  const handleSave = async () => {
    const saveData = formatSaveData(addRows, updatedRows);
    await handleGridSave(saveData);
  };

  const handleDelete = async () => {
    const deleteData = formatDeleteData(selectedRows);

    if (!deleteData.newRows.length && !deleteData.existingRows.length) {
      Message.showWarning(Message.DELETE_SELECT_REQUIRED);
      return;
    }

    await handleGridDelete({
      mutationData: deleteData.existingRows.length > 0 ? {
        systemMaterialIds: deleteData.existingRows.map(row => row.systemMaterialId)
      } : null,
      setDataList: setMaterialList,
      newRows: deleteData.newRows
    });
  };

  /** 초기 데이터 로드 */
  useEffect(() => {
    const loadData = async () => {
      const result = await refresh();
      setMaterialList(result);
    };
    loadData();
  }, []);

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
          제품관리
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
            name="userMaterialId"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="제품 ID"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="제품ID를 입력하세요"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="materialName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="제품명"
                variant="outlined"
                size="small"
                fullWidth
                placeholder="제품명을 입력하세요"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Controller
              name="flagActive"
              control={control}
              defaultValue=""
              render={({field}) => (
                  <FormControl variant="outlined" size="small" fullWidth>
                    <InputLabel id="flagActive-label">사용여부</InputLabel>
                    <Select
                        {...field}
                        labelId="flagActive-label"
                        label="사용여부"
                        value={field.value || ''}
                    >
                      <MenuItem value="">전체</MenuItem>
                      <MenuItem value="Y">사용</MenuItem>
                      <MenuItem value="N">미사용</MenuItem>
                    </Select>
                  </FormControl>
              )}
          />
        </Grid>
        <Grid item xs={12} sm={12} md={6}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
            <Controller
                name="dateRange"
                control={control}
                render={({ field }) => (
                    <DateRangePicker
                        startDate={dateRange.startDate}
                        endDate={dateRange.endDate}
                        onRangeChange={handleDateRangeChange}
                        startLabel="시작일"
                        endLabel="종료일"
                        label="날짜"
                        size="small"
                    />
                )}
            />
          </LocalizationProvider>
        </Grid>
      </SearchCondition>
      
      {/* 그리드 영역 */}
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <EnhancedDataGridWrapper
              title="제품 정보"
              rows={materialList}
              columns={COLUMNS}
              buttons={[
                {label: '행추가', onClick: () => handleRowAdd(setMaterialList), icon: <AddIcon/>},
                {label: '저장', onClick: handleSave, icon: <SaveIcon/>},
                {label: '삭제', onClick: handleDelete, icon: <DeleteIcon/>}
              ]}
              height={450}
              tabId={tabId + "-materials"}
              onRowClick={handleSelectionModelChange}
              gridProps={{
                editMode: 'cell',
                checkboxSelection: true,
                getRowId: (row) => row.id || generateId('TEMP'),
                onProcessUpdate: handleProcessRowUpdate,
                onSelectionModelChange: handleSelectionModelChange,
                columnVisibilityModel: {
                  systemMaterialId: false,
                },
              }}
          />
        </Grid>
      </Grid>
      
      {/* 하단 정보 영역 */}
      <Box mt={2} p={2} sx={{ 
        bgcolor: getBgColor(), 
        borderRadius: 1,
        border: `1px solid ${getBorderColor()}`
      }}>
        <Stack spacing={1}>
          <Typography variant="body2" color={getTextColor()}>
            • 제품관리에서는 최종 판매되는 제품 정보를 관리할 수 있습니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()}>
            • 제품별로 규격, 단가, 기본수량 등 상세 정보를 관리하여 판매 과정의 효율성을 높일 수 있습니다.
          </Typography>
          <Typography variant="body2" color={getTextColor()}>
            • 제품 코드, 제품명, 규격, 단위 등 기본 정보를 정확하게 입력하여 BOM 및 생산계획에 활용할 수 있습니다.
          </Typography>
        </Stack>
      </Box>

      {/* 도움말 모달 */}
      <HelpModal
        open={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        title="제품관리 도움말"
      >
        <Typography variant="body2" color={getTextColor()}>
          • 제품관리에서는 생산하는 제품의 기본 정보를 등록하고 관리할 수 있습니다.
        </Typography>
        <Typography variant="body2" color={getTextColor()}>
          • 제품코드, 제품명, 규격, 단위 등의 정보를 관리하여 제품 정보를 체계적으로 관리할 수 있습니다.
        </Typography>
        <Typography variant="body2" color={getTextColor()}>
          • 제품 정보는 생산 계획, 재고 관리, 출하 관리 등에서 활용됩니다.
        </Typography>
      </HelpModal>
    </Box>
  );
};

export default ProductManagement;
