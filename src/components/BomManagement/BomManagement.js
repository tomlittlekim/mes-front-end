import React, {useState, useEffect} from 'react';
import './BomManagement.css';
import {useForm, Controller} from 'react-hook-form';
import {gql} from '@apollo/client';
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
    alpha,
    Button
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import {EnhancedDataGridWrapper, MuiDataGridWrapper, SearchCondition} from '../Common';
import {DOMAINS, useDomain} from '../../contexts/DomainContext';
import HelpModal from '../Common/HelpModal';
import {
    BOM_QUERY,
    BOM_DETAIL_QUERY,
    BOM_DELETE_MUTATION,
    BOM_MUTATION, MATERIALS_BY_TYPE_QUERY, BOM_DETAIL_MUTATION, BOM_DETAIL_DELETE_MUTATION
} from '../../graphql-queries/material-master/bomQueries';
import {useGraphQL} from '../../apollo/useGraphQL';
import {useGridUtils} from '../../utils/grid/useGridUtils';
import {useGridDataCall} from '../../utils/grid/useGridDataCall';
import {useGridRow} from '../../utils/grid/useGridRow';
import CustomModal from '../Common/CustomModal';
import Message from "../../utils/message/Message";
import {format} from "date-fns";

/** GraphQL 쿼리 정의 */
//BOM 좌측 그리드
const BOM_GET = gql`${BOM_QUERY}`;
const BOM_SAVE = gql`${BOM_MUTATION}`;
const BOM_DELETE = gql`${BOM_DELETE_MUTATION}`;
//BOM 세부 그리드
const BOM_DETAIL_GET = gql`${BOM_DETAIL_QUERY}`;
const BOM_DETAIL_SAVE = gql`${BOM_DETAIL_MUTATION}`;
const BOM_DETAIL_DELETE = gql`${BOM_DETAIL_DELETE_MUTATION}`;
//드랍다운 목록들
const GET_MATERIALS_BY_TYPE = gql`${MATERIALS_BY_TYPE_QUERY}`;

/** 검색 조건 값 초기화 */
const SEARCH_CONDITIONS = {
    materialType: '',
    materialName: '',
    bomName: '',
    // flagActive: null
};

/** 그리드 컬럼을 정의 */
// BOM 목록 그리드 컬럼 정의
const BOM_COLUMNS = [
    {field: 'bomLevel', headerName: 'BOM 레벨', width: 80},
    {
        field: 'materialType', headerName: '종류', width: 100, type: 'singleSelect',
        valueOptions: [
            {value: 'COMPLETE_PRODUCT', label: '완제품'},
            {value: 'HALF_PRODUCT', label: '반제품'}
        ]
    },
    {field: 'bomId', headerName: 'BOM ID', width: 100, hide: true},
    {field: 'bomName', headerName: 'BOM 명', width: 150},
    {field: 'materialCategory', headerName: '제품유형', width: 100},
    {field: 'systemMaterialId', headerName: '제품ID(시스템생성)', width: 150, hide: true},
    {field: 'userMaterialId', headerName: '제품ID(사용자생성)', width: 150},
    {field: 'materialName', headerName: '제품명', width: 200},
    {field: 'materialStandard', headerName: '규격', width: 100},
    {field: 'unit', headerName: '단위', width: 80},
    {field: 'remark', headerName: '비고', width: 150},
    // {field: 'flagActive', headerName: '사용여부', width: 100},
    // {field: 'createUser', headerName: '등록자', width: 100},
    // {field: 'createDate', headerName: '등록일', width: 150},
    // {field: 'updateUser', headerName: '수정자', width: 100},
    // {field: 'updateDate', headerName: '수정일', width: 150}
];

