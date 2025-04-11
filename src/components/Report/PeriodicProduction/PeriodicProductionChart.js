import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material';

/**
 * 기간별 생산 실적 차트 컴포넌트
 *
 * @param {object} props - { data }
 * @returns {JSX.Element}
 */
const PeriodicProductionChart = ({ data }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  // 테마에 따른 색상 설정
  const line1Color = theme.palette.primary.main;
  const line2Color = theme.palette.secondary.main;
  const axisColor = isDarkMode ? theme.palette.grey[400] : theme.palette.text.secondary;
  const tooltipBg = isDarkMode ? alpha(theme.palette.background.paper, 0.9) : alpha(theme.palette.grey[800], 0.9);
  const tooltipText = isDarkMode ? theme.palette.text.primary : theme.palette.common.white;

  // 날짜 포맷 함수
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' });
    } catch (e) {
      return dateString; // 오류 시 원본 반환
    }
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? theme.palette.grey[700] : theme.palette.grey[300]} />
        <XAxis 
          dataKey="date" 
          tickFormatter={formatDate} // 날짜 포맷 적용
          tick={{ fill: axisColor, fontSize: 12 }} 
        />
        <YAxis yAxisId="left" tick={{ fill: axisColor, fontSize: 12 }} label={{ value: '수량', angle: -90, position: 'insideLeft', fill: axisColor, fontSize: 12, dx: -5 }} />
        <YAxis yAxisId="right" orientation="right" tick={{ fill: axisColor, fontSize: 12 }} label={{ value: '가동시간(분)', angle: 90, position: 'insideRight', fill: axisColor, fontSize: 12, dx: 5 }}/>
        <Tooltip 
          labelFormatter={formatDate} // 툴크 레이블 포맷
          contentStyle={{ backgroundColor: tooltipBg, border: 'none', borderRadius: '4px' }} 
          labelStyle={{ color: tooltipText, fontWeight: 'bold' }} 
          itemStyle={{ color: tooltipText }}
        />
        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
        <Line yAxisId="left" type="monotone" dataKey="생산수량" stroke={line1Color} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
        <Line yAxisId="left" type="monotone" dataKey="불량수" stroke={line2Color} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
        {/* 가동 시간은 Bar 또는 다른 Line으로 표현 가능 */}
        {/* <Bar yAxisId="right" dataKey="가동시간" fill="#82ca9d" /> */}
         <Line yAxisId="right" type="monotone" dataKey="가동시간" stroke={theme.palette.warning.main} strokeDasharray="5 5" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} name="가동시간(분)"/>
      </LineChart>
    </ResponsiveContainer>
  );
};

export default PeriodicProductionChart; 