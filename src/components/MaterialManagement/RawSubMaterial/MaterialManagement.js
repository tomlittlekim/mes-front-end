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
    Stack, IconButton, alpha
} from '@mui/material';
import {LocalizationProvider, DatePicker} from '@mui/x-date-pickers';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import {AdapterDateFns} from "@mui/x-date-pickers/AdapterDateFns";
import {format} from 'date-fns';
import ko from "date-fns/locale/ko";
import {EnhancedDataGridWrapper, SearchCondition} from "../../Common";
import {MATERIAL_MUTATION, DELETE_MUTATION, RAW_SUB_MATERIAL_QUERY} from "../../../graphql-queries/material-master/materialQueries";
import {useGraphQL} from "../../../apollo/useGraphQL";
import {useGridUtils} from "../../../utils/grid/useGridUtils";
import {useGridDataCall} from "../../../utils/grid/useGridDataCall";
import {useGridRow} from "../../../utils/grid/useGridRow";
import {DOMAINS, useDomain} from "../../../contexts/DomainContext";
import Message from "../../../utils/message/Message";
import HelpModal from "../../Common/HelpModal";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

// GraphQL 쿼리 정의
const MATERIAL_GET = gql`${RAW_SUB_MATERIAL_QUERY}`;
const MATERIAL_SAVE = gql`${MATERIAL_MUTATION}`;
const MATERIAL_DELETE = gql`${DELETE_MUTATION}`;

