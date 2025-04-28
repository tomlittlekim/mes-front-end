import {
    Box,
    Button,
    Dialog, DialogActions,
    DialogContent,
    DialogTitle,
    FormControl, FormHelperText, Grid,
    InputLabel, MenuItem,
    Select,
    Typography
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import React from "react";
import { useBomDetailModalData } from "../../../hooks/useBomDetailModalData";

/**
 * BOM 상세 모달 컴포넌트
 * 부모-자식 자재 관계를 설정하기 위한 모달 다이얼로그
 */
const BomDetailModal = ({
    open, 
    onClose,
    executeQuery,
    generateId,
    rowData,
    setBomDetailList,
    apiRef
}) => {
    // 상태 및 핸들러 함수를 훅에서 가져오기
    const {
        modalState,
        validation,
        isAllValid,
        loadMaterials,
        handleTypeChange,
        handleParentTypeChange,
        handleCategoryChange,
        handleParentCategoryChange,
        handleSelect,
        handleParentSelect,
        handleComplete
    } = useBomDetailModalData({
        open,
        executeQuery,
        generateId,
        rowData,
        setBomDetailList,
        apiRef
    });

    // 이벤트 핸들러에 이벤트 객체 처리 추가
    const onTypeChange = (event) => handleTypeChange(event.target.value);
    const onParentTypeChange = (event) => handleParentTypeChange(event.target.value);
    const onCategoryChange = (event) => handleCategoryChange(event.target.value);
    const onParentCategoryChange = (event) => handleParentCategoryChange(event.target.value);
    const onMaterialSelect = (event) => handleSelect(event.target.value);
    const onParentMaterialSelect = (event) => handleParentSelect(event.target.value);
    const onSubmit = () => handleComplete(onClose);

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
                                    value={modalState.parentMaterialType}
                                    onChange={onParentTypeChange}
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
                                    value={modalState.parentMaterialCategory}
                                    onChange={onParentCategoryChange}
                                    label="제품 유형"
                                    disabled={!modalState.parentMaterialType}
                                >
                                    <MenuItem value="">전체</MenuItem>
                                    {[...new Set(modalState.parentMaterials.map(m => m.materialCategory))]
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
                                    value={modalState.selectedParentMaterial?.systemMaterialId || ''}
                                    onChange={onParentMaterialSelect}
                                    label="부모 제품 선택"
                                    disabled={!modalState.parentMaterialCategory}
                                >
                                    {modalState.parentFilteredMaterials.map(material => (
                                        <MenuItem key={material.systemMaterialId} value={material.systemMaterialId}>
                                            {material.materialName} ({material.userMaterialId})
                                        </MenuItem>
                                    ))}
                                </Select>
                                {!validation.selectedParentMaterial && (
                                    <FormHelperText>부모 제품을 선택해주세요</FormHelperText>
                                )}
                            </FormControl>

                            {modalState.selectedParentMaterial && (
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
                                            <Typography>{modalState.selectedParentMaterial.materialName}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">제품ID</Typography>
                                            <Typography>{modalState.selectedParentMaterial.userMaterialId}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">자재유형</Typography>
                                            <Typography>{modalState.selectedParentMaterial.materialCategory}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">규격</Typography>
                                            <Typography>{modalState.selectedParentMaterial.materialStandard}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">단위</Typography>
                                            <Typography>{modalState.selectedParentMaterial.unit}</Typography>
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
                                    value={modalState.materialType}
                                    onChange={onTypeChange}
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
                                    value={modalState.materialCategory}
                                    onChange={onCategoryChange}
                                    label="제품 유형"
                                    disabled={!modalState.materialType}
                                >
                                    <MenuItem value="">전체</MenuItem>
                                    {[...new Set(modalState.materials.map(m => m.materialCategory))]
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
                                    value={modalState.selectedMaterial?.systemMaterialId || ''}
                                    onChange={onMaterialSelect}
                                    label="제품 선택"
                                    disabled={!modalState.materialCategory}
                                >
                                    {modalState.filteredMaterials.map(material => (
                                        <MenuItem key={material.systemMaterialId} value={material.systemMaterialId}>
                                            {material.materialName} ({material.userMaterialId})
                                        </MenuItem>
                                    ))}
                                </Select>
                                {!validation.selectedMaterial && (
                                    <FormHelperText>제품을 선택해주세요</FormHelperText>
                                )}
                            </FormControl>

                            {modalState.selectedMaterial && (
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
                                            <Typography>{modalState.selectedMaterial.materialName}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">제품ID</Typography>
                                            <Typography>{modalState.selectedMaterial.userMaterialId}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">자재유형</Typography>
                                            <Typography>{modalState.selectedMaterial.materialCategory}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">규격</Typography>
                                            <Typography>{modalState.selectedMaterial.materialStandard}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">단위</Typography>
                                            <Typography>{modalState.selectedMaterial.unit}</Typography>
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
                    onClick={onSubmit}
                    variant="contained"
                    disabled={!isAllValid}
                >
                    확인
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default BomDetailModal;
