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
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
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
import CellButton from "../Common/grid-piece/CellButton";
import {useMaterialData} from '../MaterialManagement/hooks/useMaterialData';
import RefreshIcon from '@mui/icons-material/Refresh';

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
        field: 'materialType', headerName: '종류', width: 80, type: 'singleSelect',
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
    {field: 'materialName', headerName: '제품명', width: 100},
    {field: 'materialStandard', headerName: '규격', width: 100},
    {field: 'unit', headerName: '단위', width: 80},
    {field: 'remark', headerName: '비고', width: 150},
    // {field: 'flagActive', headerName: '사용여부', width: 100},
    // {field: 'createUser', headerName: '등록자', width: 100},
    // {field: 'createDate', headerName: '등록일', width: 150},
    // {field: 'updateUser', headerName: '수정자', width: 100},
    // {field: 'updateDate', headerName: '수정일', width: 150}
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

// 제품 선택 관련 커스텀 훅
const useMaterialSelect = (setBomDetailList, materialData) => {
    const [materialSelectModal, setMaterialSelectModal] = useState({
        open: false,
        rowId: null,
        materialType: '',
        materialCategory: '',
        materials: [],
        filteredMaterials: [],
        selectedMaterial: null,
        isNewRow: false,
        parentMaterial: null,
        parentMaterialType: '',
        parentMaterialCategory: '',
        parentMaterials: [],
        parentFilteredMaterials: [],
        selectedParentMaterial: null
    });

    const handleOpen = async (params) => {
        const isNewRow = !params.row.bomDetailId;
        const initialMaterialType = params.row.materialType || '';
        const initialParentMaterialType = params.row.parentMaterialType || '';

        // 초기 상태 설정
        setMaterialSelectModal(prev => ({
            ...prev,
            open: true,
            rowId: params.id,
            materialType: initialMaterialType,
            materialCategory: params.row.materialCategory || '',
            materials: [],
            filteredMaterials: [],
            selectedMaterial: null,
            isNewRow,
            parentMaterial: null,
            parentMaterialType: initialParentMaterialType,
            parentMaterialCategory: params.row.parentMaterialCategory || '',
            parentMaterials: [],
            parentFilteredMaterials: [],
            selectedParentMaterial: null
        }));

        // 자재 데이터가 있는 경우에만 처리
        if (materialData?.materials) {
            // 자식 제품 정보 설정
            if (initialMaterialType) {
                const allMaterials = materialData.materials.filter(m => m.materialType === initialMaterialType);
                const selectedMaterial = allMaterials.find(m => m.systemMaterialId === params.row.systemMaterialId) || null;

                setMaterialSelectModal(prev => ({
                    ...prev,
                    materials: allMaterials,
                    filteredMaterials: allMaterials,
                    selectedMaterial,
                    materialCategory: selectedMaterial?.materialCategory || ''
                }));
            }

            // 부모 제품 정보 설정
            if (initialParentMaterialType) {
                const allParentMaterials = materialData.materials.filter(m => m.materialType === initialParentMaterialType);
                const selectedParentMaterial = allParentMaterials.find(m => m.systemMaterialId === params.row.parentItemCd) || null;

                setMaterialSelectModal(prev => ({
                    ...prev,
                    parentMaterials: allParentMaterials,
                    parentFilteredMaterials: allParentMaterials,
                    selectedParentMaterial,
                    parentMaterialCategory: selectedParentMaterial?.materialCategory || ''
                }));
            } else if (params.row.parentItemCd) {
                // 부모 제품 ID가 있지만 타입이 없는 경우, 해당 ID로 부모 제품 찾기
                const parentMaterial = materialData.materials.find(m => m.systemMaterialId === params.row.parentItemCd);
                if (parentMaterial) {
                    const allParentMaterials = materialData.materials.filter(m => m.materialType === parentMaterial.materialType);

                    setMaterialSelectModal(prev => ({
                        ...prev,
                        parentMaterialType: parentMaterial.materialType,
                        parentMaterials: allParentMaterials,
                        parentFilteredMaterials: allParentMaterials,
                        selectedParentMaterial: parentMaterial,
                        parentMaterialCategory: parentMaterial.materialCategory
                    }));
                }
            }
        }
    };

    const handleClose = () => {
        setMaterialSelectModal(prev => ({
            ...prev,
            open: false
        }));
    };

    const handleTypeChange = (event) => {
        const materialType = event.target.value;
        if (!materialData?.materials) return;

        const allMaterials = materialData.materials.filter(m => m.materialType === materialType);

        setMaterialSelectModal(prev => ({
            ...prev,
            materialType,
            materials: allMaterials,
            filteredMaterials: allMaterials,
            materialCategory: '',
            selectedMaterial: null
        }));
    };

    const handleParentTypeChange = (event) => {
        const parentMaterialType = event.target.value;
        if (!materialData?.materials) return;

        const allParentMaterials = materialData.materials.filter(m => m.materialType === parentMaterialType);

        setMaterialSelectModal(prev => ({
            ...prev,
            parentMaterialType,
            parentMaterials: allParentMaterials,
            parentFilteredMaterials: allParentMaterials,
            parentMaterialCategory: '',
            selectedParentMaterial: null
        }));
    };

    const handleCategoryChange = (event) => {
        const materialCategory = event.target.value;
        if (!materialData?.getMaterialsByTypeAndCategory) return;

        const filteredMaterials = materialCategory
            ? materialData.getMaterialsByTypeAndCategory(materialSelectModal.materialType, materialCategory)
            : materialSelectModal.materials;

        setMaterialSelectModal(prev => ({
            ...prev,
            materialCategory,
            filteredMaterials,
            selectedMaterial: null
        }));
    };

    const handleParentCategoryChange = (event) => {
        const parentMaterialCategory = event.target.value;
        if (!materialData?.getMaterialsByTypeAndCategory) return;

        const parentFilteredMaterials = parentMaterialCategory
            ? materialData.getMaterialsByTypeAndCategory(materialSelectModal.parentMaterialType, parentMaterialCategory)
            : materialSelectModal.parentMaterials;

        setMaterialSelectModal(prev => ({
            ...prev,
            parentMaterialCategory,
            parentFilteredMaterials,
            selectedParentMaterial: null
        }));
    };

    const handleSelect = (event) => {
        const materialId = event.target.value;
        if (!materialData?.getMaterialById) return;

        const selectedMaterial = materialData.getMaterialById(materialId);

        setMaterialSelectModal(prev => ({
            ...prev,
            selectedMaterial
        }));
    };

    const handleParentSelect = (event) => {
        const materialId = event.target.value;
        if (!materialData?.getMaterialById) return;

        const selectedParentMaterial = materialData.getMaterialById(materialId);

        setMaterialSelectModal(prev => ({
            ...prev,
            selectedParentMaterial
        }));
    };

    const handleComplete = () => {
        if (!materialSelectModal.selectedMaterial) {
            Message.showWarning('제품을 선택해주세요.');
            return;
        }

        if (!materialSelectModal.selectedParentMaterial) {
            Message.showWarning('부모 제품을 선택해주세요.');
            return;
        }

        const {rowId, selectedMaterial, selectedParentMaterial} = materialSelectModal;
        const {
            systemMaterialId,
            userMaterialId,
            materialName,
            materialStandard,
            unit,
            materialType,
            materialCategory
        } = selectedMaterial;
        const {
            systemMaterialId: parentSystemMaterialId,
            userMaterialId: parentUserMaterialId,
            materialName: parentMaterialName,
            materialType: parentMaterialType,
            materialCategory: parentMaterialCategory
        } = selectedParentMaterial;

        setBomDetailList(prev => prev.map(row => {
            if (row.id === rowId) {
                return {
                    ...row,
                    systemMaterialId,
                    userMaterialId,
                    materialName,
                    materialStandard,
                    unit,
                    materialType,
                    materialCategory,
                    parentItemCd: parentSystemMaterialId,
                    parentMaterialName,
                    userParentItemCd: parentUserMaterialId,
                    parentMaterialType,
                    parentMaterialCategory
                };
            }
            return row;
        }));

        Message.showSuccess('BOM 자재 정보가 입력되었습니다. 수정 중인 행에서 BOM 레벨과 필요 자재 수량을 입력한 뒤 반드시 저장 버튼을 눌러 저장해주세요.');
        handleClose();
    };

    return {
        materialSelectModal,
        handleOpen,
        handleClose,
        handleTypeChange,
        handleParentTypeChange,
        handleCategoryChange,
        handleParentCategoryChange,
        handleSelect,
        handleParentSelect,
        handleComplete
    };
};

