import React from 'react';
import ProductionPlanManagement from '../components/ProductionManagement/ProductionPlanManagement';
import PageLayout from '../components/Layout/PageLayout';

const ProductionPlanPage = (props) => {
  return (
    <PageLayout>
      <ProductionPlanManagement tabId={props.tabId || 'mm-plan'} />
    </PageLayout>
  );
};

export default ProductionPlanPage; 