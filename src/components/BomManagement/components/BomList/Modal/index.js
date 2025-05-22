import React from 'react';
import CustomModal from '../../../../Common/CustomModal';

/**
 * BOM 목록 모달 컴포넌트
 * 
 * @param {Object} props - 컴포넌트 속성
 * @returns {JSX.Element}
 */
const BomModal = ({
    open,
    onClose,
    title,
    size,
    modalType,
    fields,
    values,
    onChange,
    onSubmit,
    children
}) => {
    return (
        <CustomModal
            open={open}
            onClose={onClose}
            title={title}
            size={size}
            modalType={modalType}
            fields={fields}
            values={values}
            onChange={onChange}
            onSubmit={onSubmit}
        >
            {children}
        </CustomModal>
    );
};

export default BomModal;
