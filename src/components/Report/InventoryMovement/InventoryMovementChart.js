import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label } from 'recharts';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material';

/**
 * 입출고 현황 차트 컴포넌트 (품목별 입/출고량 바 차트)
 *
 * @param {object} props - { data }
 * @returns {JSX.Element}
 */
const InventoryMovementChart = ({ data }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const inColor = theme.palette.success.main;
  const outColor = theme.palette.error.main;
  const stockColor = theme.palette.info.main; // 현재재고량 색상
  const axisColor = isDarkMode ? theme.palette.grey[400] : theme.palette.text.secondary;
  const tooltipBg = isDarkMode ? alpha(theme.palette.background.paper, 0.9) : alpha(theme.palette.grey[800], 0.9);
  const tooltipText = isDarkMode ? theme.palette.text.primary : theme.palette.common.white;

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

  // 커스텀 툴팁 포맷팅
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ 
          backgroundColor: tooltipBg, 
          padding: '10px', 
          border: 'none', 
          borderRadius: '4px',
          fontSize: '12px'
        }}>
          <p style={{ color: tooltipText, fontWeight: 'bold', margin: '0 0 5px 0' }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={`tooltip-${index}`} style={{ color: entry.color, margin: '3px 0' }}>
              {entry.name}: {entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
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
          tick={{ fill: axisColor, fontSize: 11 }} 
          tickLine={{ stroke: axisColor }}
          tickFormatter={(value) => value.toLocaleString()}
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
            paddingTop: '5px',
            bottom: 0
          }} 
        />
        <Bar dataKey="입고량" fill={inColor} name="입고량" barSize={20} />
        <Bar dataKey="출고량" fill={outColor} name="출고량" barSize={20} />
        <Bar dataKey="현재재고량" fill={stockColor} name="현재재고량" barSize={20} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default InventoryMovementChart; 