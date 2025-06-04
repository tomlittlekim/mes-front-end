import * as XLSX from 'xlsx';
import { format } from 'date-fns';

/**
 * 데이터를 필터링하고 변환하는 함수
 * @param {Array} data - 원본 데이터
 * @param {Array} columns - 컬럼 정의
 * @param {Array} selectedFields - 선택된 필드들
 * @param {string} userFieldType - 등록자 필드 타입 ('id' | 'name')
 * @param {Array} productOptions - 제품 옵션 (선택사항)
 * @param {Array} equipmentOptions - 설비 옵션 (선택사항)
 * @returns {Array} 변환된 데이터
 */
export const transformDataForExport = (
  data,
  columns,
  selectedFields,
  userFieldType,
  productOptions = [],
  equipmentOptions = []
) => {
  // 선택된 컬럼만 필터링
  const selectedColumns = columns.filter(col => {
    // 등록자 필드 특별 처리
    if (col.field === 'createUser' && userFieldType === 'name') {
      return false; // name 타입이면 createUser 필드 제외
    }
    if (col.field === 'createUserName' && userFieldType === 'id') {
      return false; // id 타입이면 createUserName 필드 제외
    }
    
    // 일반 필드 처리
    return selectedFields.includes(col.field) || 
           (col.field === 'createUser' && userFieldType === 'id') ||
           (col.field === 'createUserName' && userFieldType === 'name');
  });

  // 데이터 변환
  return data.map(row => {
    const transformedRow = {};
    
    selectedColumns.forEach(col => {
      const fieldValue = row[col.field];
      let displayValue = fieldValue;

      // 특별한 필드 처리
      switch (col.field) {
        case 'productId':
          const product = productOptions.find(p => p.systemMaterialId === fieldValue);
          displayValue = product?.userMaterialId || fieldValue || '';
          break;
          
        case 'productName':
          const productForName = productOptions.find(p => p.systemMaterialId === row.productId);
          displayValue = productForName?.materialName || row.productName || '-';
          break;
          
        case 'unit':
          const productForUnit = productOptions.find(p => p.systemMaterialId === row.productId);
          displayValue = productForUnit?.unit || '-';
          break;
          
        case 'equipmentId':
          if (!fieldValue) {
            displayValue = '-';
          } else {
            const equipment = equipmentOptions.find(e => e.equipmentId === fieldValue);
            displayValue = equipment?.equipmentName || fieldValue;
          }
          break;
          
        case 'totalQty':
          const goodQty = row.goodQty || 0;
          const defectQty = row.defectQty || 0;
          displayValue = (goodQty + defectQty).toLocaleString();
          break;
          
        case 'goodQty':
        case 'defectQty':
          displayValue = fieldValue !== null && fieldValue !== undefined 
            ? Number(fieldValue).toLocaleString() 
            : '0';
          break;
          
        case 'progressRate':
        case 'defectRate':
          if (col.field === 'progressRate' && !row.workOrderId) {
            displayValue = '-';
          } else {
            displayValue = fieldValue !== null && fieldValue !== undefined 
              ? `${fieldValue}%` 
              : '0%';
          }
          break;
          
        case 'prodStartTime':
        case 'prodEndTime':
        case 'createDate':
          displayValue = formatDateForExport(fieldValue);
          break;
          
        case 'createUser':
          displayValue = userFieldType === 'id' ? (fieldValue || '-') : (row.createUserName || '-');
          break;
          
        case 'createUserName':
          displayValue = userFieldType === 'name' ? (fieldValue || '-') : (row.createUser || '-');
          break;
          
        case 'defectCause':
          displayValue = row.defectCauseName || '-';
          break;
          
        default:
          displayValue = fieldValue || '-';
      }
      
      transformedRow[col.headerName] = displayValue;
    });
    
    return transformedRow;
  });
};

/**
 * 날짜 포맷 함수 (엑셀용)
 * @param {string} dateString - 날짜 문자열
 * @returns {string} 포맷된 날짜
 */
const formatDateForExport = (dateString) => {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    return !isNaN(date) ? format(date, 'yyyy-MM-dd HH:mm') : '-';
  } catch (e) {
    return '-';
  }
};

/**
 * 엑셀 파일로 내보내기
 * @param {Array} data - 내보낼 데이터
 * @param {string} filename - 파일명
 * @param {string} sheetName - 시트명
 */
export const exportToExcel = (data, filename, sheetName = 'Sheet1') => {
  try {
    // 워크북 생성
    const wb = XLSX.utils.book_new();
    
    // 워크시트 생성
    const ws = XLSX.utils.json_to_sheet(data);
    
    // 컬럼 너비 자동 조정
    const colWidths = [];
    if (data.length > 0) {
      Object.keys(data[0]).forEach((key, index) => {
        const maxLength = Math.max(
          key.length,
          ...data.map(row => String(row[key] || '').length)
        );
        colWidths[index] = { wch: Math.min(maxLength + 2, 50) };
      });
      ws['!cols'] = colWidths;
    }
    
    // 워크시트를 워크북에 추가
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    
    // 파일 저장
    const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
    const fullFilename = `${filename}_${timestamp}.xlsx`;
    XLSX.writeFile(wb, fullFilename);
    
    return true;
  } catch (error) {
    console.error('엑셀 내보내기 오류:', error);
    return false;
  }
};

/**
 * 출력용 데이터 생성
 * @param {Array} data - 내보낼 데이터
 * @param {string} title - 문서 제목
 * @returns {Object} 출력용 HTML 문자열과 스타일
 */
export const generatePrintData = (data, title) => {
  if (!data || data.length === 0) {
    return {
      html: '<div>출력할 데이터가 없습니다.</div>',
      styles: ''
    };
  }

  const headers = Object.keys(data[0]);
  
  const styles = `
    <style>
      @media print {
        body { margin: 0; }
        .no-print { display: none !important; }
      }
      .print-container {
        font-family: Arial, sans-serif;
        margin: 20px;
      }
      .print-title {
        text-align: center;
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 20px;
        border-bottom: 2px solid #333;
        padding-bottom: 10px;
      }
      .print-info {
        text-align: right;
        margin-bottom: 20px;
        font-size: 12px;
        color: #666;
      }
      .print-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 10px;
      }
      .print-table th,
      .print-table td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: center;
        font-size: 12px;
      }
      .print-table th {
        background-color: #f5f5f5;
        font-weight: bold;
      }
      .print-table tr:nth-child(even) {
        background-color: #f9f9f9;
      }
      .print-footer {
        margin-top: 30px;
        text-align: center;
        font-size: 10px;
        color: #999;
      }
    </style>
  `;

  const html = `
    <div class="print-container">
      <div class="print-title">${title}</div>
      <div class="print-info">
        출력일시: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}<br>
        총 ${data.length}건
      </div>
      <table class="print-table">
        <thead>
          <tr>
            ${headers.map(header => `<th>${header}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.map(row => `
            <tr>
              ${headers.map(header => `<td>${row[header] || ''}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="print-footer">
        IMOS - 통합 제조 운영 시스템
      </div>
    </div>
  `;

  return { html, styles };
};

/**
 * 출력 실행
 * @param {Array} data - 출력할 데이터
 * @param {string} title - 문서 제목
 */
export const executePrint = (data, title) => {
  try {
    const { html, styles } = generatePrintData(data, title);
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          ${styles}
        </head>
        <body>
          ${html}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    // 약간의 지연 후 인쇄 대화상자 표시
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
    
    return true;
  } catch (error) {
    console.error('출력 오류:', error);
    return false;
  }
}; 