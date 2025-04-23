import React, {useState, useEffect, useCallback, useMemo} from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    IconButton,
    FormHelperText
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import Message from "../../../utils/message/Message";
import { useMaterialData } from '../../MaterialManagement/hooks/useMaterialData';

/** 좌측 그리드 등록/수정 클릭 시 표시되는 모달 */

const MaterialSelectModal = ({
                                 open,
                                 onClose,
                                 rowData,
                                 setBomDetailList,
                                 executeQuery,
                                 generateId,
                                 apiRef
                             }) => {
    const { materials, getMaterialById, loadMaterials } = useMaterialData(executeQuery);

    const [materialSelectModal, setMaterialSelectModal] = useState({
        materialType: '',
        materialCategory: '',
        materials: [],
        filteredMaterials: [],
        selectedMaterial: null,
        parentMaterialType: '',
        parentMaterialCategory: '',
        parentMaterials: [],
        parentFilteredMaterials: [],
        selectedParentMaterial: null
    });

    // 유효성 검사 상태 관리
    const [validation, setValidation] = useState({
        materialType: true,
        materialCategory: true,
        selectedMaterial: true,
        parentMaterialType: true,
        parentMaterialCategory: true,
        selectedParentMaterial: true
    });

    // 필드에 값이 있는지 확인하는 함수
    const checkFieldsValidity = useCallback(() => {
        return {
            materialType: !!materialSelectModal.materialType,
            materialCategory: !!materialSelectModal.materialCategory,
            selectedMaterial: !!materialSelectModal.selectedMaterial,
            parentMaterialType: !!materialSelectModal.parentMaterialType,
            parentMaterialCategory: !!materialSelectModal.parentMaterialCategory,
            selectedParentMaterial: !!materialSelectModal.selectedParentMaterial
        };
    }, [
        materialSelectModal.materialType,
        materialSelectModal.materialCategory,
        materialSelectModal.selectedMaterial,
        materialSelectModal.parentMaterialType,
        materialSelectModal.parentMaterialCategory,
        materialSelectModal.selectedParentMaterial
    ]);

    // 모든 필드가 유효한지 확인
    const isAllValid = useMemo(() => {
        const fieldValidity = checkFieldsValidity();
        return Object.values(fieldValidity).every(Boolean);
    }, [checkFieldsValidity]);

    // 제품 매핑 함수
    const findMaterialById = useCallback((systemMaterialId) => {
        if (!materials || !systemMaterialId) return null;
        return materials.find(m => m.systemMaterialId === systemMaterialId);
    }, [materials]);

    // 타입별 자료 필터링
    const filterMaterialsByType = useCallback((type) => {
        if (!materials || !type) return [];
        return materials.filter(m => m.materialType === type);
    }, [materials]);

    // 카테고리별 추가 필터링
    const filterByCategory = useCallback((materialList, category) => {
        if (!category) return materialList;
        return materialList.filter(m => m.materialCategory === category);
    }, []);

    // 모달이 열릴 때 데이터 초기화 및 설정
    useEffect(() => {
        if (!open) return;

        // 초기 validation 상태 설정
        setValidation({
            materialType: true,
            materialCategory: true,
            selectedMaterial: true,
            parentMaterialType: true,
            parentMaterialCategory: true,
            selectedParentMaterial: true
        });

        // 신규 행인지 확인 (rowData가 없거나 id가 'NEW'로 시작하면 신규 행)
        const isNewRow = !rowData || (rowData.id && rowData.id.toString().startsWith('NEW'));
        
        if (!isNewRow && rowData && materials && materials.length > 0) {
            console.log('기존 데이터 로드:', rowData);
            
            // 자식 제품 찾기
            const childMaterial = findMaterialById(rowData.systemMaterialId);
            
            // 부모 제품 찾기
            const parentMaterial = findMaterialById(rowData.parentItemCd);
            
            const newState = {
                materialType: '',
                materialCategory: '',
                materials: [],
                filteredMaterials: [],
                selectedMaterial: null,
                parentMaterialType: '',
                parentMaterialCategory: '',
                parentMaterials: [],
                parentFilteredMaterials: [],
                selectedParentMaterial: null
            };
            
            // 1. 자식 제품 정보 설정
            if (childMaterial) {
                const filteredByType = filterMaterialsByType(childMaterial.materialType);
                
                newState.materialType = childMaterial.materialType;
                newState.materialCategory = childMaterial.materialCategory;
                newState.materials = filteredByType;
                newState.filteredMaterials = filterByCategory(filteredByType, childMaterial.materialCategory);
                newState.selectedMaterial = childMaterial;
                
                console.log('자식 제품 매핑:', childMaterial);
            }
            
            // 2. 부모 제품 정보 설정
            if (parentMaterial) {
                const filteredParentByType = filterMaterialsByType(parentMaterial.materialType);
                
                newState.parentMaterialType = parentMaterial.materialType;
                newState.parentMaterialCategory = parentMaterial.materialCategory;
                newState.parentMaterials = filteredParentByType;
                newState.parentFilteredMaterials = filterByCategory(
                    filteredParentByType, 
                    parentMaterial.materialCategory
                );
                newState.selectedParentMaterial = parentMaterial;
                
                console.log('부모 제품 매핑:', parentMaterial);
            }
            
            // 상태 업데이트
            setMaterialSelectModal(newState);
        } else {
            // 신규 행 추가 시 완전 초기화
            console.log('신규 행 추가 모드');
            setMaterialSelectModal({
                materialType: '',
                materialCategory: '',
                materials: [],
                filteredMaterials: [],
                selectedMaterial: null,
                parentMaterialType: '',
                parentMaterialCategory: '',
                parentMaterials: [],
                parentFilteredMaterials: [],
                selectedParentMaterial: null
            });
        }
    }, [open, rowData, materials, findMaterialById, filterMaterialsByType, filterByCategory]);

    // 필드 값 변경 시 validation 상태 업데이트
    useEffect(() => {
        const fieldValidity = checkFieldsValidity();
        
        setValidation(prev => {
            // 필드 값이 있으면 에러 표시 안 함(true), 없으면 에러 표시(false)
            const newValidation = {
                materialType: fieldValidity.materialType,
                materialCategory: fieldValidity.materialCategory,
                selectedMaterial: fieldValidity.selectedMaterial,
                parentMaterialType: fieldValidity.parentMaterialType,
                parentMaterialCategory: fieldValidity.parentMaterialCategory,
                selectedParentMaterial: fieldValidity.selectedParentMaterial
            };
            
            // 상태가 같으면 불필요한 리렌더링 방지
            if (JSON.stringify(prev) === JSON.stringify(newValidation)) {
                return prev;
            }
            return newValidation;
        });
    }, [
        materialSelectModal.materialType,
        materialSelectModal.materialCategory,
        materialSelectModal.selectedMaterial,
        materialSelectModal.parentMaterialType,
        materialSelectModal.parentMaterialCategory,
        materialSelectModal.selectedParentMaterial,
        checkFieldsValidity
    ]);

    const handleTypeChange = (event) => {
        const materialType = event.target.value;
        if (!materials) return;

        const filteredMaterials = filterMaterialsByType(materialType);

        setMaterialSelectModal(prev => ({
            ...prev,
            materialType,
            materials: filteredMaterials,
            filteredMaterials,
            materialCategory: '',
            selectedMaterial: null
        }));
    };

    const handleParentTypeChange = (event) => {
        const parentMaterialType = event.target.value;
        if (!materials) return;

        const filteredParentMaterials = filterMaterialsByType(parentMaterialType);

        setMaterialSelectModal(prev => ({
            ...prev,
            parentMaterialType,
            parentMaterials: filteredParentMaterials,
            parentFilteredMaterials: filteredParentMaterials,
            parentMaterialCategory: '',
            selectedParentMaterial: null
        }));
    };

    const handleCategoryChange = (event) => {
        const materialCategory = event.target.value;
        const filteredMaterials = filterByCategory(materialSelectModal.materials, materialCategory);

        setMaterialSelectModal(prev => ({
            ...prev,
            materialCategory,
            filteredMaterials,
            selectedMaterial: null
        }));
    };

    const handleParentCategoryChange = (event) => {
        const parentMaterialCategory = event.target.value;
        const parentFilteredMaterials = filterByCategory(materialSelectModal.parentMaterials, parentMaterialCategory);

        setMaterialSelectModal(prev => ({
            ...prev,
            parentMaterialCategory,
            parentFilteredMaterials,
            selectedParentMaterial: null
        }));
    };

    const handleSelect = (event) => {
        const materialId = event.target.value;
        const selectedMaterial = findMaterialById(materialId);

        setMaterialSelectModal(prev => ({
            ...prev,
            selectedMaterial
        }));
    };

    const handleParentSelect = (event) => {
        const materialId = event.target.value;
        const selectedParentMaterial = findMaterialById(materialId);

        setMaterialSelectModal(prev => ({
            ...prev,
            selectedParentMaterial
        }));
    };

    const handleComplete = () => {
        // 모든 필드 유효성 체크
        if (!isAllValid) {
            // 유효성 검사 실패 시 에러 표시 후 종료
            setValidation({
                materialType: !!materialSelectModal.materialType,
                materialCategory: !!materialSelectModal.materialCategory,
                selectedMaterial: !!materialSelectModal.selectedMaterial,
                parentMaterialType: !!materialSelectModal.parentMaterialType,
                parentMaterialCategory: !!materialSelectModal.parentMaterialCategory,
                selectedParentMaterial: !!materialSelectModal.selectedParentMaterial
            });
            return;
        }

        const { selectedMaterial, selectedParentMaterial } = materialSelectModal;
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

        // rowData가 있으면 수정, 없으면 새 행 추가
        if (rowData) {
            // 기존 행 수정
            setBomDetailList(prev => prev.map(row => {
                if (row.id === rowData.id) {
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
        } else {
            // 새 행 추가
            setBomDetailList(prev => [...prev, {
                id: generateId('NEW'),
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
                parentMaterialCategory,
                bomLevel: 1,
                itemQty: 0,
                remark: ''
            }]);
        }

        if (apiRef && apiRef.current && rowData) {
            apiRef.current.startCellEditMode({
                id: rowData.id,
                field: 'bomLevel',
            });
        }

        Message.showSuccess('BOM 자재 정보가 입력되었습니다. 수정 중인 행에서 BOM 레벨과 필요 자재 수량을 입력한 뒤 반드시 저장 버튼을 눌러 저장해주세요.');
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            sx={{
                '& .MuiDialog-paper': {
                    zIndex: 1000
                }
            }}
        >
            <DialogTitle>
                {rowData && !rowData.id?.toString().startsWith('NEW') ? '제품 수정' : '제품 등록'}
            </DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                    <Button
                        startIcon={<RefreshIcon />}
                        onClick={loadMaterials}
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
                            <FormControl fullWidth error={!validation.parentMaterialType}>
                                <InputLabel>종류</InputLabel>
                                <Select
                                    value={materialSelectModal.parentMaterialType}
                                    onChange={handleParentTypeChange}
                                    label="종류"
                                >
                                    <MenuItem value="COMPLETE_PRODUCT">완제품</MenuItem>
                                    <MenuItem value="HALF_PRODUCT">반제품</MenuItem>
                                </Select>
                                {!validation.parentMaterialType && (
                                    <FormHelperText>부모 제품의 종류를 선택해주세요</FormHelperText>
                                )}
                            </FormControl>

                            <FormControl fullWidth error={!validation.parentMaterialCategory}>
                                <InputLabel>제품 유형</InputLabel>
                                <Select
                                    value={materialSelectModal.parentMaterialCategory}
                                    onChange={handleParentCategoryChange}
                                    label="제품 유형"
                                    disabled={!materialSelectModal.parentMaterialType}
                                >
                                    <MenuItem value="">전체</MenuItem>
                                    {[...new Set(materialSelectModal.parentMaterials.map(m => m.materialCategory))]
                                        .filter(Boolean)
                                        .map(category => (
                                            <MenuItem key={category} value={category}>
                                                {category}
                                            </MenuItem>
                                        ))}
                                </Select>
                                {!validation.parentMaterialCategory && (
                                    <FormHelperText>부모 제품의 유형을 선택해주세요</FormHelperText>
                                )}
                            </FormControl>

                            <FormControl fullWidth error={!validation.selectedParentMaterial}>
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
                                {!validation.selectedParentMaterial && (
                                    <FormHelperText>부모 제품을 선택해주세요</FormHelperText>
                                )}
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
                            <FormControl fullWidth error={!validation.materialType}>
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
                                {!validation.materialType && (
                                    <FormHelperText>제품의 종류를 선택해주세요</FormHelperText>
                                )}
                            </FormControl>

                            <FormControl fullWidth error={!validation.materialCategory}>
                                <InputLabel>제품 유형</InputLabel>
                                <Select
                                    value={materialSelectModal.materialCategory}
                                    onChange={handleCategoryChange}
                                    label="제품 유형"
                                    disabled={!materialSelectModal.materialType}
                                >
                                    <MenuItem value="">전체</MenuItem>
                                    {[...new Set(materialSelectModal.materials.map(m => m.materialCategory))]
                                        .filter(Boolean)
                                        .map(category => (
                                            <MenuItem key={category} value={category}>
                                                {category}
                                            </MenuItem>
                                        ))}
                                </Select>
                                {!validation.materialCategory && (
                                    <FormHelperText>제품의 유형을 선택해주세요</FormHelperText>
                                )}
                            </FormControl>

                            <FormControl fullWidth error={!validation.selectedMaterial}>
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
                                {!validation.selectedMaterial && (
                                    <FormHelperText>제품을 선택해주세요</FormHelperText>
                                )}
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
                <Button onClick={onClose}>취소</Button>
                <Button 
                    onClick={handleComplete} 
                    variant="contained"
                    disabled={!isAllValid}
                >
                    확인
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default MaterialSelectModal;
