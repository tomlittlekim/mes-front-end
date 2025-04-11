import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

/**
 * 계획 대비 실적 차트 컴포넌트
 *
 * @param {object} props - { data }
 * @returns {JSX.Element}
 */
const PlanVsActualChart = ({ data }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  // 테마에 따른 색상 설정
  const barColor = theme.palette.primary.main;
  const axisColor = isDarkMode ? theme.palette.grey[400] : theme.palette.text.secondary;
  const tooltipBg = isDarkMode ? alpha(theme.palette.background.paper, 0.9) : alpha(theme.palette.grey[800], 0.9);
  const tooltipText = isDarkMode ? theme.palette.text.primary : theme.palette.common.white;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 0, // Y축 레이블 공간 확보
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? theme.palette.grey[700] : theme.palette.grey[300]} />
        <XAxis dataKey="name" tick={{ fill: axisColor, fontSize: 12 }} />
        <YAxis 
          tick={{ fill: axisColor, fontSize: 12 }}
          label={{ value: '달성률 (%)', angle: -90, position: 'insideLeft', fill: axisColor, fontSize: 12, dx: -10 }} // Y축 레이블
          domain={[0, 'auto']} // Y축 범위 자동 설정 (최대값 기준)
        />
        <Tooltip 
          cursor={{ fill: alpha(barColor, 0.1) }} // 마우스 오버 시 배경색
          contentStyle={{ backgroundColor: tooltipBg, border: 'none', borderRadius: '4px' }} // 툴팁 스타일
          labelStyle={{ color: tooltipText, fontWeight: 'bold' }} // 툴팁 레이블 스타일
          itemStyle={{ color: tooltipText }} // 툴팁 아이템 스타일
          formatter={(value) => [`${value}%`, '달성률']} // 툴팁 포맷
        />
        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
        <Bar dataKey="달성률" fill={barColor} barSize={30} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default PlanVsActualChart; 