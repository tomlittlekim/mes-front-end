import { format } from 'date-fns';
import Message from '../../../../utils/message/Message';

/**
 * 불량정보 목록 인쇄 유틸리티
 *
 * @param {Array} defectList - 불량 목록
 * @param {String} userName - 현재 사용자 이름
 */
export const printDefectInfo = (defectList, userName) => {
  if (defectList.length === 0) {
    Message.showWarning({message: '출력할 불량정보가 없습니다.'});
    return;
  }

  try {
    // 불량정보 데이터를 출력 가능한 형태로 준비
    const printData = defectList.map(item => ({
      불량ID: item.defectId || '-',
      작업지시ID: item.workOrderId || '-',
      생산실적ID: item.prodResultId || '-',
      제품ID: item.productId || '-',
      제품명: item.productName || '-',
      불량수량: item.defectQty || 0,
      불량유형: item.resultInfo || '-',
      불량원인: item.defectCause || '-',
      상태: getStateLabel(item.state),
      등록일시: item.createDate ? format(new Date(item.createDate), 'yyyy-MM-dd') : '-',
      등록자: item.createUser || '-'
    }));

    // 새 창에 출력용 HTML 생성
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      Message.showWarning({message: '팝업이 차단되어 있습니다. 팝업 차단을 해제해주세요.'});
      return;
    }

    // 인쇄할 HTML 생성
    printWindow.document.write(`
      <html>
      <head>
        <title>불량정보 목록</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; text-align: center; font-size: 18px; margin-bottom: 20px; }
          .summary { margin-bottom: 20px; }
          .data-table { width: 100%; border-collapse: collapse; }
          .data-table th, .data-table td { padding: 8px; text-align: center; border: 1px solid #ddd; font-size: 12px; }
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
        
        <h1>불량정보 목록</h1>
        
        <div class="summary">
          <p>총 불량정보 수: ${defectList.length}건</p>
        </div>
        
        <table class="data-table">
          <thead>
            <tr>
              <th>불량ID</th>
              <th>작업지시ID</th>
              <th>생산실적ID</th>
              <th>제품ID</th>
              <th>제품명</th>
              <th>불량수량</th>
              <th>불량유형</th>
              <th>불량원인</th>
              <th>상태</th>
              <th>등록일시</th>
              <th>등록자</th>
            </tr>
          </thead>
          <tbody>
            ${printData.map(item => `
              <tr>
                <td>${item.불량ID}</td>
                <td>${item.작업지시ID}</td>
                <td>${item.생산실적ID}</td>
                <td>${item.제품ID}</td>
                <td>${item.제품명}</td>
                <td>${item.불량수량}</td>
                <td>${item.불량유형}</td>
                <td>${item.불량원인}</td>
                <td>${item.상태}</td>
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

    Message.showSuccess({message: '인쇄 창이 열렸습니다.'});
  } catch (error) {
    console.error('인쇄 중 오류 발생:', error);
    Message.showError({ message: '인쇄 중 오류가 발생했습니다.' });
  }
};

/**
 * 불량정보 데이터를 CSV로 내보내는 유틸리티
 *
 * @param {Array} defectList - 불량 목록
 */
export const exportDefectInfoToCSV = (defectList) => {
  if (defectList.length === 0) {
    Message.showWarning({message: '내보낼 데이터가 없습니다.'});
    return;
  }

  try {
    // 파일명 생성
    const fileName = `불량정보_목록_${format(new Date(), 'yyyyMMdd')}.csv`;

    // CSV 헤더 생성
    let csvContent = "불량ID,작업지시ID,생산실적ID,제품ID,제품명,불량수량,불량유형,불량원인,상태,등록일시,등록자\n";

    // 데이터 행 추가
    defectList.forEach(item => {
      const row = [
        item.defectId || '',
        item.workOrderId || '',
        item.prodResultId || '',
        item.productId || '',
        item.productName || '',
        item.defectQty || 0,
        item.resultInfo || '',
        item.defectCause || '',
        getStateLabel(item.state),
        item.createDate ? format(new Date(item.createDate), 'yyyy-MM-dd HH:mm:ss') : '',
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

    Message.showSuccess({message: '엑셀 파일이 다운로드되었습니다.'});
  } catch (error) {
    console.error('엑셀 내보내기 중 오류 발생:', error);
    Message.showError({ message: '엑셀 내보내기 중 오류가 발생했습니다.' });
  }
};

/**
 * 불량 상태 라벨 반환 함수
 *
 * @param {string} state - 불량 상태 코드
 * @returns {string} - 상태 라벨
 */
const getStateLabel = (state) => {
  const stateMap = {
    'NEW': '신규',
    'PROCESSING': '처리중',
    'COMPLETED': '완료됨'
  };
  return stateMap[state] || state || '-';
};