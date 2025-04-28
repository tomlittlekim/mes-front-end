import React, { useCallback, useState, useEffect } from 'react';
import { Box, IconButton, Stack, Typography, useTheme, alpha, Grid, Button, Chip, FormControl, InputLabel, MenuItem, Select, List, ListItem, ListItemIcon, Checkbox, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HelpModal from '../../Common/HelpModal';
import { SearchCondition, EnhancedDataGridWrapper } from '../../Common';
import { useGraphQL } from '../../../apollo/useGraphQL';
import Message from "../../../utils/message/Message";
import { useForm, Controller } from 'react-hook-form';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label, Cell, ComposedChart } from 'recharts';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ko from "date-fns/locale/ko"; 
import DateRangePicker from '../../Common/DateRangePicker';
import { GRAPHQL_URL } from '../../../config';

// =====================================================================
// GraphQL 쿼리 정의
// =====================================================================
const PLAN_VS_ACTUAL_QUERY = `
  query planVsActual($filter: PlanVsActualFilter) {
    planVsActual(filter: $filter) {
      prodPlanId
      planQty
      totalOrderQty
      completedOrderQty
      achievementRate
      materialName
      systemMaterialId
    }
  }
`;

const GET_MATERIALS_QUERY = `
  query getMaterialNameAndSysId {
    getMaterialNameAndSysId {
      systemMaterialId
      materialName
    }
  }
`;

