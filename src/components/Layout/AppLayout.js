import React from 'react';
import SidebarContainer from '../../containers/SidebarContainer';
import AppHeader from '../Common/AppHeader';
import TabLayout from './TabLayout';
import { Element, scroller } from 'react-scroll';
import './AppLayout.css';

const AppLayout = () => {
  return (
      <div className="app-layout">
        <SidebarContainer />
        <main className="app-main">
          <AppHeader />
          <Element name="app-content" className="app-content">
            <TabLayout />
          </Element>
        </main>
      </div>
  );
};

export default AppLayout;