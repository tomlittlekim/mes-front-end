import React from 'react';
import PageLayout from '../components/Layout/PageLayout';
import MaterialManagement from "../components/MaterialManagement/RawSubMaterial/MaterialManagement";

const MaterialManagementPage = (props) => {
  return (
    <PageLayout>
      <MaterialManagement tabId={props.tabId || 'pi-material-management'} />
    </PageLayout>
  );
};

export default MaterialManagementPage; 