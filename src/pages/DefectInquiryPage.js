import React from 'react';
import DefectInquiry from '../components/ProductionManagement/DefectInquiry';
import PageLayout from '../components/Layout/PageLayout';

const DefectInquiryPage = (props) => {
  return (
    <PageLayout>
      <DefectInquiry tabId={props.tabId || 'defect-inquiry'} />
    </PageLayout>
  );
};

export default DefectInquiryPage; 