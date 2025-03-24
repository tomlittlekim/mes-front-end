import React from 'react';
import NoticeBoard from '../components/System/NoticeBoard';
import PageLayout from '../components/Layout/PageLayout';

const NoticeBoardPage = (props) => {
  return (
    <PageLayout>
      <NoticeBoard tabId={props.tabId || 'sy-notice'} />
    </PageLayout>
  );
};

export default NoticeBoardPage; 