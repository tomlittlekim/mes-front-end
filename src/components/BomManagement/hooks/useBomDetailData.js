import { useState, useEffect } from 'react';
import { useGridUtils } from '../../../utils/grid/useGridUtils';
import { useGridDataCall } from '../../../utils/grid/useGridDataCall';
import { useGridRow } from '../../../utils/grid/useGridRow';
import Message from '../../../utils/message/Message';
import {
    BOM_DETAIL_GET,
    BOM_DETAIL_SAVE,
    BOM_DETAIL_DELETE,
    BOM_DETAIL_NEW_ROW_STRUCTURE
} from '../constants/BomConstants';

/**
 * BOM 상세 데이터 관리를 위한 커스텀 훅
 *
 * @param {Function} executeQuery - GraphQL 쿼리 함수
 * @param {Function} executeMutation - GraphQL 뮤테이션 함수
 * @param {Object} selectedBom - 선택된 BOM 객체
 * @returns {Object} - BOM 상세 관련 상태와 함수들
 */
export const useBomDetailData = (executeQuery, executeMutation, selectedBom) => {
    const [bomDetailList, setBomDetailList] = useState([]);
    const [prevBomId, setPrevBomId] = useState(null);
    const { generateId, formatGridData } = useGridUtils();

    // 데이터 포맷팅 함수
    const formatBomDetailData = (data) => formatGridData(data, 'getBomDetails', bom => ({
        ...bom,
        id: bom.bomDetailId || generateId('TEMP')
    }));

    // 새로운 BOM detail 행 생성 함수
    const createNewBomDetail = () => ({
        id: generateId('NEW'),
        ...BOM_DETAIL_NEW_ROW_STRUCTURE,
    });

    /** BOM detail Input 타입으로 변환 */
    const transformRowForMutation = (row) => ({
        bomId: row.bomId || '',
        bomLevel: parseInt(row.bomLevel) || 0,
        systemMaterialId: row.systemMaterialId || '',
        parentItemCd: row.parentItemCd || '',
        itemQty: parseFloat(row.itemQty) || 0,
        remark: row.remark || ''
    });

    /** BOM detail Update 타입으로 변환 */
    const transformRowForUpdate = (row) => ({
        bomDetailId: row.bomDetailId,
        ...transformRowForMutation(row)
    });

    /** BOM detail Delete 타입으로 변환 */
    const transformRowForDelete = (row) => ({
        bomDetailId: row.bomDetailId
    });

    // 그리드 행 관리 훅
    const {
        selectedRows,
        addRows,
        updatedRows,
        setAddRows,
        setUpdatedRows,
        handleRowSelect,
        handleRowUpdate,
        handleRowAdd,
        formatSaveData,
        formatDeleteData
    } = useGridRow({
        createNewRow: createNewBomDetail,
        formatNewRow: transformRowForMutation,
        formatUpdatedRow: transformRowForUpdate,
        formatExistingRow: transformRowForDelete
    });

    // 그리드 데이터 호출 훅
    const {
        loading: isLoading,
        refresh,
        handleGridSearch,
        handleGridSave,
        handleGridDelete
    } = useGridDataCall({
        executeQuery,
        executeMutation,
        query: BOM_DETAIL_GET,
        mutation: BOM_DETAIL_SAVE,
        deleteMutation: BOM_DETAIL_DELETE,
        formatData: formatBomDetailData,
        onSuccess: async (bomId) => {
            if (bomId) {
                const result = await refresh({ bomId });
                setBomDetailList(result);
            }
        },
        clearAddRows: () => setAddRows([]),
        clearUpdatedRows: () => setUpdatedRows([])
    });

    // 행 선택 시 이벤트 핸들러
    const handleDetailSelect = (newSelection) => {
        handleRowSelect(newSelection, bomDetailList);
    };

    // 행 업데이트 시 이벤트 핸들러
    const handleDetailProcessUpdate = (newRow, oldRow) => {
        return handleRowUpdate(newRow, oldRow, setBomDetailList);
    };

    // BOM ID로 상세 데이터 로드
    const loadDetailData = async (bomId) => {
        if (!bomId) {
            setBomDetailList([]);
            return [];
        }

        try {
            const result = await executeQuery(BOM_DETAIL_GET, { bomId });

            if (result.data?.getBomDetails) {
                const formattedDetails = result.data.getBomDetails
                    .filter(detail => detail !== null)
                    .map(detail => ({
                        ...detail,
                        id: detail.bomDetailId,
                        bomId: bomId,
                    }));

                setBomDetailList(formattedDetails);
                return formattedDetails;
            } else {
                setBomDetailList([]);
                return [];
            }
        } catch (error) {
            console.error('BOM 상세 조회 실패:', error);
            setBomDetailList([]);
            return [];
        }
    };

    // selectedBom이 변경될 때 상세 데이터 로드
    useEffect(() => {
        const currentBomId = selectedBom?.bomId;
        
        // 이전에 로드한 bomId와 다를 때만 로드
        if (currentBomId && currentBomId !== prevBomId) {
            loadDetailData(currentBomId);
            setPrevBomId(currentBomId);
        } else if (!currentBomId) {
            setBomDetailList([]);
            setPrevBomId(null);
        }
    }, [selectedBom?.bomId]); // bomId가 변경될 때만 실행

    // BOM 상세 저장 처리
    const handleDetailSave = async (selectedBomId) => {
        if (!selectedBomId) return false;
        
        const { createdRows: newCreatedRows, updatedRows: newUpdatedRows } = formatSaveData(addRows, updatedRows);

        // BOM ID 설정
        newCreatedRows.forEach(row => {
            row.bomId = selectedBomId;
        });

        try {
            await handleGridSave({
                createdRows: newCreatedRows,
                updatedRows: newUpdatedRows
            });

            // 저장 후 상세 정보 다시 로드
            await loadDetailData(selectedBomId);
            return true;
        } catch (error) {
            console.error('BOM 상세 저장 실패:', error);
            Message.showError('저장 중 오류가 발생했습니다.');
            return false;
        }
    };

    // BOM 상세 삭제 처리
    const handleDetailDelete = async () => {
        if (!selectedBom?.bomId) {
            Message.showWarning('선택된 BOM이 없습니다.');
            return false;
        }
        
        const deleteData = formatDeleteData(selectedRows);

        if (!deleteData.newRows.length && !deleteData.existingRows.length) {
            Message.showWarning(Message.DELETE_SELECT_REQUIRED);
            return false;
        }

        try {
            await handleGridDelete({
                mutationData: {
                    bomDetailIds: deleteData.existingRows.map(row => row.bomDetailId)
                },
                setDataList: setBomDetailList,
                newRows: deleteData.newRows,
                customMessage: {
                    html: `
                        <div>
                            <div style="font-size: 1.2em; font-weight: bold; margin-bottom: 10px;">BOM 상세 정보를 삭제하시겠습니까?</div>
                            <div style="color: #ff0000; font-size: 0.9em;">
                            BOM 상세정보가 삭제됩니다.<br>
                            이 작업은 되돌릴 수 없습니다.<br>
                            정말 삭제하시겠습니까?
                            </div>
                        </div>
                    `
                },
                refreshFilter: { bomId: selectedBom.bomId }
            });
            return true;
        } catch (error) {
            console.error('BOM 상세 삭제 실패:', error);
            return false;
        }
    };

    return {
        bomDetailList,
        setBomDetailList,
        isLoading,
        selectedRows,
        handleDetailSelect,
        handleDetailProcessUpdate,
        handleRowAdd,
        loadDetailData,
        handleDetailSave,
        handleDetailDelete,
        generateId
    };
};

export default useBomDetailData;