import React, {useState, useEffect} from 'react';
import './BomManagement.css';
import {
    Grid,
    Box,
    useTheme,
} from '@mui/material';
import {DOMAINS, useDomain} from '../../contexts/DomainContext';
import {useGraphQL} from '../../apollo/useGraphQL';
import {useMaterialData} from '../MaterialManagement/hooks/useMaterialData';
import {useGridApiRef} from "@mui/x-data-grid";
// 새로 리팩토링한 컴포넌트 및 훅 임포트
import SearchForm from './components/SearchForm';
import PageHeader from './components/PageHeader';
import HelpContent from './components/HelpContent';
import BomList, { BomModal } from './components/BomList';
import BomDetail, { MaterialSelectModal } from './components/BomDetail';
import {useBomData} from './hooks/useBomData';
import {useBomDetailData} from './hooks/useBomDetailData';
import { useBomModal } from './hooks/useBomModalData';

/**
 * BOM 관리 컴포넌트
 * 
 * @returns {JSX.Element}
 */
const BomManagement = () => {
    // 전역 상태 및 유틸리티
    const theme = useTheme();
    const {domain} = useDomain();
    const isDarkMode = theme.palette.mode === 'dark';
    const {executeQuery, executeMutation} = useGraphQL();
    const apiRef = useGridApiRef();

    // 모달 관련 상태
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
    const [materialSelectModalOpen, setMaterialSelectModalOpen] = useState(false);
    const [selectedRowData, setSelectedRowData] = useState(null);

    // 자재 데이터 관리 훅
    const { getMaterialsByType, getMaterialById } = useMaterialData(executeQuery);

    // BOM 데이터 관리 훅
    const {
        bomList,
        selectedBom,
        setSelectedBom,
        isLoading,
        handleBomSelect,
        loadInitialData,
        handleSave: handleBomSave,
        handleDelete: handleBomDelete,
        handleSearch: handleBomSearch,
        setDetailLoadFunction
    } = useBomData(executeQuery, executeMutation);

    // BOM 상세 데이터 관리 훅
    const {
        bomDetailList,
        setBomDetailList,
        handleDetailSelect,
        handleDetailProcessUpdate,
        handleRowAdd,
        loadDetailData,
        handleDetailSave,
        handleDetailDelete,
        generateId
    } = useBomDetailData(executeQuery, executeMutation, selectedBom);

    // 상세 데이터 로드 함수 등록
    useEffect(() => {
        if (loadDetailData && typeof loadDetailData === 'function') {
            setDetailLoadFunction(loadDetailData);
        }
    }, []);

    // 모달 필드의 relation 함수 정의
    const getMaterialOptions = (materialType) => {
        const materialsList = getMaterialsByType(materialType);
        return materialsList.map(m => ({
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

    // BOM 모달 관리 훅
    const {
        modalConfig,
        handleModalFieldChange,
        handleModalSubmit,
        handleOpenRegisterModal,
        handleOpenEditModal,
        handleCloseModal
    } = useBomModal({
        bomData: {
            selectedBom
        },
        getMaterialOptions,
        getMaterialDetails,
        getMaterialsByType,
        handleBomSave
    });

    // BOM 선택 및 상세 데이터 로드
    const handleBomSelectAndLoadDetail = async (params) => {
        const bom = await handleBomSelect(params);
        if (bom?.bomId) {
            await loadDetailData(bom.bomId);
        }
    };

    // 자재 선택 모달 제어
    const handleOpenMaterialSelectModal = (params) => {
        setSelectedRowData(params.row);
        setMaterialSelectModalOpen(true);
    };

    const handleCloseMaterialSelectModal = () => {
        setMaterialSelectModalOpen(false);
        setSelectedRowData(null);
    };

    // BOM 상세 저장
    const handleBomDetailSave = async () => {
        if (selectedBom?.bomId) {
            await handleDetailSave(selectedBom.bomId);
        }
    };

    // 초기 데이터 로드
    useEffect(() => {
        const initialize = async () => {
            const result = await loadInitialData();
            
            // 첫 번째 BOM이 있으면 자동 선택 및 상세 데이터 로드
            if (result && result.length > 0) {
                const firstBom = result[0];
                setSelectedBom(firstBom);
                
                if (firstBom.bomId) {
                    await loadDetailData(firstBom.bomId);
                }
            }
        };
        
        initialize();
    }, []);

    return (
        <Box sx={{p: 0, minHeight: '100vh'}}>
            {/* 헤더 영역 */}
            <PageHeader
                title="BOM 관리"
                setIsHelpModalOpen={setIsHelpModalOpen}
                domain={domain}
                isDarkMode={isDarkMode}
            />

            {/* 검색 영역 */}
            <SearchForm onSearch={handleBomSearch} />

            {/* 데이터 그리드 영역 */}
            {!isLoading && (
                <Grid container spacing={2}>
                    {/* BOM 목록 */}
                    <BomList
                        bomList={bomList}
                        handleBomSelect={handleBomSelectAndLoadDetail}
                        handleOpenRegisterModal={handleOpenRegisterModal}
                        handleOpenEditModal={handleOpenEditModal}
                        handleBomDelete={handleBomDelete}
                    />

                    {/* BOM 상세 목록 */}
                    <BomDetail
                        bomDetailList={bomDetailList}
                        selectedBom={selectedBom}
                        handleDetailSelect={handleDetailSelect}
                        handleDetailProcessUpdate={handleDetailProcessUpdate}
                        handleRowAdd={handleRowAdd}
                        handleDetailSave={handleBomDetailSave}
                        handleDetailDelete={handleDetailDelete}
                        setBomDetailList={setBomDetailList}
                        handleOpenMaterialSelectModal={handleOpenMaterialSelectModal}
                        apiRef={apiRef}
                    />
                </Grid>
            )}

            {/* 모달 영역 */}
            <HelpContent
                isHelpModalOpen={isHelpModalOpen}
                setIsHelpModalOpen={setIsHelpModalOpen}
                domain={domain}
                isDarkMode={isDarkMode}
            />

            <BomModal
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

            <MaterialSelectModal
                open={materialSelectModalOpen}
                onClose={handleCloseMaterialSelectModal}
                rowData={selectedRowData}
                setBomDetailList={setBomDetailList}
                executeQuery={executeQuery}
                generateId={generateId}
                apiRef={apiRef}
            />
        </Box>
    );
};

export default BomManagement;