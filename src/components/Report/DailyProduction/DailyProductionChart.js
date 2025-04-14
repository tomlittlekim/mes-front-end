import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material';

/**
 * 생산 일보 차트 컴포넌트 (시간대별 생산량 바 차트)
 *
 * @param {object} props - { data }
 * @returns {JSX.Element}
 */
const DailyProductionChart = ({ data }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const barColor = theme.palette.primary.main;
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
        <XAxis dataKey="name" tick={{ fill: axisColor, fontSize: 12 }} interval={0} /> {/* 시간대 표시 간격 조정 */}
        <YAxis tick={{ fill: axisColor, fontSize: 12 }} label={{ value: '생산량', angle: -90, position: 'insideLeft', fill: axisColor, fontSize: 12, dx: -5 }}/>
        <Tooltip 
          contentStyle={{ backgroundColor: tooltipBg, border: 'none', borderRadius: '4px' }} 
          labelStyle={{ color: tooltipText, fontWeight: 'bold' }} 
          itemStyle={{ color: tooltipText }}
        />
        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
        <Bar dataKey="생산량" fill={barColor} barSize={20} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default DailyProductionChart; 