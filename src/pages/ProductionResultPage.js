import React from 'react';
import ProductionResultManagement from '../components/ProductionManagement/ProductionResultManagement';
import PageLayout from '../components/Layout/PageLayout';

const ProductionResultPage = (props) => {
  return (
    <PageLayout>
      <ProductionResultManagement tabId={props.tabId || 'mm-result-in'} />
    </PageLayout>
  );
};

export default ProductionResultPage; 