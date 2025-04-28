import React, { useState, useEffect } from 'react';
import './ProductManagement.css';
import {
  Box,
  useTheme,
} from '@mui/material';
import { DOMAINS, useDomain } from "../../../contexts/DomainContext";
import { useGraphQL } from "../../../apollo/useGraphQL";
import { useProductData } from './hooks/useProductData';

// 직접 컴포넌트 import
import SearchForm from './components/SearchForm';
import ProductGrid from './components/ProductGrid';
import HelpContent from './components/HelpContent';
import PageHeader from './components/PageHeader';

const ProductManagement = ({tabId}) => {
  // Theme 및 Context 관련
  const theme = useTheme();
  const { domain } = useDomain();
  const isDarkMode = theme.palette.mode === 'dark';
  const { executeQuery, executeMutation } = useGraphQL();
  
  // 상태 관리
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  
  // 제품 데이터 관련 훅 사용
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
    generateId
  } = useProductData(executeQuery, executeMutation);

  /** 초기 데이터 로드 */
  useEffect(() => {
    loadInitialData();
  }, []);

  return (
    <Box sx={{ p: 0, minHeight: '100vh' }}>
      {/* 타이틀 영역 */}
      <PageHeader 
        title="제품관리"
        setIsHelpModalOpen={setIsHelpModalOpen}
        domain={domain}
        isDarkMode={isDarkMode}
      />

      {/* 검색 폼 컴포넌트 */}
      <SearchForm onSearch={handleSearch} />

      {/* 그리드 컴포넌트 */}
      {!isLoading && (
        <ProductGrid
          materialList={materialList}
          handleSelectionModelChange={handleSelectionModelChange}
          handleProcessRowUpdate={handleProcessRowUpdate}
          handleRowAdd={handleRowAdd}
          handleSave={handleSave}
          handleDelete={handleDelete}
          setMaterialList={setMaterialList}
          generateId={generateId}
          tabId={tabId}
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

export default ProductManagement;