const BomManagement = (props) => {
    const theme = useTheme();
    const {domain} = useDomain();
    const isDarkMode = theme.palette.mode === 'dark';
    const {executeQuery, executeMutation} = useGraphQL();
    const { materials, getMaterialsByType, getMaterialById, loadMaterials } = useMaterialData(executeQuery);

    // materialData 객체 생성
    const materialData = {
        materials,
        getMaterialById
    };

    // 모달 필드의 relation 함수 정의
    const getMaterialOptions = (materialType) => {
        const materials = getMaterialsByType(materialType);
        return materials.map(m => ({
            value: m.systemMaterialId,
            label: m.materialName
        }));
    };

    const getMaterialDetails = (systemMaterialId) => {
        const material = getMaterialById(systemMaterialId);
        return {
            userMaterialId: material?.userMaterialId || '',
            materialName: material?.materialName || '',
            materialStandard: material?.materialStandard || '',
            unit: material?.unit || ''
        };
    };

    // BOM_MODAL_FIELDS 정의
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
                getOptions: getMaterialOptions,
                onSelect: getMaterialDetails
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
                getOptions: getMaterialOptions,
                onSelect: getMaterialDetails
            }
        },
        {id: 'userMaterialId', label: '제품ID', type: 'text', required: true, lock: true},
        {id: 'materialStandard', label: '규격', type: 'text', lock: true},
        {id: 'unit', label: '단위', type: 'text', required: true, lock: true},
        {id: 'bomName', label: 'BOM 명', type: 'text', required: true},
        {id: 'remark', label: '비고', type: 'textarea', rows: 6}
    ];

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

    /** 상태 관리 */
        // BOM 목록 그리드 상태
    const [bomList, setBomList] = useState([]);
    const [selectedBom, setSelectedBom] = useState([]);
    // BOM 상세 그리드 상태
    const [bomDetailList, setBomDetailList] = useState([]);
    const [selectedDetail, setSelectedDetail] = useState([]);

    // 모달 관련 상태
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

    // Form 관련
    const {control, handleSubmit, reset} = useForm({defaultValues: SEARCH_CONDITIONS});

    // Grid 관련 훅
    const {generateId, formatDateToYYYYMMDD, formatGridData} = useGridUtils();