const MaterialManagement = ({tabId}) => {
    const theme = useTheme();
    const {domain} = useDomain();
    const isDarkMode = theme.palette.mode === 'dark';
    const {executeQuery, executeMutation} = useGraphQL();

    // 그리드 유틸리티 훅
    const { generateId, formatDateToYYYYMMDD, formatFlagActive, formatGridData } = useGridUtils();

    // 데이터 포맷팅 함수 정의
    const formatMaterialData = (data) => formatGridData(data, 'getRawSubMaterials', material => {
        return {
            ...material,
            id: material.systemMaterialId || generateId('TEMP'),
            flagActive: formatFlagActive(material.flagActive)
        };
    });

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

    // 새로운 행 생성 함수 정의
    const createNewMaterial = () => ({
        ...STRUCTURE,
        id: generateId('NEW'),
        createDate: formatDateToYYYYMMDD(new Date()),
        updateDate: formatDateToYYYYMMDD(new Date())
    });

    // 그리드 데이터 호출 훅
    const {
        loading: isLoading,
        refreshKey,
        loadInitialData,
        handleGridSearch,
        handleGridSave,
        handleGridDelete,
        refresh
    } = useGridDataCall({
        executeQuery,
        executeMutation,
        query: MATERIAL_GET,
        mutation: MATERIAL_SAVE,
        deleteMutation: MATERIAL_DELETE,
        formatData: formatMaterialData,
        defaultFilter: defaultMaterialFilter,
        onSuccess: async () => {
            const result = await refresh();
            setMaterialList(result);
        },
        onDeleteSuccess: async () => {
            const result = await refresh();
            setMaterialList(result);
        },
        clearAddRows: () => setAddRows([]),
        clearUpdatedRows: () => setUpdatedRows([])
    });

    // 그리드 행 관련 훅
    const {
        selectedRows,
        addRows,
        updatedRows,
        setAddRows,
        setUpdatedRows,
        setSelectedRows,
        handleRowSelect,
        handleRowUpdate,
        handleRowAdd,
        formatSaveData,
        formatDeleteData
    } = useGridRow({
        createNewRow: createNewMaterial,
        formatNewRow: row => ({
            materialType: row.materialType || '',
            materialCategory: row.materialCategory || '',
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
        formatUpdatedRow: row => ({
            systemMaterialId: row.systemMaterialId,
            materialType: row.materialType || '',
            materialCategory: row.materialCategory || '',
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
        formatExistingRow: row => ({
            systemMaterialId: row.systemMaterialId
        })
    });

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
        materialCategory: '',
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
                // { value: 'HALF_PRODUCT', label: '반제품' },
                // { value: 'COMPLETE_PRODUCT', label: '완제품' }
            ], editable: true},
        {field: 'materialCategory', headerName: '자재유형', width: 100, type: 'singleSelect',
            valueOptions: [
                { value: '잉크', label: '잉크' },
                { value: '포장재', label: '포장재' },
                // { value: 'HALF_PRODUCT', label: '반제품' },
                // { value: 'COMPLETE_PRODUCT', label: '완제품' }
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

    // 상태 관리
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [materialList, setMaterialList] = useState([]);
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

    // 초기 데이터 로드
    useEffect(() => {
        const loadData = async () => {
            const result = await loadInitialData();
            setMaterialList(result);
        };
        loadData();
    }, []);

    // 체크박스 선택 핸들러
    const handleSelectionModelChange = (newSelection) => {
        const selectionArray = Array.isArray(newSelection) ? newSelection : [newSelection];
        const selectedItems = materialList.filter(row => selectionArray.includes(row.id));
        setSelectedMaterial(selectedItems[0] || null);
        setSelectedRows(selectedItems);
    };

    // 행 수정 완료 핸들러
    const handleProcessRowUpdate = (newRow, oldRow) => {
        return handleRowUpdate(newRow, oldRow, setMaterialList);
    };

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

    // 검색 파라미터 포맷팅 함수 정의
    const formatMaterialSearchParams = (data) => ({
        systemMaterialId: data.systemMaterialId || '',
        materialType: data.materialType || '',
        userMaterialId: data.materialId || '',
        materialName: data.materialName || '',
        flagActive: data.flagActive || null,
        fromDate: data.fromDate ? format(data.fromDate, 'yyyy-MM-dd') : null,
        toDate: data.toDate ? format(data.toDate, 'yyyy-MM-dd') : null
    });

    // 검색 핸들러
    const handleSearch = async (data) => {
        const searchParams = formatMaterialSearchParams(data);
        const result = await handleGridSearch(searchParams);
        setMaterialList(result);
    };

    // 저장 핸들러
    const handleSave = async () => {
        const saveData = formatSaveData(addRows, updatedRows);
        // 저장할 데이터가 없는 경우
        if (!saveData.createdRows.length && !saveData.updatedRows.length) {
            Message.showWarning(Message.NO_DATA_TO_SAVE);
            return;
        }

        try {
            await handleGridSave(saveData);
        } catch (error) {
            console.error('Save Error:', error);
        }
    };

    // 삭제 핸들러
    const handleDelete = async () => {
        if (!selectedRows.length) {
            Message.showWarning(Message.DELETE_SELECT_REQUIRED);
            return;
        }

        const deleteData = formatDeleteData(selectedRows, row => ({
            systemMaterialId: row.systemMaterialId
        }));

        // systemMaterialIds 배열로 변환
        const systemMaterialIds = deleteData.existingRows.map(row => row.systemMaterialId);

        await handleGridDelete({
            data: selectedRows,
            setDataList: setMaterialList,
            clearAddRows: () => setAddRows([]),
            mutationData: { systemMaterialIds },
            searchParams: formatMaterialSearchParams(getValues())
        });
    };

    const GRID_BUTTONS = [
        {label: '조회', onClick: handleSubmit(handleSearch), icon: null},
        {label: '행추가', onClick: () => handleRowAdd(setMaterialList), icon: <AddIcon/>},
        {label: '저장', onClick: handleSave, icon: <SaveIcon/>},
        {label: '삭제', onClick: handleDelete, icon: <DeleteIcon/>}
    ];

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

            {/* 도움말 모달 */}
            <HelpModal
                open={isHelpModalOpen}
                onClose={() => setIsHelpModalOpen(false)}
                title="원/부자재 관리 도움말"
            >
                <Typography variant="body2" color={getTextColor()}>
                    • 원/부자재관리에서는 제품 생산에 필요한 원자재와 부자재 정보를 관리합니다.
                </Typography>
                <Typography variant="body2" color={getTextColor()}>
                    • 행추가 버튼을 클릭하여 새로운 자재를 등록할 수 있습니다.
                </Typography>
                <Typography variant="body2" color={getTextColor()}>
                    • 각 행을 직접 수정한 후 저장 버튼을 클릭하여 변경사항을 저장할 수 있습니다.
                </Typography>
            </HelpModal>
        </Box>
    );
};

export default MaterialManagement; 