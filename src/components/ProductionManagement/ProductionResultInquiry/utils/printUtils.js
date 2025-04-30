import { format } from 'date-fns';
import Message from '../../../../utils/message/Message';

/**
 * 날짜 포맷 함수
 * 
 * @param {String} dateString - 날짜 문자열
 * @returns {String} 포맷된 날짜 문자열 또는 '-'
 */
const formatDateDisplay = (dateString) => {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    return !isNaN(date) ? format(date, 'yyyy-MM-dd HH:mm:ss') : '-';
  } catch (e) {
    return '-';
  }
};

/**
 * 생산실적 데이터 인쇄 유틸리티
 *
 * @param {Object} selectedWorkOrder - 선택된 작업지시 객체 (없을 수 있음)
 * @param {Array} productionResultList - 생산실적 목록
 * @param {String} userName - 현재 사용자 이름
 * @param {Array} productOptions - 제품 옵션 목록
 * @param {Array} equipmentOptions - 설비 옵션 목록
 */
export const printProductionResult = (selectedWorkOrder, productionResultList, userName, productOptions = [], equipmentOptions = []) => {
  if (productionResultList.length === 0) {
    Message.showWarning('출력할 생산실적이 없습니다.');
    return;
  }

  try {
    // 생산실적 데이터를 출력 가능한 형태로 준비
    const printData = productionResultList.map(item => {
      // 제품 정보 찾기
      const product = productOptions.find(p => p.systemMaterialId === item.productId);
      const productId = product ? product.userMaterialId : item.productId;
      const productName = product ? product.materialName : '-';
      const unit = product ? product.unit : '-';
      
      // 설비 정보 찾기
      const equipment = equipmentOptions.find(e => e.equipmentId === item.equipmentId);
      const equipmentName = equipment ? equipment.equipmentName : item.equipmentId || '-';
      
      return {
        생산실적ID: item.prodResultId || '-',
        작업지시ID: item.workOrderId || '-',
        제품ID: productId || '-',
        제품명: productName || '-',
        단위: unit || '-',
        생산수량: (item.goodQty || 0) + (item.defectQty || 0),
        양품수량: item.goodQty || 0,
        불량수량: item.defectQty || 0,
        진척률: `${item.progressRate || 0}%`,
        불량률: `${item.defectRate || 0}%`,
        설비: equipmentName || '-',
        생산시작일시: formatDateDisplay(item.prodStartTime),
        생산종료일시: formatDateDisplay(item.prodEndTime),
        등록일시: formatDateDisplay(item.createDate),
        등록자: item.createUser || '-'
      };
    });

    // 새 창에 출력용 HTML 생성
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      Message.showWarning('팝업이 차단되어 있습니다. 팝업 차단을 해제해주세요.');
      return;
    }

    // 타이틀 설정
    const title = `생산실적 출력 - ${format(new Date(), 'yyyy-MM-dd')}`;

    // 인쇄할 HTML 생성
    printWindow.document.write(`
      <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; text-align: center; font-size: 18px; margin-bottom: 20px; }
          .info-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .info-table th, .info-table td { padding: 8px; text-align: left; border: 1px solid #ddd; }
          .info-table th { background-color: #f0f0f0; font-weight: bold; }
          .data-table { width: 100%; border-collapse: collapse; }
          .data-table th, .data-table td { padding: 8px; text-align: center; border: 1px solid #ddd; }
          .data-table th { background-color: #f0f0f0; font-weight: bold; }
          .data-table tr:nth-child(even) { background-color: #f9f9f9; }
          .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
          @media print {
            body { margin: 0; padding: 15px; }
            h1 { margin-top: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="text-align: right; margin-bottom: 20px;">
          <button onclick="window.print()">인쇄</button>
          <button onclick="window.close()">닫기</button>
        </div>
        
        <h1>생산실적 출력</h1>
        
        <table class="info-table">
          <tr>
            <th>생산실적 건수</th>
            <td>${productionResultList.length}건</td>
            <th>출력일시</th>
            <td>${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}</td>
          </tr>
        </table>
        
        <table class="data-table">
          <thead>
            <tr>
              <th>생산실적ID</th>
              <th>작업지시ID</th>
              <th>제품ID</th>
              <th>제품명</th>
              <th>단위</th>
              <th>생산수량</th>
              <th>양품수량</th>
              <th>불량수량</th>
              <th>진척률</th>
              <th>불량률</th>
              <th>설비</th>
              <th>생산시작일시</th>
              <th>생산종료일시</th>
              <th>등록일시</th>
              <th>등록자</th>
            </tr>
          </thead>
          <tbody>
            ${printData.map(item => `
              <tr>
                <td>${item.생산실적ID}</td>
                <td>${item.작업지시ID}</td>
                <td>${item.제품ID}</td>
                <td>${item.제품명}</td>
                <td>${item.단위}</td>
                <td>${item.생산수량}</td>
                <td>${item.양품수량}</td>
                <td>${item.불량수량}</td>
                <td>${item.진척률}</td>
                <td>${item.불량률}</td>
                <td>${item.설비}</td>
                <td>${item.생산시작일시}</td>
                <td>${item.생산종료일시}</td>
                <td>${item.등록일시}</td>
                <td>${item.등록자}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          출력일시: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')} / 출력자: ${userName || '관리자'}
        </div>
        
        <script>
          // 자동으로 인쇄 다이얼로그 열기
          window.onload = function() {
            // 잠시 지연 후 인쇄 다이얼로그 표시
            setTimeout(function() {
              window.print();
            }, 500);
          };
        </script>
      </body>
      </html>
    `);

    printWindow.document.close();

    Message.showSuccess('인쇄 창이 열렸습니다.');
  } catch (error) {
    console.error('인쇄 중 오류 발생:', error);
    Message.showError({ message: '인쇄 중 오류가 발생했습니다.' });
  }
};

/**
 * 생산실적 데이터를 CSV로 내보내는 유틸리티
 *
 * @param {Object} selectedWorkOrder - 선택된 작업지시 객체 (없을 수 있음)
 * @param {Array} productionResultList - 생산실적 목록
 * @param {Array} productOptions - 제품 옵션 목록
 * @param {Array} equipmentOptions - 설비 옵션 목록
 */
export const exportProductionResultToCSV = (selectedWorkOrder, productionResultList, productOptions = [], equipmentOptions = []) => {
  if (productionResultList.length === 0) {
    Message.showWarning('내보낼 데이터가 없습니다.');
    return;
  }

  try {
    // 파일명 생성
    const fileName = `생산실적_${format(new Date(), 'yyyyMMdd')}.csv`;

    // CSV 헤더 생성
    let csvContent = "생산실적ID,작업지시ID,제품ID,제품명,단위,생산수량,양품수량,불량수량,진척률,불량률,설비,생산시작일시,생산종료일시,등록일시,등록자\n";

    // 데이터 행 추가
    productionResultList.forEach(item => {
      // 제품 정보 찾기
      const product = productOptions.find(p => p.systemMaterialId === item.productId);
      const productId = product ? product.userMaterialId : item.productId;
      const productName = product ? product.materialName : '-';
      const unit = product ? product.unit : '-';
      
      // 설비 정보 찾기
      const equipment = equipmentOptions.find(e => e.equipmentId === item.equipmentId);
      const equipmentName = equipment ? equipment.equipmentName : item.equipmentId || '-';
      
      const row = [
        item.prodResultId || '',
        item.workOrderId || '',
        productId || '',
        productName || '',
        unit || '',
        (item.goodQty || 0) + (item.defectQty || 0),
        item.goodQty || 0,
        item.defectQty || 0,
        `${item.progressRate || 0}%`,
        `${item.defectRate || 0}%`,
        equipmentName || '',
        formatDateDisplay(item.prodStartTime),
        formatDateDisplay(item.prodEndTime),
        formatDateDisplay(item.createDate),
        item.createUser || ''
      ].map(cell => {
        // CSV 형식에 맞게 셀 데이터 처리 (콤마나 따옴표 처리)
        const cellStr = String(cell);
        return cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')
            ? `"${cellStr.replace(/"/g, '""')}"`
            : cellStr;
      }).join(',');

      csvContent += row + '\n';
    });

    // CSV 파일 생성 및 다운로드
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    Message.showSuccess('엑셀 파일이 다운로드되었습니다.');
  } catch (error) {
    console.error('엑셀 내보내기 중 오류 발생:', error);
    Message.showError({ message: '엑셀 내보내기 중 오류가 발생했습니다.' });
  }
};