// BOM 상세 목록 그리드 컬럼 정의
    const BOM_DETAIL_COLUMNS = [
        {
            field: 'systemMaterialId',
            headerName: '제품 설정',
            width: 70,
            renderCell: (params) => (
                <CellButton
                    params={params}
                    onClick={(params) => handleOpen(params)}
                    label="설정"
                />
            )
        },
        {field: 'bomLevel', headerName: 'BOM 레벨', width: 80, type: 'number', editable: true},
        {field: 'bomId', headerName: 'BOM ID', width: 80, hide: true},
        {field: 'bomDetailId', headerName: 'BOM Detail ID', width: 150, hide: true},
        {
            field: 'materialType',
            headerName: '종류',
            width: 80,
            type: 'singleSelect',
            valueOptions: [
                {value: 'RAW_MATERIAL', label: '원자재'},
                {value: 'SUB_MATERIAL', label: '부자재'},
                {value: 'HALF_PRODUCT', label: '반제품'}
            ],
            editable: true
        },
        {field: 'materialCategory', headerName: '유형', width: 60},
        {field: 'materialName', headerName: '제품명', width: 100, editable: true},
        {field: 'userMaterialId', headerName: '제품ID(사용자생성)', width: 150, editable: true},
        {field: 'parentItemCd', headerName: '상위품목ID(시스템생성)', width: 150, hide: true},
        {field: 'parentMaterialName', headerName: '상위제품명', width: 200, hide: true},
        {field: 'parentMaterialType', headerName: '상위제품종류', width: 200, hide: true},
        {field: 'userParentItemCd', headerName: '상위품목ID(사용자생성)', width: 150, editable: true},
        {field: 'materialStandard', headerName: '규격', width: 100},
        {field: 'unit', headerName: '단위', width: 80},
        {field: 'itemQty', headerName: '필요수량', width: 100, type: 'number', editable: true},
        {field: 'remark', headerName: '비고', width: 150, editable: true}
    ];

    // 데이터 포맷팅 함수
    const formatBomData = (data) => formatGridData(data, 'getBomList', bom => ({
        ...bom,
        id: bom.bomId || generateId('TEMP')
    }));

    const formatBomDetailData = (data) => formatGridData(data, 'getBomDetails', bom => ({
        ...bom,
        id: bom.bomDetailId || generateId('TEMP')
    }));

    // 새로운 BOM detail 행 생성 함수
    const createNewBomDetail = () => ({
        id: generateId('NEW'),
        ...BOM_DETAIL_NEW_ROW_STRUCTURE,
    });

    /** BOM detail Input 타입으로 변환 */
    const transformRowForMutation = (row) => ({
        bomId: selectedBom.bomId || '',
        // bomDetailId: row.bomDetailId || '',
        bomLevel: parseInt(row.bomLevel) || 0,
        systemMaterialId: row.systemMaterialId || '',
        parentItemCd: row.parentItemCd || '',
        itemQty: parseFloat(row.itemQty) || 0,
        remark: row.remark || ''
    });

    /** BOM detail Update 타입으로 변환 - 여기서는 Input + bomDetailId */
    const transformRowForUpdate = (row) => ({
        bomDetailId: row.bomDetailId,
        ...transformRowForMutation(row)
    });

    /** BOM detail Delete 타입으로 변환 - 여기서는 bomDetailId 가지고 삭제 */
    const transformBomDetailForDelete = (row) => ({
        bomDetailId: row.bomDetailId
    });

    /** BOM Delete 타입으로 변환 - 여기서는 bomId 가지고 삭제 */
    const transformBomForDelete = (row) => ({
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
            await refreshAndKeepSelection();
            // const result = await refresh();
            // setBomList(result);
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
        formatExistingRow: transformBomForDelete
    });

    /** BOM Detail 그리드 행 관리 훅 */
    const {
        selectedRows: detailSelectedRows,
        addRows: detailAddRows = [],
        updatedRows: detailUpdatedRows = [],
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
        formatExistingRow: transformBomDetailForDelete
    });

    /** BOM Detail 그리드 데이터 호출 훅 */
    const {
        loading: isDetailLoading,
        refresh: detailRefresh,
        handleGridSave: handleDetailGridSave,
        handleGridDelete: handleDetailGridDelete,
    } = useGridDataCall({
        executeQuery,
        executeMutation,
        query: BOM_DETAIL_GET,
        mutation: BOM_DETAIL_SAVE,
        deleteMutation: BOM_DETAIL_DELETE,
        formatData: formatBomDetailData,
        defaultFilter: {bomId: selectedBom?.bomId || ''},
        onSuccess: (result) => {
            const details = result?.data?.getBomDetails || [];
            const formattedDetails = details
                .filter(detail => detail !== null)
                .map(detail => ({
                    ...detail,
                    id: detail.bomDetailId,
                    bomId: selectedBom.bomId,
                    parentItemCd: selectedBom.systemMaterialId
                }));
            setBomDetailList(formattedDetails);
        },
        clearAddRows: setDetailAddRows,
        clearUpdatedRows: setDetailUpdatedRows
    });

    // 행 선택 시 이벤트 핸들러 - BOM Detail
    const handleDetailSelect = (newSelection) => {
        handleDetailRowSelect(newSelection, bomDetailList);
    };

    // 행 업데이트 시 이벤트 핸들러 - BOM Detail
    const handleDetailProcessUpdate = (newRow, oldRow) => {
        return handleDetailRowUpdate(newRow, oldRow, setBomDetailList);
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

    const handleDetailSave = async () => {
        const { createdRows, updatedRows } = formatDetailSaveData(detailAddRows, detailUpdatedRows);

        console.log('생성: ', createdRows, '/업뎃: ',updatedRows)

        try {
            await handleDetailGridSave({
                createdRows,
                updatedRows
            });

        } catch (error) {
            console.error('저장 실패:', error);
            Message.showError('저장 중 오류가 발생했습니다.');
        }
    };

    // 좌측 그리드 삭제 핸들러
    const handleBomDelete = async () => {
        if (!selectedBom) {
            Message.showWarning(Message.DELETE_SELECT_REQUIRED);
            return;
        }

        await handleGridDelete({
            mutationData: {bomId: selectedBom.bomId},
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

    // 우측 그리드 삭제 핸들러
    const handleDetailDelete = async () => {
        const deleteData = formatDetailDeleteData(detailSelectedRows);

        if (!deleteData.newRows.length && !deleteData.existingRows.length) {
            Message.showWarning(Message.DELETE_SELECT_REQUIRED);
            return;
        }

        await handleDetailGridDelete({
            mutationData: {
                bomDetailIds: deleteData.existingRows.map(row => row.bomDetailId)
            },
            setDataList: setBomDetailList,
            newRows: deleteData.newRows,
            customMessage: {
                html: `
                <div>
                    <div style="font-size: 1.2em; font-weight: bold; margin-bottom: 10px;">BOM 상세 정보를 삭제하시겠습니까?</div>
                    <div style="color: #ff0000; font-size: 0.9em;">
                    BOM 상세정보가 삭제됩니다.<br>
                    이 작업은 되돌릴 수 없습니다.<br>
                    정말 삭제하시겠습니까?
                    </div>
                </div>
            `
            }
        });

        // 삭제 후 상태 초기화
        setDetailAddRows([]);
        setDetailUpdatedRows([]);
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
        if (!field) return;

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
                const { targetField, getOptions, onSelect } = field.relation;

                if (targetField && getOptions) {
                    const options = getOptions(value);
                    
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
                        })
                    }));
                } else if (onSelect && value) {
                    const additionalValues = onSelect(value);
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
            
            // 첫 번째 BOM이 있으면 자동으로 선택
            if (result.length > 0) {
                const firstBom = result[0];
                setSelectedBom(firstBom);
                
                // 첫 번째 BOM의 상세 정보 로드
                try {
                    const detailResult = await executeQuery(BOM_DETAIL_GET, {bomId: firstBom.bomId});
                    if (detailResult.data?.getBomDetails) {
                        const formattedDetails = detailResult.data.getBomDetails
                            .filter(detail => detail !== null)
                            .map(detail => ({
                                ...detail,
                                id: detail.bomDetailId,
                                bomId: firstBom.bomId,
                                parentItemCd: firstBom.systemMaterialId
                            }));
                        setBomDetailList(formattedDetails);
                    }
                } catch (error) {
                    console.error('BOM Detail 조회 실패:', error);
                    setBomDetailList([]);
                }
            }
        };
        loadData();
    }, []);

    // BOM 선택 핸들러
    const handleBomSelect = async (params) => {
        const bom = bomList.find(b => b.id === params.id);
        setSelectedBom(bom);

        const selectedBomId = bom?.bomId;

        // BOM 상세 정보 조회
        try {
            const result = await executeQuery(BOM_DETAIL_GET, {bomId: selectedBomId});

            const details = result?.data?.getBomDetails || [];
            const formattedDetails = details.map(detail => ({
                ...detail,
                id: detail.bomDetailId,
                bomId: selectedBomId,
                parentItemCd: bom.systemMaterialId
            }));
            setBomDetailList(formattedDetails);
        } catch (error) {
            setBomDetailList([]);
        }
    };

    const refreshAndKeepSelection = async () => {
        const result = await refresh(); // 좌측 그리드 데이터 새로고침
        setBomList(result);

        if (!selectedBom) {
            setBomDetailList([]); // 선택된 BOM 없을 때 빈 배열 설정
            return;
        }

        // 기존 선택된 BOM 유지
        const preservedBom = result.find(b => b.bomId === selectedBom.bomId);
        if (preservedBom) {
            setSelectedBom(preservedBom);

            // 우측 그리드 데이터 새로고침
            const detailResult = await executeQuery(BOM_DETAIL_GET, {bomId: preservedBom.bomId});
            setBomDetailList(detailResult.data?.getBomDetails || []);
        } else {
            setSelectedBom(null);
            setBomDetailList([]);
        }
    };

    // BOM 좌측 그리드 버튼
    const bomGridButtons = [
        {label: '등록', onClick: handleOpenRegisterModal, icon: <AddIcon/>},
        {label: '수정', onClick: handleOpenEditModal, icon: <EditIcon/>},
        {label: '삭제', onClick: handleBomDelete, icon: <DeleteIcon/>}
    ];

    // BOM 우측 상세 그리드 버튼
    const bomDetailGridButtons = [
        {label: '행추가', onClick: () => handleDetailRowAdd(setBomDetailList), icon: <AddIcon/>, disabled: !selectedBom},
        {label: '저장', onClick: handleDetailSave, icon: <SaveIcon/>},
        {label: '삭제', onClick: handleDetailDelete, icon: <DeleteIcon/>}
    ];

    const {
        materialSelectModal,
        handleOpen,
        handleClose,
        handleTypeChange,
        handleParentTypeChange,
        handleCategoryChange,
        handleParentCategoryChange,
        handleSelect,
        handleParentSelect,
        handleComplete
    } = useMaterialSelect(setBomDetailList, materialData);

    // 리프레시 버튼 추가
    const handleRefresh = async () => {
        await loadMaterials();
    };

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
                        <EnhancedDataGridWrapper
                            key={selectedBom?.bomId || 'empty'}
                            title={`상세정보 ${selectedBom ? '- ' + selectedBom.bomName : ''}`}
                            rows={bomDetailList}
                            columns={BOM_DETAIL_COLUMNS}
                            buttons={bomDetailGridButtons}
                            height={450}
                            gridProps={{
                                editMode: 'cell',
                                checkboxSelection: true,
                                onSelectionModelChange: handleDetailSelect,
                                onProcessUpdate: handleDetailProcessUpdate,
                                columnVisibilityModel: {
                                    bomId: false,
                                    bomDetailId: false,
                                    parentItemCd: false,
                                    parentMaterialName: false,
                                    userParentItemCd: false,
                                    parentMaterialType: false
                                },
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

            {/* 제품 선택 모달 */}
            <Dialog
                open={materialSelectModal.open}
                onClose={handleClose}
                maxWidth="md"
                fullWidth
                sx={{
                    '& .MuiDialog-paper': {
                        zIndex: 1000
                    }
                }}
            >
                <DialogTitle>
                    {materialSelectModal.isNewRow ? '제품 등록' : '제품 수정'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                        <Button
                            startIcon={<RefreshIcon />}
                            onClick={handleRefresh}
                            // disabled={isMaterialLoading}
                            size="small"
                        >
                            자재 목록 새로고침
                        </Button>
                    </Box>
                    <Box sx={{display: 'flex', gap: 4, mt: 2}}>
                        {/* 부모 제품 선택 영역 */}
                        <Box sx={{flex: 1}}>
                            <Typography variant="subtitle1" sx={{mb: 2}}>부모 제품</Typography>
                            <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                <FormControl fullWidth>
                                    <InputLabel>종류</InputLabel>
                                    <Select
                                        value={materialSelectModal.parentMaterialType}
                                        onChange={handleParentTypeChange}
                                        label="종류"
                                    >
                                        <MenuItem value="COMPLETE_PRODUCT">완제품</MenuItem>
                                        <MenuItem value="HALF_PRODUCT">반제품</MenuItem>
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth>
                                    <InputLabel>제품 유형</InputLabel>
                                    <Select
                                        value={materialSelectModal.parentMaterialCategory}
                                        onChange={handleParentCategoryChange}
                                        label="제품 유형"
                                        disabled={!materialSelectModal.parentMaterialType}
                                    >
                                        <MenuItem value="">전체</MenuItem>
                                        {[...new Set(materialSelectModal.parentMaterials.map(m => m.materialCategory))]
                                            .map(category => (
                                                <MenuItem key={category} value={category}>
                                                    {category}
                                                </MenuItem>
                                            ))}
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth>
                                    <InputLabel>부모 제품 선택</InputLabel>
                                    <Select
                                        value={materialSelectModal.selectedParentMaterial?.systemMaterialId || ''}
                                        onChange={handleParentSelect}
                                        label="부모 제품 선택"
                                        disabled={!materialSelectModal.parentMaterialCategory}
                                    >
                                        {materialSelectModal.parentFilteredMaterials.map(material => (
                                            <MenuItem key={material.systemMaterialId} value={material.systemMaterialId}>
                                                {material.materialName} ({material.userMaterialId})
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                {materialSelectModal.selectedParentMaterial && (
                                    <Box sx={{
                                        mt: 2,
                                        p: 2,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderRadius: 1
                                    }}>
                                        <Typography variant="subtitle2" sx={{mb: 1}}>선택된 부모 제품 정보</Typography>
                                        <Grid container spacing={1}>
                                            <Grid item xs={12}>
                                                <Typography variant="body2" color="text.secondary">제품명</Typography>
                                                <Typography>{materialSelectModal.selectedParentMaterial.materialName}</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body2" color="text.secondary">제품ID</Typography>
                                                <Typography>{materialSelectModal.selectedParentMaterial.userMaterialId}</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body2" color="text.secondary">자재유형</Typography>
                                                <Typography>{materialSelectModal.selectedParentMaterial.materialCategory}</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body2" color="text.secondary">규격</Typography>
                                                <Typography>{materialSelectModal.selectedParentMaterial.materialStandard}</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body2" color="text.secondary">단위</Typography>
                                                <Typography>{materialSelectModal.selectedParentMaterial.unit}</Typography>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                )}
                            </Box>
                        </Box>

                        {/* 자식 제품 선택 영역 */}
                        <Box sx={{flex: 1}}>
                            <Typography variant="subtitle1" sx={{mb: 2}}>자식 제품</Typography>
                            <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                <FormControl fullWidth>
                                    <InputLabel>종류</InputLabel>
                                    <Select
                                        value={materialSelectModal.materialType}
                                        onChange={handleTypeChange}
                                        label="종류"
                                    >
                                        <MenuItem value="RAW_MATERIAL">원자재</MenuItem>
                                        <MenuItem value="SUB_MATERIAL">부자재</MenuItem>
                                        <MenuItem value="HALF_PRODUCT">반제품</MenuItem>
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth>
                                    <InputLabel>제품 유형</InputLabel>
                                    <Select
                                        value={materialSelectModal.materialCategory}
                                        onChange={handleCategoryChange}
                                        label="제품 유형"
                                        disabled={!materialSelectModal.materialType}
                                    >
                                        <MenuItem value="">전체</MenuItem>
                                        {[...new Set(materialSelectModal.materials.map(m => m.materialCategory))]
                                            .map(category => (
                                                <MenuItem key={category} value={category}>
                                                    {category}
                                                </MenuItem>
                                            ))}
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth>
                                    <InputLabel>제품 선택</InputLabel>
                                    <Select
                                        value={materialSelectModal.selectedMaterial?.systemMaterialId || ''}
                                        onChange={handleSelect}
                                        label="제품 선택"
                                        disabled={!materialSelectModal.materialCategory}
                                    >
                                        {materialSelectModal.filteredMaterials.map(material => (
                                            <MenuItem key={material.systemMaterialId} value={material.systemMaterialId}>
                                                {material.materialName} ({material.userMaterialId})
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                {materialSelectModal.selectedMaterial && (
                                    <Box sx={{
                                        mt: 2,
                                        p: 2,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderRadius: 1
                                    }}>
                                        <Typography variant="subtitle2" sx={{mb: 1}}>선택된 제품 정보</Typography>
                                        <Grid container spacing={1}>
                                            <Grid item xs={12}>
                                                <Typography variant="body2" color="text.secondary">제품명</Typography>
                                                <Typography>{materialSelectModal.selectedMaterial.materialName}</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body2" color="text.secondary">제품ID</Typography>
                                                <Typography>{materialSelectModal.selectedMaterial.userMaterialId}</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body2" color="text.secondary">자재유형</Typography>
                                                <Typography>{materialSelectModal.selectedMaterial.materialCategory}</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body2" color="text.secondary">규격</Typography>
                                                <Typography>{materialSelectModal.selectedMaterial.materialStandard}</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body2" color="text.secondary">단위</Typography>
                                                <Typography>{materialSelectModal.selectedMaterial.unit}</Typography>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>취소</Button>
                    <Button onClick={handleComplete} variant="contained">확인</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default BomManagement;