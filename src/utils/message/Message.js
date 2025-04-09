import Swal from "sweetalert2";

class Message {
  // 메시지 상수
  static SAVE_SUCCESS = '저장되었습니다.';
  static DELETE_SUCCESS = '삭제되었습니다.';
  static DELETE_CONFIRM = '선택한 항목을 삭제하시겠습니까?';
  static DELETE_SELECT_REQUIRED = '삭제할 항목을 선택해주세요.';
  static UPDATE_SELECT_REQUIRED = '수정할 항목을 선택해주세요.';
  static SERVER_ERROR = '서버 연결 중 오류가 발생했습니다.';
  static ERROR = '오류';
  static SUCCESS = '성공';
  static DELETE = '삭제';
  static CANCEL = '취소';
  static CONFIRM = '확인';
  static WARNING = '경고';
  static NO_SELECTED_ROWS = '선택된 행이 없습니다.';
  static NO_DATA_TO_SAVE = '저장할 데이터가 없습니다.';
  static ERROR_DURING_SAVE = '저장 중 오류가 발생했습니다.';
  static ERROR_DURING_DELETE = '저장 중 오류가 발생했습니다.';

  // 성공 메시지 표시
  static showSuccess(message, callback) {
    Swal.fire({
      icon: 'success',
      title: this.SUCCESS,
      text: message,
      confirmButtonText: this.CONFIRM
    }).then((result) => {
      if (result.isConfirmed && callback) {
        callback();
      }
    });
  }

  // 에러 메시지 표시
  static showError(error, setLoading) {
    console.error('GraphQL Error:', error);
    Swal.fire({
      icon: 'error',
      title: this.ERROR,
      text: error.message || this.SERVER_ERROR,
      confirmButtonText: this.CONFIRM
    });
    if (setLoading) setLoading(false);
  }

  // 경고 메시지 표시
  static showWarning(message) {
    Swal.fire({
      icon: 'warning',
      title: this.WARNING,
      text: message,
      confirmButtonText: this.CONFIRM
    });
  }

  // 일반 확인 다이얼로그 표시
  static showConfirm(title, message, callback) {
    Swal.fire({
      title: title,
      html: `<div style="font-size: 1.2em;">${message}</div>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#6c757d',
      confirmButtonText: this.CONFIRM,
      cancelButtonText: this.CANCEL
    }).then((result) => {
      if (result.isConfirmed && callback) {
        callback();
      }
    });
  }

  // 삭제 확인 다이얼로그 표시 - 필요 시 customOptions 문구 사용 가능
  static showDeleteConfirm(callback, customOptions = {}) {
    Swal.fire({
      title: customOptions.title || this.DELETE,
      html: customOptions.html || `<div style="font-size: 1.2em;">${this.DELETE_CONFIRM}</div>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: this.DELETE,
      cancelButtonText: this.CANCEL
    }).then((result) => {
      if (result.isConfirmed && callback) {
        callback();
      }
    });
  }
}

export default Message;