import React, {useState, useEffect, useRef} from 'react';
import './MaterialManagement.css';
import {useForm, Controller} from 'react-hook-form';
import { gql } from '@apollo/client';
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
import {LocalizationProvider, DatePicker} from '@mui/x-date-pickers';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import {EnhancedDataGridWrapper, MuiDataGridWrapper, SearchCondition} from '../Common';
import {useDomain, DOMAINS} from '../../contexts/DomainContext';
import {MATERIAL_QUERY, MATERIAL_MUTATION, DELETE_MUTATION} from '../../graphql-queries/material-master/materialQueries';
import {useGraphQL} from '../../apollo/useGraphQL';
import {AdapterDateFns} from "@mui/x-date-pickers/AdapterDateFns";
import {format} from 'date-fns';
import ko from "date-fns/locale/ko";
import {
    handleGridAdd,
    handleGridDelete,
    handleGridSave,
    handleGridSearch,
    loadInitialData, useGridDataEffect
} from "../../utils/grid/gridDataCallUtils";
import {
    createRowSelectHandler, createRowUpdateHandler, createRowAddHandler,
    createSaveDataFormatter, createDeleteDataFormatter,
    formatDateToYYYYMMDD,
    formatFlagActive,
    formatGridData,
    generateId
} from "../../utils/grid/gridUtils";

// GraphQL 쿼리 정의
const MATERIAL_GET = gql`${MATERIAL_QUERY}`;
const MATERIAL_SAVE = gql`${MATERIAL_MUTATION}`;
const MATERIAL_DELETE = gql`${DELETE_MUTATION}`;

