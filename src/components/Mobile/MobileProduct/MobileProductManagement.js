import React, { useState, useEffect } from 'react';
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
  IconButton,
  Button,
  Divider,
  Card,
  CardContent,
  CardActions,
  List,
  ListItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  alpha,
  Stack
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { DOMAINS, useDomain } from '../../../contexts/DomainContext';
import { gql } from "@apollo/client";
import { useGraphQL } from "../../../apollo/useGraphQL";
import { useGridUtils } from "../../../utils/grid/useGridUtils";
import { format } from "date-fns";
import Message from "../../../utils/message/Message";
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ko from "date-fns/locale/ko";

// GraphQL 쿼리 정의
const MATERIAL_GET = gql`
    query GetCompleteMaterials($materialType: String, $userMaterialId: String, $materialName: String, $fromDate: String, $toDate: String) {
        getCompleteMaterials(
            materialType: $materialType,
            userMaterialId: $userMaterialId,
            materialName: $materialName,
            fromDate: $fromDate,
            toDate: $toDate
        ) {
            systemMaterialId
            materialCategory
            userMaterialId
            materialName
            materialStandard
            unit
            baseQuantity
            materialStorage
            createUser
            createDate
            updateUser
            updateDate
        }
    }
`;

const MATERIAL_SAVE = gql`
    mutation SaveMaterial($input: MaterialInput!, $systemMaterialId: String) {
        saveMaterial(input: $input, systemMaterialId: $systemMaterialId) {
            systemMaterialId
        }
    }
`;

const MATERIAL_DELETE = gql`
    mutation DeleteMaterials($systemMaterialIds: [String!]!) {
        deleteMaterials(systemMaterialIds: $systemMaterialIds)
    }
`;

// 검색 조건 초기값
const SEARCH_CONDITIONS = {
  userMaterialId: '',
  materialName: '',
  fromDate: null,
  toDate: null
};