// BOM 상세 목록 그리드 컬럼 정의
const BOM_DETAIL_COLUMNS = [
    {field: 'bomLevel', headerName: 'BOM 레벨', width: 80},
    {field: 'bomId', headerName: 'BOM ID', width: 80, hide: true},
    {field: 'bomDetailId', headerName: 'BOM Detail ID', width: 150, hide: true},
    {field: 'materialType', headerName: '자재종류', width: 150},
    {field: 'systemMaterialId', headerName: '제품ID(시스템생성)', width: 150, hide: true},
    {field: 'materialName', headerName: '제품명', width: 200},
    {field: 'userMaterialId', headerName: '제품ID(사용자생성)', width: 150},
    {field: 'parentItemCd', headerName: '상위품목ID(시스템생성)', width: 150, hide: true},
    {field: 'parentMaterialName', headerName: '상위제품명', width: 200},
    {field: 'userParentItemCd', headerName: '상위품목ID(사용자생성)', width: 150},
    {field: 'materialStandard', headerName: '규격', width: 100},
    {field: 'unit', headerName: '단위', width: 80},
    {field: 'itemQty', headerName: '필요수량', width: 100},
    {field: 'remark', headerName: '비고', width: 150},
    // {field: 'flagActive', headerName: '사용여부', width: 100},
    // { field: 'createUser', headerName: '등록자', width: 100 },
    // { field: 'createDate', headerName: '등록일', width: 150 },
    // { field: 'updateUser', headerName: '수정자', width: 100 },
    // { field: 'updateDate', headerName: '수정일', width: 150 }
];

/** 신규 데이터 추가 시 생성되는 구조 */
//BOM(팝업)
const BOM_MODAL_FIELDS = [
    {
        id: 'materialType',
        label: '종류',
        type: 'select',
        required: true,
        lockOnEdit: true,
        options: [
            {value: 'COMPLETE_PRODUCT', label: '완제품'},
            {value: 'HALF_PRODUCT', label: '반제품'}
        ],
        relation: {
            targetField: 'systemMaterialId',
            query: GET_MATERIALS_BY_TYPE,
            params: ['materialType'],
            mapping: {
                value: 'systemMaterialId',
                label: 'materialName'
            }
        }
    },
    {
        id: 'systemMaterialId',
        label: '제품 선택',
        type: 'select',
        required: true,
        lockOnEdit: true,
        options: [],
        relation: {
            query: GET_MATERIALS_BY_TYPE,
            params: ['materialType'],
            mapping: {
                value: 'systemMaterialId',
                label: 'materialName'
            },
            onSelect: (selectedValue, allValues) => {
                const selectedOption = allValues.find(opt => opt.systemMaterialId === selectedValue);
                return {
                    userMaterialId: selectedOption?.userMaterialId || '',
                    materialName: selectedOption?.materialName || '',
                    materialStandard: selectedOption?.materialStandard || '',
                    unit: selectedOption?.unit || ''
                };
            }
        }
    },
    {id: 'userMaterialId', label: '제품ID', type: 'text', required: true, lock: true},
    {id: 'materialStandard', label: '규격', type: 'text', lock: true},
    {id: 'unit', label: '단위', type: 'text', required: true, lock: true},
    {id: 'bomName', label: 'BOM 명', type: 'text', required: true},
    {id: 'remark', label: '비고', type: 'textarea', rows: 6}
];

//BOM DETAIL(행추가)
const BOM_DETAIL_NEW_ROW_STRUCTURE = {
    seq: null,
    bomLevel: '',
    bomId: '',
    bomDetailId: '',
    materialType: '',
    systemMaterialId: '',
    materialName: '',
    userMaterialId: '',
    parentItemCd: '',
    parentMaterialName: '',
    userParentItemCd: '',
    materialStandard: '',
    unit: '',
    itemQty: 0,
    remark: '',
    // flagActive: 'Y',
};

/** 서버에 보내야 하는 BOM 필드 구조 */
const BOM_SERVER_FIELDS = {
    bomId: '',
    bomLevel: 1,
    materialType: '',
    bomName: '',
    systemMaterialId: '',
    remark: ''
};

/** 모달 필드값을 서버 필드 구조로 매핑 */
const mapModalToServerFields = (modalValues) => {
    return Object.keys(BOM_SERVER_FIELDS).reduce((acc, field) => {
        acc[field] = modalValues[field];
        return acc;
    }, {});
};

