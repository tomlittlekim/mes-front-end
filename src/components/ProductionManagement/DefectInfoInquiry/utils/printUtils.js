import { format } from 'date-fns';
import { getDefectStateName, getDefectStateClass } from './gridDataUtils';
import Swal from 'sweetalert2';

/**
 * 날짜 형식화 함수
 * 
 * @param {string} dateString - 날짜 문자열
 * @returns {string} 형식화된 날짜 문자열 (yyyy-MM-dd HH:mm)
 */
const formatDate = (dateString) => {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    return !isNaN(date) ? format(date, 'yyyy-MM-dd HH:mm') : '-';
  } catch (e) {
    return '-';
  }
};

/**
 * 불량정보 인쇄를 위한 함수
 * 
 * @param {Array} defectInfoList - 불량정보 목록
 * @param {Array} productOptions - 제품 정보 목록
 * @param {Array} equipmentOptions - 설비 정보 목록
 * @returns {void}
 */
export const printDefectInfo = (defectInfoList, productOptions = [], equipmentOptions = []) => {
  // 인쇄 중 상태인지 확인하여 이미 인쇄중이면 무시
  if (window.isPrinting) return;
  window.isPrinting = true;

  // 새 창 생성
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  
  // 인쇄할 제품 정보로 Map 생성
  const productMap = {};
  productOptions.forEach(product => {
    if (product.systemMaterialId) {
      productMap[product.systemMaterialId] = {
        name: product.materialName || '-',
        code: product.userMaterialId || '-',
        unit: product.unit || '-'
      };
    }
  });

  // 인쇄할 설비 정보로 Map 생성
  const equipmentMap = {};
  equipmentOptions.forEach(equipment => {
    if (equipment.equipmentId) {
      equipmentMap[equipment.equipmentId] = {
        name: equipment.equipmentName || '-',
        factory: equipment.factoryName || '-',
        line: equipment.lineName || '-'
      };
    }
  });

  // CSS 스타일 정의
  const styles = `
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { text-align: center; font-size: 24px; margin-bottom: 20px; }
    .print-info { text-align: right; margin-bottom: 10px; font-size: 12px; color: #666; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
    th { background-color: #f2f2f2; }
    .no-data { text-align: center; padding: 50px; font-size: 16px; color: #666; }
    .defect-highlight { color: #f44336; font-weight: bold; }
    .status-cell {
      padding: 3px 6px;
      border-radius: 4px;
      font-weight: 600;
      text-align: center;
      text-transform: uppercase;
      font-size: 0.75rem;
      display: inline-block;
      min-width: 80px;
    }
    .status-active {
      background-color: rgba(84, 214, 44, 0.16);
      color: #229A16;
    }
    .status-inactive {
      background-color: rgba(255, 72, 66, 0.16);
      color: #B71D18;
    }
    .status-pending {
      background-color: rgba(255, 193, 7, 0.16);
      color: #B78103;
    }
    @media print {
      body { -webkit-print-color-adjust: exact; color-adjust: exact; }
    }
  `;

  // HTML 내용 생성
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>불량정보 목록</title>
        <style>${styles}</style>
      </head>
      <body>
        <h1>불량정보 목록</h1>
        <div class="print-info">출력일시: ${formatDate(new Date().toISOString())}</div>
        
        ${defectInfoList.length === 0 ? '<div class="no-data">조회된 불량정보가 없습니다.</div>' : `
          <table>
            <thead>
              <tr>
                <th>불량ID</th>
                <th>생산실적ID</th>
                <th>제품</th>
                <th>제품명</th>
                <th>불량수량</th>
                <th>불량정보</th>
                <th>불량원인</th>
                <th>상태</th>
                <th>설비</th>
                <th>등록일시</th>
                <th>등록자</th>
              </tr>
            </thead>
            <tbody>
              ${defectInfoList.map(defect => `
                <tr>
                  <td>${defect.defectId || '-'}</td>
                  <td>${defect.prodResultId || '-'}</td>
                  <td>${productMap[defect.productId]?.code || defect.productId || '-'}</td>
                  <td>${productMap[defect.productId]?.name || defect.productName || '-'}</td>
                  <td class="${parseFloat(defect.defectQty) > 0 ? 'defect-highlight' : ''}">${
                    defect.defectQty !== null && defect.defectQty !== undefined
                        ? parseFloat(defect.defectQty).toLocaleString()
                        : '0'
                  }</td>
                  <td>${defect.resultInfo || '-'}</td>
                  <td>${defect.defectCause || '-'}</td>
                  <td>
                    <span class="status-cell ${getDefectStateClass(defect.state)}">
                      ${getDefectStateName(defect.state)}
                    </span>
                  </td>
                  <td>${equipmentMap[defect.equipmentId]?.name || defect.equipmentId || '-'}</td>
                  <td>${formatDate(defect.createDate)}</td>
                  <td>${defect.createUser || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `}
      </body>
    </html>
  `;

  // 내용 쓰기 및 인쇄
  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  
  // 인쇄 다이얼로그 표시 전 로딩 대기
  printWindow.onload = () => {
    printWindow.print();
    printWindow.onafterprint = () => {
      printWindow.close();
      window.isPrinting = false;
    };
  };
};

/**
 * 불량정보를 CSV로 내보내는 함수
 * 
 * @param {Array} defectInfoList - 불량정보 목록
 * @param {Array} productOptions - 제품 정보 목록
 * @param {Array} equipmentOptions - 설비 정보 목록
 * @returns {void}
 */
export const exportDefectInfoToCSV = (defectInfoList, productOptions = [], equipmentOptions = []) => {
  if (!defectInfoList || defectInfoList.length === 0) {
    Swal.fire({
      icon: 'warning',
      title: '알림',
      text: '내보낼 데이터가 없습니다.'
    });
    return;
  }

  // 인쇄할 제품 정보로 Map 생성
  const productMap = {};
  productOptions.forEach(product => {
    if (product.systemMaterialId) {
      productMap[product.systemMaterialId] = {
        name: product.materialName || '-',
        code: product.userMaterialId || '-',
        unit: product.unit || '-'
      };
    }
  });

  // 인쇄할 설비 정보로 Map 생성
  const equipmentMap = {};
  equipmentOptions.forEach(equipment => {
    if (equipment.equipmentId) {
      equipmentMap[equipment.equipmentId] = {
        name: equipment.equipmentName || '-',
        factory: equipment.factoryName || '-',
        line: equipment.lineName || '-'
      };
    }
  });

  // CSV 헤더
  const headers = [
    '불량ID', 
    '생산실적ID', 
    '제품코드',
    '제품명',
    '불량수량',
    '불량정보',
    '불량원인',
    '상태',
    '설비',
    '등록일시',
    '등록자'
  ];

  // CSV 행 데이터 생성
  const csvRows = [
    headers.join(',')
  ];

  // 데이터 행 추가
  defectInfoList.forEach(defect => {
    const productCode = productMap[defect.productId]?.code || defect.productId || '';
    const productName = productMap[defect.productId]?.name || defect.productName || '';
    const equipmentName = equipmentMap[defect.equipmentId]?.name || defect.equipmentId || '';
    
    const row = [
      defect.defectId || '',
      defect.prodResultId || '',
      productCode,
      productName,
      defect.defectQty !== null && defect.defectQty !== undefined ? defect.defectQty : '0',
      defect.resultInfo || '',
      defect.defectCause || '',
      getDefectStateName(defect.state),
      equipmentName,
      formatDate(defect.createDate),
      defect.createUser || ''
    ];
    
    // 쉼표 포함된 필드는 따옴표로 묶기
    const escapedRow = row.map(field => {
      const stringField = `${field}`;
      return stringField.includes(',') ? `"${stringField}"` : stringField;
    });
    
    csvRows.push(escapedRow.join(','));
  });
  
  // CSV 문자열 생성
  const csvContent = csvRows.join('\n');
  
  // CSV 다운로드
  const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  // 다운로드 속성 설정
  const now = new Date();
  const formattedDate = format(now, 'yyyyMMdd_HHmmss');
  link.setAttribute('href', url);
  link.setAttribute('download', `불량정보_${formattedDate}.csv`);
  link.style.visibility = 'hidden';
  
  // 다운로드 실행
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}; 