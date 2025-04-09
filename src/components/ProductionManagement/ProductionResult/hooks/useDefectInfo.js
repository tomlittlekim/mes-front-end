import { useState, useCallback } from 'react';
import Message from '../../../../utils/message/Message';

/**
 * 불량정보 관련 상태와 로직을 관리하는 커스텀 훅
 *
 * @returns {Object} 불량정보 관련 상태와 함수
 */
export const useDefectInfo = () => {
  // 불량정보 관련 상태
  const [defectList, setDefectList] = useState([]);
  const [isDefectModalOpen, setIsDefectModalOpen] = useState(false);
  const [currentDefect, setCurrentDefect] = useState({
    defectId: '',
    defectName: '',
    defectQty: 0,
    defectCause: '',
    state: 'NEW'
  });
  const [isEditingDefect, setIsEditingDefect] = useState(false);

  // 수량 변경 핸들러
  const handleQtyChange = useCallback((field, value, selectedWorkOrder, productionResult, productionResultList) => {
    const numValue = Number(value) || 0;

    // 작업지시 수량 확인
    const orderQty = selectedWorkOrder?.orderQty || 0;

    // 기존 생산실적의 양품수량 합계
    const existingGoodQty = productionResultList
    .filter(r => r.id !== (productionResult?.id || ''))
    .reduce((sum, result) => sum + (result.goodQty || 0), 0);

    // 입력 가능한 최대 양품수량
    const maxGoodQty = orderQty - existingGoodQty;

    if (field === 'goodQty' && numValue > maxGoodQty) {
      // 최대 양품수량 초과 시 경고
      Message.showWarning(`입력 가능한 최대 양품수량은 ${maxGoodQty}입니다.`);
      return maxGoodQty;
    }

    return numValue;
  }, []);

  // 불량정보 추가 모달 열기
  const handleOpenDefectModal = useCallback(() => {
    setIsEditingDefect(false);
    setCurrentDefect({
      defectId: `DEF_${Date.now().toString().substring(6)}`,
      defectName: '',
      defectQty: 0,
      defectCause: '',
      state: 'NEW'
    });
    setIsDefectModalOpen(true);
  }, []);

  // 불량정보 수정 모달 열기
  const handleEditDefect = useCallback((defect) => {
    setIsEditingDefect(true);
    setCurrentDefect({ ...defect });
    setIsDefectModalOpen(true);
  }, []);

  // 불량정보 저장
  const handleSaveDefect = useCallback((currentDefect, isEditingDefect, setProductionResult) => {
    // 간단한 유효성 검사
    if (!currentDefect.defectName || !currentDefect.defectQty) {
      Message.showWarning('불량명과 수량을 입력해주세요.');
      return;
    }

    if (isEditingDefect) {
      // 수정 모드
      setDefectList(defects =>
          defects.map(
              d => d.defectId === currentDefect.defectId ? currentDefect : d)
      );
    } else {
      // 추가 모드
      setDefectList(defects => [...defects, currentDefect]);

      // 불량 수량 자동 반영
      const totalDefectQty = [...defectList, currentDefect].reduce(
          (sum, d) => sum + Number(d.defectQty || 0), 0);
      if (setProductionResult) {
        setProductionResult(prev => ({
          ...prev,
          defectQty: totalDefectQty
        }));
      }
    }

    setIsDefectModalOpen(false);
  }, [defectList]);

  // 불량정보 삭제
  const handleDeleteDefect = useCallback((defectId, setProductionResult) => {
    setDefectList(defects => {
      const updatedList = defects.filter(d => d.defectId !== defectId);

      // 불량 수량 자동 반영
      const totalDefectQty = updatedList.reduce(
          (sum, d) => sum + Number(d.defectQty || 0), 0);
      if (setProductionResult) {
        setProductionResult(prev => ({
          ...prev,
          defectQty: totalDefectQty
        }));
      }

      return updatedList;
    });
  }, []);

  return {
    defectList,
    setDefectList,
    isDefectModalOpen,
    setIsDefectModalOpen,
    currentDefect,
    setCurrentDefect,
    isEditingDefect,
    setIsEditingDefect,
    handleQtyChange,
    handleOpenDefectModal,
    handleEditDefect,
    handleSaveDefect,
    handleDeleteDefect
  };
};

export default useDefectInfo;