const MobileProductManagement = () => {
  // Theme 및 Context 관련
  const theme = useTheme();
  const { domain } = useDomain();
  const isDarkMode = theme.palette.mode === 'dark';
  const { executeQuery, executeMutation } = useGraphQL();

  // 스타일 관련 함수
  const getAccentColor = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? '#e67e22' : '#d35400';
    }
    return isDarkMode ? '#1976d2' : '#0a2351';
  };

  const getBgColor = () => domain === DOMAINS.PEMS ?
      (isDarkMode ? 'rgba(45, 30, 15, 0.5)' : 'rgba(252, 235, 212, 0.6)') :
      (isDarkMode ? 'rgba(0, 27, 63, 0.5)' : 'rgba(232, 244, 253, 0.6)');

  const getBorderColor = () => domain === DOMAINS.PEMS ?
      (isDarkMode ? '#3d2814' : '#f5e8d7') :
      (isDarkMode ? '#1e3a5f' : '#e0e0e0');

  // Grid 관련 유틸
  const { generateId, formatDateToYYYYMMDD } = useGridUtils();

  // 상태 관리
  const [materialList, setMaterialList] = useState([]);
  const [searchParams, setSearchParams] = useState(SEARCH_CONDITIONS);
  const [loading, setLoading] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [editMode, setEditMode] = useState(false); // false = 신규, true = 수정

  // 데이터 포맷팅 함수
  const formatMaterialData = (data) => {
    if (!data || !data.getCompleteMaterials) return [];

    return data.getCompleteMaterials.map(material => ({
      ...material,
      id: material.systemMaterialId || generateId('TEMP')
    }));
  };

  // 신규 자재 생성 구조
  const createNewMaterial = () => ({
    id: generateId('NEW'),
    materialType: 'COMPLETE_PRODUCT',
    materialCategory: '',
    systemMaterialId: '',
    userMaterialId: '',
    materialName: '',
    materialStandard: '',
    unit: '',
    baseQuantity: 0,
    materialStorage: '',
    createUser: '자동입력',
    createDate: formatDateToYYYYMMDD(new Date()),
    updateUser: '자동입력',
    updateDate: formatDateToYYYYMMDD(new Date())
  });

  // 검색 조건 포맷팅
  const formatSearchParams = (data) => ({
    ...data,
    fromDate: data.fromDate ? format(data.fromDate, 'yyyy-MM-dd') : null,
    toDate: data.toDate ? format(data.toDate, 'yyyy-MM-dd') : null
  });

  // 자재 데이터 포맷팅 (저장용)
  const transformRowForMutation = (row) => ({
    materialType: 'COMPLETE_PRODUCT',
    materialCategory: row.materialCategory || '',
    userMaterialId: row.userMaterialId || '',
    materialName: row.materialName || '',
    materialStandard: row.materialStandard || '',
    unit: row.unit || '',
    baseQuantity: Number(row.baseQuantity) || 0,
    materialStorage: row.materialStorage || ''
  });

  // API 호출 함수들
  const handleSearch = async () => {
    try {
      setLoading(true);
      const formattedParams = formatSearchParams(searchParams);

      const { data } = await executeQuery({
        query: MATERIAL_GET,
        variables: formattedParams
      });

      const formattedData = formatMaterialData(data);
      setMaterialList(formattedData);
    } catch (error) {
      console.error('제품 조회 중 에러 발생:', error);
      Message.showError('제품 조회 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedMaterial) return;

    // 필수값 체크
    if (!selectedMaterial.userMaterialId || !selectedMaterial.materialName) {
      Message.showWarning('제품ID와 제품명은 필수 입력 항목입니다.');
      return;
    }

    try {
      setLoading(true);
      const input = transformRowForMutation(selectedMaterial);

      const { data } = await executeMutation({
        mutation: MATERIAL_SAVE,
        variables: {
          input,
          systemMaterialId: editMode ? selectedMaterial.systemMaterialId : null
        }
      });

      if (data && data.saveMaterial) {
        Message.showSuccess(editMode ? '제품 정보가 수정되었습니다.' : '새 제품이 등록되었습니다.');
        handleSearch(); // 목록 새로고침
        setIsEditDialogOpen(false);
      }
    } catch (error) {
      console.error('제품 저장 중 에러 발생:', error);
      Message.showError('제품 저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (systemMaterialId) => {
    if (!systemMaterialId) {
      Message.showWarning('삭제할 제품을 선택해주세요.');
      return;
    }

    const confirmed = window.confirm('선택한 제품을 삭제하시겠습니까?');
    if (!confirmed) return;

    try {
      setLoading(true);

      const { data } = await executeMutation({
        mutation: MATERIAL_DELETE,
        variables: {
          systemMaterialIds: [systemMaterialId]
        }
      });

      if (data && data.deleteMaterials) {
        Message.showSuccess('제품이 삭제되었습니다.');
        handleSearch(); // 목록 새로고침
      }
    } catch (error) {
      console.error('제품 삭제 중 에러 발생:', error);
      Message.showError('제품 삭제 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 이벤트 핸들러들
  const handleOpenNewDialog = () => {
    setSelectedMaterial(createNewMaterial());
    setEditMode(false);
    setIsEditDialogOpen(true);
  };

  const handleOpenEditDialog = (material) => {
    setSelectedMaterial(material);
    setEditMode(true);
    setIsEditDialogOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedMaterial(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleResetFilters = () => {
    setSearchParams(SEARCH_CONDITIONS);
  };

  const handleCloseFilterDialog = () => {
    setIsFilterDialogOpen(false);
  };

  const handleApplyFilters = () => {
    handleSearch();
    setIsFilterDialogOpen(false);
  };

  // 초기 데이터 로드
  useEffect(() => {
    handleSearch();
  }, []);

  return (
      <Box sx={{ width: '100%' }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
          pb: 1,
          borderBottom: `1px solid ${getBorderColor()}`
        }}>
          <Typography
              variant="h5"
              component="h2"
              sx={{ fontWeight: 600 }}
          >
            제품관리
          </Typography>
          <Box>
            <IconButton
                onClick={() => setIsFilterDialogOpen(true)}
                sx={{ color: getAccentColor() }}
            >
              <FilterListIcon />
            </IconButton>
            <IconButton
                onClick={handleOpenNewDialog}
                sx={{ color: getAccentColor() }}
            >
              <AddIcon />
            </IconButton>
            <IconButton
                onClick={() => setIsHelpModalOpen(true)}
                sx={{ color: getAccentColor() }}
            >
              <HelpOutlineIcon />
            </IconButton>
          </Box>
        </Box>

        {/* 활성 필터 표시 영역 */}
        {(searchParams.userMaterialId || searchParams.materialName) && (
            <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {searchParams.userMaterialId && (
                  <Chip
                      label={`제품ID: ${searchParams.userMaterialId}`}
                      onDelete={() => setSearchParams(prev => ({ ...prev, userMaterialId: '' }))}
                      size="small"
                      color="primary"
                      variant="outlined"
                  />
              )}
              {searchParams.materialName && (
                  <Chip
                      label={`제품명: ${searchParams.materialName}`}
                      onDelete={() => setSearchParams(prev => ({ ...prev, materialName: '' }))}
                      size="small"
                      color="primary"
                      variant="outlined"
                  />
              )}
              <Chip
                  label="필터 초기화"
                  onDelete={handleResetFilters}
                  onClick={handleResetFilters}
                  size="small"
                  variant="outlined"
              />
            </Box>
        )}

        {/* 제품 목록 */}
        {loading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography>데이터를 불러오는 중...</Typography>
            </Box>
        ) : materialList.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography>등록된 제품이 없습니다.</Typography>
              <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleOpenNewDialog}
                  sx={{ mt: 2, bgcolor: getAccentColor() }}
              >
                제품 등록하기
              </Button>
            </Box>
        ) : (
            <List sx={{
              width: '100%',
              p: 0,
              '& .MuiListItem-root': { p: 0, mb: 2 },
            }}>
              {materialList.map((material) => (
                  <ListItem key={material.id} disablePadding>
                    <Card
                        variant="outlined"
                        className="mobile-card mobile-touch-item"
                        sx={{
                          width: '100%',
                          borderColor: getBorderColor()
                        }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="subtitle1" fontWeight="bold" color={getAccentColor()}>
                            {material.materialName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ID: {material.userMaterialId}
                          </Typography>
                        </Box>

                        <Grid container spacing={1} sx={{ mb: 1 }}>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">규격</Typography>
                            <Typography variant="body2">{material.materialStandard || '-'}</Typography>
                          </Grid>
                          <Grid item xs={3}>
                            <Typography variant="caption" color="text.secondary">단위</Typography>
                            <Typography variant="body2">{material.unit || '-'}</Typography>
                          </Grid>
                          <Grid item xs={3}>
                            <Typography variant="caption" color="text.secondary">기본수량</Typography>
                            <Typography variant="body2">{material.baseQuantity || '0'}</Typography>
                          </Grid>
                        </Grid>

                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            카테고리: {material.materialCategory || '-'}
                          </Typography>
                        </Box>
                      </CardContent>
                      <Divider />
                      <CardActions sx={{ justifyContent: 'space-between', px: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          {material.updateDate ? `최종 수정: ${material.updateDate}` : `등록: ${material.createDate}`}
                        </Typography>
                        <Box>
                          <IconButton
                              size="small"
                              onClick={() => handleOpenEditDialog(material)}
                              sx={{ color: getAccentColor() }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                              size="small"
                              onClick={() => handleDelete(material.systemMaterialId)}
                              sx={{ color: theme.palette.error.main }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </CardActions>
                    </Card>
                  </ListItem>
              ))}
            </List>
        )}

        {/* 검색 필터 다이얼로그 */}
        <Dialog
            open={isFilterDialogOpen}
            onClose={handleCloseFilterDialog}
            fullWidth
            maxWidth="xs"
        >
          <DialogTitle sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            bgcolor: getAccentColor(),
            color: 'white'
          }}>
            검색 필터
            <IconButton
                size="small"
                onClick={handleCloseFilterDialog}
                sx={{ color: 'white' }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ pt: 2, mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                    label="제품 ID"
                    name="userMaterialId"
                    value={searchParams.userMaterialId}
                    onChange={handleFilterChange}
                    variant="outlined"
                    size="small"
                    fullWidth
                    placeholder="제품ID를 입력하세요"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                    label="제품명"
                    name="materialName"
                    value={searchParams.materialName}
                    onChange={handleFilterChange}
                    variant="outlined"
                    size="small"
                    fullWidth
                    placeholder="제품명을 입력하세요"
                />
              </Grid>
              <Grid item xs={12}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
                  <DatePicker
                      label="시작일"
                      value={searchParams.fromDate}
                      onChange={(date) => setSearchParams(prev => ({ ...prev, fromDate: date }))}
                      slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
                  <DatePicker
                      label="종료일"
                      value={searchParams.toDate}
                      onChange={(date) => setSearchParams(prev => ({ ...prev, toDate: date }))}
                      slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button
                variant="outlined"
                onClick={handleResetFilters}
                startIcon={<CloseIcon />}
                fullWidth
            >
              초기화
            </Button>
            <Button
                variant="contained"
                onClick={handleApplyFilters}
                startIcon={<SearchIcon />}
                sx={{ bgcolor: getAccentColor() }}
                fullWidth
            >
              검색
            </Button>
          </DialogActions>
        </Dialog>

        {/* 제품 추가/수정 다이얼로그 */}
        <Dialog
            open={isEditDialogOpen}
            onClose={() => setIsEditDialogOpen(false)}
            fullWidth
            maxWidth="sm"
        >
          <DialogTitle sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            bgcolor: getAccentColor(),
            color: 'white'
          }}>
            {editMode ? '제품 수정' : '신규 제품 등록'}
            <IconButton
                size="small"
                onClick={() => setIsEditDialogOpen(false)}
                sx={{ color: 'white' }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ pt: 2, mt: 1 }}>
            {selectedMaterial && (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                        label="제품 ID"
                        name="userMaterialId"
                        value={selectedMaterial.userMaterialId}
                        onChange={handleInputChange}
                        variant="outlined"
                        size="small"
                        fullWidth
                        required
                        placeholder="제품ID를 입력하세요"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                        label="제품명"
                        name="materialName"
                        value={selectedMaterial.materialName}
                        onChange={handleInputChange}
                        variant="outlined"
                        size="small"
                        fullWidth
                        required
                        placeholder="제품명을 입력하세요"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl variant="outlined" size="small" fullWidth>
                      <InputLabel>자재유형</InputLabel>
                      <Select
                          name="materialCategory"
                          value={selectedMaterial.materialCategory}
                          onChange={handleInputChange}
                          label="자재유형"
                      >
                        <MenuItem value="">선택</MenuItem>
                        <MenuItem value="잉크">잉크</MenuItem>
                        <MenuItem value="포장재">포장재</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                        label="규격"
                        name="materialStandard"
                        value={selectedMaterial.materialStandard}
                        onChange={handleInputChange}
                        variant="outlined"
                        size="small"
                        fullWidth
                        placeholder="규격을 입력하세요"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <FormControl variant="outlined" size="small" fullWidth>
                      <InputLabel>단위</InputLabel>
                      <Select
                          name="unit"
                          value={selectedMaterial.unit}
                          onChange={handleInputChange}
                          label="단위"
                      >
                        <MenuItem value="">선택</MenuItem>
                        <MenuItem value="EA">개</MenuItem>
                        <MenuItem value="roll">롤</MenuItem>
                        <MenuItem value="bottle">병</MenuItem>
                        <MenuItem value="pack">팩</MenuItem>
                        <MenuItem value="can">캔</MenuItem>
                        <MenuItem value="sheet">장</MenuItem>
                        <MenuItem value="set">세트</MenuItem>
                        <MenuItem value="ream">연</MenuItem>
                        <MenuItem value="pair">쌍</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                        label="기본수량"
                        name="baseQuantity"
                        type="number"
                        value={selectedMaterial.baseQuantity}
                        onChange={handleInputChange}
                        variant="outlined"
                        size="small"
                        fullWidth
                        InputProps={{ inputProps: { min: 0 } }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                        label="보관창고"
                        name="materialStorage"
                        value={selectedMaterial.materialStorage}
                        onChange={handleInputChange}
                        variant="outlined"
                        size="small"
                        fullWidth
                        placeholder="보관창고 정보를 입력하세요"
                    />
                  </Grid>
                </Grid>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button
                variant="outlined"
                onClick={() => setIsEditDialogOpen(false)}
                startIcon={<CloseIcon />}
                fullWidth
            >
              취소
            </Button>
            <Button
                variant="contained"
                onClick={handleSave}
                startIcon={<SaveIcon />}
                sx={{ bgcolor: getAccentColor() }}
                fullWidth
            >
              저장
            </Button>
          </DialogActions>
        </Dialog>

        {/* 도움말 모달 */}
        <Dialog
            open={isHelpModalOpen}
            onClose={() => setIsHelpModalOpen(false)}
            fullWidth
            maxWidth="xs"
        >
          <DialogTitle sx={{
            bgcolor: getAccentColor(),
            color: 'white'
          }}>
            제품관리 도움말
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <Typography variant="body2">
                • 제품관리에서는 생산하는 제품의 기본 정보를 등록하고 관리할 수 있습니다.
              </Typography>
              <Typography variant="body2">
                • 제품코드, 제품명, 규격, 단위 등의 정보를 관리하여 제품 정보를 체계적으로 관리할 수 있습니다.
              </Typography>
              <Typography variant="body2">
                • 제품 정보는 생산 계획, 재고 관리, 출하 관리 등에서 활용됩니다.
              </Typography>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsHelpModalOpen(false)} sx={{ color: getAccentColor() }}>
              확인
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
  );
};

export default MobileProductManagement;