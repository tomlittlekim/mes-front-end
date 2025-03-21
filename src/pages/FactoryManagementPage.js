import React from 'react';
import FactoryManagement from '../components/FactoryManagement/FactoryManagement';

const FactoryManagementPage = (props) => {
  return (
    <>
      <FactoryManagement tabId={props.tabId || 'ci-factory'} />
    </>
  );
};

export default FactoryManagementPage; 