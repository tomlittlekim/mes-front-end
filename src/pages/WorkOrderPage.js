import React from 'react';
import WorkOrderManagement from '../components/ProductionManagement/WorkOrderManagement';

const WorkOrderPage = (props) => {
  return (
    <>
      <WorkOrderManagement tabId={props.tabId || 'mm-workorder'} />
    </>
  );
};

export default WorkOrderPage; 