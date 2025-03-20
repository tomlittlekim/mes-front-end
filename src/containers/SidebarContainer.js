import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import { useTabs } from '../contexts/TabContext';

const SidebarContainer = ({ activeMenuItem, activeMenuGroup }) => {
  const { openTab, activeTab } = useTabs();

  // 지속적으로 유지할 메뉴 아이템 상태
  const [menuItems, setMenuItems] = useState([
    {
      id: 'main',
      name: '메인',
      icon: '🏠',
      isActive: false,
      subItems: [] // Main은 하위 메뉴 없음
    },
    {
      id: 'ci',
      name: '기준정보관리',
      icon: 'ℹ️',
      isActive: false,
      subItems: [
        { id: 'ci-common', name: '공통코드관리' },
        { id: 'ci-factory', name: '공장정보관리' },
        { id: 'ci-line', name: '라인정보관리' },
        { id: 'ci-equipment', name: '설비정보관리' },
        { id: 'ci-customer', name: '거래처관리' },
        { id: 'ci-warehouse', name: '창고정보관리' }
      ]
    },
    // 다른 메뉴 항목들...
    {
      id: 'pi',
      name: '품목정보관리',
      icon: '📋',
      isActive: false,
      subItems: [
        { id: 'pi-wip', name: '원/부자재관리' },
        { id: 'pi-half-product', name: '반제품관리' },
        { id: 'pi-product', name: '제품관리' },
        { id: 'pi-bom', name: 'BOM관리' }
      ]
    },
    {
      id: 'sm',
      name: '영업관리',
      icon: '💼',
      isActive: false,
      subItems: [
        { id: 'sm-order', name: '주문등록' },
        { id: 'sm-sales', name: '출하관리' },
        { id: 'sm-transaction', name: '거래명세서관리' }
      ]
    },
    {
      id: 'mi',
      name: '자재/재고관리',
      icon: '📦',
      isActive: false,
      subItems: [
        { id: 'mi-inbound', name: '입고관리' },
        { id: 'mi-outbound', name: '출고관리' },
        { id: 'mi-stock', name: '자재/재고현황' },
        { id: 'mi-stock-history', name: '재고상세이력' }
      ]
    },
    {
      id: 'pm',
      name: '생산관리',
      icon: '🏭',
      isActive: false,
      subItems: [
        { id: 'pm-plan', name: '생산계획관리' },
        { id: 'pm-workorder', name: '작업지시관리' },
        { id: 'mm-result-in', name: '생산실적등록' },
        { id: 'mm-result', name: '생산실적조회' },
        { id: 'mm-defect', name: '불량조회' }
      ]
    },
    {
      id: 'mo',
      name: '모니터링',
      icon: '📊',
      isActive: false,
      subItems: [
        { id: 'mo-integrated', name: '통합모니터링' },
        { id: 'mo-kpi', name: 'KPI모니터링' }
      ]
    },
    {
      id: 'rp',
      name: '리포트',
      icon: '📝',
      isActive: false,
      subItems: [
        { id: 'rp-mpv', name: '계획대비실적조회' },
        { id: 'rp-ppr', name: '기간별생산실적' },
        { id: 'rp-dpr', name: '일일생산수율' },
        { id: 'rp-imr', name: '입출고현황' },
        { id: 'rp-dpr', name: '생산일보' }
      ]
    },
    {
      id: 'sy',
      name: '시스템',
      icon: '⚙️',
      isActive: false,
      subItems: [
        { id: 'sy-notice', name: '공지사항' },
        { id: 'sy-admin', name: '권한관리' },
        { id: 'sy-user', name: '사용자관리' },
        { id: 'sy-company', name: '회사정보' }
      ]
    }
  ]);

  // 현재 열린 메뉴 아이템 상태 (펼쳐진 상태 유지를 위함)
  const [expandedItems, setExpandedItems] = useState(['main']);

  // 메뉴 구조를 메모이제이션하여 재계산 방지
  const menuStructure = useMemo(() => {
    const structure = new Map();
    
    // 메뉴 구조를 맵으로 구성
    menuItems.forEach(item => {
      if (item.subItems && item.subItems.length > 0) {
        item.subItems.forEach(subItem => {
          structure.set(subItem.id, item.id);
        });
      }
    });
    
    return structure;
  }, []);

  // 활성화된 메뉴 업데이트 함수
  const updateActiveMenu = useCallback((activeId) => {
    // 모든 메뉴의 활성 상태 초기화 후 선택된 메뉴만 활성화
    setMenuItems(prevMenuItems => prevMenuItems.map(item => {
      // 메인 메뉴가 활성화되는 경우
      if (item.id === activeId) {
        return { ...item, isActive: true };
      }

      // 서브 메뉴가 활성화되는 경우
      if (item.subItems && item.subItems.some(subItem => subItem.id === activeId)) {
        return { ...item, isActive: true };
      }

      return { ...item, isActive: false };
    }));
  }, []);

  // 현재 활성화된 탭이 변경될 때 해당 메뉴를 활성화
  useEffect(() => {
    if (activeTab) {
      updateActiveMenu(activeTab);
      
      // 상위 메뉴 그룹 확장
      const menuGroup = menuStructure.get(activeTab) || null;
      if (menuGroup) {
        setExpandedItems(prev => {
          if (!prev.includes(menuGroup)) {
            return [...prev, menuGroup];
          }
          return prev;
        });
      }
    }
  }, [activeTab, updateActiveMenu, menuStructure]);

  // 직접 activeMenuItem, activeMenuGroup props가 변경될 때도 적용
  useEffect(() => {
    if (activeMenuItem) {
      updateActiveMenu(activeMenuItem);
    }

    if (activeMenuGroup) {
      setExpandedItems(prev => {
        if (!prev.includes(activeMenuGroup)) {
          return [...prev, activeMenuGroup];
        }
        return prev;
      });
    }
  }, [activeMenuItem, activeMenuGroup, updateActiveMenu]);

  // 메뉴 아이템 확장/축소 토글
  const toggleItem = useCallback((id) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id) 
        : [...prev, id]
    );
  }, []);

  // 메뉴 클릭 핸들러
  const handleItemClick = useCallback((id) => {
    console.log(`Menu clicked: ${id}`);
    
    // 탭 정보 생성
    let tabInfo = {
      id: id,
      name: '탭'
    };
    
    // 메인 메뉴 클릭 시 ID가 'main'으로 전달됨 (메뉴 아이템의 ID)
    if (id === 'main') {
      tabInfo.name = '메인';
      openTab(tabInfo);
      return;
    }
    
    // 메뉴 아이템 찾기
    // 상태 업데이트를 하지 않고 현재 menuItems를 사용
    let foundTab = false;
    menuItems.forEach(item => {
      if (item.id === id) {
        tabInfo.name = item.name;
        foundTab = true;
      } else if (item.subItems) {
        const subItem = item.subItems.find(sub => sub.id === id);
        if (subItem) {
          tabInfo.name = subItem.name;
          tabInfo.group = item.id;
          foundTab = true;
        }
      }
    });
    
    if (foundTab) {
      openTab(tabInfo);
    }
  }, [openTab, menuItems]);

  return (
    <Sidebar
      items={menuItems}
      expandedItems={expandedItems}
      onItemClick={handleItemClick}
      onToggleItem={toggleItem}
    />
  );
};

export default SidebarContainer;