const MaterialManagement = ({tabId}) => {
    const theme = useTheme();
    const {domain} = useDomain();
    const isDarkMode = theme.palette.mode === 'dark';
    const {executeQuery, executeMutation, loading, error, data} = useGraphQL();

    /** 원부자재 관리 관련 상수 선언부 */
    const DEFAULT_VALUES = {
        materialType: '',
        materialId: '',
        materialName: '',
        flagActive: '',
        fromDate: null,
        toDate: null
    };

    const STRUCTURE = {
        seq: null,
        materialType: '',
        systemMaterialId: '',
        userMaterialId: '',
        materialName: '',
        materialStandard: '',
        unit: '',
        minQuantity: 0,
        maxQuantity: 0,
        manufacturerName: '',
        supplierId: '',
        materialStorage: '',
        flagActive: 'Y',
        createUser: '자동입력',
        createDate: '자동입력',
        updateUser: '자동입력',
        updateDate: '자동입력'
    };

    const COLUMNS = [
        {field: 'materialType', headerName: '자재종류', width: 100, type: 'singleSelect',
            valueOptions: [
                { value: 'RAW_MATERIAL', label: '원자재' },
                { value: 'SUB_MATERIAL', label: '부자재' },
                { value: 'HALF_PRODUCT', label: '반제품' },
                { value: 'COMPLETE_PRODUCT', label: '완제품' }
            ], editable: true},
        {field: 'systemMaterialId', headerName: '시스템자재ID', width: 120},
        {field: 'userMaterialId', headerName: '사용자자재ID', width: 120, editable: true },
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
        {field: 'minQuantity', headerName: '최소수량', width: 80, type: 'number', editable: true },
        {field: 'maxQuantity', headerName: '최대수량', width: 80, type: 'number', editable: true },
        {field: 'manufacturerName', headerName: '제조사명', width: 120, editable: true },
        {field: 'supplierId', headerName: '공급업체명', width: 120,  type: 'singleSelect',
            valueOptions: [
                { value: 'SUP010', label: '광학용품마트' },
                { value: 'SUP018', label: '도서용품샵' },
                { value: 'SUP017', label: '제본재료마트' },
                { value: 'SUP016', label: '제본용품샵' },
                { value: 'SUP015', label: '잉크마스터' },
                { value: 'SUP014', label: '북커버월드' },
                { value: 'SUP013', label: '종이나라' },
                { value: 'SUP012', label: '안경부품마트' },
                { value: 'SUP011', label: '안경악세서리' },
                { value: 'SUP001', label: '대한물산' },
                { value: 'SUP009', label: '안경부품샵' },
                { value: 'SUP008', label: '안경나라' },
                { value: 'SUP007', label: '렌즈월드' },
                { value: 'SUP006', label: '스티커프로' },
                { value: 'SUP005', label: '접착왕' },
                { value: 'SUP004', label: '박스월드' },
                { value: 'SUP003', label: '프린트마스터' },
                { value: 'SUP002', label: '컬러솔루션' },
            ], editable: true },
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
        },
        { field: 'createUser', headerName: '작성자', width: 100},
        { field: 'createDate', headerName: '작성일', width: 200},
        { field: 'updateUser', headerName: '수정자', width: 100},
        { field: 'updateDate', headerName: '수정일', width: 200},
    ];


    const { control, handleSubmit, reset, getValues } = useForm({
        defaultValues: DEFAULT_VALUES
    });

    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [updatedRows, setUpdatedRows] = useState([]);
    const [addRows, setAddRows] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [materialList, setMaterialList] = useState([]);
    const [refreshKey, setRefreshKey] = useState(0);
    const [selectedRows, setSelectedRows] = useState([]);

    // 행 선택 핸들러
    const handleMaterialSelect = createRowSelectHandler(materialList, setSelectedMaterial);

    // 체크박스 선택 핸들러
    const handleSelectionModelChange = (newSelection) => {
        setSelectedRows(newSelection);
        const selectedItems = materialList.filter(row => newSelection.includes(row.id));
        setSelectedMaterial(selectedItems[0] || null);
    };

    // 행 수정 완료 핸들러
    const handleProcessRowUpdate = createRowUpdateHandler(
        setMaterialList,
        setAddRows,
        setUpdatedRows
    );

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

    const handleReset = () => {
        reset(DEFAULT_VALUES);
    };

    // 데이터 포맷팅 함수 정의
    const formatMaterialData = (data) => formatGridData(data, 'materials', material => {
        return {
            ...material,
            id: material.systemMaterialId || generateId('TEMP'),
            flagActive: formatFlagActive(material.flagActive)
        };
    })

    // 기본 필터 정의
    const defaultMaterialFilter = {
        systemMaterialId: '',
        materialType: '',
        userMaterialId: '',
        materialName: '',
        flagActive: null,
        fromDate: null,
        toDate: null
    };

    // 검색 파라미터 포맷팅 함수 정의
    const formatMaterialSearchParams = (data) => ({
        systemMaterialId: data.systemMaterialId || '' ,
        materialType: data.materialType || '',
        userMaterialId: data.materialId || '',
        materialName: data.materialName || '',
        flagActive: data.flagActive || null,
        fromDate: data.fromDate ? format(data.fromDate, 'yyyy-MM-dd') : null,
        toDate: data.toDate ? format(data.toDate, 'yyyy-MM-dd') : null
    });

    // 새로운 행 생성 함수 정의
    const createNewMaterial = () => ({
        ...STRUCTURE,
        id: generateId('NEW'),
        createDate: formatDateToYYYYMMDD(new Date()),
        updateDate: formatDateToYYYYMMDD(new Date())
    });

    // 저장 데이터 포맷팅 함수
    const formatMaterialForSave = createSaveDataFormatter(
        // 신규 행 포맷팅
        row => ({
            materialType: row.materialType || '',
            userMaterialId: row.userMaterialId || '',
            materialName: row.materialName || '',
            materialStandard: row.materialStandard || '',
            unit: row.unit || '',
            minQuantity: row.minQuantity || 0,
            maxQuantity: row.maxQuantity || 0,
            manufacturerName: row.manufacturerName || '',
            supplierId: row.supplierId || '',
            materialStorage: row.materialStorage || '',
            flagActive: row.flagActive || 'Y'
        }),
        // 수정 행 포맷팅
        row => ({
            systemMaterialId: row.systemMaterialId,
            materialType: row.materialType || '',
            userMaterialId: row.userMaterialId || '',
            materialName: row.materialName || '',
            materialStandard: row.materialStandard || '',
            unit: row.unit || '',
            minQuantity: row.minQuantity || 0,
            maxQuantity: row.maxQuantity || 0,
            manufacturerName: row.manufacturerName || '',
            supplierId: row.supplierId || '',
            materialStorage: row.materialStorage || '',
            flagActive: row.flagActive || 'Y'
        })
    );

    // 삭제 데이터 포맷팅 함수
    const formatMaterialForDelete = createDeleteDataFormatter(
        row => row.systemMaterialId
    );

    // 초기 데이터 로드
    useEffect(() => {
        loadInitialData({
            executeQuery,
            query: MATERIAL_GET,
            setData: setMaterialList,
            setLoading: setIsLoading,
            formatData: formatMaterialData,
            defaultFilter: defaultMaterialFilter
        });
    }, []);

    const handleSearch = async (data) => {
        await handleGridSearch({
            executeQuery,
            query: MATERIAL_GET,
            setData: setMaterialList,
            setRefreshKey,
            formatData: formatMaterialData,
            formatSearchParams: () => formatMaterialSearchParams(data)
        });
    };

    // 저장 핸들러 수정
    const handleSave = async () => {
        const { createdRows: newRows, updatedRows: modifiedRows } = formatMaterialForSave(addRows, updatedRows);

        await handleGridSave({
            executeMutation,
            mutation: MATERIAL_SAVE,
            setLoading: setIsLoading,
            handleSearch,
            data: {
                createdRows: newRows,
                updatedRows: modifiedRows
            },
            searchParams: getValues()
        });

        // 저장 후 상태 초기화
        setAddRows([]);
        setUpdatedRows([]);
    };

    // 행 추가 핸들러
    const handleAdd = createRowAddHandler(
        createNewMaterial,
        setMaterialList,
        setAddRows
    );

    const handleDelete = async () => {
        const selectedItems = materialList.filter(row => selectedRows.includes(row.id));
        
        // 신규/기존 행 분리
        const { newRows, existingRows } = formatMaterialForDelete(selectedItems);
        
        await handleGridDelete({
            executeMutation,
            mutation: MATERIAL_DELETE,
            setLoading: setIsLoading,
            handleSearch,
            data: selectedItems,
            searchParams: getValues(),
            setDataList: setMaterialList,
            setAddRows,
            mutationData: {
                systemMaterialIds: existingRows
            }
        });

        // 삭제 후 상태 초기화
        setSelectedMaterial(null);
        setSelectedRows([]);
    };


    const GRID_BUTTONS = [
        {label: '조회', onClick: handleSubmit(handleSearch), icon: null},
        {label: '행추가', onClick: handleAdd, icon: <AddIcon/>},
        {label: '저장', onClick: handleSave, icon: <SaveIcon/>},
        {label: '삭제', onClick: handleDelete, icon: <DeleteIcon/>}
    ];


    // useEffect 대신 커스텀 훅 사용
    useGridDataEffect({
        data,
        setData: setMaterialList,
        setLoading: setIsLoading,
        formatData: formatMaterialData
    });

    return (
        <Box sx={{p: 0, minHeight: '100vh'}}>
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
                    원/부자재관리
                </Typography>
            </Box>

            <SearchCondition
                onSearch={handleSubmit(handleSearch)}
                onReset={handleReset}
            >
                <Grid item xs={12} sm={6} md={3}>
                    <Controller
                        name="materialType"
                        control={control}
                        render={({field}) => (
                            <FormControl variant="outlined" size="small" fullWidth>
                                <InputLabel id="materialType-label">자재종류</InputLabel>
                                <Select
                                    {...field}
                                    labelId="materialType-label"
                                    label="자재종류"
                                >
                                    <MenuItem value="">전체</MenuItem>
                                    <MenuItem value="RAW_MATERIAL">원자재</MenuItem>
                                    <MenuItem value="SUB_MATERIAL">부자재</MenuItem>
                                    <MenuItem value="COMPLETE_PRODUCT">완제품</MenuItem>
                                    <MenuItem value="HALF_PRODUCT">반제품</MenuItem>
                                </Select>
                            </FormControl>
                        )}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Controller
                        name="materialId"
                        control={control}
                        render={({field}) => (
                            <TextField
                                {...field}
                                label="자재 ID"
                                variant="outlined"
                                size="small"
                                fullWidth
                                placeholder="자재ID를 입력하세요"
                            />
                        )}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Controller
                        name="materialName"
                        control={control}
                        render={({field}) => (
                            <TextField
                                {...field}
                                label="자재명"
                                variant="outlined"
                                size="small"
                                fullWidth
                                placeholder="자재명을 입력하세요"
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
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Controller
                                name="fromDate"
                                control={control}
                                render={({field}) => (
                                    <DatePicker
                                        {...field}
                                        label="시작일"
                                        slotProps={{
                                            textField: {
                                                size: "small",
                                                fullWidth: true
                                            }
                                        }}
                                    />
                                )}
                            />
                            <Typography variant="body2" sx={{mx: 1}}>~</Typography>
                            <Controller
                                name="toDate"
                                control={control}
                                render={({field}) => (
                                    <DatePicker
                                        {...field}
                                        label="종료일"
                                        slotProps={{
                                            textField: {
                                                size: "small",
                                                fullWidth: true
                                            }
                                        }}
                                    />
                                )}
                            />
                        </Stack>
                    </LocalizationProvider>
                </Grid>
            </SearchCondition>

            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <EnhancedDataGridWrapper
                        title="원/부자재 목록"
                        key={refreshKey}
                        rows={materialList}
                        columns={COLUMNS}
                        buttons={GRID_BUTTONS}
                        height={450}
                        tabId={tabId + "-materials"}
                        onRowClick={handleMaterialSelect}
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

            <Box mt={2} p={2} sx={{
                bgcolor: getBgColor(),
                borderRadius: 1,
                border: `1px solid ${getBorderColor()}`
            }}>
                <Stack spacing={1}>
                    <Typography variant="body2" color={getTextColor()}>
                        • 원/부자재관리에서는 제품 생산에 필요한 원자재와 부자재 정보를 관리합니다.
                    </Typography>
                    <Typography variant="body2" color={getTextColor()}>
                        • 행추가 버튼을 클릭하여 새로운 자재를 등록할 수 있습니다.
                    </Typography>
                    <Typography variant="body2" color={getTextColor()}>
                        • 각 행을 직접 수정한 후 저장 버튼을 클릭하여 변경사항을 저장할 수 있습니다.
                    </Typography>
                </Stack>
            </Box>
        </Box>
    );
};

export default MaterialManagement; 