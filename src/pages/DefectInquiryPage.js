import React from 'react';
import DefectInfoInquiry from '../components/ProductionManagement/DefectInfoInquiry';
import PageLayout from '../components/Layout/PageLayout';

const DefectInquiryPage = (props) => {
  return (
    <PageLayout>
      <DefectInfoInquiry tabId={props.tabId || 'defect-inquiry'} />
    </PageLayout>
  );
};

export default DefectInquiryPage; 