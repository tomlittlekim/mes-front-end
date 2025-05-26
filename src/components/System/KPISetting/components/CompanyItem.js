import React, { useState, useMemo, useEffect } from 'react';
import {
    Box,
    Typography,
    Chip,
    Tooltip,
    IconButton, 
    useTheme,
    Alert,
    Fade,
    Tabs,
    Tab,
    Divider
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {useDomain} from "../../../../contexts/DomainContext";

/**
 * 회사 정보 및 KPI 설정 컴포넌트
 * 
 * @param {string} branchId - 지점 ID
 * @param {Object} company - 회사 정보
 * @param {Array} kpiIndicators - KPI 지표 목록
 * @param {Function} onKPIIndicatorSelection - KPI 지표 선택/해제 처리 함수
 * @param {Object} categorizedIndicators - 카테고리별로 그룹화된 KPI 지표
 * @param {number} maxKpiSelection - 최대 선택 가능 KPI 개수
 */
const CompanyItem = ({ 
  branchId, 
  company, 
  kpiIndicators, 
  onKPIIndicatorSelection,
  categorizedIndicators = {},
  maxKpiSelection = 2 // 기본값 설정
}) => {
    // Theme 및 Context 관련
    const theme = useTheme();
    const { domain } = useDomain();
    const isDarkMode = theme.palette.mode === 'dark';
    
    // 카테고리 탭 상태 관리
    const [categoryTab, setCategoryTab] = useState(0);
    
    // 경고 상태 관리
    const [showWarning, setShowWarning] = useState(false);
    const [warningKpiId, setWarningKpiId] = useState(null);
    const [counterHighlight, setCounterHighlight] = useState(false);
    
    // 경고 타이머 관리
    useEffect(() => {
        if (showWarning) {
            const timer = setTimeout(() => {
                setShowWarning(false);
                setWarningKpiId(null);
            }, 3000);
            
            return () => clearTimeout(timer);
        }
    }, [showWarning]);
    
    // 카운터 하이라이트 타이머 관리
    useEffect(() => {
        if (counterHighlight) {
            const timer = setTimeout(() => {
                setCounterHighlight(false);
            }, 1500);
            
            return () => clearTimeout(timer);
        }
    }, [counterHighlight]);
    
    // 카테고리별 KPI 지표 준비
    const categoryNames = useMemo(() => {
        return Object.keys(categorizedIndicators);
    }, [categorizedIndicators]);
    
    // 현재 선택된 카테고리의 KPI 지표 목록
    const currentCategoryIndicators = useMemo(() => {
        if (categoryNames.length === 0) return kpiIndicators.slice(0, 20); // 카테고리가 없는 경우 기본 표시
        return categorizedIndicators[categoryNames[categoryTab]] || [];
    }, [categorizedIndicators, categoryNames, categoryTab, kpiIndicators]);
    
    // 카테고리 탭 변경 처리
    const handleCategoryTabChange = (event, newValue) => {
        setCategoryTab(newValue);
    };

    // 선택된 KPI 지표 처리
    const handleKPIToggle = (kpiId) => {
        const isSelected = company.selectedKPIs.includes(kpiId);
        
        // 최대 선택 개수 체크
        if (!isSelected && company.selectedKPIs.length >= maxKpiSelection) {
            // 이미 최대 개수 선택된 경우 경고 표시
            setShowWarning(true);
            setWarningKpiId(kpiId);
            setCounterHighlight(true);
            return;
        }
        
        onKPIIndicatorSelection(
            branchId,
            company.id,
            kpiId,
            !isSelected
        );
    };

    return (
        <Box
            sx={{
                mb: 2,
                px: 3,
                py: 2,
                borderRadius: 1,
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: isDarkMode ? 'background.paper' : '#fff',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: 1,
                position: 'relative'
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
                    {company.name}
                </Typography>
                <Tooltip title={`선택된 지표: ${company.selectedKPIs.length}/${maxKpiSelection}개`}>
                    <Chip 
                        size="medium"
                        label={`${company.selectedKPIs.length}/${maxKpiSelection}`}
                        color={counterHighlight ? "error" : (company.selectedKPIs.length > 0 ? "primary" : "default")}
                        sx={{ 
                            minWidth: '40px', 
                            height: '30px',
                            transition: 'color 0.3s ease',
                            animation: counterHighlight ? 'pulse 1.5s ease' : 'none',
                            '@keyframes pulse': {
                                '0%': { transform: 'scale(1)' },
                                '50%': { transform: 'scale(1.1)' },
                                '100%': { transform: 'scale(1)' }
                            }
                        }}
                    />
                </Tooltip>
            </Box>

            {showWarning && (
                <Fade in={showWarning}>
                    <Alert 
                        severity="warning" 
                        sx={{ 
                            mb: 1.5, 
                            py: 0.5, 
                            '& .MuiAlert-message': { 
                                p: '4px 0' 
                            } 
                        }}
                    >
                        최대 {maxKpiSelection}개까지만 선택 가능합니다.
                    </Alert>
                </Fade>
            )}
            
            {/* 현재 선택된 KPI 표시 */}
            {company.selectedKPIs.length > 0 && (
                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
                        선택된 KPI:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {company.selectedKPIs.map(kpiId => {
                            const indicator = kpiIndicators.find(ind => ind.id === kpiId);
                            return indicator ? (
                                <Chip
                                    key={kpiId}
                                    label={indicator.name}
                                    size="medium"
                                    color="primary"
                                    onDelete={() => handleKPIToggle(kpiId)}
                                    sx={{ 
                                        mb: 1,
                                        fontSize: '0.85rem',
                                        height: '36px',
                                        padding: '0 6px'
                                    }}
                                />
                            ) : null;
                        })}
                    </Box>
                    <Divider sx={{ my: 2 }} />
                </Box>
            )}

            {/* 카테고리 탭 */}
            {categoryNames.length > 0 && (
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                    <Tabs 
                        value={categoryTab} 
                        onChange={handleCategoryTabChange}
                        variant="scrollable"
                        scrollButtons="auto"
                        TabIndicatorProps={{
                            style: { display: 'none' }
                        }}
                        sx={{
                            minHeight: '36px',
                            '& .MuiTab-root': {
                                minHeight: '36px',
                                py: 1
                            }
                        }}
                    >
                        {categoryNames.map((categoryName, index) => (
                            <Tab 
                                key={index} 
                                label={categoryName} 
                                sx={{ 
                                    textTransform: 'none',
                                    minWidth: '80px',
                                    px: 2,
                                    fontSize: '0.85rem'
                                }} 
                            />
                        ))}
                    </Tabs>
                </Box>
            )}

            {/* KPI 지표 선택 영역 */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {currentCategoryIndicators.map(indicator => {
                    const isSelected = company.selectedKPIs.includes(indicator.id);
                    const isWarning = warningKpiId === indicator.id;
                    
                    return (
                        <Tooltip
                            key={indicator.id}
                            title={indicator.description || indicator.name}
                        >
                            <Chip
                                label={indicator.name}
                                size="medium"
                                color={isSelected ? "primary" : "default"}
                                variant={isSelected ? "filled" : "outlined"}
                                onClick={() => handleKPIToggle(indicator.id)}
                                sx={{ 
                                    mb: 1,
                                    fontSize: '0.85rem',
                                    height: '36px',
                                    border: isWarning ? '2px solid' : '1px solid',
                                    borderColor: isWarning ? 'error.main' : isSelected ? 'primary.main' : 'rgba(0, 0, 0, 0.23)',
                                    animation: isWarning ? 'shake 0.5s ease' : 'none',
                                    padding: '0 8px',
                                    '@keyframes shake': {
                                        '0%, 100%': { transform: 'translateX(0)' },
                                        '20%, 60%': { transform: 'translateX(-5px)' },
                                        '40%, 80%': { transform: 'translateX(5px)' }
                                    }
                                }}
                            />
                        </Tooltip>
                    );
                })}
            </Box>
        </Box>
    );
};

export default CompanyItem; 