import React from 'react';
import CompanyInfo from '../components/System/CompanyInfo';
import PageLayout from '../components/Layout/PageLayout';

const CompanyInfoPage = (props) => {
  return (
    <PageLayout>
      <CompanyInfo tabId={props.tabId || 'company-info'} />
    </PageLayout>
  );
};

export default CompanyInfoPage; 