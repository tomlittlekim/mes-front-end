import React, { useState } from 'react';
import { 
  Box, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  TextField,
  Button,
  Grid,
  useTheme,
  Typography,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
  Tooltip
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useDomain, DOMAINS } from '../../contexts/DomainContext';

/**
 * KPI 데이터 필터 컴포넌트
 * 
 * @param {Object} props - 컴포넌트 속성
 * @param {Object} props.defaultFilter - 기본 필터 값
 * @param {Array} props.kpiData - KPI 데이터 배열
 * @param {Array} props.indicatorFilters - 지표별 필터 설정
 * @param {Function} props.onFilterChange - 필터 변경 핸들러
 * @param {Function} props.onRefresh - 데이터 새로고침 핸들러
 * @returns {JSX.Element}
 */
const KpiFilter = ({ 
  defaultFilter, 
  kpiData = [], 
  indicatorFilters = [], 
  onFilterChange, 
  onRefresh 
}) => {
  const theme = useTheme();
  const { domain } = useDomain();
  const isDarkMode = theme.palette.mode === 'dark';
  
  // 개별 필터 사용 여부
  const [useCustomFilters, setUseCustomFilters] = useState(indicatorFilters.length > 0);
  
  // 도메인별 색상 설정
  const getTextColor = () => {
    if (domain === DOMAINS.PEMS) {
      return isDarkMode ? '#f0e6d9' : 'rgba(0, 0, 0, 0.87)';
    }
    return isDarkMode ? '#b3c5e6' : 'rgba(0, 0, 0, 0.87)';
  };
  
  // 기본 필터 값 변경 핸들러
  const handleDefaultFilterChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({
      defaultFilter: {
        ...defaultFilter,
        [name]: value,
      },
      indicatorFilters: useCustomFilters ? indicatorFilters : []
    });
  };
  
  // 개별 필터 값 변경 핸들러
  const handleIndicatorFilterChange = (index, field, value) => {
    const updatedFilters = [...indicatorFilters];
    
    // 해당 인덱스의 필터가 없으면 생성
    if (!updatedFilters[index]) {
      updatedFilters[index] = {
        kpiIndicatorCd: kpiData[index]?.kpiIndicatorCd || '',
        date: defaultFilter.date,
        range: defaultFilter.range
      };
    }
    
    updatedFilters[index] = {
      ...updatedFilters[index],
      [field]: value
    };
    
    onFilterChange({
      defaultFilter,
      indicatorFilters: updatedFilters
    });
  };
  
  // 개별 필터 사용 여부 변경 핸들러
  const handleUseCustomFiltersChange = (e) => {
    const useCustom = e.target.checked;
    setUseCustomFilters(useCustom);
    
    // 개별 필터 사용으로 변경 시 기본 필터 값으로 초기화
    if (useCustom && indicatorFilters.length === 0) {
      const newFilters = kpiData.map(item => ({
        kpiIndicatorCd: item.kpiIndicatorCd,
        date: defaultFilter.date,
        range: defaultFilter.range
      }));
      
      onFilterChange({
        defaultFilter,
        indicatorFilters: newFilters
      });
    } else if (!useCustom) {
      // 개별 필터 사용 안함으로 변경 시 빈 배열로 설정
      onFilterChange({
        defaultFilter,
        indicatorFilters: []
      });
    }
  };

  return (
    <Box sx={{ mb: 2, mt: 1 }}>
      {/* 기본 필터 */}
      <Box sx={{ mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3} md={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={useCustomFilters}
                  onChange={handleUseCustomFiltersChange}
                  color="primary"
                />
              }
              label="지표별 필터 사용"
            />
          </Grid>
          
          <Grid item xs={12} sm={3} md={2}>
            <TextField
              name="date"
              label="기준 날짜"
              type="date"
              value={defaultFilter.date}
              onChange={handleDefaultFilterChange}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              sx={{
                '& .MuiInputBase-input': {
                  color: getTextColor(),
                },
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={3} md={2}>
            <FormControl fullWidth>
              <InputLabel>데이터 범위</InputLabel>
              <Select
                name="range"
                value={defaultFilter.range}
                label="데이터 범위"
                onChange={handleDefaultFilterChange}
                sx={{
                  color: getTextColor(),
                }}
              >
                <MenuItem value="day">일간</MenuItem>
                <MenuItem value="week">주간</MenuItem>
                <MenuItem value="month">월간</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={3} md={2}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={onRefresh}
              fullWidth
              sx={{ height: '56px' }}
            >
              새로고침
            </Button>
          </Grid>
        </Grid>
      </Box>
      
      {/* 개별 필터 (아코디언 형태로 표시) */}
      {useCustomFilters && kpiData.length > 0 && (
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="indicator-filters-content"
            id="indicator-filters-header"
          >
            <Typography>KPI 지표별 필터 설정</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              {kpiData.map((item, index) => {
                const indicatorFilter = indicatorFilters[index] || {
                  kpiIndicatorCd: item.kpiIndicatorCd,
                  date: defaultFilter.date,
                  range: defaultFilter.range
                };
                
                return (
                  <Grid item xs={12} key={`filter-${item.kpiIndicatorCd}`}>
                    <Box sx={{ p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        {item.kpiTitle}
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={4}>
                          <TextField
                            label="기준 날짜"
                            type="date"
                            value={indicatorFilter.date}
                            onChange={(e) => handleIndicatorFilterChange(index, 'date', e.target.value)}
                            fullWidth
                            InputLabelProps={{
                              shrink: true,
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControl fullWidth>
                            <InputLabel>데이터 범위</InputLabel>
                            <Select
                              value={indicatorFilter.range}
                              label="데이터 범위"
                              onChange={(e) => handleIndicatorFilterChange(index, 'range', e.target.value)}
                            >
                              <MenuItem value="day">일간</MenuItem>
                              <MenuItem value="week">주간</MenuItem>
                              <MenuItem value="month">월간</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                      </Grid>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </AccordionDetails>
        </Accordion>
      )}
    </Box>
  );
};

export default KpiFilter; 