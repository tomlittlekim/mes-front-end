import React, { useCallback, useState, useEffect } from 'react';
import { Box, IconButton, Stack, Typography, useTheme, alpha, Grid, Button, Chip, FormControl, InputLabel, MenuItem, Select, List, ListItem, ListItemIcon, Checkbox, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HelpModal from '../../Common/HelpModal';
import { SearchCondition, EnhancedDataGridWrapper } from '../../Common';
import { useGraphQL } from '../../../apollo/useGraphQL';
import Message from "../../../utils/message/Message";
import { useForm, Controller } from 'react-hook-form';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label, Cell } from 'recharts';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ko from "date-fns/locale/ko"; 
import DateRangePicker from '../../Common/DateRangePicker';
import { getPeriodicProduction, getDefectInfo, getMaterialList } from '../../../api/standardInfo/inventoryApi';

// =====================================================================
// 커스텀 훅: usePeriodicProduction
// =====================================================================
export const useDailyYield = (tabId) => {
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
        const materials = await getMaterialList();
        setMaterialList(materials);
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

      const periodicProductionData = await getPeriodicProduction(filter);
      if (!periodicProductionData || periodicProductionData.length === 0) {
        console.warn('No periodic production data found.');
        setReportData([]);
        setChartData([]);
        setIsLoading(false);
        return;
      }
      
      console.log('Fetched Periodic Production Data:', periodicProductionData);

      // --- 데이터 가공 로직 ---
      // 1. 차트 데이터 생성
      const processedChartData = periodicProductionData.map((item) => ({
        name: item.materialName,
        '양품수량': item.totalGoodQty,
        '불량수량': item.totalDefectQty,
        '불량률': item.totalDefectRate
      })).sort((a, b) => b['양품수량'] - a['양품수량']); // 양품수량 기준 내림차순 정렬

      // 2. 그리드 데이터 생성
      const processedGridData = periodicProductionData.map((item, index) => ({
        id: `${item.materialName}-${index}`, // materialName과 인덱스 조합으로 고유 ID 생성
        materialName: item.materialName,
        totalGoodQty: item.totalGoodQty,
        totalDefectQty: item.totalDefectQty,
        totalDefectRate: item.totalDefectRate,
        totalQty: item.totalGoodQty + item.totalDefectQty,
        unit: item.unit,
        productId: item.productId
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
// 주기별 생산 검색 폼 컴포넌트
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
// 주기별 생산 차트 컴포넌트
// =====================================================================
const DailyYieldChart = ({ data, highlightedMaterial, onBarMouseOver, onBarMouseOut }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const goodQtyColor = '#4ade80'; // 양품수량 - 밝은 녹색
  const defectQtyColor = '#ef4444'; // 불량수량 - 빨간색
  const totalQtyColor = '#3b82f6'; // 총 생산수량 - 파란색
  const defectRateColor = '#f97316'; // 불량률 - 주황색
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
  const itemWidth = 80; // 각 X축 항목이 차지할 대략적인 너비 (px)
  const calculatedMinWidthForScroll = data.length * itemWidth;

  // 총 생산수량 추가 (양품수량 + 불량수량)
  const chartDataWithTotal = data.map(item => ({
    ...item,
    '총 생산수량': item['양품수량'] + item['불량수량'],
  }));

  // 바 렌더링 커스터마이징 - 하이라이트 적용
  const getBarProps = (entry, dataKey) => {
    const colors = {
      '양품수량': goodQtyColor,
      '불량수량': defectQtyColor,
      '총 생산수량': totalQtyColor,
      '불량률': defectRateColor
    };
    
    if (highlightedMaterial && entry.name === highlightedMaterial) {
      return {
        fill: colors[dataKey],
        fillOpacity: 1
      };
    }
    return {
      fill: colors[dataKey],
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
          {payload.map((entry, index) => {
            // 수량 관련 데이터는 정수로, 불량률은 소수점 2자리까지 표시
            const isRate = entry.name === '불량률';
            const formattedValue = isRate 
              ? entry.value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) + '%'
              : entry.value.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0});
            
            return (
              <p key={`tooltip-${index}`} style={{ 
                color: entry.color, 
                margin: '3px 0',
                fontWeight: 'bold'
              }}>
                {entry.name}: {formattedValue}
              </p>
            );
          })}
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
    // 1. 외부 Box: 스크롤 컨테이너 역할
    <Box sx={{ width: '100%', height: '100%', overflowX: 'auto', overflowY: 'hidden' }}>
      {/* 2. 내부 Box: BarChart의 실제 크기를 정의 */}
      <Box sx={{ width: '100%', minWidth: `${calculatedMinWidthForScroll}px`, height: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartDataWithTotal}
            margin={{ top: 10, right: 30, left: 20, bottom: 40 }} // bottom margin 증가
            barGap={2}
            barCategoryGap="30%" // 카테고리 간 간격 조정
          >
            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? theme.palette.grey[700] : theme.palette.grey[300]} />
            <XAxis 
              dataKey="name" 
              tick={{ fill: axisColor, fontSize: 11 }} 
              tickLine={{ stroke: axisColor }}
              height={60} // X축 높이 증가
              interval={0}
              tickFormatter={(value) => value.length > 10 ? `${value.substring(0, 10)}...` : value}
            />
            <YAxis 
              yAxisId="left"
              tick={{ fill: axisColor, fontSize: 11 }} 
              tickLine={{ stroke: axisColor }}
              tickFormatter={(value) => value.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}
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
              tickFormatter={(value) => `${value}%`}
              tick={{ fill: axisColor, fontSize: 11 }}
              tickLine={{ stroke: axisColor }}
              width={50}
            >
              <Label
                value="불량률(%)"
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
                bottom: 0 // 레전드 하단 위치
              }} 
              iconType="square"
            />
            <Bar 
              dataKey="양품수량" 
              name="양품수량" 
              barSize={18}
              fill={goodQtyColor}
              yAxisId="left"
              isAnimationActive={false}
            >
              {chartDataWithTotal.map((entry, index) => (
                <Cell 
                  key={`cell-good-${index}`} 
                  {...getBarProps(entry, '양품수량')}
                  onMouseOver={() => onBarMouseOver && onBarMouseOver(entry.name)}
                  onMouseOut={() => onBarMouseOut && onBarMouseOut()}
                />
              ))}
            </Bar>
            <Bar 
              dataKey="불량수량" 
              name="불량수량" 
              barSize={18}
              fill={defectQtyColor}
              yAxisId="left"
              isAnimationActive={false}
            >
              {chartDataWithTotal.map((entry, index) => (
                <Cell 
                  key={`cell-defect-${index}`} 
                  {...getBarProps(entry, '불량수량')}
                  onMouseOver={() => onBarMouseOver && onBarMouseOver(entry.name)}
                  onMouseOut={() => onBarMouseOut && onBarMouseOut()}
                />
              ))}
            </Bar>
            <Bar 
              dataKey="총 생산수량" 
              name="총 생산수량" 
              barSize={18}
              fill={totalQtyColor}
              yAxisId="left"
              isAnimationActive={false}
            >
              {chartDataWithTotal.map((entry, index) => (
                <Cell 
                  key={`cell-total-${index}`} 
                  {...getBarProps(entry, '총 생산수량')}
                  onMouseOver={() => onBarMouseOver && onBarMouseOver(entry.name)}
                  onMouseOut={() => onBarMouseOut && onBarMouseOut()}
                />
              ))}
            </Bar>
            <Bar 
              dataKey="불량률" 
              name="불량률" 
              barSize={18}
              fill={defectRateColor}
              yAxisId="right"
              isAnimationActive={false}
            >
              {chartDataWithTotal.map((entry, index) => (
                <Cell 
                  key={`cell-rate-${index}`} 
                  {...getBarProps(entry, '불량률')}
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
// 메인 컴포넌트: 주기별 생산 현황
// =====================================================================
const DailyYieldCombined = (props) => {
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

  // 불량 상세 사유 모달 상태
  const [defectDetailModal, setDefectDetailModal] = useState({
    open: false,
    loading: false,
    materialName: '',
    defectCauses: [],
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
  } = useDailyYield(props.tabId);

  const getTextColor = useCallback(() => isDarkMode ? '#fff' : 'rgba(0, 0, 0, 0.87)', [isDarkMode]);
  const getBgColor = useCallback(() => isDarkMode ? 'rgba(255, 255, 255, 0.08)' : '#f5f5f5', [isDarkMode]);
  const getBorderColor = useCallback(() => isDarkMode ? 'rgba(255, 255, 255, 0.12)' : '#e0e0e0', [isDarkMode]);

  // 불량 상세 모달 열기 및 데이터 조회
  const handleOpenDefectDetail = async (row) => {
    if (!row.productId) {
      Message.showInfo("이 제품의 ID가 없어 상세 불량 내역을 조회할 수 없습니다.");
      return;
    }

    setDefectDetailModal({
      open: true,
      loading: true,
      materialName: row.materialName,
      defectCauses: [],
    });

    try {
      const defectData = await getDefectInfo(row.productId);

      if (!defectData || defectData.length === 0) {
        setDefectDetailModal(prev => ({ ...prev, loading: false, defectCauses: [] }));
      } else {
        const aggregatedDefects = defectData.reduce((acc, current) => {
          const { codeName, codeDesc, defectQty } = current;
          if (!acc[codeName]) {
            acc[codeName] = {
              reason: codeName,
              desc: codeDesc,
              qty: 0,
            };
          }
          acc[codeName].qty += parseFloat(defectQty) || 0;
          return acc;
        }, {});

        const formattedDefects = Object.values(aggregatedDefects);
        setDefectDetailModal(prev => ({ ...prev, loading: false, defectCauses: formattedDefects }));
      }

    } catch (error) {
      console.error('Error fetching defect details:', error);
      Message.showError("불량 내역 조회 중 오류가 발생했습니다.");
      setDefectDetailModal(prev => ({ ...prev, loading: false }));
    }
  };

  // 불량 상세 모달 닫기
  const handleCloseDefectDetail = () => {
    setDefectDetailModal({
      open: false,
      loading: false,
      materialName: '',
      defectCauses: [],
    });
  };

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
      handleCloseMaterialSelect();
      setTimeout(() => {
        Message.showWarning('최소한 하나의 제품을 선택해주세요.');
      }, 200);
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
  const dailyYieldColumns = [
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
      field: 'unit', 
      headerName: '규격', 
      width: 120, 
      headerAlign: 'center', 
      align: 'left',
      editable: false,
    },
    { 
      field: 'totalGoodQty', 
      headerName: '양품수량', 
      width: 120, 
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
              {parseFloat(value).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}
            </Typography>
          </Box>
        );
      },
    },
    { 
      field: 'totalDefectQty', 
      headerName: '불량수량', 
      width: 120, 
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
              pr: 1,
              color: theme.palette.error.main
            }}
          >
            <Typography>
              {parseFloat(value).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}
            </Typography>
          </Box>
        );
      },
    },
    { 
      field: 'totalQty', 
      headerName: '총 생산수량', 
      width: 120, 
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
              {parseFloat(value).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}
            </Typography>
          </Box>
        );
      },
    },
    { 
      field: 'totalDefectRate', 
      headerName: '불량률(%)', 
      width: 100, 
      headerAlign: 'center', 
      align: 'right', 
      editable: false,
      renderCell: (params) => {
        const value = parseFloat(params.value);
        let color = theme.palette.text.primary;
        
        if (value < 1) {
          color = theme.palette.success.main;
        } else if (value >= 5) {
          color = theme.palette.error.main;
        } else if (value >= 1) {
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
          레포트 - 불량율 현황
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
            <Typography variant="h6" sx={{ mb: 2, color: getTextColor() }}>제품별 생산 현황 및 불량률</Typography>
            {!isLoading && chartData && chartData.length > 0 ? (
              <DailyYieldChart 
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
            title="일별 수율 현황"
            key={refreshKey}
            rows={reportData}
            columns={dailyYieldColumns}
            loading={isLoading}
            buttons={[]}
            height={500}
            tabId={props.tabId + "-grid"}
            gridProps={{
              autoHeight: false,
              getRowId: (row) => row.id,
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
                  sortModel: [{ field: 'totalGoodQty', sort: 'desc' }],
                },
                pagination: {
                  paginationModel: { pageSize: 10, page: 0 },
                },
              },
              density: 'standard',
              onRowDoubleClick: (params) => handleOpenDefectDetail(params.row), // 더블클릭 이벤트 핸들러 추가
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

      <HelpModal open={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} title="일별 수율 현황 도움말">
        <Typography component="div" color={getTextColor()} paragraph>
          • 설정된 기간 동안의 제품별 생산 수량과 불량률을 조회합니다.
        </Typography>
        <Typography component="div" color={getTextColor()} paragraph>
          • 차트에는 양품 수량만 표시되며, 상세 정보는 그리드에서 확인할 수 있습니다.
        </Typography>
        <Typography component="div" color={getTextColor()} paragraph>
          • 그리드의 행을 더블클릭하면 상세 불량 사유를 확인할 수 있습니다.
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

      {/* 불량 상세 사유 모달 */}
      <Dialog open={defectDetailModal.open} onClose={handleCloseDefectDetail} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography component="span" variant="h6" sx={{ fontWeight: 'bold' }}>{defectDetailModal.materialName}</Typography>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0, minHeight: '150px' }}>
          {defectDetailModal.loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          ) : defectDetailModal.defectCauses && defectDetailModal.defectCauses.length > 0 ? (
            <List sx={{ width: '100%', py: 0 }}>
              {defectDetailModal.defectCauses.map((defect, index) => (
                <ListItem key={index} divider sx={{ py: 2 }}>
                  <Grid container alignItems="center" spacing={2}>
                    <Grid item xs={9}>
                      <ListItemText
                        primary={defect.reason}
                        secondary={defect.reason !== defect.desc ? defect.desc : null}
                        primaryTypographyProps={{ fontWeight: 'bold' }}
                        secondaryTypographyProps={{ variant: 'body2', color: 'text.secondary', mt: 0.5 }}
                      />
                    </Grid>
                    <Grid item xs={3} sx={{ textAlign: 'right' }}>
                        <Chip
                            label={`수량: ${defect.qty.toLocaleString()}`}
                            size="small"
                            color="error"
                            variant="outlined"
                        />
                    </Grid>
                  </Grid>
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Typography sx={{ p: 2, textAlign: 'center' }}>표시할 불량 사유가 없습니다.</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDefectDetail} variant="contained">닫기</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DailyYieldCombined; 