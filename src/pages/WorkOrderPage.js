import React from 'react';
import WorkOrderManagement from '../components/ProductionManagement/WorkOrder';
import PageLayout from '../components/Layout/PageLayout';

const WorkOrderPage = (props) => {
  return (
    <PageLayout>
      <WorkOrderManagement tabId={props.tabId || 'mm-workorder'} />
    </PageLayout>
  );
};

export default WorkOrderPage; 