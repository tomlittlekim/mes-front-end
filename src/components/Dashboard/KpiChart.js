import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  useTheme, 
  CircularProgress, 
  FormControl, 
  Select, 
  MenuItem, 
  IconButton
} from '@mui/material';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  ReferenceLine 
} from 'recharts';
import { useDomain, DOMAINS } from '../../contexts/DomainContext';
import RefreshIcon from '@mui/icons-material/Refresh';
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format, parse } from 'date-fns';
import ko from "date-fns/locale/ko";

/**
 * KPI 차트 컴포넌트
 * 
 * @param {Object} props - 컴포넌트 속성
 * @param {Object} props.kpiData - KPI 차트 데이터
 * @param {boolean} props.isLoading - 로딩 상태
 * @param {Function} props.onFilterChange - 필터 변경 핸들러
 * @param {Object} props.filter - 현재 필터 설정
 * @returns {JSX.Element}
 */
const KpiChart = ({ 
  kpiData, 
  isLoading, 
  onFilterChange,
  filter
}) => {
  const theme = useTheme();
  const { domain } = useDomain();
  const isDarkMode = theme.palette.mode === 'dark';
  
  // 현재 차트의 필터 상태
  const [localFilter, setLocalFilter] = useState({
    date: filter?.date || new Date().toISOString().split('T')[0],
    range: filter?.range || 'week'
  });
  
  // 날짜 객체로 변환
  const dateObject = useMemo(() => {
    try {
      if (!localFilter.date) return new Date();
      return parse(localFilter.date, 'yyyy-MM-dd', new Date());
    } catch (error) {
      console.error('날짜 파싱 오류:', error);
      return new Date();
    }
  }, [localFilter.date]);
  
  // 외부 필터가 변경되면 로컬 필터도 업데이트
  useEffect(() => {
    if (filter) {
      setLocalFilter({
        date: filter.date,
        range: filter.range
      });
    }
  }, [filter]);
  
  // 도메인별 색상 설정
  const getTextColor = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? '#f0e6d9' : 'rgba(0, 0, 0, 0.87)';
    }
    return isDarkMode ? '#b3c5e6' : 'rgba(0, 0, 0, 0.87)';
  };
  
  const getSecondaryTextColor = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? 'rgba(240, 230, 217, 0.7)' : 'rgba(0, 0, 0, 0.6)';
    }
    return isDarkMode ? 'rgba(179, 197, 230, 0.7)' : 'rgba(0, 0, 0, 0.6)';
  };
  
  const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  
  // 도메인별 차트 색상
  const getChartColors = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode 
        ? ['#e67e22', '#f39c12', '#3498db', '#1abc9c', '#9b59b6'] 
        : ['#d35400', '#e74c3c', '#2980b9', '#16a085', '#8e44ad'];
    }
    return ['#4caf50', '#ff5722', '#2196f3', '#ff9800', '#9c27b0'];
  };
  
  const getTooltipBgColor = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? '#3d2814' : '#ffffff';
    }
    return isDarkMode ? '#1e3a5f' : '#ffffff';
  };
  
  const getTooltipBorderColor = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)';
    }
    return isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)';
  };

  // 차트 데이터 키 추출
  const dataKeys = useMemo(() => {
    if (!kpiData || !kpiData.chartData || kpiData.chartData.length === 0) {
      return [];
    }
    
    // 첫 번째 데이터 포인트에서 "name" 키를 제외한 모든 키 추출
    const firstDataPoint = kpiData.chartData[0];
    return Object.keys(firstDataPoint).filter(key => key !== 'name');
  }, [kpiData]);
  
  // 범위 변경 핸들러
  const handleRangeChange = (e) => {
    const { value } = e.target;
    const newFilter = {
      ...localFilter,
      range: value
    };
    
    setLocalFilter(newFilter);
    
    // 부모 컴포넌트에 필터 변경 알림
    if (onFilterChange) {
      onFilterChange(kpiData.kpiIndicatorCd, newFilter);
    }
  };
  
  // 날짜 변경 핸들러
  const handleDateChange = (newDate) => {
    if (!newDate) return;
    
    try {
      const formattedDate = format(newDate, 'yyyy-MM-dd');
      const newFilter = {
        ...localFilter,
        date: formattedDate
      };
      
      setLocalFilter(newFilter);
      
      // 부모 컴포넌트에 필터 변경 알림
      if (onFilterChange) {
        onFilterChange(kpiData.kpiIndicatorCd, newFilter);
      }
    } catch (error) {
      console.error('날짜 변환 오류:', error);
    }
  };
  
  // 필터 새로고침 핸들러
  const handleRefresh = () => {
    if (onFilterChange) {
      onFilterChange(kpiData.kpiIndicatorCd, localFilter, true);
    }
  };

  // 차트 타입에 따른 컴포넌트 렌더링
  const renderChart = () => {
    if (isLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (!kpiData || !kpiData.chartData || kpiData.chartData.length === 0) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Typography variant="body1" color={getSecondaryTextColor()}>
            데이터가 없습니다.
          </Typography>
        </Box>
      );
    }
    
    const chartColors = getChartColors();
    
    // 현재 필터 범위에 따른 X축 라벨 포맷 설정
    const formatXAxis = (value) => {
      if (!value) return '';
      
      // 날짜 형식(YYYY-MM-DD)인지 확인
      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        switch (localFilter.range) {
          case 'day':
            return value.substring(5); // MM-DD 형식으로 표시
          case 'week':
            return value.substring(5); // MM-DD 형식으로 표시
          case 'month':
            return value.substring(8); // DD 형식으로 표시
          default:
            return value;
        }
      }
      
      // 시간 형식인 경우 (08, 09, 10 등)
      if (localFilter.range === 'day' && /^\d{1,2}$/.test(value)) {
        return `${value}시`;
      }
      
      return value;
    };
    
    // 차트 타입에 따라 다른 차트 렌더링
    switch (kpiData.chartType?.toLowerCase()) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={kpiData.chartData}
              margin={{ top: 20, right: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis 
                dataKey="name"
                tick={{ fill: getTextColor() }}
                tickFormatter={formatXAxis}
              />
              <YAxis
                  tick={{ fill: getTextColor() }}
                  ticks={[0, 25, 50, 75, 100]}
                  tickFormatter={value => value}
                  label={{
                    value: kpiData.unit,
                    angle: -90,
                    position: 'insideLeft',
                    style: { fill: getTextColor() }
                  }}
                  domain={[
                    0,
                    (dataMax) => {
                      if (
                          typeof kpiData.targetValue === 'number' &&
                          kpiData.targetValue > dataMax * 2
                      ) {
                        // 목표치가 데이터의 2배보다 크면, 목표치 + 10%까지만
                        return kpiData.targetValue * 1.1;
                      }
                      // 아니면 데이터/목표치 중 큰 값 + 10% 여유
                      return Math.max(dataMax, kpiData.targetValue ?? dataMax) * 1.1;
                    }
                  ]}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: getTooltipBgColor(),
                  borderColor: getTooltipBorderColor(),
                  color: getTextColor()
                }}
                formatter={(value, name) => [`${value} ${kpiData.unit || ''}`, name]}
                labelFormatter={formatXAxis}
              />
              <Legend wrapperStyle={{ color: getTextColor() }} />
              {kpiData.targetValue && (
                <ReferenceLine 
                  y={kpiData.targetValue} 
                  stroke="#ff0000" 
                  strokeDasharray="3 3"
                  label={{ 
                    value: `목표: ${kpiData.targetValue}${kpiData.unit || ''}`,
                    fill: '#ff0000',
                    position: 'insideRight',
                  }}
                />
              )}
              {dataKeys.map((key, index) => (
                <Bar 
                  key={key}
                  dataKey={key} 
                  fill={chartColors[index % chartColors.length]}
                  name={key}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
        
      case 'line':
      default:
        return (
          <ResponsiveContainer width="100%" aspect={2}>
            <LineChart
              data={kpiData.chartData}
              margin={{ top: 20, right: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis 
                dataKey="name"
                tick={{ fill: getTextColor() }}
                tickFormatter={formatXAxis}
              />
              <YAxis 
                tick={{ fill: getTextColor() }}
                label={{ 
                  value: kpiData.unit, 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fill: getTextColor() }
                }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: getTooltipBgColor(),
                  borderColor: getTooltipBorderColor(),
                  color: getTextColor()
                }}
                formatter={(value, name) => [`${value} ${kpiData.unit || ''}`, name]}
                labelFormatter={formatXAxis}
              />
              <Legend wrapperStyle={{ color: getTextColor() }} />
              {kpiData.targetValue && (
                <ReferenceLine 
                  y={kpiData.targetValue} 
                  stroke="#ff0000" 
                  strokeDasharray="3 3"
                  label={{ 
                    value: `목표: ${kpiData.targetValue}${kpiData.unit || ''}`,
                    fill: '#ff0000',
                    position: 'insideRight',
                  }}
                />
              )}
              {dataKeys.map((key, index) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={chartColors[index % chartColors.length]}
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                  name={key}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <Box sx={{ 
      p: 1,
      color: getTextColor(),
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {kpiData?.kpiTitle || 'KPI 지표'}
          </Typography>
          <Typography variant="body2" sx={{ color: getSecondaryTextColor() }}>
            {kpiData?.categoryNm ? `카테고리: ${kpiData.categoryNm}` : '핵심성과지표 데이터입니다.'}
          </Typography>
        </Box>
        
        {/* 인라인 필터 컨트롤 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
            <DatePicker
              label="조회일자"
              value={dateObject}
              onChange={handleDateChange}
              slotProps={{ textField: { size: "small" } }}
              sx={{ width: 150 }}
            />
          </LocalizationProvider>
          
          <FormControl size="small" sx={{ minWidth: 90 }}>
            <Select
              name="range"
              value={localFilter.range}
              onChange={handleRangeChange}
              sx={{ color: getTextColor() }}
              displayEmpty
            >
              <MenuItem value="day">일간</MenuItem>
              <MenuItem value="week">주간</MenuItem>
              <MenuItem value="month">월간</MenuItem>
            </Select>
          </FormControl>
          
          <IconButton 
            size="small" 
            onClick={handleRefresh}
            sx={{ p: 1 }}
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      
      <Box sx={{ flex: 1, width: '100%', minHeight: 250 }}>
        {renderChart()}
      </Box>
    </Box>
  );
};

export default KpiChart; 