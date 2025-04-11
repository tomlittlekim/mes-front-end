import React from 'react';
import { DefectManagement } from '../components/ProductionManagement/DefectInquiry';
import PageLayout from '../components/Layout/PageLayout';

const DefectInquiryPage = (props) => {
  return (
    <PageLayout>
      <DefectManagement tabId={props.tabId || 'defect-inquiry'} />
    </PageLayout>
  );
};

export default DefectInquiryPage; 