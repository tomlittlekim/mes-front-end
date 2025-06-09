import React, { useState, useMemo } from 'react';
import { 
    Box, 
    Typography, 
    Grid, 
    Paper, 
    Accordion, 
    AccordionSummary, 
    AccordionDetails,
    Chip,
    Divider,
    Tooltip,
    Tabs,
    Tab
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BusinessIcon from '@mui/icons-material/Business';
import CompanyItem from './CompanyItem';

/**
 * 지점 및 회사 목록 컴포넌트
 * 
 * @param {Array} branchList - 지점 및 회사 목록 데이터
 * @param {Array} kpiIndicators - KPI 지표 목록 데이터
 * @param {Function} onKPIIndicatorSelection - KPI 지표 선택/해제 처리 함수
 * @param {Function} onCompanyKPIChange - 회사별 KPI 변경 처리 함수
 * @param {Function} onTargetValueChange - 목표값 변경 처리 함수
 * @param {boolean} isSaving - 저장 중 여부
 * @param {number} maxKpiSelection - 최대 선택 가능 KPI 개수
 */
const BranchCompanyList = ({ 
  branchList, 
  kpiIndicators, 
  onKPIIndicatorSelection,
  onCompanyKPIChange,
  onTargetValueChange,
  isSaving,
  maxKpiSelection = 2, // 기본값 설정
}) => {
    // 지점별 확장 상태 관리
    const [expandedItems, setExpandedItems] = useState(branchList.map((_, index) => index));
    
    // 카테고리 탭 상태 관리
    const [categoryTab, setCategoryTab] = useState(0);

    // 지점 아코디언 확장/축소 토글
    const handleAccordionToggle = (index) => {
        if (expandedItems.includes(index)) {
            setExpandedItems(expandedItems.filter(item => item !== index));
        } else {
            setExpandedItems([...expandedItems, index]);
        }
    };
    
    // 카테고리 탭 변경 처리
    const handleCategoryTabChange = (event, newValue) => {
        setCategoryTab(newValue);
    };

    // 지부에 속한 모든 회사의 KPI 일괄 선택/해제
    const handleSelectAllKPI = (branchId, kpiId) => {
        const branch = branchList.find(b => b.id === branchId);
        if (!branch) return;

        // 해당 지부의 모든 회사 중 하나라도 KPI가 선택되어 있는지 확인
        const anySelected = branch.companies.some(company => 
            company.selectedKPIs.includes(kpiId)
        );

        // 모든 회사에 대해 KPI 선택/해제 적용
        branch.companies.forEach(company => {
            // 하나라도 선택되어 있으면 모두 해제, 아니면 모두 선택
            onKPIIndicatorSelection(branchId, company.id, kpiId, !anySelected);
        });
    };
    
    // KPI 지표를 카테고리별로 그룹화
    const categorizedIndicators = useMemo(() => {
        const categories = {};
        
        kpiIndicators.forEach(indicator => {
            const categoryName = indicator.category || '기타';
            if (!categories[categoryName]) {
                categories[categoryName] = [];
            }
            categories[categoryName].push(indicator);
        });
        
        return categories;
    }, [kpiIndicators]);
    
    // 카테고리 목록
    const categoryNames = useMemo(() => {
        return Object.keys(categorizedIndicators);
    }, [categorizedIndicators]);
    
    // 현재 선택된 카테고리의 KPI 지표 목록
    const currentCategoryIndicators = useMemo(() => {
        if (categoryNames.length === 0) return [];
        return categorizedIndicators[categoryNames[categoryTab]] || [];
    }, [categorizedIndicators, categoryNames, categoryTab]);

    return (
        <Box className="branch-company-container">
            <Typography variant="subtitle1" gutterBottom>
                KPI 지표 선택 (최대 {maxKpiSelection}개 선택 가능)
            </Typography>

            {branchList.map((branch, branchIndex) => (
                <Paper 
                    key={branch.id} 
                    sx={{ 
                        mb: 2,
                        backgroundColor: 'background.paper',
                        boxShadow: 2
                    }}
                >
                    <Accordion 
                        expanded={expandedItems.includes(branchIndex)}
                        onChange={() => handleAccordionToggle(branchIndex)}
                        disableGutters
                    >
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            sx={{
                                backgroundColor: 'primary.light',
                                color: 'white',
                                borderBottom: '1px solid',
                                borderColor: 'divider'
                            }}
                        >
                            <Typography variant="subtitle1" fontWeight="bold">
                                {branch.name} ({branch.companies.length}개 회사)
                            </Typography>
                        </AccordionSummary>
                        
                        <AccordionDetails sx={{ p: 2 }}>
                            {/* 공통 지표 선택 영역 */}
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                                    공통 KPI 지표 선택 (모든 회사에 적용)
                                </Typography>
                                
                                {/* 카테고리 탭 */}
                                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                                    <Tabs 
                                        value={categoryTab} 
                                        onChange={handleCategoryTabChange}
                                        variant="scrollable"
                                        scrollButtons="auto"
                                        sx={{
                                            minHeight: '48px',
                                            '& .MuiTab-root': {
                                                minHeight: '48px',
                                                fontSize: '1rem',
                                                fontWeight: 500,
                                                px: 3
                                            }
                                        }}
                                    >
                                        {categoryNames.map((categoryName, index) => (
                                            <Tab 
                                                key={index} 
                                                label={categoryName} 
                                                sx={{ 
                                                    textTransform: 'none',
                                                    minWidth: '120px'
                                                }} 
                                            />
                                        ))}
                                    </Tabs>
                                </Box>
                                
                                {/* 선택된 카테고리의 KPI 지표 목록 */}
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                    {currentCategoryIndicators.map(indicator => {
                                        // 해당 지부의 모든 회사 중 하나라도 KPI가 선택되어 있는지 확인
                                        const allSelected = branch.companies.every(company => 
                                            company.selectedKPIs.includes(indicator.id)
                                        );
                                        const someSelected = branch.companies.some(company => 
                                            company.selectedKPIs.includes(indicator.id)
                                        );
                                        
                                        return (
                                            <Tooltip 
                                                key={indicator.id} 
                                                title={someSelected && !allSelected ? "일부 회사만 선택됨" : indicator.description || ""}
                                            >
                                                <Chip
                                                    label={indicator.name}
                                                    size="medium"
                                                    color={allSelected ? "primary" : someSelected ? "info" : "default"}
                                                    variant={someSelected ? "filled" : "outlined"}
                                                    onClick={() => handleSelectAllKPI(branch.id, indicator.id)}
                                                    sx={{ 
                                                        mb: 1,
                                                        fontSize: '0.85rem',
                                                        height: '36px',
                                                        border: '1px solid',
                                                        borderColor: allSelected ? 'primary.main' : someSelected ? 'info.main' : 'rgba(0, 0, 0, 0.23)',
                                                        padding: '0 8px',
                                                    }}
                                                />
                                            </Tooltip>
                                        );
                                    })}
                                </Box>
                                <Divider sx={{ my: 2 }} />
                            </Box>
                            
                            {/* 회사별 지표 선택 영역 */}
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                                회사별 KPI 지표 선택
                            </Typography>
                            <Grid container spacing={3}>
                                {branch.companies.map(company => (
                                    <Grid item xs={12} sm={12} md={6} lg={4} key={company.id}>
                                        <CompanyItem
                                            branchId={branch.id}
                                            company={company}
                                            kpiIndicators={kpiIndicators}
                                            onKPIIndicatorSelection={onKPIIndicatorSelection}
                                            onCompanyKPIChange={onCompanyKPIChange}
                                            onTargetValueChange={onTargetValueChange}
                                            isSaving={isSaving}
                                            maxKpiSelection={maxKpiSelection}
                                            categorizedIndicators={categorizedIndicators}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        </AccordionDetails>
                    </Accordion>
                </Paper>
            ))}
            
            {branchList.length === 0 && (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="textSecondary">
                        등록된 지점 또는 회사 정보가 없습니다.
                    </Typography>
                </Paper>
            )}
        </Box>
    );
};

export default BranchCompanyList; 