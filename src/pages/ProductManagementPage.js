import React from 'react';
import ProductManagement from '../components/ProductManagement/ProductManagement';

const ProductManagementPage = (props) => {
  return (
    <>
      <ProductManagement tabId={props.tabId || 'pi-product'} />
    </>
  );
};

export default ProductManagementPage; 