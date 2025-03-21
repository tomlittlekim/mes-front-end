import React from 'react';
import ProductionResultInquiry from '../components/ProductionManagement/ProductionResultInquiry';

const ProductionResultInquiryPage = (props) => {
  return (
    <>
      <ProductionResultInquiry tabId={props.tabId || 'mm-result'} />
    </>
  );
};

export default ProductionResultInquiryPage; 