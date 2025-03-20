import React from 'react';
import SidebarContainer from '../../containers/SidebarContainer';
import AppHeader from '../Common/AppHeader';
import TabLayout from './TabLayout';
import './AppLayout.css';

const AppLayout = () => {
  return (
      <div className="app-layout">
        <SidebarContainer />
        <main className="app-main">
          <AppHeader />
          <div className="app-content">
            <TabLayout />
          </div>
        </main>
      </div>
  );
};

export default AppLayout;