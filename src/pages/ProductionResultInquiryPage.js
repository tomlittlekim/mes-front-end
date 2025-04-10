import React from 'react';
import ProductionResultInquiry from '../components/ProductionManagement/ProductionResultInquiry/ProductionResultInquiry';
import PageLayout from '../components/Layout/PageLayout';

const ProductionResultInquiryPage = (props) => {
  return (
    <PageLayout>
      <ProductionResultInquiry tabId={props.tabId || 'mm-result'} />
    </PageLayout>
  );
};

export default ProductionResultInquiryPage; 