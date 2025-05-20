import React, { useCallback, useState, useEffect } from 'react';
import { Box, IconButton, Stack, Typography, useTheme, alpha, Grid, Button, Popover, Chip, FormControl, InputLabel, MenuItem, Select, List, ListItem, ListItemIcon, Checkbox, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HelpModal from '../../Common/HelpModal';
import { SearchCondition, EnhancedDataGridWrapper } from '../../Common';
import { useMaterialData } from '../../MaterialManagement/hooks/useMaterialData';
import { useGraphQL } from '../../../apollo/useGraphQL';
import Message from "../../../utils/message/Message";
import { useForm, Controller } from 'react-hook-form';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label, Cell } from 'recharts';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ko from "date-fns/locale/ko"; 
import DateRangePicker from '../../Common/DateRangePicker';
import { GRAPHQL_URL } from '../../../config';

// =====================================================================
// GraphQL 쿼리 정의
// =====================================================================
const GET_INVENTORY_HISTORY_LIST = `
  query getInventoryHistoryList($filter: InventoryHistoryFilter) {
    getInventoryHistoryList(filter: $filter) {
      inOutType
      warehouseName
      supplierName
      manufacturerName
      materialName
      changeQty
      currentQty
      unit
      createDate
    }
  }
`;

// =====================================================================
// 커스텀 훅: useInventoryMovement
// =====================================================================
export const useInventoryMovement = (tabId) => {
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const { control, handleSubmit, reset, setValue, getValues } = useForm({
    defaultValues: {
      movementDateRange: [null, null],
      systemMaterialIds: [], // 선택된 제품 ID 배열
      inOutType: '',
      warehouseName: '',
      supplierName: '',
      manufacturerName: '',
      unit: '',
    },
  });

  const handleSearch = useCallback(async (formData) => {
    console.log('Search Params:', formData);
    setIsLoading(true);
    setReportData([]);
    setChartData([]);
    try {
      // API 파라미터 설정
      const filter = {
        startDate: formData.movementDateRange?.[0] ? new Date(formData.movementDateRange[0]).toISOString().split('T')[0] : null,
        endDate: formData.movementDateRange?.[1] ? new Date(formData.movementDateRange[1]).toISOString().split('T')[0] : null,
        
        // materialNames 필드 - 백엔드 필드명과 일치시킴
        // 제품 선택 결과가 있는 경우 배열로 전달, 없으면 필드 제외
        ...(formData.materialNames && formData.materialNames.length > 0 ? { materialNames: formData.materialNames } : {}),
        
        inOutType: formData.inOutType || null,
        warehouseName: formData.warehouseName || null,
        supplierName: formData.supplierName || null,
        manufacturerName: formData.manufacturerName || null,
      };
      
      console.log('API Params:', filter);

      const response = await fetch(GRAPHQL_URL, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: GET_INVENTORY_HISTORY_LIST,
          variables: { filter }
        })
      });
      
      const responseText = await response.text();
      if (!responseText.trim()) {
        throw new Error('빈 응답을 받았습니다');
      }
      const result = JSON.parse(responseText);

      if (result.errors) {
        console.error('GraphQL Error:', result.errors);
        throw new Error(result.errors[0].message || 'GraphQL 데이터 조회 실패');
      }

      const historyData = result.data?.getInventoryHistoryList;
      if (!historyData) {
        console.warn('No inventory history data found.');
        setReportData([]);
        setChartData([]);
        setIsLoading(false);
        return;
      }
      
      console.log('Fetched History Data:', historyData);

      // --- 데이터 가공 로직 수정 ---
      // 1. 차트 데이터 생성 - 품목별 입고량, 출고량, 현재재고량 계산
      const summaryMap = new Map();
      
      historyData.forEach(item => {
        const key = item.materialName;
        if (!summaryMap.has(key)) {
          summaryMap.set(key, { 
            materialName: key, 
            inQty: 0, 
            outQty: 0,
            currentStock: 0  // 현재 재고량 추가
          });
        }
        
        const summary = summaryMap.get(key);
        const qty = parseFloat(item.changeQty) || 0;
        
        if (item.inOutType === 'IN') {
          summary.inQty += qty;
        } else if (item.inOutType === 'OUT') {
          summary.outQty += Math.abs(qty);
        }
        
        // 현재 재고량은 입고량 - 출고량
        summary.currentStock = summary.inQty - summary.outQty;
      });
      
      // 차트 데이터 형식으로 변환
      const processedChartData = Array.from(summaryMap.values())
        .map(summary => ({
          name: summary.materialName,
          '입고량': summary.inQty,
          '출고량': summary.outQty,
          '현재재고량': summary.currentStock  // 현재 재고량 추가
        }))
        .sort((a, b) => b['입고량'] - a['입고량']); // 입고량 기준 내림차순 정렬

      // 2. 그리드 데이터 생성 (상세 이력에 고유 ID 추가)
      const processedGridData = historyData.map((item, index) => ({
        ...item,
        id: `${item.materialName}-${item.createDate}-${index}`,
        changeQty: parseFloat(item.changeQty) || 0,
        currentQty: parseFloat(item.currentQty) || 0
      }))
      .sort((a, b) => new Date(b.createDate) - new Date(a.createDate)); // 날짜 기준 내림차순 정렬

      console.log('Processed Grid Data:', processedGridData);
      console.log('Processed Chart Data:', processedChartData);
      // --- 데이터 가공 종료 ---

      // 짧은 지연 후 상태 업데이트 (UI 반응성 개선)
      await new Promise(resolve => setTimeout(resolve, 300)); 
      setReportData(processedGridData);
      setChartData(processedChartData);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error fetching or processing report data:', error);
      setReportData([]);
      setChartData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 초기 로드 시 검색 실행
  useEffect(() => {
    handleSearch(getValues()); 
  }, [handleSearch, getValues]);

  const handleReset = useCallback(() => {
    reset({
      movementDateRange: [null, null],
      systemMaterialIds: [], // 리셋 시 선택된 제품 ID 배열도 초기화
      inOutType: '', 
      warehouseName: '', 
      supplierName: '', 
      manufacturerName: '', 
      unit: '',
    }); 
    setReportData([]);
    setChartData([]);
    setRefreshKey(prev => prev + 1);
  }, [reset]);

  const handleDateRangeChange = useCallback((newValue) => {
    if(newValue && Array.isArray(newValue)) {
      setValue('movementDateRange', newValue); 
    }
    console.log('Date range changed in hook:', newValue);
  }, [setValue]);

  return {
    control,
    handleSubmit,
    reset,
    setValue,
    handleDateRangeChange,
    handleReset,
    handleSearch,
    isLoading,
    reportData,
    chartData,
    refreshKey,
  };
};

