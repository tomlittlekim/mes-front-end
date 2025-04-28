import { useState } from 'react';
import { getBomModalFields } from '../components/BomList/Modal/BomModal';

/**
 * BOM 모달 상태 및 핸들러 제공 훅
 *
 * @param {Object} params - 훅 파라미터
 * @param {Object} params.bomData - BOM 관련 데이터/함수
 * @param {Function} params.getMaterialOptions - 자재 옵션을 가져오는 함수
 * @param {Function} params.getMaterialDetails - 자재 상세 정보를 가져오는 함수
 * @param {Function} params.getMaterialsByType - 자재 타입별 필터링 함수
 * @param {Function} params.handleBomSave - BOM 저장 핸들러
 * @returns {Object} 모달 관련 상태 및 함수
 */
export const useBomModal = ({
                                bomData,
                                getMaterialOptions,
                                getMaterialDetails,
                                getMaterialsByType,
                                handleBomSave
                            }) => {
    // BOM 모달 필드 가져오기
    const BOM_MODAL_FIELDS = getBomModalFields(getMaterialOptions, getMaterialDetails);

    // 모달 상태 관리
    const [modalConfig, setModalConfig] = useState({
        open: false,
        modalType: '',
        title: '',
        size: 'sm',
        values: {},
        fields: BOM_MODAL_FIELDS
    });

    // 모달 필드 변경 핸들러
    const handleModalFieldChange = async (fieldId, value) => {
        const field = BOM_MODAL_FIELDS.find(f => f.id === fieldId);
        if (!field) return;

        // 먼저 값을 설정
        setModalConfig(prev => ({
            ...prev,
            values: {
                ...prev.values,
                [fieldId]: value
            }
        }));

        if (field?.relation) {
            try {
                const { targetField, getOptions, onSelect } = field.relation;

                if (targetField && getOptions) {
                    const options = getOptions(value);

                    setModalConfig(prev => ({
                        ...prev,
                        fields: prev.fields.map(f => {
                            if (f.id === targetField) {
                                return {
                                    ...f,
                                    options,
                                    disabled: false
                                };
                            }
                            return f;
                        })
                    }));
                } else if (onSelect && value) {
                    const additionalValues = onSelect(value);
                    setModalConfig(prev => ({
                        ...prev,
                        values: {
                            ...prev.values,
                            ...additionalValues
                        }
                    }));
                }
            } catch (error) {
                console.error('관계성 필드 처리 중 오류:', error);
            }
        }
    };

    // 모달 저장 핸들러
    const handleModalSubmit = async () => {
        try {
            await handleBomSave(modalConfig.values);
            handleCloseModal();
        } catch (error) {
            console.error('저장 실패:', error);
        }
    };

    // 등록 모달 열기
    const handleOpenRegisterModal = () => {
        setModalConfig({
            open: true,
            modalType: 'register',
            title: 'BOM 등록',
            values: {},
            fields: BOM_MODAL_FIELDS
        });
    };

    // 수정 모달 열기
    const handleOpenEditModal = async () => {
        if (!bomData.selectedBom) return;

        // materialType에 맞는 제품 목록을 이미 로드된 데이터에서 필터링
        try {
            // API 호출 대신 이미 로드된 데이터 사용
            const filteredMaterials = getMaterialsByType(bomData.selectedBom.materialType);

            const options = filteredMaterials.map(item => ({
                value: item.systemMaterialId,
                label: item.materialName
            }));

            // 모달 상태 설정
            setModalConfig({
                open: true,
                modalType: 'edit',
                title: 'BOM 수정',
                values: {
                    ...bomData.selectedBom,
                    systemMaterialId_options: options,
                    systemMaterialId_raw_data: filteredMaterials
                },
                fields: BOM_MODAL_FIELDS.map(field => {
                    if (field.id === 'systemMaterialId') {
                        return {
                            ...field,
                            options,
                            disabled: true
                        };
                    }
                    return field;
                })
            });
        } catch (error) {
            console.error('제품 목록 로드 실패:', error);
        }
    };

    // 모달 닫기
    const handleCloseModal = () => {
        setModalConfig({
            open: false,
            modalType: '',
            title: '',
            values: {},
            fields: BOM_MODAL_FIELDS
        });
    };

    return {
        modalConfig,
        handleModalFieldChange,
        handleModalSubmit,
        handleOpenRegisterModal,
        handleOpenEditModal,
        handleCloseModal
    };
};