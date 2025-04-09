import React, { useContext } from 'react';
import DefectInfoModal from './DefectInfoModal';
import { ProductionResultContext } from '../../contexts/ProductionResultContext';

/**
 * 불량정보 모달 컨테이너 컴포넌트
 * 모달의 상태와 핸들러를 관리
 *
 * @returns {JSX.Element}
 */
const DefectInfoModalContainer = () => {
  const {
    isDefectModalOpen,
    setIsDefectModalOpen,
    currentDefect,
    setCurrentDefect,
    isEditingDefect,
    handleSaveDefect,
    defectTypeOptions
  } = useContext(ProductionResultContext);

  const handleClose = () => {
    setIsDefectModalOpen(false);
  };

  const handleSave = () => {
    handleSaveDefect();
  };

  return (
      <DefectInfoModal
          open={isDefectModalOpen}
          onClose={handleClose}
          currentDefect={currentDefect}
          setCurrentDefect={setCurrentDefect}
          isEditingDefect={isEditingDefect}
          onSave={handleSave}
          defectTypeOptions={defectTypeOptions}
      />
  );
};

export default DefectInfoModalContainer;