import React, { useState } from 'react';
import { Box, Container, Typography, CircularProgress, FormControl, InputLabel, Select, MenuItem, Grid, Button, Paper, useTheme } from '@mui/material';
import { useKPISetting } from './hooks/useKPISetting';
import BranchCompanyList from './components/BranchCompanyList';
import { DOMAINS, useDomain } from '../../../contexts/DomainContext';
import PageHeader from '../../BomManagement/components/PageHeader';
import HelpContent from './components/HelpContent';
import './KPISetting.css';

/**
 * KPI 설정 관리 컴포넌트
 * 
 * 각 회사별로 필요한 KPI 지표를 설정하고 관리하는 화면입니다.
 */
const KPISetting = () => {
  // 전역 상태 및 유틸리티
  const theme = useTheme();
  const { domain } = useDomain();
  const isDarkMode = theme.palette.mode === 'dark';
  
  // 모달 관련 상태
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  
  const { 
    branchList, 
    kpiIndicators, 
    isLoading, 
    isSaving,
    selectedBranch,
    handleBranchChange,
    handleCompanyKPIChange,
    handleKPIIndicatorSelection,
    handleTargetValueChange,
    saveSettings,
    maxKpiSelection
  } = useKPISetting();

  // 선택된 지부 내의 회사 목록과 데이터
  const selectedBranchData = branchList.find(branch => branch.id === selectedBranch);

  return (
    <Box sx={{p: 0, minHeight: '100vh'}}>
      {/* 헤더 영역 */}
      <PageHeader
        title="KPI 지표 관리"
        setIsHelpModalOpen={setIsHelpModalOpen}
        domain={domain}
        isDarkMode={isDarkMode}
      />
      
      <Box sx={{ pt: 4, pb: 6 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
            <CircularProgress size={60} />
          </Box>
        ) : (
          <>
            <Paper elevation={2} sx={{ p: 3, mb: 5 }}>
              <Grid container spacing={4} alignItems="center">
                <Grid item xs={12} md={8}>
                  <FormControl fullWidth size="large">
                    <InputLabel>지부 선택</InputLabel>
                    <Select
                      value={selectedBranch || ''}
                      label="지부 선택"
                      onChange={(e) => handleBranchChange(e.target.value)}
                      sx={{ fontSize: '1.1rem', height: '56px' }}
                    >
                      {branchList.map((branch) => (
                        <MenuItem key={branch.id} value={branch.id} sx={{ fontSize: '1.1rem' }}>
                          {branch.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center' }}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={saveSettings}
                    disabled={isSaving || !selectedBranch}
                    sx={{ 
                      height: '56px', 
                      fontSize: '1.1rem', 
                      fontWeight: 'bold',
                      px: 4
                    }}
                    fullWidth
                  >
                    {isSaving ? '저장 중...' : 'KPI 설정 저장'}
                  </Button>
                </Grid>
              </Grid>
            </Paper>

            {selectedBranch ? (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                  {selectedBranchData?.name} 지부 KPI 설정
                </Typography>
                <BranchCompanyList 
                  branchList={selectedBranchData ? [selectedBranchData] : []}
                  kpiIndicators={kpiIndicators}
                  onCompanyKPIChange={handleCompanyKPIChange}
                  onKPIIndicatorSelection={handleKPIIndicatorSelection}
                  onTargetValueChange={handleTargetValueChange}
                  isSaving={isSaving}
                  maxKpiSelection={maxKpiSelection}
                />
              </Box>
            ) : (
              <Paper sx={{ p: 5, mt: 5, textAlign: 'center', backgroundColor: '#f5f5f5' }}>
                <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                  지부를 선택하면 해당 지부의 회사별 KPI 설정을 관리할 수 있습니다.
                </Typography>
              </Paper>
            )}
          </>
        )}
      </Box>

      {/* 도움말 모달 */}
      <HelpContent
        isHelpModalOpen={isHelpModalOpen}
        setIsHelpModalOpen={setIsHelpModalOpen}
        domain={domain}
        isDarkMode={isDarkMode}
      />
    </Box>
  );
};

export default KPISetting; 