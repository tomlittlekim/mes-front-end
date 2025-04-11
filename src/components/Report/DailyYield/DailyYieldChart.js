import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material';

// 수율에 따른 색상 반환 함수
const getColor = (value) => {
  if (value >= 95) return '#4caf50'; // Green
  if (value >= 90) return '#ff9800'; // Orange
  return '#f44336'; // Red
};

/**
 * 일일 생산 수율 차트 컴포넌트 (품목별 수율 바 차트)
 *
 * @param {object} props - { data }
 * @returns {JSX.Element}
 */
const DailyYieldChart = ({ data }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const axisColor = isDarkMode ? theme.palette.grey[400] : theme.palette.text.secondary;
  const tooltipBg = isDarkMode ? alpha(theme.palette.background.paper, 0.9) : alpha(theme.palette.grey[800], 0.9);
  const tooltipText = isDarkMode ? theme.palette.text.primary : theme.palette.common.white;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? theme.palette.grey[700] : theme.palette.grey[300]} />
        <XAxis dataKey="name" tick={{ fill: axisColor, fontSize: 12 }} />
        <YAxis 
          tick={{ fill: axisColor, fontSize: 12 }} 
          label={{ value: '수율 (%)', angle: -90, position: 'insideLeft', fill: axisColor, fontSize: 12, dx: -10 }} 
          domain={[0, 100]} // 수율은 0-100 범위
        />
        <Tooltip 
          contentStyle={{ backgroundColor: tooltipBg, border: 'none', borderRadius: '4px' }} 
          labelStyle={{ color: tooltipText, fontWeight: 'bold' }} 
          itemStyle={{ color: tooltipText }}
          formatter={(value) => [`${value}%`, '수율']} // 툴팁 포맷
        />
        {/* <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} /> */}
        <Bar dataKey="수율" barSize={30}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getColor(entry.수율)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default DailyYieldChart; 