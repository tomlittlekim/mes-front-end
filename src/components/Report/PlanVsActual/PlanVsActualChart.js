import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label, Cell } from 'recharts';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material';

/**
 * 계획대비 실적 차트 컴포넌트
 * 
 * @param {Object} props - 컴포넌트 속성
 * @param {Array} props.data - 차트 데이터
 * @param {string} props.highlightedProduct - 강조 표시할 제품명
 * @param {Function} props.onBarMouseOver - 바 마우스오버 이벤트 핸들러
 * @param {Function} props.onBarMouseOut - 바 마우스아웃 이벤트 핸들러
 * @returns {JSX.Element}
 */
const PlanVsActualChart = ({ data, highlightedProduct, onBarMouseOver, onBarMouseOut }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  // 색상 정의
  const planColor = theme.palette.primary.main;      // 계획수량 - 파란색
  const orderColor = theme.palette.warning.main;     // 지시수량 - 주황색
  const completedColor = theme.palette.success.main; // 완료수량 - 녹색
  
  const axisColor = isDarkMode ? theme.palette.grey[400] : theme.palette.text.secondary;

  // 데이터가 없는 경우 처리
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
    const barColors = {
      '계획수량': planColor,
      '지시수량': orderColor, 
      '완료수량': completedColor
    };
    
    if (highlightedProduct && entry.name === highlightedProduct) {
      return {
        fill: barColors[dataKey],
        fillOpacity: 1
      };
    }
    return {
      fill: barColors[dataKey],
      fillOpacity: highlightedProduct ? 0.4 : 1
    };
  };

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      // 툴팁이 활성화될 때 해당 제품명으로 마우스오버 이벤트 호출
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
              color: entry.dataKey === '계획수량' ? planColor : 
                     entry.dataKey === '지시수량' ? orderColor : 
                     completedColor, 
              margin: '3px 0',
              fontWeight: 'bold'
            }}>
              {entry.name}: {entry.value.toLocaleString()}
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
          iconType="square"
        />
        <Bar 
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
      </BarChart>
    </ResponsiveContainer>
  );
};

export default PlanVsActualChart; 