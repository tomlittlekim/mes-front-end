import React, { useState, useEffect } from 'react';
import './MaterialManagement.css';
import {
  Box,
  useTheme,
} from '@mui/material';
import { DOMAINS, useDomain } from "../../../contexts/DomainContext";
import { useGraphQL } from "../../../apollo/useGraphQL";
import { useMaterialData } from './hooks/useMaterialData';

// 분리한 컴포넌트들 import
import SearchForm from './components/SearchForm';
import MaterialGrid from './components/MaterialGrid';
import HelpContent from './components/HelpContent';
import PageHeader from './components/PageHeader';

const MaterialManagement = ({ tabId }) => {
  // Theme 및 Context 관련
  const theme = useTheme();
  const { domain } = useDomain();
  const isDarkMode = theme.palette.mode === 'dark';
  const { executeQuery, executeMutation } = useGraphQL();
  
  // 상태 관리
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  
  // 원부자재 데이터 관련 훅 사용
  const {
    materialList,
    setMaterialList,
    isLoading,
    handleSelectionModelChange,
    handleProcessRowUpdate,
    handleRowAdd,
    loadInitialData,
    handleSearch,
    handleSave,
    handleDelete,
    generateId,
    // 드롭다운 옵션들
    unitOptions,
    materialCategoryOptions,
    rawSubTypeOptions,
    vendorOptions
  } = useMaterialData(executeQuery, executeMutation);

  /** 초기 데이터 로드 */
  useEffect(() => {
    loadInitialData();
  }, []);

  return (
    <Box sx={{ p: 0, minHeight: '100vh' }}>
      {/* 타이틀 영역 */}
      <PageHeader 
        title="원부자재 관리"
        setIsHelpModalOpen={setIsHelpModalOpen}
        domain={domain}
        isDarkMode={isDarkMode}
      />

      {/* 검색 폼 컴포넌트 */}
      <SearchForm 
        onSearch={handleSearch}
        rawSubTypeOptions={rawSubTypeOptions}
      />

      {/* 그리드 컴포넌트 */}
      {!isLoading && (
        <MaterialGrid
          materialList={materialList}
          handleSelectionModelChange={handleSelectionModelChange}
          handleProcessRowUpdate={handleProcessRowUpdate}
          handleRowAdd={handleRowAdd}
          handleSave={handleSave}
          handleDelete={handleDelete}
          setMaterialList={setMaterialList}
          generateId={generateId}
          tabId={tabId}
          // 드롭다운 옵션 전달
          unitOptions={unitOptions}
          materialCategoryOptions={materialCategoryOptions}
          rawSubTypeOptions={rawSubTypeOptions}
          vendorOptions = {vendorOptions}
        />
      )}
      
      {/* 도움말 및 정보 영역 */}
      <HelpContent
        isHelpModalOpen={isHelpModalOpen}
        setIsHelpModalOpen={setIsHelpModalOpen}
        domain={domain}
        isDarkMode={isDarkMode}
      />
    </Box>
  );
};

export default MaterialManagement; 