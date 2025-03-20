import React from 'react';
import './Sidebar.css';
import { useTabs } from '../../contexts/TabContext';
import { useDomain, DOMAINS } from '../../contexts/DomainContext';

const Sidebar = ({ items, expandedItems = ['main'], onItemClick, onToggleItem }) => {
  const { activeTab } = useTabs();
  const { domain, domainName } = useDomain();

  // expandedItems props가 없을 경우 기본값으로 ['main'] 사용
  const handleToggle = (id) => {
    if (onToggleItem) {
      onToggleItem(id);
    }
  };

  const handleClick = (id) => {
    if (onItemClick) {
      onItemClick(id);
    }
  };

  // 도메인에 따라 로고 클래스 반환
  const getLogoClass = () => {
    return domain === DOMAINS.PEMS ? 'pems-logo system-logo' : 'imos-logo system-logo';
  };

  return (
      <div className="sidebar">
        <div className="sidebar-title">
          <h2 className={getLogoClass()}>{domainName}</h2>
        </div>
        <nav className="sidebar-nav">
          <ul className="sidebar-menu">
            {items.map(item => (
                <li key={item.id} className={item.isActive ? 'active' : ''}>
                  <div
                      className="menu-item"
                      onClick={() => {
                        // 확장/축소 토글
                        handleToggle(item.id);

                        // 서브메뉴가 없는 항목(예: 메인 메뉴)은 클릭 시 해당 페이지로 이동
                        if (!item.subItems || item.subItems.length === 0) {
                          handleClick(item.id);
                        }
                      }}
                  >
                    <div className="menu-title">
                      <span className="icon">{item.icon}</span>
                      <span className="menu-name">{item.name}</span>
                    </div>
                    {item.subItems && item.subItems.length > 0 && (
                        <span className="expand-icon">
                    {expandedItems.includes(item.id) ? '▼' : '▶'}
                  </span>
                    )}
                  </div>

                  {item.subItems && expandedItems.includes(item.id) && (
                      <ul className="submenu">
                        {item.subItems.map(subItem => {
                          // 현재 활성화된 탭과 비교
                          const isActive = subItem.id === activeTab;
                          return (
                            <li key={subItem.id} className={isActive ? 'active' : ''}>
                              <a
                                  href={`#${subItem.id}`}
                                  className={isActive ? 'active' : ''}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleClick(subItem.id);
                                  }}
                              >
                                <span>{subItem.name}</span>
                              </a>
                            </li>
                          );
                        })}
                      </ul>
                  )}
                </li>
            ))}
          </ul>
        </nav>
      </div>
  );
};

export default Sidebar;