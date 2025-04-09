import React from 'react';
import ProductionResultManagement from '../components/ProductionManagement/ProductionResult/ProductionResultManagement';
import { ProductionResultProvider } from '../components/ProductionManagement/ProductionResult/contexts/ProductionResultContext';
import PageLayout from '../components/Layout/PageLayout';

const ProductionResultPage = (props) => {
  const tabId = props.tabId || 'mm-result-in';

  return (
      <PageLayout>
        <ProductionResultProvider tabId={tabId}>
          <ProductionResultManagement tabId={tabId} />
        </ProductionResultProvider>
      </PageLayout>
  );
};

export default ProductionResultPage;