// =====================================================================
// 입출고 현황 검색 폼 컴포넌트
// =====================================================================
const SearchForm = ({ control, handleDateRangeChange }) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
      <Grid container spacing={2} alignItems="center">
        {/* 날짜 범위 필드 */} 
        <Grid item xs={12} sm={12} md={12}> {/* 전체 너비 사용 */} 
          <Controller
            name="movementDateRange"
            control={control}
            defaultValue={[null, null]} // 기본값 배열로 설정
            render={({ field }) => (
              <DateRangePicker
                  startDate={field.value?.[0]}
                  endDate={field.value?.[1]}
                  onRangeChange={(startDate, endDate) => {
                      field.onChange([startDate, endDate]); 
                      if (handleDateRangeChange) {
                        handleDateRangeChange([startDate, endDate]);
                      }
                  }}
                  startLabel="시작일"
                  endLabel="종료일"
                  label="입출고일자"
                  size="small"
              />
            )}
          />
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
};

// =====================================================================
// 입출고 현황 차트 컴포넌트
// =====================================================================
const InventoryMovementChart = ({ data, highlightedMaterial, onBarMouseOver, onBarMouseOut }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const inColor = theme.palette.success.main;
  const outColor = theme.palette.error.main;
  const stockColor = theme.palette.info.main; // 현재재고량 색상
  const axisColor = isDarkMode ? theme.palette.grey[400] : theme.palette.text.secondary;

  // 데이터가 없는 경우 체크
  if (!data || data.length === 0) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        color: axisColor
      }}>
        표시할 데이터가 없습니다
      </div>
    );
  }

  // 동적 차트 너비 계산
  const itemWidth = 80; // 각 X축 항목이 차지할 대략적인 너비 (px). 이 값을 조절하여 한 화면에 보이는 항목 수를 변경할 수 있습니다.
  const calculatedMinWidthForScroll = data.length * itemWidth;

  // 바 렌더링 커스터마이징 - 하이라이트 적용
  const getBarProps = (entry, dataKey) => {
    if (highlightedMaterial && entry.name === highlightedMaterial) {
      return {
        fill: dataKey === '입고량' ? inColor : dataKey === '출고량' ? outColor : stockColor,
        fillOpacity: 1
      };
    }
    return {
      fill: dataKey === '입고량' ? inColor : dataKey === '출고량' ? outColor : stockColor,
      fillOpacity: highlightedMaterial ? 0.4 : 1
    };
  };

  // 커스텀 툴팁 포맷팅
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      if (onBarMouseOver && label) {
        onBarMouseOver(label);
      }
      
      return (
        <div style={{
          backgroundColor: isDarkMode ? '#2D3748' : '#FFFFFF',
          padding: '10px',
          border: '1px solid',
          borderColor: isDarkMode ? '#4A5568' : '#E2E8F0',
          borderRadius: '4px',
          fontSize: '12px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <p style={{
            color: isDarkMode ? '#FFFFFF' : '#2D3748',
            fontWeight: 'bold',
            margin: '0 0 5px 0',
            borderBottom: '1px solid',
            borderColor: isDarkMode ? '#4A5568' : '#E2E8F0',
            paddingBottom: '3px'
          }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={`tooltip-${index}`} style={{
              color: entry.dataKey === '입고량' ? inColor : entry.dataKey === '출고량' ? outColor : stockColor,
              margin: '3px 0',
              fontWeight: 'bold'
            }}>
              {entry.name}: {entry.value.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 2})}
            </p>
          ))}
        </div>
      );
    }
    
    if (!active && onBarMouseOut) {
      onBarMouseOut();
    }
    
    return null;
  };

  return (
    // 1. 외부 Box: 스크롤 컨테이너 역할. 부모로부터 높이를 100% 받음.
    <Box sx={{ width: '100%', height: '100%', overflowX: 'auto', overflowY: 'hidden' }}>
      {/* 
        Inner Box: 
        - Tries to be 100% of the scrollable parent's width.
        - But will not be smaller than calculatedMinWidthForScroll, ensuring all content is potentially visible via scroll.
      */}
      <Box sx={{ width: '100%', minWidth: `${calculatedMinWidthForScroll}px`, height: '100%' }}>
        <ResponsiveContainer width="100%" height="100%"> {/* Fills the inner Box */}
          <BarChart
            data={data}
            margin={{ top: 10, right: 30, left: 20, bottom: 40 }} // X축 레이블 공간 확보를 위해 bottom margin 증가
            barGap={0} // 같은 카테고리 내 바 사이 간격
            barCategoryGap="30%" // X축 카테고리 그룹 사이 간격 (항목 밀집도 조절)
          >
            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? theme.palette.grey[700] : theme.palette.grey[300]} />
            <XAxis
              dataKey="name"
              tick={{ fill: axisColor, fontSize: 11 }}
              tickLine={{ stroke: axisColor }}
              height={60} // X축 높이 증가 (레이블이 길거나 여러 줄일 경우 대비)
              interval={0} // 모든 틱(레이블) 표시
              tickFormatter={(value) => value.length > 10 ? `${value.substring(0, 10)}...` : value} // 긴 레이블 자르기
            />
            <YAxis
              tick={{ fill: axisColor, fontSize: 11 }}
              tickLine={{ stroke: axisColor }}
              tickFormatter={(value) => value.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 1})}
              width={50}
            >
              <Label
                value="수량"
                angle={-90}
                position="insideLeft"
                fill={axisColor}
                fontSize={12}
                dx={-10}
              />
            </YAxis>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{
                fontSize: '12px',
                paddingTop: '5px', // 레전드와 차트 사이 간격
                bottom: 0 // 레전드를 차트 하단에 위치
              }}
              iconType="square"
            />
            <Bar
              dataKey="입고량"
              name="입고량"
              barSize={20} // 바의 두께
              fill={inColor}
              isAnimationActive={false}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-in-${index}`}
                  {...getBarProps(entry, '입고량')}
                  onMouseOver={() => onBarMouseOver && onBarMouseOver(entry.name)}
                  onMouseOut={() => onBarMouseOut && onBarMouseOut()}
                />
              ))}
            </Bar>
            <Bar
              dataKey="출고량"
              name="출고량"
              barSize={20}
              fill={outColor}
              isAnimationActive={false}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-out-${index}`}
                  {...getBarProps(entry, '출고량')}
                  onMouseOver={() => onBarMouseOver && onBarMouseOver(entry.name)}
                  onMouseOut={() => onBarMouseOut && onBarMouseOut()}
                />
              ))}
            </Bar>
            <Bar
              dataKey="현재재고량"
              name="현재재고량"
              barSize={20}
              fill={stockColor}
              isAnimationActive={false}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-stock-${index}`}
                  {...getBarProps(entry, '현재재고량')}
                  onMouseOver={() => onBarMouseOver && onBarMouseOver(entry.name)}
                  onMouseOut={() => onBarMouseOut && onBarMouseOut()}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

// =====================================================================
// 입출고 현황 리포트 정의 (EnhancedDataGridWrapper용)
// =====================================================================
const InventoryMovementReport = (props) => {
  const columns = [
    { field: 'id', headerName: 'ID', width: 70, hide: true },
    { field: 'materialName', headerName: '자재명', width: 250 },
    { field: 'openingStock', headerName: '기초재고', width: 120, type: 'number', align: 'right', headerAlign: 'right' },
    { field: 'inQty', headerName: '입고수량', width: 120, type: 'number', align: 'right', headerAlign: 'right' },
    { field: 'outQty', headerName: '출고수량', width: 120, type: 'number', align: 'right', headerAlign: 'right' },
    { field: 'currentStock', headerName: '현재고', width: 120, type: 'number', align: 'right', headerAlign: 'right' },
  ];

  const defaultGridProps = {
    initialState: {
      columns: {
        columnVisibilityModel: { id: false },
      },
      sorting: {
        sortModel: [{ field: 'materialName', sort: 'asc' }],
      },
    },
    ...props.gridProps
  };

  return null;
};

// 리포트 컬럼과 그리드 속성 내보내기
export const inventoryMovementColumns = InventoryMovementReport.columns;
export const inventoryMovementGridProps = InventoryMovementReport.defaultGridProps;

// =====================================================================
// 메인 컴포넌트: 입출고 현황
// =====================================================================
const InventoryMovement = (props) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const { executeQuery, executeMutation } = useGraphQL();
  // 강조 표시를 위한 상태 추가
  const [highlightedMaterial, setHighlightedMaterial] = useState(null);

  // 자재 데이터 관련 훅
  const {
    materials,
    isLoading: isMaterialLoading,
    getCategoriesByType,
    getMaterialsByTypeAndCategory,
    getMaterialById,
    refresh: refreshMaterialData
  } = useMaterialData(executeQuery);

  // materialData 객체 생성
  const materialData = {
    materials,
    getCategoriesByType,
    getMaterialsByTypeAndCategory,
    getMaterialById
  };

  // 다중 자재 선택 기능
  const [materialSelectModal, setMaterialSelectModal] = useState({
    open: false,
    materialType: '',
    materialCategory: '',
    materials: [],
    filteredMaterials: [],
    selectedMaterials: [], // 다중 선택을 위한 배열
  });

  // 선택된 자재 목록 (검색 조건에 사용)
  const [selectedSearchMaterials, setSelectedSearchMaterials] = useState([]);

  const {
    control,
    handleSubmit,
    reset,
    handleDateRangeChange,
    handleReset: originalHandleReset,
    handleSearch: originalHandleSearch,
    isLoading,
    chartData,
    refreshKey,
    reportData: fetchedReportData
  } = useInventoryMovement(props.tabId);

  const [receivingList, setReceivingList] = useState([]);

  useEffect(() => {
    if (fetchedReportData) {
      setReceivingList(fetchedReportData);
    }
  }, [fetchedReportData]);

  // 컴포넌트 마운트 시 자재 데이터 로드
  useEffect(() => {
    if (refreshMaterialData) {
      refreshMaterialData();
    }
  }, [refreshMaterialData]);

  const getTextColor = useCallback(() => isDarkMode ? '#fff' : 'rgba(0, 0, 0, 0.87)', [isDarkMode]);
  const getBgColor = useCallback(() => isDarkMode ? 'rgba(255, 255, 255, 0.08)' : '#f5f5f5', [isDarkMode]);
  const getBorderColor = useCallback(() => isDarkMode ? 'rgba(255, 255, 255, 0.12)' : '#e0e0e0', [isDarkMode]);

  // 제품 선택 모달 열기
  const handleOpenMaterialSelect = () => {
    setMaterialSelectModal(prev => ({
      ...prev,
      open: true
    }));
  };

  // 제품 선택 모달 닫기
  const handleCloseMaterialSelect = () => {
    setMaterialSelectModal(prev => ({
      ...prev,
      open: false
    }));
  };

  // 제품 타입 변경 시
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
      selectedMaterials: [] // 타입 변경 시 선택 초기화
    }));
  };

  // 제품 카테고리 변경 시
  const handleCategoryChange = (event) => {
    const materialCategory = event.target.value;
    const filteredMaterials = materialCategory
      ? materialData.getMaterialsByTypeAndCategory(materialSelectModal.materialType, materialCategory)
      : materialSelectModal.materials;

    setMaterialSelectModal(prev => ({
      ...prev,
      materialCategory,
      filteredMaterials,
      selectedMaterials: [] // 카테고리 변경 시 선택 초기화
    }));
  };

  // 체크박스 토글
  const handleToggleMaterial = (material) => {
    setMaterialSelectModal(prev => {
      const currentIndex = prev.selectedMaterials.findIndex(m => m.systemMaterialId === material.systemMaterialId);
      const newSelected = [...prev.selectedMaterials];
      
      if (currentIndex === -1) {
        newSelected.push(material);
      } else {
        newSelected.splice(currentIndex, 1);
      }
      
      return {
        ...prev,
        selectedMaterials: newSelected
      };
    });
  };

  // 선택 완료
  const handleComplete = () => {
    if (materialSelectModal.selectedMaterials.length === 0) {
      handleCloseMaterialSelect();
      setTimeout(() => {
        Message.showWarning('최소한 하나의 제품을 선택해주세요.');
      }, 200);
      return;
    }

    setSelectedSearchMaterials(materialSelectModal.selectedMaterials);
    handleCloseMaterialSelect();
    // Message.showSuccess(`${materialSelectModal.selectedMaterials.length}개의 제품이 선택되었습니다.`);
  };

  // 검색 조건에서 제품 제거
  const handleRemoveMaterial = (materialId) => {
    setSelectedSearchMaterials(prev => prev.filter(m => m.systemMaterialId !== materialId));
  };

  // 검색 핸들러 - 선택된 제품 ID 추가
  const handleSearch = (data) => {
    // 선택된 제품이 있는 경우만 materialNames 배열 추가
    const searchParams = {
      ...data,
    };
    
    // systemMaterialIds 필드는 더 이상 필요없음
    delete searchParams.systemMaterialIds;
    
    // 선택된 제품이 있는 경우에만 materialNames 추가 (제품 이름 사용)
    if (selectedSearchMaterials.length > 0) {
      // materialName(제품 이름)을 사용 - systemMaterialId(제품 ID) 대신
      searchParams.materialNames = selectedSearchMaterials.map(m => m.materialName);
    }
    
    console.log('검색 파라미터:', searchParams);
    originalHandleSearch(searchParams);
  };

  // 리셋 핸들러 - 선택된 제품도 초기화
  const handleReset = () => {
    originalHandleReset();
    setSelectedSearchMaterials([]);
  };

  const searchFormItems = SearchForm({ control, handleDateRangeChange });

  // 이 부분이 변경되었습니다 - 4개 컬럼만 표시
  const receivingColumns = [
    { field: 'materialName', 
      headerName: '자재명', 
      width: 100,
      headerAlign: 'center',
      align: 'left',
      editable: false,
      flex: 1,
    },
    { field: 'inOutType', 
      headerName: '입출고유형', 
      width: 70,
      headerAlign: 'center',
      align: 'center',
      editable: false,
      renderCell: (params) => {
        const raw = params.row?.inOutType;
        let text = '';
        let color = '';
      
        if (raw === 'IN') {
          text = '입고';
          color = theme.palette.success.main;
        } else if (raw === 'OUT') {
          text = '출고';
          color = theme.palette.error.main;
        }
      
        return (
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%', 
              width: '100%' 
            }}
          >
            <Typography sx={{ color, fontWeight: 'bold', fontSize: '13px' }}>
              {text}
            </Typography>
          </Box>
        );
      },
    },
    { field: 'changeQty', 
      headerName: '변동수량',
      width: 70,
      type: 'number',
      headerAlign: 'center',
      align: 'right',
      editable: false,
      renderCell: (params) => {
        const value = params.value;
        const color = value > 0 ? theme.palette.success.main : value < 0 ? theme.palette.error.main : 'inherit';
    
        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              height: '100%',
              width: '100%',
              pr: 1
            }}
          >
            <Typography sx={{ color, fontWeight: '' }}>
              {parseFloat(value).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})}
            </Typography>
          </Box>
        );
      },
    },
    { field: 'createDate', 
      headerName: '변동일자', 
      width: 160, 
      headerAlign: 'center', 
      align: 'center', 
      editable: false, 
      renderCell: (params) => {
        const raw = params.row?.createDate;
        if (!raw) return '';
        return raw.replace('T', ' ');
      },
    },
  ];

  return (
    <Box sx={{ p: 2, minHeight: 'calc(100vh - 64px)' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, borderBottom: `1px solid ${getBorderColor()}`, pb: 1 }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 600, color: getTextColor() }}>
          레포트 - 입출고 현황
        </Typography>
        <IconButton onClick={() => setIsHelpModalOpen(true)} sx={{ ml: 1, color: theme.palette.primary.main }}>
          <HelpOutlineIcon />
        </IconButton>
      </Box>

      <SearchCondition onSearch={handleSubmit(handleSearch)} onReset={handleReset}>
        {searchFormItems}
        
        {/* 제품 선택 버튼 */}
        <Grid item xs={12} md={12} mt={0}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleOpenMaterialSelect}
              disabled={isMaterialLoading}
            >
              {isMaterialLoading ? '자재 로딩중...' : '제품 선택'}
            </Button>
            
            {/* 선택된 제품 표시 영역 */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, overflow: 'auto', maxHeight: '60px', flex: 1 }}>
              {selectedSearchMaterials.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>
                  모든 제품
                </Typography>
              ) : (
                selectedSearchMaterials.map((material) => (
                  <Chip
                    key={material.systemMaterialId}
                    label={`${material.materialName} (${material.userMaterialId || ''})`}
                    size="small"
                    onDelete={() => handleRemoveMaterial(material.systemMaterialId)}
                  />
                ))
              )}
            </Box>
          </Box>
        </Grid>
      </SearchCondition>

      <Grid container spacing={2} mt={0}>
        <Grid item xs={12} md={12}>
          <Box sx={{ height: 300, bgcolor: getBgColor(), borderRadius: 1, p: 2, border: `1px solid ${getBorderColor()}` }}>
            <Typography variant="h6" sx={{ mb: 2, color: getTextColor() }}>품목별 입출고량 및 현재재고</Typography>
            {!isLoading && chartData && chartData.length > 0 ? (
              <InventoryMovementChart 
                data={chartData} 
                highlightedMaterial={highlightedMaterial}
                onBarMouseOver={(materialName) => setHighlightedMaterial(materialName)}
                onBarMouseOut={() => setHighlightedMaterial(null)}
              />
            ) : (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <Typography sx={{ color: getTextColor() }}>{isLoading ? '차트 로딩 중...' : '데이터 없음'}</Typography>
              </Box>
            )}
          </Box>
        </Grid>

        <Grid item xs={12} md={12} mt={3}>
          <EnhancedDataGridWrapper
            title="입출고 현황"
            key={refreshKey}
            rows={receivingList}
            columns={receivingColumns}
            loading={isLoading}
            buttons={[]}
            height={500}
            tabId={props.tabId + "-grid"}
            gridProps={{
              autoHeight: false,
              sx: {
                '& .MuiDataGrid-cell': {
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                },
                // 강조 행 스타일 추가
                '& .highlighted-row': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.15),
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.25),
                  }
                }
              },
              pagination: true,
              paginationMode: 'client',
              pageSizeOptions: [5, 10, 20, 50],
              initialState: {
                sorting: {
                  sortModel: [{ field: 'createDate', sort: 'desc' }],
                },
                pagination: {
                  paginationModel: { pageSize: 10, page: 0 },
                },
              },
              density: 'standard',
              paginationPosition: 'bottom',
              paginationModel: {
                pageSize: 10,
                page: 0
              },
              onPaginationModelChange: () => {},
              disableRowSelectionOnClick: true,
              rowsPerPageOptions: [5, 10, 20, 50],
              showFooter: true,
              getRowClassName: (params) => {
                if (highlightedMaterial && params.row.materialName === highlightedMaterial) {
                  return 'highlighted-row';
                }
                return '';
              },
              onRowMouseEnter: (params) => {
                setHighlightedMaterial(params.row.materialName);
              },
              onRowMouseLeave: () => {
                setHighlightedMaterial(null);
              }
            }}
          />
        </Grid>
      </Grid>

      <HelpModal open={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} title="입출고 현황 도움말">
        <Typography component="div" color={getTextColor()} paragraph>
          • 설정된 기간 동안의 품목별 입고 수량, 출고 수량, 현재 재고 잔량을 조회합니다.
        </Typography>
      </HelpModal>

      {/* 다중 제품 선택 모달 - 이 부분이 수정되었습니다 */}
      <Dialog
        open={materialSelectModal.open}
        onClose={handleCloseMaterialSelect}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>제품 다중 선택</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
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
                <MenuItem value="COMPLETE_PRODUCT">완제품</MenuItem>
              </Select>
            </FormControl>

            {/* <FormControl fullWidth disabled={!materialSelectModal.materialType}>
              <InputLabel>제품 유형</InputLabel>
              <Select
                value={materialSelectModal.materialCategory}
                onChange={handleCategoryChange}
                label="제품 유형"
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
            </FormControl> */}

            {/* 제품 목록 체크박스 */}
            <Box sx={{ mt: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, maxHeight: '300px', overflow: 'auto' }}>
              <List dense>
                {materialSelectModal.filteredMaterials.length > 0 ? (
                  materialSelectModal.filteredMaterials.map((material) => (
                    <ListItem 
                      key={material.systemMaterialId} 
                      button
                      onClick={() => handleToggleMaterial(material)}
                      dense
                    >
                      <ListItemIcon>
                        <Checkbox
                          edge="start"
                          checked={materialSelectModal.selectedMaterials.some(m => m.systemMaterialId === material.systemMaterialId)}
                          tabIndex={-1}
                          disableRipple
                        />
                      </ListItemIcon>
                      <ListItemText 
                        primary={material.materialName} 
                        secondary={`${material.userMaterialId || ''} | ${material.materialStandard || ''} | ${material.unit || ''}`}
                      />
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="표시할 제품이 없습니다" />
                  </ListItem>
                )}
              </List>
            </Box>

            <Typography variant="body2" align="right">
              선택된 제품: {materialSelectModal.selectedMaterials.length}개
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMaterialSelect}>취소</Button>
          <Button onClick={handleComplete} variant="contained">선택 완료</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// 내보내기
export default InventoryMovement; 