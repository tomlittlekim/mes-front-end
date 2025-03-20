import React from 'react';
import LineManagement from '../components/LineManagement/LineManagement';

const LineManagementPage = (props) => {
  return <LineManagement tabId={props.tabId || 'line'} />;
};

export default LineManagementPage; 