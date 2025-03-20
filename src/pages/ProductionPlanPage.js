import React from 'react';
import ProductionPlanManagement from '../components/ProductionManagement/ProductionPlanManagement';

const ProductionPlanPage = (props) => {
  return (
    <>
      <ProductionPlanManagement tabId={props.tabId || 'mm-plan'} />
    </>
  );
};

export default ProductionPlanPage; 