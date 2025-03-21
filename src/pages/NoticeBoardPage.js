import React from 'react';
import NoticeBoard from '../components/System/NoticeBoard';

const NoticeBoardPage = (props) => {
  return (
    <>
      <NoticeBoard tabId={props.tabId || 'sy-notice'} />
    </>
  );
};

export default NoticeBoardPage; 