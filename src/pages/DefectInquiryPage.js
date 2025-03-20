import React from 'react';
import DefectInquiry from '../components/ProductionManagement/DefectInquiry';

const DefectInquiryPage = (props) => {
  return <DefectInquiry tabId={props.tabId || 'defect-inquiry'} />;
};

export default DefectInquiryPage; 