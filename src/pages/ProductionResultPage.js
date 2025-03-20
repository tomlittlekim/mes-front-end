import React from 'react';
import ProductionResultManagement from '../components/ProductionManagement/ProductionResultManagement';

const ProductionResultPage = (props) => {
  return (
    <>
      <ProductionResultManagement tabId={props.tabId || 'mm-result-in'} />
    </>
  );
};

export default ProductionResultPage; 