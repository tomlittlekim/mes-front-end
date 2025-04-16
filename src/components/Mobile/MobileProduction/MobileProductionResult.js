import React, {useEffect, useState} from 'react';
import {
  alpha,
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useTheme
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import FactoryIcon from '@mui/icons-material/Factory';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import {DOMAINS, useDomain} from '../../../contexts/DomainContext';
import {gql} from "@apollo/client";
import {useGraphQL} from "../../../apollo/useGraphQL";
import {useGridUtils} from "../../../utils/grid/useGridUtils";
import {format} from "date-fns";
import Message from "../../../utils/message/Message";
import {DatePicker, LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import ko from "date-fns/locale/ko";
import Swal from 'sweetalert2';

// GraphQL 쿼리 정의 (예시 - 실제 프로젝트에 맞게 수정 필요)
const PRODUCTION_GET = gql`
    query GetProductionResults($equipmentId: String, $productId: String, $fromDate: String, $toDate: String) {
        getProductionResults(
            equipmentId: $equipmentId,
            productId: $productId,
            fromDate: $fromDate,
            toDate: $toDate
        ) {
            prodResultId
            equipmentId
            equipmentName
            productId
            productName
            prodDate
            goodQty
            defectQty
            progressRate
            defectRate
            shiftType
            workers
            memo
            createUser
            createDate
            updateUser
            updateDate
        }
    }
`;

const PRODUCTION_SAVE = gql`
    mutation SaveProductionResult($input: ProductionResultInput!, $prodResultId: String) {
        saveProductionResult(input: $input, prodResultId: $prodResultId) {
            prodResultId
        }
    }
`;

const PRODUCTION_DELETE = gql`
    mutation DeleteProductionResult($prodResultId: String!) {
        deleteProductionResult(prodResultId: $prodResultId)
    }
`;

const DEFECT_INFO_SAVE = gql`
    mutation SaveDefectInfos($defectInfos: [DefectInfoInput!]!) {
        saveDefectInfos(defectInfos: $defectInfos)
    }
`;

// 제품 조회 쿼리
const PRODUCT_GET = gql`
    query GetProducts {
        getCompleteMaterials {
            systemMaterialId
            userMaterialId
            materialName
        }
    }
`;

// 설비 조회 쿼리
const EQUIPMENT_GET = gql`
    query GetEquipments {
        getEquipments {
            equipmentId
            equipmentName
        }
    }
`;

// 검색 조건 초기값
const SEARCH_CONDITIONS = {
  equipmentId: '',
  productId: '',
  fromDate: null,
  toDate: null
};

// 불량유형 목록 (실제 구현에서는 API에서 가져올 수 있음)
const DEFECT_TYPES = [
  { value: 'APPEARANCE', label: '외관불량' },
  { value: 'FUNCTIONAL', label: '기능불량' },
  { value: 'DIMENSION', label: '치수불량' },
  { value: 'MATERIAL', label: '재질불량' },
  { value: 'PROCESS', label: '공정불량' },
  { value: 'PACKAGE', label: '포장불량' },
  { value: 'OTHER', label: '기타' }
];

const MobileProductionResult = () => {
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
  const [productionList, setProductionList] = useState([]);
  const [productList, setProductList] = useState([]);  // 제품 목록
  const [equipmentList, setEquipmentList] = useState([]); // 설비 목록
  const [searchParams, setSearchParams] = useState(SEARCH_CONDITIONS);
  const [loading, setLoading] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDefectInfoModalOpen, setIsDefectInfoModalOpen] = useState(false);
  const [selectedProduction, setSelectedProduction] = useState(null);
  const [defectInfos, setDefectInfos] = useState([]);
  const [editMode, setEditMode] = useState(false); // false = 신규, true = 수정

  // 신규 불량정보 폼
  const [currentDefect, setCurrentDefect] = useState({
    defectType: '',
    defectQty: 0,
    defectCause: '',
    resultInfo: ''
  });

  // 데이터 포맷팅 함수
  const formatProductionData = (data) => {
    if (!data || !data.getProductionResults) return [];

    return data.getProductionResults.map(result => ({
      ...result,
      id: result.prodResultId || generateId('TEMP')
    }));
  };

  // 신규 생산실적 생성 구조
  const createNewProduction = () => ({
    id: generateId('NEW'),
    prodResultId: '',
    equipmentId: '',
    equipmentName: '',
    productId: '',
    productName: '',
    prodDate: formatDateToYYYYMMDD(new Date()),
    goodQty: 0,
    defectQty: 0,
    progressRate: 0,
    defectRate: 0,
    shiftType: 'DAY',
    workers: '',
    memo: '',
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

  // 생산실적 데이터 포맷팅 (저장용)
  const transformRowForMutation = (row) => ({
    equipmentId: row.equipmentId || '',
    productId: row.productId || '',
    prodDate: row.prodDate || formatDateToYYYYMMDD(new Date()),
    goodQty: Number(row.goodQty) || 0,
    defectQty: Number(row.defectQty) || 0,
    shiftType: row.shiftType || 'DAY',
    workers: row.workers || '',
    memo: row.memo || ''
  });

  // 제품 목록 조회
  const loadProducts = async () => {
    try {
      const { data } = await executeQuery({
        query: PRODUCT_GET
      });

      if (data && data.getCompleteMaterials) {
        setProductList(data.getCompleteMaterials.map(product => ({
          id: product.systemMaterialId,
          name: product.materialName,
          code: product.userMaterialId
        })));
      }
    } catch (error) {
      console.error('제품 목록 조회 중 에러 발생:', error);
    }
  };

  // 설비 목록 조회
  const loadEquipments = async () => {
    try {
      const { data } = await executeQuery({
        query: EQUIPMENT_GET
      });

      if (data && data.getEquipments) {
        setEquipmentList(data.getEquipments.map(equipment => ({
          id: equipment.equipmentId,
          name: equipment.equipmentName
        })));
      }
    } catch (error) {
      console.error('설비 목록 조회 중 에러 발생:', error);
    }
  };

  // API 호출 함수들
  const handleSearch = async () => {
    try {
      setLoading(true);
      const formattedParams = formatSearchParams(searchParams);

      const { data } = await executeQuery({
        query: PRODUCTION_GET,
        variables: formattedParams
      });

      const formattedData = formatProductionData(data);
      setProductionList(formattedData);
    } catch (error) {
      console.error('생산실적 조회 중 에러 발생:', error);
      Message.showError('생산실적 조회 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedProduction) return;

    // 필수값 체크
    if (!selectedProduction.equipmentId || !selectedProduction.productId || !selectedProduction.prodDate) {
      Message.showWarning('설비, 제품, 생산일자는 필수 입력 항목입니다.');
      return;
    }

    try {
      setLoading(true);
      const input = transformRowForMutation(selectedProduction);

      // 불량수량이 있는 경우 불량정보가 필요
      if (selectedProduction.defectQty > 0 && !defectInfos.length) {
        setIsDefectInfoModalOpen(true);
        setLoading(false);
        return;
      }

      const { data } = await executeMutation({
        mutation: PRODUCTION_SAVE,
        variables: {
          input,
          prodResultId: editMode ? selectedProduction.prodResultId : null
        }
      });

      if (data && data.saveProductionResult) {
        // 불량정보 저장이 필요한 경우
        if (selectedProduction.defectQty > 0 && defectInfos.length > 0) {
          // 불량정보에 prodResultId 업데이트
          const updatedDefectInfos = defectInfos.map(info => ({
            ...info,
            prodResultId: data.saveProductionResult.prodResultId
          }));

          await executeMutation({
            mutation: DEFECT_INFO_SAVE,
            variables: {
              defectInfos: updatedDefectInfos
            }
          });
        }

        Message.showSuccess(editMode ? '생산실적 정보가 수정되었습니다.' : '새 생산실적이 등록되었습니다.');
        handleSearch(); // 목록 새로고침
        setIsEditDialogOpen(false);
        setDefectInfos([]);
      }
    } catch (error) {
      console.error('생산실적 저장 중 에러 발생:', error);
      Message.showError('생산실적 저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (prodResultId) => {
    if (!prodResultId) {
      Message.showWarning('삭제할 생산실적을 선택해주세요.');
      return;
    }

    const confirmed = window.confirm('선택한 생산실적을 삭제하시겠습니까?');
    if (!confirmed) return;

    try {
      setLoading(true);

      const { data } = await executeMutation({
        mutation: PRODUCTION_DELETE,
        variables: {
          prodResultId
        }
      });

      if (data && data.deleteProductionResult) {
        Message.showSuccess('생산실적이 삭제되었습니다.');
        handleSearch(); // 목록 새로고침
      }
    } catch (error) {
      console.error('생산실적 삭제 중 에러 발생:', error);
      Message.showError('생산실적 삭제 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 이벤트 핸들러들
  const handleOpenNewDialog = () => {
    setSelectedProduction(createNewProduction());
    setEditMode(false);
    setDefectInfos([]);
    setIsEditDialogOpen(true);
  };

  const handleOpenEditDialog = (production) => {
    setSelectedProduction(production);
    setEditMode(true);
    setDefectInfos([]); // 불량정보는 편집 시 새로 가져와야 함
    setIsEditDialogOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // 수량 필드일 경우 숫자로 변환
    if (name === 'goodQty' || name === 'defectQty') {
      const numValue = Number(value);
      if (isNaN(numValue) || numValue < 0) return;

      // 불량률과 진척률 자동 계산
      const updatedProduction = { ...selectedProduction, [name]: numValue };
      const totalQty = Number(updatedProduction.goodQty) + Number(updatedProduction.defectQty);

      if (totalQty > 0) {
        updatedProduction.defectRate = Math.round((Number(updatedProduction.defectQty) / totalQty) * 100);
        updatedProduction.progressRate = Math.round((Number(updatedProduction.goodQty) / totalQty) * 100);
      } else {
        updatedProduction.defectRate = 0;
        updatedProduction.progressRate = 0;
      }

      setSelectedProduction(updatedProduction);
    } else {
      setSelectedProduction(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // 제품 선택 시 제품명 자동 설정
  const handleProductChange = (e) => {
    const selectedId = e.target.value;
    const selectedProduct = productList.find(product => product.id === selectedId);

    setSelectedProduction(prev => ({
      ...prev,
      productId: selectedId,
      productName: selectedProduct ? selectedProduct.name : ''
    }));
  };

  // 설비 선택 시 설비명 자동 설정
  const handleEquipmentChange = (e) => {
    const selectedId = e.target.value;
    const selectedEquipment = equipmentList.find(equipment => equipment.id === selectedId);

    setSelectedProduction(prev => ({
      ...prev,
      equipmentId: selectedId,
      equipmentName: selectedEquipment ? selectedEquipment.name : ''
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

  // 불량정보 관련 핸들러
  const handleDefectInfoDialogOpen = () => {
    setIsDefectInfoModalOpen(true);
  };

  const handleDefectInfoDialogClose = () => {
    setIsDefectInfoModalOpen(false);
  };

  const handleSaveDefectInfos = (updatedDefectInfos) => {
    setDefectInfos(updatedDefectInfos);
    setIsDefectInfoModalOpen(false);

    // 저장 진행
    handleSave();
  };

  const handleDefectInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'defectQty') {
      // 불량수량은 숫자만 허용하고 음수는 허용하지 않음
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < 0) return;

      setCurrentDefect({ ...currentDefect, [name]: numValue });
    } else {
      setCurrentDefect({ ...currentDefect, [name]: value });
    }
  };

  const handleAddDefect = () => {
    // 유효성 검증
    if (!currentDefect.defectType) {
      Swal.fire({
        title: '입력 오류',
        text: '불량유형을 선택해주세요.',
        icon: 'warning',
        confirmButtonText: '확인'
      });
      return;
    }

    if (!currentDefect.defectQty || currentDefect.defectQty <= 0) {
      Swal.fire({
        title: '입력 오류',
        text: '불량수량은 0보다 커야 합니다.',
        icon: 'warning',
        confirmButtonText: '확인'
      });
      return;
    }

    if (!currentDefect.defectCause) {
      Swal.fire({
        title: '입력 오류',
        text: '불량원인을 입력해주세요.',
        icon: 'warning',
        confirmButtonText: '확인'
      });
      return;
    }

    // 총 불량수량 확인
    const existingTotal = defectInfos.reduce((sum, item) => sum + (Number(item.defectQty) || 0), 0);
    const newTotal = existingTotal + Number(currentDefect.defectQty);

    if (newTotal > selectedProduction.defectQty) {
      Swal.fire({
        title: '불량수량 초과',
        text: `총 불량수량(${selectedProduction.defectQty})을 초과할 수 없습니다. 현재 입력된 총량: ${newTotal}`,
        icon: 'warning',
        confirmButtonText: '확인'
      });
      return;
    }

    // 새 불량정보 형식으로 변환
    const newDefectInfo = {
      productId: selectedProduction.productId,
      defectQty: Number(currentDefect.defectQty),
      defectType: currentDefect.defectType,
      defectCause: currentDefect.defectCause,
      resultInfo: currentDefect.resultInfo || currentDefect.defectType,
      state: 'NEW',
      flagActive: true
    };

    // 불량정보 배열에 추가
    setDefectInfos([...defectInfos, newDefectInfo]);

    // 입력 필드 초기화
    setCurrentDefect({
      defectType: '',
      defectQty: 0,
      defectCause: '',
      resultInfo: ''
    });
  };

  const handleDeleteDefect = (index) => {
    const updatedDefectInfos = [...defectInfos];
    updatedDefectInfos.splice(index, 1);
    setDefectInfos(updatedDefectInfos);
  };

  // 불량정보 유효성 검증
  const isDefectInfoValid = () => {
    if (selectedProduction?.defectQty <= 0) return true; // 불량이 없으면 유효함

    if (defectInfos.length === 0) return false; // 불량이 있는데 정보가 없으면 유효하지 않음

    // 총 불량수량 계산
    const totalDefectInfoQty = defectInfos.reduce((sum, item) => sum + (Number(item.defectQty) || 0), 0);

    // 총 불량수량이 생산실적의 불량수량과 같은지 확인
    return Math.abs(totalDefectInfoQty - selectedProduction.defectQty) < 0.001;
  };

  // 초기 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([loadProducts(), loadEquipments()]);
      handleSearch();
    };
    loadData();
  }, []);

  // 상태 표시용 Chip 컴포넌트
  const ShiftTypeChip = ({ type }) => {
    const isDay = type === 'DAY';

    return (
        <Chip
            icon={isDay ? <WbSunnyIcon fontSize="small" /> : <NightsStayIcon fontSize="small" />}
            label={isDay ? "주간" : "야간"}
            size="small"
            variant="outlined"
            sx={{
              fontWeight: 500,
              bgcolor: isDay
                  ? (isDarkMode ? 'rgba(255, 193, 7, 0.2)' : 'rgba(255, 193, 7, 0.1)')
                  : (isDarkMode ? 'rgba(66, 165, 245, 0.2)' : 'rgba(66, 165, 245, 0.1)'),
              color: isDay
                  ? (isDarkMode ? '#ffc107' : '#ff8f00')
                  : (isDarkMode ? '#42a5f5' : '#1976d2'),
              border: `1px solid ${isDay
                  ? (isDarkMode ? 'rgba(255, 193, 7, 0.5)' : 'rgba(255, 193, 7, 0.3)')
                  : (isDarkMode ? 'rgba(66, 165, 245, 0.5)' : 'rgba(66, 165, 245, 0.3)')}`,
              '& .MuiChip-icon': {
                color: isDay
                    ? (isDarkMode ? '#ffc107' : '#ff8f00')
                    : (isDarkMode ? '#42a5f5' : '#1976d2')
              },
              minWidth: '80px',
              justifyContent: 'center'
            }}
        />
    );
  };

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
            생산실적등록
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
        {(searchParams.equipmentId || searchParams.productId) && (
            <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {searchParams.equipmentId && (
                  <Chip
                      label={`설비: ${equipmentList.find(e => e.id === searchParams.equipmentId)?.name || searchParams.equipmentId}`}
                      onDelete={() => setSearchParams(prev => ({ ...prev, equipmentId: '' }))}
                      size="small"
                      color="primary"
                      variant="outlined"
                  />
              )}
              {searchParams.productId && (
                  <Chip
                      label={`제품: ${productList.find(p => p.id === searchParams.productId)?.name || searchParams.productId}`}
                      onDelete={() => setSearchParams(prev => ({ ...prev, productId: '' }))}
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

        {/* 생산실적 목록 */}
        {loading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography>데이터를 불러오는 중...</Typography>
            </Box>
        ) : productionList.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography>등록된 생산실적이 없습니다.</Typography>
              <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleOpenNewDialog}
                  sx={{ mt: 2, bgcolor: getAccentColor() }}
              >
                생산실적 등록하기
              </Button>
            </Box>
        ) : (
            <List sx={{
              width: '100%',
              p: 0,
              '& .MuiListItem-root': { p: 0, mb: 2 },
            }}>
              {productionList.map((production) => (
                  <ListItem key={production.id} disablePadding>
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
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ bgcolor: getAccentColor(), mr: 1, width: 28, height: 28 }}>
                              <FactoryIcon sx={{ fontSize: 16 }} />
                            </Avatar>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {production.equipmentName || production.equipmentId}
                            </Typography>
                          </Box>
                          <Box display="flex" alignItems="center">
                            <ShiftTypeChip type={production.shiftType || 'DAY'} />
                            <Typography variant="body2" sx={{
                              display: 'flex',
                              alignItems: 'center',
                              color: 'text.secondary',
                              ml: 1
                            }}>
                              <CalendarTodayIcon sx={{ fontSize: 14, mr: 0.5 }} />
                              {production.prodDate}
                            </Typography>
                          </Box>
                        </Box>

                        <Typography variant="body1" sx={{ mb: 1 }}>
                          {production.productName || production.productId}
                        </Typography>

                        <Grid container spacing={1} sx={{ mb: 1 }}>
                          <Grid item xs={4}>
                            <Typography variant="caption" color="text.secondary">양품</Typography>
                            <Typography variant="body2">
                              {production.goodQty ? Number(production.goodQty).toLocaleString() : '0'}
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="caption" color="text.secondary">불량</Typography>
                            <Typography variant="body2" sx={{
                              color: production.defectQty > 0 ? 'error.main' : 'text.primary'
                            }}>
                              {production.defectQty ? Number(production.defectQty).toLocaleString() : '0'}
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="caption" color="text.secondary">작업자</Typography>
                            <Typography variant="body2">{production.workers || '-'}</Typography>
                          </Grid>
                        </Grid>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Chip
                              label={`진척률: ${production.progressRate || 0}%`}
                              size="small"
                              sx={{
                                bgcolor: theme.palette.success.light,
                                color: theme.palette.success.contrastText,
                                fontSize: '0.75rem'
                              }}
                          />
                          {production.defectRate > 0 && (
                              <Chip
                                  label={`불량률: ${production.defectRate}%`}
                                  size="small"
                                  sx={{
                                    bgcolor: theme.palette.error.light,
                                    color: theme.palette.error.contrastText,
                                    fontSize: '0.75rem'
                                  }}
                              />
                          )}
                        </Box>

                        {production.memo && (
                            <Typography variant="body2" sx={{
                              mt: 1,
                              bgcolor: alpha(theme.palette.background.paper, 0.5),
                              p: 1,
                              borderRadius: 1,
                              fontSize: '0.75rem'
                            }}>
                              {production.memo}
                            </Typography>
                        )}
                      </CardContent>
                      <Divider />
                      <CardActions sx={{ justifyContent: 'space-between', px: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          {production.createDate ? `등록: ${format(new Date(production.createDate), 'yyyy-MM-dd')}` : ''}
                        </Typography>
                        <Box>
                          <IconButton
                              size="small"
                              onClick={() => handleOpenEditDialog(production)}
                              sx={{ color: getAccentColor() }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                              size="small"
                              onClick={() => handleDelete(production.prodResultId)}
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
                <FormControl variant="outlined" size="small" fullWidth>
                  <InputLabel>설비</InputLabel>
                  <Select
                      name="equipmentId"
                      value={searchParams.equipmentId}
                      onChange={handleFilterChange}
                      label="설비"
                  >
                    <MenuItem value="">전체</MenuItem>
                    {equipmentList.map(equipment => (
                        <MenuItem key={equipment.id} value={equipment.id}>
                          {equipment.name}
                        </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl variant="outlined" size="small" fullWidth>
                  <InputLabel>제품</InputLabel>
                  <Select
                      name="productId"
                      value={searchParams.productId}
                      onChange={handleFilterChange}
                      label="제품"
                  >
                    <MenuItem value="">전체</MenuItem>
                    {productList.map(product => (
                        <MenuItem key={product.id} value={product.id}>
                          {product.name}
                        </MenuItem>
                    ))}
                  </Select>
                </FormControl>
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

        {/* 생산실적 추가/수정 다이얼로그 */}
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
            {editMode ? '생산실적 수정' : '신규 생산실적 등록'}
            <IconButton
                size="small"
                onClick={() => setIsEditDialogOpen(false)}
                sx={{ color: 'white' }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ pt: 2, mt: 1 }}>
            {selectedProduction && (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControl variant="outlined" size="small" fullWidth required>
                      <InputLabel>설비</InputLabel>
                      <Select
                          name="equipmentId"
                          value={selectedProduction.equipmentId}
                          onChange={handleEquipmentChange}
                          label="설비"
                      >
                        <MenuItem value="">선택</MenuItem>
                        {equipmentList.map(equipment => (
                            <MenuItem key={equipment.id} value={equipment.id}>
                              {equipment.name}
                            </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl variant="outlined" size="small" fullWidth required>
                      <InputLabel>제품</InputLabel>
                      <Select
                          name="productId"
                          value={selectedProduction.productId}
                          onChange={handleProductChange}
                          label="제품"
                      >
                        <MenuItem value="">선택</MenuItem>
                        {productList.map(product => (
                            <MenuItem key={product.id} value={product.id}>
                              {product.name} ({product.code})
                            </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
                      <DatePicker
                          label="생산일자"
                          value={selectedProduction.prodDate ? new Date(selectedProduction.prodDate) : null}
                          onChange={(date) => setSelectedProduction(prev => ({
                            ...prev,
                            prodDate: date ? formatDateToYYYYMMDD(date) : null
                          }))}
                          slotProps={{ textField: { size: 'small', fullWidth: true, required: true } }}
                      />
                    </LocalizationProvider>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                        label="양품수량"
                        name="goodQty"
                        type="number"
                        value={selectedProduction.goodQty}
                        onChange={handleInputChange}
                        variant="outlined"
                        size="small"
                        fullWidth
                        InputProps={{ inputProps: { min: 0 } }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                        label="불량수량"
                        name="defectQty"
                        type="number"
                        value={selectedProduction.defectQty}
                        onChange={handleInputChange}
                        variant="outlined"
                        size="small"
                        fullWidth
                        InputProps={{ inputProps: { min: 0 } }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl variant="outlined" size="small" fullWidth>
                      <InputLabel>근무타입</InputLabel>
                      <Select
                          name="shiftType"
                          value={selectedProduction.shiftType || 'DAY'}
                          onChange={handleInputChange}
                          label="근무타입"
                      >
                        <MenuItem value="DAY">주간</MenuItem>
                        <MenuItem value="NIGHT">야간</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                        label="작업자"
                        name="workers"
                        value={selectedProduction.workers}
                        onChange={handleInputChange}
                        variant="outlined"
                        size="small"
                        fullWidth
                        placeholder="작업자 이름을 입력하세요"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                        label="메모"
                        name="memo"
                        value={selectedProduction.memo}
                        onChange={handleInputChange}
                        variant="outlined"
                        size="small"
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="추가 정보나 특이사항을 입력하세요"
                    />
                  </Grid>

                  {selectedProduction.defectQty > 0 && (
                      <Grid item xs={12}>
                        <Box
                            sx={{
                              p: 2,
                              bgcolor: isDarkMode ? 'rgba(255, 0, 0, 0.1)' : 'rgba(255, 235, 235, 1)',
                              borderRadius: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              border: '1px solid',
                              borderColor: 'error.light'
                            }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <WarningAmberIcon sx={{ color: 'error.main', mr: 1 }} />
                            <Typography variant="body2" color="error.main">
                              불량수량이 있는 경우 불량정보를 등록해야 합니다.
                            </Typography>
                          </Box>
                          <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              onClick={handleDefectInfoDialogOpen}
                          >
                            {defectInfos.length > 0 ? '불량정보 수정' : '불량정보 등록'}
                          </Button>
                        </Box>
                      </Grid>
                  )}
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
                disabled={selectedProduction?.defectQty > 0 && !isDefectInfoValid()}
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
            생산실적등록 도움말
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <Typography variant="body2">
                • 생산실적등록에서는 일일 생산량과 작업 정보를 등록할 수 있습니다.
              </Typography>
              <Typography variant="body2">
                • 설비, 제품, 생산일자, 수량은 필수 입력 사항입니다.
              </Typography>
              <Typography variant="body2">
                • 양품수량과 불량수량을 입력하면 진척률과 불량률이 자동으로 계산됩니다.
              </Typography>
              <Typography variant="body2">
                • 불량수량이 있는 경우 불량정보(불량유형, 원인 등)를 등록해야 합니다.
              </Typography>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsHelpModalOpen(false)} sx={{ color: getAccentColor() }}>
              확인
            </Button>
          </DialogActions>
        </Dialog>

        {/* 불량정보 등록 모달 */}
        <Dialog
            open={isDefectInfoModalOpen}
            onClose={handleDefectInfoDialogClose}
            fullWidth
            maxWidth="md"
            PaperProps={{
              sx: {
                minHeight: '70vh'
              }
            }}
        >
          <DialogTitle sx={{
            borderBottom: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            bgcolor: getAccentColor(),
            color: 'white'
          }}>
            <Typography variant="h6" component="div">
              불량정보 등록
            </Typography>
            <IconButton
                onClick={handleDefectInfoDialogClose}
                sx={{ color: 'white' }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers sx={{ p: 3 }}>
            <Grid container spacing={3}>
              {/* 생산실적 정보 */}
              <Grid item xs={12}>
                <Paper elevation={2} sx={{ p: 2, mb: 3, bgcolor: isDarkMode ? 'rgba(66, 66, 66, 0.2)' : 'rgba(240, 240, 240, 0.5)' }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    생산실적 정보
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2">
                        <strong>제품:</strong> {selectedProduction?.productName || ''}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2">
                        <strong>설비:</strong> {selectedProduction?.equipmentName || ''}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2">
                        <strong>불량수량:</strong> {selectedProduction?.defectQty || 0}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* 불량정보 입력 폼 */}
              <Grid item xs={12}>
                <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    불량정보 추가
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={3}>
                      <FormControl fullWidth size="small">
                        <InputLabel id="defect-type-label">불량유형</InputLabel>
                        <Select
                            labelId="defect-type-label"
                            name="defectType"
                            value={currentDefect.defectType}
                            onChange={handleDefectInputChange}
                            label="불량유형"
                        >
                          {DEFECT_TYPES.map(option => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <TextField
                          name="defectQty"
                          label="불량수량"
                          type="number"
                          value={currentDefect.defectQty}
                          onChange={handleDefectInputChange}
                          fullWidth
                          size="small"
                          InputProps={{ inputProps: { min: 0 } }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField
                          name="defectCause"
                          label="불량원인"
                          value={currentDefect.defectCause}
                          onChange={handleDefectInputChange}
                          fullWidth
                          size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField
                          name="resultInfo"
                          label="상세내용(선택)"
                          value={currentDefect.resultInfo}
                          onChange={handleDefectInputChange}
                          fullWidth
                          size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={1} display="flex" alignItems="center" justifyContent="center">
                      <Button
                          variant="contained"
                          color="success"
                          onClick={handleAddDefect}
                          startIcon={<AddIcon />}
                          sx={{
                            minWidth: '80px',
                            height: '36px',
                            fontWeight: 'medium',
                            bgcolor: getAccentColor()
                          }}
                      >
                        추가
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* 불량정보 목록 */}
              <Grid item xs={12}>
                <Paper elevation={3} sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                    불량정보 목록
                  </Typography>

                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{
                          bgcolor: isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)'
                        }}>
                          <TableCell align="center" width="8%">번호</TableCell>
                          <TableCell align="center" width="22%">불량유형</TableCell>
                          <TableCell align="center" width="15%">불량수량</TableCell>
                          <TableCell align="center" width="25%">불량원인</TableCell>
                          <TableCell align="center" width="20%">상세내용</TableCell>
                          <TableCell align="center" width="10%">관리</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {defectInfos.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} align="center">
                                <Typography variant="body2" sx={{ py: 2, color: 'text.secondary' }}>
                                  등록된 불량정보가 없습니다. 불량정보를 추가해주세요.
                                </Typography>
                              </TableCell>
                            </TableRow>
                        ) : (
                            defectInfos.map((defect, index) => {
                              const defectType = DEFECT_TYPES.find(type => type.value === defect.defectType);
                              return (
                                  <TableRow key={index} sx={{
                                    '&:nth-of-type(odd)': {
                                      bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
                                    }
                                  }}>
                                    <TableCell align="center">{index + 1}</TableCell>
                                    <TableCell>{defectType ? defectType.label : defect.defectType}</TableCell>
                                    <TableCell align="center">{defect.defectQty}</TableCell>
                                    <TableCell>{defect.defectCause}</TableCell>
                                    <TableCell>{defect.resultInfo || '-'}</TableCell>
                                    <TableCell align="center">
                                      <IconButton
                                          size="small"
                                          color="error"
                                          onClick={() => handleDeleteDefect(index)}
                                      >
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </TableCell>
                                  </TableRow>
                              );
                            })
                        )}

                        {/* 합계 행 */}
                        {defectInfos.length > 0 && (
                            <TableRow sx={{
                              bgcolor: isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)'
                            }}>
                              <TableCell colSpan={2} align="right">
                                <Typography variant="subtitle2">합계</Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Typography variant="subtitle2">
                                  {defectInfos.reduce((sum, item) => sum + (Number(item.defectQty) || 0), 0)}
                                </Typography>
                              </TableCell>
                              <TableCell colSpan={3} />
                            </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* 검증 상태 표시 */}
                  {defectInfos.length > 0 && (
                      <Box mt={2} p={1} sx={{
                        bgcolor: isDefectInfoValid() ?
                            (isDarkMode ? 'rgba(76, 175, 80, 0.1)' : 'rgba(76, 175, 80, 0.1)') :
                            (isDarkMode ? 'rgba(244, 67, 54, 0.1)' : 'rgba(244, 67, 54, 0.1)'),
                        borderRadius: 1,
                        border: `1px solid ${isDefectInfoValid() ?
                            (isDarkMode ? 'rgba(76, 175, 80, 0.5)' : 'rgba(76, 175, 80, 0.5)') :
                            (isDarkMode ? 'rgba(244, 67, 54, 0.5)' : 'rgba(244, 67, 54, 0.5)')}`
                      }}>
                        <Typography variant="body2" color={isDefectInfoValid() ? 'success.main' : 'error.main'}>
                          {isDefectInfoValid() ?
                              '✓ 모든 불량정보가 올바르게 입력되었습니다.' :
                              '✗ 총 불량수량과 등록된 불량정보의 합이 일치해야 합니다.'}
                        </Typography>
                      </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{
            borderTop: `1px solid ${theme.palette.divider}`,
            p: 2,
            justifyContent: 'space-between',
            bgcolor: isDarkMode ? theme.palette.grey[900] : theme.palette.grey[100]
          }}>
            <Typography variant="body2" color={isDefectInfoValid() ? 'success.main' : 'error.main'} sx={{ ml: 2 }}>
              {isDefectInfoValid() ?
                  '✓ 저장할 준비가 완료되었습니다.' :
                  defectInfos.length === 0 ?
                      '최소 1개 이상의 불량정보를 등록해야 합니다.' :
                      `불량수량 합계가 ${defectInfos.reduce((sum, item) => sum + (Number(item.defectQty) || 0), 0)}/${selectedProduction?.defectQty || 0}입니다.`}
            </Typography>
            <Box>
              <Button onClick={handleDefectInfoDialogClose} sx={{ mr: 1 }}>
                취소
              </Button>
              <Button
                  onClick={() => handleSaveDefectInfos(defectInfos)}
                  variant="contained"
                  color="primary"
                  disabled={!isDefectInfoValid()}
                  sx={{ bgcolor: getAccentColor() }}
              >
                저장
              </Button>
            </Box>
          </DialogActions>
        </Dialog>
      </Box>
  );
};

export default MobileProductionResult;