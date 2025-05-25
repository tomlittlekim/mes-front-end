import React, { useState } from 'react';
import ModelViewer from './ModelViewer';
import IotChartFor3d from '../Charts/IotChartFor3d';

const panelWidth = 420;
const panelMinWidth = 220;

const ModelViewerWithIotPanel = ({ tabId }) => {
  const [minimized, setMinimized] = useState(true);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <ModelViewer tabId={tabId} />
      <div
        style={{
          position: 'absolute',
          top: 24,
          right: 24,
          width: minimized ? panelMinWidth : panelWidth,
          minHeight: minimized ? 48 : 400,
          background: '#fff',
          border: '1px solid #eee',
          borderRadius: 8,
          boxShadow: '0 2px 12px #0001',
          zIndex: 20,
          transition: 'width 0.2s, min-height 0.2s',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* 상태바 */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: 48, padding: '0 16px', borderBottom: minimized ? 'none' : '1px solid #eee', background: '#f7f7f7',
        }}>
          <span style={{ fontWeight: 600, fontSize: 16 }}>IOT 전력량</span>
          <button
            style={{ border: 'none', background: 'none', fontSize: 20, cursor: 'pointer', color: '#888' }}
            onClick={() => setMinimized(m => !m)}
            title={minimized ? '확장' : '최소화'}
          >
            {minimized ? '+' : '-'}
          </button>
        </div>
        {/* 본문 */}
        <div style={{ 
          flex: 1, 
          minHeight: minimized ? 0 : 352, 
          padding: 8, 
          overflow: 'auto',
          display: minimized ? 'none' : 'block'
        }}>
            <IotChartFor3d />
          </div>
      </div>
    </div>
  );
};

export default ModelViewerWithIotPanel; 