// =====================================================================
// 커스텀 훅: usePlanVsActual
// =====================================================================
export const usePlanVsActual = (tabId) => {
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [materialList, setMaterialList] = useState([]);

  const { control, handleSubmit, reset, setValue, getValues } = useForm({
    defaultValues: {
      dateRange: [null, null],
      systemMaterialIds: [], // 선택된 자재 ID 배열
    },
  });

  // 자재 목록 로드
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const response = await fetch(GRAPHQL_URL, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: GET_MATERIALS_QUERY
          })
        });
        
        const result = await response.json();
        
        if (result.errors) {
          console.error('GraphQL Error:', result.errors);
        } else if (result.data && result.data.getMaterialNameAndSysId) {
          setMaterialList(result.data.getMaterialNameAndSysId);
        }
      } catch (error) {
        console.error('Error fetching materials:', error);
      }
    };
    
    fetchMaterials();
  }, []);

  const handleSearch = useCallback(async (formData) => {
    console.log('Search Params:', formData);
    setIsLoading(true);
    setReportData([]);
    setChartData([]);
    try {
      // API 파라미터 설정
      const filter = {
        startDate: formData.dateRange?.[0] ? new Date(formData.dateRange[0]).toISOString().split('T')[0] : null,
        endDate: formData.dateRange?.[1] ? new Date(formData.dateRange[1]).toISOString().split('T')[0] : null,
        
        // systemMaterialIds 필드는 항상 포함 (필수 파라미터이므로)
        systemMaterialIds: formData.systemMaterialIds || []
      };
      
      console.log('API Params:', filter);

      const response = await fetch(GRAPHQL_URL, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: PLAN_VS_ACTUAL_QUERY,
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

      const planVsActualData = result.data?.planVsActual;
      if (!planVsActualData || planVsActualData.length === 0) {
        console.warn('No plan vs actual data found.');
        setReportData([]);
        setChartData([]);
        setIsLoading(false);
        return;
      }
      
      console.log('Fetched Plan vs Actual Data:', planVsActualData);

      // --- 데이터 가공 로직 ---
      // 1. 차트 데이터 생성 - 품목별 계획수량, 지시수량, 완료수량 계산
      const summaryMap = new Map();
      
      planVsActualData.forEach(item => {
        const key = item.materialName;
        if (!summaryMap.has(key)) {
          summaryMap.set(key, { 
            name: key, 
            '계획수량': 0, 
            '지시수량': 0,
            '완료수량': 0
          });
        }
        
        const summary = summaryMap.get(key);
        summary['계획수량'] += parseFloat(item.planQty) || 0;
        summary['지시수량'] += parseFloat(item.totalOrderQty) || 0;
        summary['완료수량'] += parseFloat(item.completedOrderQty) || 0;
      });
      
      // 차트 데이터 형식으로 변환
      const processedChartData = Array.from(summaryMap.values())
        .sort((a, b) => b['계획수량'] - a['계획수량']); // 계획수량 기준 내림차순 정렬

      // 2. 그리드 데이터 생성
      const processedGridData = planVsActualData.map((item, index) => ({
        id: `${item.prodPlanId}-${index}`,
        prodPlanId: item.prodPlanId,
        materialName: item.materialName,
        systemMaterialId: item.systemMaterialId,
        planQty: parseFloat(item.planQty) || 0,
        orderQty: parseFloat(item.totalOrderQty) || 0,
        completedQty: parseFloat(item.completedOrderQty) || 0,
        remainingQty: (parseFloat(item.planQty) || 0) - (parseFloat(item.completedOrderQty) || 0),
        achievementRate: parseFloat(item.achievementRate) || 0
      }));

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
      dateRange: [null, null],
      systemMaterialIds: [], // 리셋 시 선택된 자재 ID 배열도 초기화
    }); 
    setReportData([]);
    setChartData([]);
    setRefreshKey(prev => prev + 1);
  }, [reset]);

  const handleDateRangeChange = useCallback((newValue) => {
    if(newValue && Array.isArray(newValue)) {
      setValue('dateRange', newValue); 
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
    materialList
  };
};

// =====================================================================
// 계획대비 실적 검색 폼 컴포넌트
// =====================================================================
const SearchForm = ({ control, handleDateRangeChange }) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
      <Grid container spacing={2} alignItems="center">
        {/* 날짜 범위 필드 */} 
        <Grid item xs={12} sm={12} md={12}> {/* 전체 너비 사용 */} 
          <Controller
            name="dateRange"
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
                  label="조회기간"
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
// 계획대비 실적 차트 컴포넌트
// =====================================================================
const PlanVsActualChart = ({ data, highlightedMaterial, onBarMouseOver, onBarMouseOut }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const planColor = theme.palette.primary.main;
  const orderColor = theme.palette.warning.main;
  const completedColor = theme.palette.success.main;
  const achievementColor = '#4ade80'; // 밝은 녹색으로 달성률 색상 변경
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

  // 바 렌더링 커스터마이징 - 하이라이트 적용
  const getBarProps = (entry, dataKey) => {
    if (highlightedMaterial && entry.name === highlightedMaterial) {
      return {
        fill: dataKey === '계획수량' ? planColor : dataKey === '지시수량' ? orderColor : dataKey === '완료수량' ? completedColor : achievementColor,
        fillOpacity: 1
      };
    }
    return {
      fill: dataKey === '계획수량' ? planColor : dataKey === '지시수량' ? orderColor : dataKey === '완료수량' ? completedColor : achievementColor,
      fillOpacity: highlightedMaterial ? 0.4 : 1
    };
  };

  // 커스텀 툴팁 포맷팅
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      // 툴팁이 활성화될 때 해당 자재명으로 마우스오버 이벤트 호출
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
              color: entry.dataKey === '계획수량' ? planColor 
                : entry.dataKey === '지시수량' ? orderColor 
                : entry.dataKey === '완료수량' ? completedColor 
                : achievementColor, 
              margin: '3px 0',
              fontWeight: 'bold'
            }}>
              {entry.name}: {entry.dataKey === '달성률' 
                ? `${entry.value.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})}%` 
                : entry.value.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 1})}
            </p>
          ))}
        </div>
      );
    }
    
    // 툴팁이 비활성화될 때 마우스아웃 이벤트 호출
    if (!active && onBarMouseOut) {
      onBarMouseOut();
    }
    
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={data}
        margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
        barGap={0}
        barCategoryGap={30}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? theme.palette.grey[700] : theme.palette.grey[300]} />
        <XAxis 
          dataKey="name" 
          tick={{ fill: axisColor, fontSize: 11 }} 
          tickLine={{ stroke: axisColor }}
          height={50}
          interval={0}
          tickFormatter={(value) => value.length > 10 ? `${value.substring(0, 10)}...` : value}
        />
        <YAxis 
          yAxisId="left"
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
        <YAxis 
          yAxisId="right"
          orientation="right"
          domain={[0, 100]}
          tick={{ fill: axisColor, fontSize: 11 }} 
          tickLine={{ stroke: axisColor }}
          tickFormatter={(value) => `${value}%`}
          width={50}
        >
          <Label 
            value="달성률(%)" 
            angle={90} 
            position="insideRight" 
            fill={axisColor} 
            fontSize={12} 
            dx={10}
          />
        </YAxis>
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          wrapperStyle={{ 
            fontSize: '12px', 
            paddingTop: '5px',
            bottom: 0
          }} 
          iconType="square"
        />
        <Bar 
          yAxisId="left"
          dataKey="계획수량" 
          name="계획수량" 
          barSize={20}
          fill={planColor}
          isAnimationActive={false}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-plan-${index}`} 
              {...getBarProps(entry, '계획수량')}
              onMouseOver={() => onBarMouseOver && onBarMouseOver(entry.name)}
              onMouseOut={() => onBarMouseOut && onBarMouseOut()}
            />
          ))}
        </Bar>
        <Bar 
          yAxisId="left"
          dataKey="지시수량" 
          name="지시수량" 
          barSize={20}
          fill={orderColor}
          isAnimationActive={false}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-order-${index}`} 
              {...getBarProps(entry, '지시수량')}
              onMouseOver={() => onBarMouseOver && onBarMouseOver(entry.name)}
              onMouseOut={() => onBarMouseOut && onBarMouseOut()}
            />
          ))}
        </Bar>
        <Bar 
          yAxisId="left"
          dataKey="완료수량" 
          name="완료수량" 
          barSize={20}
          fill={completedColor}
          isAnimationActive={false}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-completed-${index}`} 
              {...getBarProps(entry, '완료수량')}
              onMouseOver={() => onBarMouseOver && onBarMouseOver(entry.name)}
              onMouseOut={() => onBarMouseOut && onBarMouseOut()}
            />
          ))}
        </Bar>
        <Bar 
          yAxisId="right"
          dataKey="달성률" 
          name="달성률(%)" 
          barSize={20}
          fill={achievementColor}
          isAnimationActive={false}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-achievement-${index}`} 
              {...getBarProps(entry, '달성률')}
              onMouseOver={() => onBarMouseOver && onBarMouseOver(entry.name)}
              onMouseOut={() => onBarMouseOut && onBarMouseOut()}
            />
          ))}
        </Bar>
      </ComposedChart>
    </ResponsiveContainer>
  );
};