const BomManagement = (props) => {
    // Theme 및 Context 관련
    const theme = useTheme();
    const {domain} = useDomain();
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
    const {control, handleSubmit, reset} = useForm({defaultValues: SEARCH_CONDITIONS});

    // Grid 관련 훅
    const {generateId, formatDateToYYYYMMDD, formatGridData} = useGridUtils();

    // 데이터 포맷팅 함수
    const formatBomData = (data) => formatGridData(data, 'getBomList', bom => ({
        ...bom,
        id: bom.bomId || generateId('TEMP')
    }));

    // 새로운 BOM detail 행 생성 함수
    const createNewBomDetail = () => ({
        id: generateId('NEW'),
        ...BOM_DETAIL_NEW_ROW_STRUCTURE,
    });

    /** BOM detail Input 타입으로 변환 */
    const transformRowForMutation = (row) => ({
        bomId: row.bomId || '',
        bomDetailId: row.bomDetailId || '',
        bomLevel: parseInt(row.bomLevel) || 0,
        systemMaterialId: row.systemMaterialId || '',
        parentItemCd: row.parentItemCd || '',
        itemQty: parseFloat(row.itemQty) || 0,
        remark: row.remark || ''
    });

    /** BOM detail Update 타입으로 변환 - 여기서는 Input + systemMaterialId */
    const transformRowForUpdate = (row) => ({
        bomId: row.bomId,
        ...transformRowForMutation(row)
    });

    /** BOM detail Delete 타입으로 변환 - 여기서는 systemMaterialId를 가지고 삭제 */
    const transformRowForDelete = (row) => ({
        bomId: row.bomId
    });

    /** BOM 그리드 데이터 호출 훅 (useGridDataCall) - API 호출과 데이터 관리 담당 */
    const {
        loading: isLoading,        // 로딩 상태
        refresh,                            // 데이터 새로고침 함수
        handleGridSearch,                   // 검색 API 호출
        handleGridSave,                     // 저장 API 호출
        handleGridDelete                    // 삭제 API 호출
    } = useGridDataCall({
        executeQuery,                       // GraphQL 쿼리 실행 함수
        executeMutation,                    // GraphQL 뮤테이션 실행 함수
        query: BOM_GET,                // 조회 쿼리
        mutation: BOM_SAVE,            // 저장 뮤테이션
        deleteMutation: BOM_DELETE,    // 삭제 뮤테이션
        formatData: formatBomData,     // 데이터 포맷팅 함수
        defaultFilter: SEARCH_CONDITIONS,   // 기본 검색 조건
        onSuccess: async () => { // 성공 콜백
            const result = await refresh();
            setBomList(result);
        }
    });

    /** BOM 그리드 행 관리 훅 */
    const {
        selectedRows: bomSelectedRows,
        handleRowSelect: handleBomRowSelect
    } = useGridRow({
        createNewRow: () => ({}), // BOM은 모달로 등록/수정하므로 빈 함수
        formatNewRow: () => ({}),
        formatUpdatedRow: () => ({}),
        formatExistingRow: (row) => ({ bomId: row.bomId })
    });

    /** BOM Detail 그리드 행 관리 훅 */
    const {
        selectedRows: detailSelectedRows,
        addRows: detailAddRows,
        updatedRows: detailUpdatedRows,
        setAddRows: setDetailAddRows,
        setUpdatedRows: setDetailUpdatedRows,
        handleRowSelect: handleDetailRowSelect,
        handleRowUpdate: handleDetailRowUpdate,
        handleRowAdd: handleDetailRowAdd,
        formatSaveData: formatDetailSaveData,
        formatDeleteData: formatDetailDeleteData
    } = useGridRow({
        createNewRow: createNewBomDetail,
        formatNewRow: transformRowForMutation,
        formatUpdatedRow: transformRowForUpdate,
        formatExistingRow: transformRowForDelete
    });

    /** 상태 관리 */
    // BOM 목록 그리드 상태
    const [bomList, setBomList] = useState([]);
    const [selectedBom, setSelectedBom] = useState(null);
    // BOM 상세 그리드 상태
    const [bomDetailList, setBomDetailList] = useState([]);
    const [selectedDetail, setSelectedDetail] = useState(null);
    // 모달 관련 상태
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

    // 행 선택 시 이벤트 핸들러 - BOM Detail
    const handleDetailSelect = (params) => {
        handleDetailRowSelect(params, bomDetailList);
    };

    // 검색조건 초기화
    const handleReset = () => reset(SEARCH_CONDITIONS);

    // 검색조건 포메팅
    const formatBomSearchParams = (data) => ({...data});

    /** CRUD 핸들러들 */
    const handleSearch = async (data) => {
        const searchParams = formatBomSearchParams(data);
        const result = await handleGridSearch(searchParams);
        setBomList(result);
        setBomDetailList([]);
    };

    const handleSave = async () => {
        const saveData = formatDetailSaveData(detailAddRows, detailUpdatedRows);
        await handleGridSave(saveData);
    };

    const handleDelete = async () => {
        if (!selectedBom) {
            Message.showWarning(Message.DELETE_SELECT_REQUIRED);
            return;
        }

        await handleGridDelete({
            mutationData: { bomId: selectedBom.bomId },
            setDataList: setBomList,
            newRows: [],
            customMessage: {
                html: `
                <div>
                    <div style="font-size: 1.2em; font-weight: bold; margin-bottom: 10px;">BOM 정보를 삭제하시겠습니까?</div>
                    <div style="color: #ff0000; font-size: 0.9em;">
                    BOM 정보를 삭제하면 BOM 상세정보도 함께 사라집니다.<br>
                    이 작업은 되돌릴 수 없습니다.<br>
                    정말 삭제하시겠습니까?
                    </div>
                </div>
            `
            }
        });
        setSelectedBom(null);
        setBomDetailList([]);
    };

    /** BOM 모달 관련 */
        // 모달 상태 관리
    const [modalConfig, setModalConfig] = useState({
            open: false,
            modalType: '',
            title: '',
            size: 'xs',
            values: {},
            fields: BOM_MODAL_FIELDS
        });


    // 모달 필드 변경 핸들러
    const handleModalFieldChange = async (fieldId, value) => {
        const field = BOM_MODAL_FIELDS.find(f => f.id === fieldId);
        
        // 먼저 값을 설정
        setModalConfig(prev => ({
            ...prev,
            values: {
                ...prev.values,
                [fieldId]: value
            }
        }));
        
        if (field?.relation) {
            try {
                const { targetField, query, params, mapping, onSelect } = field.relation;
                
                if (targetField) {
                    // materialType 선택 시에만 서버 요청
                    const queryParams = {};
                    params.forEach(param => {
                        queryParams[param] = modalConfig.values[param] || value;
                    });

                    const result = await executeQuery(query, queryParams);
                    
                    // materialType 선택 시 systemMaterialId 목록 업데이트
                    const options = result.data.getMaterialsByType.map(item => ({
                        value: item[mapping.value],
                        label: item[mapping.label]
                    }));

                    // systemMaterialId 필드만 업데이트
                    setModalConfig(prev => ({
                        ...prev,
                        fields: prev.fields.map(f => {
                            if (f.id === targetField) {
                                return {
                                    ...f,
                                    options,
                                    disabled: false
                                };
                            }
                            return f;
                        }),
                        values: {
                            ...prev.values,
                            [`${targetField}_options`]: options,
                            [`${targetField}_raw_data`]: result.data.getMaterialsByType
                        }
                    }));
                } else if (onSelect && value) {
                    // systemMaterialId 선택 시 이미 불러온 원본 데이터에서 찾기
                    const rawData = modalConfig.values[`${fieldId}_raw_data`] || [];
                    const additionalValues = onSelect(value, rawData);
                    setModalConfig(prev => ({
                        ...prev,
                        values: {
                            ...prev.values,
                            ...additionalValues
                        }
                    }));
                }
            } catch (error) {
                console.error('관계성 필드 처리 중 오류:', error);
            }
        }
    };

    // 모달 저장 핸들러
    const handleModalSubmit = async () => {
        try {
            // 모달 필드값을 서버 필드 구조로 매핑
            const formattedData = mapModalToServerFields(modalConfig.values);

            if (modalConfig.modalType === 'register') {
                await handleGridSave({createdRows: [formattedData], updatedRows: []});
            } else {
                await handleGridSave({createdRows: [], updatedRows: [formattedData]});
            }

            setModalConfig({
                open: false,
                modalType: '',
                title: '',
                values: {},
                fields: BOM_MODAL_FIELDS
            });
        } catch (error) {
            console.error('저장 실패:', error);
        }
    };

    // 등록 모달 열기
    const handleOpenRegisterModal = () => {
        setModalConfig({
            open: true,
            modalType: 'register',
            title: 'BOM 등록',
            values: {},
            fields: BOM_MODAL_FIELDS
        });
    };

    // 수정 모달 열기
    const handleOpenEditModal = async () => {
        if (!selectedBom) {
            Message.showWarning(Message.UPDATE_SELECT_REQUIRED);
            return;
        }

        // materialType에 맞는 제품 목록을 먼저 로드
        try {
            const result = await executeQuery(GET_MATERIALS_BY_TYPE, {
                materialType: selectedBom.materialType
            });

            const options = result.data.getMaterialsByType.map(item => ({
                value: item.systemMaterialId,
                label: item.materialName
            }));

            // 모달 상태 설정
            setModalConfig({
                open: true,
                modalType: 'edit',
                title: 'BOM 수정',
                values: {
                    ...selectedBom,
                    systemMaterialId_options: options,
                    systemMaterialId_raw_data: result.data.getMaterialsByType
                },
                fields: BOM_MODAL_FIELDS.map(field => {
                    if (field.id === 'systemMaterialId') {
                        return {
                            ...field,
                            options,
                            disabled: true
                        };
                    }
                    return field;
                })
            });
        } catch (error) {
            console.error('제품 목록 로드 실패:', error);
            Message.showError('제품 목록을 불러오는데 실패했습니다.');
        }
    };

    // 모달 닫기
    const handleCloseModal = () => {
        setModalConfig({
            open: false,
            modalType: '',
            title: '',
            values: {},
            fields: BOM_MODAL_FIELDS
        });
    };

    /** 초기 데이터 로드 */
    useEffect(() => {
        const loadData = async () => {
            const result = await refresh();
            setBomList(result);
        };
        loadData();
    }, []);

    // BOM 선택 핸들러
    const handleBomSelect = async (params) => {
        console.log('BOM 선택됨:', params);
        const bom = bomList.find(b => b.id === params.id);
        setSelectedBom(bom);

        // BOM 상세 정보 조회
        try {
            const result = await executeQuery(BOM_DETAIL_GET, {bomId: bom.bomId});
            console.log('BOM Detail 조회 결과:', result);

            if (result.data?.getBomDetails) {
                const formattedDetails = result.data.getBomDetails
                    .filter(detail => detail !== null)
                    .map(detail => ({
                        ...detail,
                        id: detail.bomDetailId,
                        bomId: bom.bomId,
                        parentItemCd: bom.systemMaterialId
                    }));
                setBomDetailList(formattedDetails);
            }
        } catch (error) {
            console.error('BOM Detail 조회 실패:', error);
            setBomDetailList([]);
        }
    };

    // BOM 좌측 그리드 버튼 수정
    const bomGridButtons = [
        {label: '등록', onClick: handleOpenRegisterModal, icon: <AddIcon/>},
        {label: '수정', onClick: handleOpenEditModal, icon: <EditIcon/>},
        {label: '삭제', onClick: handleDelete, icon: <DeleteIcon/>}
    ];

    // BOM 우측 상세 그리드 버튼
    const bomDetailGridButtons = [
        {label: '행추가', onClick: () => handleDetailRowAdd(setBomDetailList()), icon: <AddIcon/>},
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
                    BOM 관리
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
                    <HelpOutlineIcon/>
                </IconButton>
            </Box>

            {/* 검색 조건 영역 */}
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
                                <InputLabel id="materialType-label">종류</InputLabel>
                                <Select
                                    {...field}
                                    labelId="materialType-label"
                                    label="종류"
                                >
                                    <MenuItem value="">전체</MenuItem>
                                    <MenuItem value="RAW_MATERIAL">원자재</MenuItem>
                                    <MenuItem value="SUB_MATERIAL">부자재</MenuItem>
                                    <MenuItem value="HALF_PRODUCT">반제품</MenuItem>
                                    <MenuItem value="COMPLETE_PRODUCT">완제품</MenuItem>
                                </Select>
                            </FormControl>
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
                        name="bomName"
                        control={control}
                        render={({field}) => (
                            <TextField
                                {...field}
                                label="BOM 명"
                                variant="outlined"
                                size="small"
                                fullWidth
                                placeholder="BOM 명을 입력하세요"
                            />
                        )}
                    />
                </Grid>
                {/*<Grid item xs={12} sm={6} md={3}>*/}
                {/*    <Controller*/}
                {/*        name="flagActive"*/}
                {/*        control={control}*/}
                {/*        render={({field}) => (*/}
                {/*            <FormControl variant="outlined" size="small" fullWidth>*/}
                {/*                <InputLabel id="flagActive-label">사용여부</InputLabel>*/}
                {/*                <Select*/}
                {/*                    {...field}*/}
                {/*                    labelId="flagActive-label"*/}
                {/*                    label="사용여부"*/}
                {/*                >*/}
                {/*                    <MenuItem value="">전체</MenuItem>*/}
                {/*                    <MenuItem value="Y">사용</MenuItem>*/}
                {/*                    <MenuItem value="N">미사용</MenuItem>*/}
                {/*                </Select>*/}
                {/*            </FormControl>*/}
                {/*        )}*/}
                {/*    />*/}
                {/*</Grid>*/}
            </SearchCondition>

            {/* 그리드 영역 */}
            {!isLoading && (
                <Grid container spacing={2}>
                    {/* BOM 목록 그리드 */}
                    <Grid item xs={12} md={6}>
                        <EnhancedDataGridWrapper
                            title="BOM 목록"
                            rows={bomList}
                            columns={BOM_COLUMNS}
                            buttons={bomGridButtons}
                            height={450}
                            onRowClick={handleBomSelect}
                            gridProps={{
                                checkboxSelection: false,
                                disableRowSelectionOnClick: false,
                                columnVisibilityModel: {
                                    bomId: false,
                                    systemMaterialId: false,
                                }
                            }}
                        />
                    </Grid>

                    {/* BOM 상세 목록 그리드 */}
                    <Grid item xs={12} md={6}>
                        <MuiDataGridWrapper
                            title={`상세정보 ${selectedBom ? '- ' + selectedBom.bomName : ''}`}
                            rows={bomDetailList}
                            columns={BOM_DETAIL_COLUMNS}
                            buttons={bomDetailGridButtons}
                            height={450}
                            gridProps={{
                                checkboxSelection: true,
                                onSelectionModelChange: handleDetailSelect,
                                onProcessUpdate: handleDetailRowUpdate,
                            }}
                        />
                    </Grid>
                </Grid>
            )}

            {/* 도움말 모달 */}
            <HelpModal
                open={isHelpModalOpen}
                onClose={() => setIsHelpModalOpen(false)}
                title="BOM 관리 도움말"
            >
                <Typography variant="body2" color={getTextColor()}>
                    • BOM 관리에서는 제품의 구성요소와 조립 방법을 관리합니다.
                </Typography>
                <Typography variant="body2" color={getTextColor()}>
                    • BOM 목록에서 특정 제품을 선택하면 해당 제품의 상세 구성요소를 확인할 수 있습니다.
                </Typography>
                <Typography variant="body2" color={getTextColor()}>
                    • 각 구성요소의 수량과 단위를 관리하여 생산 계획 수립에 활용할 수 있습니다.
                </Typography>
            </HelpModal>

            {/* 모달 */}
            <CustomModal
                open={modalConfig.open}
                onClose={handleCloseModal}
                title={modalConfig.title}
                size={modalConfig.size}
                modalType={modalConfig.modalType}
                fields={modalConfig.fields}
                values={modalConfig.values}
                onChange={handleModalFieldChange}
                onSubmit={handleModalSubmit}
            />
        </Box>
    );
};

export default BomManagement;