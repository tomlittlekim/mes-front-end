import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';

// 스타일 정의
const chartStyles = {
  root: {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    borderRadius: '12px',
    height: '100%',
  },
  title: {
    fontWeight: 600,
    fontSize: '1.1rem',
    marginBottom: '16px',
    color: '#2c3e50',
  },
  chartContainer: {
    height: 350,
    margin: '0 auto',
  },
  overallBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    borderRadius: '8px',
    backgroundColor: '#f5f9ff',
    marginTop: '16px',
  },
  overallValue: {
    fontSize: '2.5rem',
    fontWeight: 700,
    color: '#1976d2',
  },
};

// KPI 카테고리 변환 함수
const formatCategory = (category) => {
  switch(category) {
    case 'energyEfficiency':
      return '에너지 효율';
    case 'peakReduction':
      return '피크 감소율';
    case 'standbyPower':
      return '대기 전력';
    case 'costSavings':
      return '비용 절감률';
    case 'powerQuality':
      return '전력 품질';
    default:
      return category;
  }
};

// KPI 추세 차트 컴포넌트
const OverallKPIChart = ({ kpiAchievement }) => {
  // 레이더 차트 데이터 준비
  const prepareChartData = () => {
    if (!kpiAchievement || !kpiAchievement.byCategory) return [];
    
    const categories = Object.keys(kpiAchievement.byCategory);
    return categories.map(category => ({
      category: formatCategory(category),
      달성률: kpiAchievement.byCategory[category],
      fullMark: 100,
    }));
  };
  
  const chartData = prepareChartData();
  
  // 달성률에 따른 색상 결정
  const getOverallColor = (rate) => {
    if (rate >= 90) return '#4caf50';
    if (rate >= 75) return '#2196f3';
    if (rate >= 60) return '#ff9800';
    return '#f44336';
  };
  
  const overallColor = getOverallColor(kpiAchievement.overall);
  
  // 커스텀 툴팁 컴포넌트
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: '8px 12px',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        >
          <Typography variant="body2" fontWeight="bold">
            {payload[0].payload.category}
          </Typography>
          <Typography variant="body2" sx={{ color: '#1976d2' }}>
            달성률: {payload[0].value.toFixed(1)}%
          </Typography>
        </Box>
      );
    }
    return null;
  };
  
  return (
    <Card sx={chartStyles.root}>
      <CardContent>
        <Typography variant="h6" sx={chartStyles.title}>
          전체 KPI 달성률
        </Typography>
        
        <Box sx={chartStyles.chartContainer}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
              <PolarGrid stroke="#e0e0e0" />
              <PolarAngleAxis dataKey="category" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tickCount={6} />
              <Tooltip content={<CustomTooltip />} />
              <Radar
                name="달성률"
                dataKey="달성률"
                stroke="#1976d2"
                fill="#1976d2"
                fillOpacity={0.5}
              />
            </RadarChart>
          </ResponsiveContainer>
        </Box>
        
        <Box sx={chartStyles.overallBox}>
          <Typography variant="subtitle1" color="textSecondary">
            종합 KPI 달성률
          </Typography>
          <Typography sx={{ ...chartStyles.overallValue, color: overallColor }}>
            {kpiAchievement.overall.toFixed(1)}%
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default OverallKPIChart; 