// =====================================================================
// 메인 컴포넌트: 계획대비 실적조회
// =====================================================================
const PlanVsActualCombined = (props) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  
  // 강조 표시를 위한 상태 추가
  const [highlightedMaterial, setHighlightedMaterial] = useState(null);

  // 자재 선택 모달
  const [materialSelectModal, setMaterialSelectModal] = useState({
    open: false,
    searchText: '',
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
    reportData,
    chartData,
    refreshKey,
    materialList
  } = usePlanVsActual(props.tabId);

  const getTextColor = useCallback(() => isDarkMode ? '#fff' : 'rgba(0, 0, 0, 0.87)', [isDarkMode]);
  const getBgColor = useCallback(() => isDarkMode ? 'rgba(255, 255, 255, 0.08)' : '#f5f5f5', [isDarkMode]);
  const getBorderColor = useCallback(() => isDarkMode ? 'rgba(255, 255, 255, 0.12)' : '#e0e0e0', [isDarkMode]);

  // 자재 선택 모달 열기
  const handleOpenMaterialSelect = () => {
    setMaterialSelectModal(prev => ({
      ...prev,
      open: true,
      selectedMaterials: [...selectedSearchMaterials]
    }));
  };

  // 자재 선택 모달 닫기
  const handleCloseMaterialSelect = () => {
    setMaterialSelectModal(prev => ({
      ...prev,
      open: false,
      searchText: ''
    }));
  };

  // 자재 검색 텍스트 변경 핸들러
  const handleSearchTextChange = (e) => {
    setMaterialSelectModal(prev => ({
      ...prev,
      searchText: e.target.value
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
      Message.showWarning('최소한 하나의 자재를 선택해주세요.');
      return;
    }

    setSelectedSearchMaterials(materialSelectModal.selectedMaterials);
    handleCloseMaterialSelect();
  };

  // 검색 조건에서 자재 제거
  const handleRemoveMaterial = (materialId) => {
    setSelectedSearchMaterials(prev => prev.filter(m => m.systemMaterialId !== materialId));
  };

  // 검색 핸들러 - 선택된 자재 ID 추가
  const handleSearch = (data) => {
    const searchParams = {
      ...data,
      // systemMaterialIds 필드는 항상 포함시킴 (필수 파라미터)
      systemMaterialIds: selectedSearchMaterials.length > 0 
        ? selectedSearchMaterials.map(m => m.systemMaterialId)
        : []
    };
    
    console.log('검색 파라미터:', searchParams);
    originalHandleSearch(searchParams);
  };

  // 리셋 핸들러 - 선택된 자재도 초기화
  const handleReset = () => {
    originalHandleReset();
    setSelectedSearchMaterials([]);
  };

  // 필터링된 자재 목록
  const filteredMaterials = materialList.filter(material => {
    if (!materialSelectModal.searchText) return true;
    
    const searchText = materialSelectModal.searchText.toLowerCase();
    return (
      material.materialName.toLowerCase().includes(searchText) ||
      material.systemMaterialId.toLowerCase().includes(searchText)
    );
  });

  const searchFormItems = SearchForm({ control, handleDateRangeChange });

  // 그리드 컬럼 정의
  const planVsActualColumns = [
    { 
      field: 'materialName', 
      headerName: '제품명', 
      width: 180, 
      headerAlign: 'center', 
      align: 'left',
      editable: false,
      flex: 1,
    },
    { 
      field: 'prodPlanId', 
      headerName: '계획ID', 
      width: 120, 
      headerAlign: 'center', 
      align: 'center', 
      editable: false,
    },
    { 
      field: 'planQty', 
      headerName: '계획수량', 
      width: 90, 
      headerAlign: 'center', 
      align: 'right', 
      editable: false,
      renderCell: (params) => {
        const value = params.value;
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
            <Typography>
              {parseFloat(value).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 1})}
            </Typography>
          </Box>
        );
      },
    },
    { 
      field: 'orderQty', 
      headerName: '지시수량', 
      width: 90, 
      headerAlign: 'center', 
      align: 'right', 
      editable: false,
      renderCell: (params) => {
        const value = params.value;
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
            <Typography>
              {parseFloat(value).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 1})}
            </Typography>
          </Box>
        );
      },
    },
    { 
      field: 'completedQty', 
      headerName: '완료수량', 
      width: 90, 
      headerAlign: 'center', 
      align: 'right', 
      editable: false,
      renderCell: (params) => {
        const value = params.value;
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
            <Typography>
              {parseFloat(value).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 1})}
            </Typography>
          </Box>
        );
      },
    },
    { 
      field: 'remainingQty', 
      headerName: '잔여수량', 
      width: 90, 
      headerAlign: 'center', 
      align: 'right', 
      editable: false,
      renderCell: (params) => {
        const value = params.value;
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
            <Typography>
              {parseFloat(value).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 1})}
            </Typography>
          </Box>
        );
      },
    },
    { 
      field: 'achievementRate', 
      headerName: '달성률(%)', 
      width: 100, 
      headerAlign: 'center', 
      align: 'right', 
      editable: false,
      renderCell: (params) => {
        const value = parseFloat(params.value);
        let color = theme.palette.text.primary;
        
        if (value >= 100) {
          color = theme.palette.success.main;
        } else if (value < 80) {
          color = theme.palette.error.main;
        } else if (value < 100) {
          color = theme.palette.warning.main;
        }
        
        return (
          <Box 
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              height: '100%',
              width: '100%',
              pr: 1,
              color, 
              fontWeight: 'bold' 
            }}
          >
            {value}%
          </Box>
        );
      },
    },
  ];

  return (
    <Box sx={{ p: 2, minHeight: 'calc(100vh - 64px)' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, borderBottom: `1px solid ${getBorderColor()}`, pb: 1 }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 600, color: getTextColor() }}>
          레포트 - 계획대비 실적조회
        </Typography>
        <IconButton onClick={() => setIsHelpModalOpen(true)} sx={{ ml: 1, color: theme.palette.primary.main }}>
          <HelpOutlineIcon />
        </IconButton>
      </Box>

      <SearchCondition onSearch={handleSubmit(handleSearch)} onReset={handleReset}>
        {searchFormItems}
        
        {/* 자재 선택 버튼 */}
        <Grid item xs={12} md={12} mt={0}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleOpenMaterialSelect}
            >
              자재 선택
            </Button>
            
            {/* 선택된 자재 표시 영역 */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, overflow: 'auto', maxHeight: '60px', flex: 1 }}>
              {selectedSearchMaterials.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>
                  모든 자재
                </Typography>
              ) : (
                selectedSearchMaterials.map((material) => (
                  <Chip
                    key={material.systemMaterialId}
                    label={`${material.materialName}`}
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
            <Typography variant="h6" sx={{ mb: 2, color: getTextColor() }}>제품별 계획/지시/완료 수량</Typography>
            {!isLoading && chartData && chartData.length > 0 ? (
              <PlanVsActualChart 
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
            title="계획대비 실적 현황"
            key={refreshKey}
            rows={reportData}
            columns={planVsActualColumns}
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
                  sortModel: [{ field: 'prodPlanId', sort: 'desc' }],
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

      <HelpModal open={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} title="계획대비 실적조회 도움말">
        <Typography component="div" color={getTextColor()} paragraph>
          • 설정된 기간 동안의 제품별 생산계획 대비 실적을 조회합니다.
        </Typography>
      </HelpModal>

      {/* 자재 다중 선택 모달 */}
      <Dialog
        open={materialSelectModal.open}
        onClose={handleCloseMaterialSelect}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>자재 다중 선택</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            {/* 검색 필드 */}
            <TextField
              label="자재 검색"
              variant="outlined"
              value={materialSelectModal.searchText}
              onChange={handleSearchTextChange}
              placeholder="자재명 또는 ID로 검색"
              fullWidth
              size="small"
            />

            {/* 자재 목록 체크박스 */}
            <Box sx={{ mt: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, maxHeight: '300px', overflow: 'auto' }}>
              <List dense>
                {filteredMaterials.length > 0 ? (
                  filteredMaterials.map((material) => (
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
                        secondary={material.systemMaterialId} 
                      />
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="표시할 자재가 없습니다" />
                  </ListItem>
                )}
              </List>
            </Box>

            <Typography variant="body2" align="right">
              선택된 자재: {materialSelectModal.selectedMaterials.length}개
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

export default PlanVsActualCombined; 