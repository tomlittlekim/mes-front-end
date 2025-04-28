/**
 * BOM 목록 모달 필드 정의
 * @param {Function} getMaterialOptions - 자재 옵션을 가져오는 함수
 * @param {Function} getMaterialDetails - 자재 상세 정보를 가져오는 함수
 * @returns {Array} 모달 필드 배열
 */
export const getBomModalFields = (getMaterialOptions, getMaterialDetails) => [
    {
        id: 'materialType',
        label: '종류',
        type: 'select',
        required: true,
        lockOnEdit: true,
        options: [
            {value: 'COMPLETE_PRODUCT', label: '완제품'},
            {value: 'HALF_PRODUCT', label: '반제품'}
        ],
        relation: {
            targetField: 'systemMaterialId',
            getOptions: getMaterialOptions,
            onSelect: getMaterialDetails
        }
    },
    {
        id: 'systemMaterialId',
        label: '제품 선택',
        type: 'select',
        required: true,
        lockOnEdit: true,
        options: [],
        relation: {
            getOptions: getMaterialOptions,
            onSelect: getMaterialDetails
        }
    },
    {id: 'userMaterialId', label: '제품ID', type: 'text', required: true, lock: true},
    {id: 'materialStandard', label: '규격', type: 'text', lock: true},
    {id: 'unit', label: '단위', type: 'text', required: true, lock: true},
    {id: 'bomName', label: 'BOM 명', type: 'text', required: true},
    {id: 'remark', label: '비고', type: 'textarea', rows: 6}
];

export default getBomModalFields;