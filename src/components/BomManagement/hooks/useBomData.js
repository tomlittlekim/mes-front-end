import { useState } from 'react';
import { useGridUtils } from '../../../utils/grid/useGridUtils';
import { useGridDataCall } from '../../../utils/grid/useGridDataCall';
import { useGridRow } from '../../../utils/grid/useGridRow';
import Message from '../../../utils/message/Message';
import {
    BOM_GET,
    BOM_SAVE,
    BOM_DELETE,
    SEARCH_CONDITIONS,
    BOM_SERVER_FIELDS,
} from '../constants/BomConstants';

/** 모달 필드값을 서버 필드 구조로 매핑 */
const mapModalToServerFields = (modalValues) => {
    return Object.keys(BOM_SERVER_FIELDS).reduce((acc, field) => {
        acc[field] = modalValues[field];
        return acc;
    }, {});
};

/**
 * BOM 데이터 관리를 위한 커스텀 훅
 *
 * @param {Function} executeQuery - GraphQL 쿼리 함수
 * @param {Function} executeMutation - GraphQL 뮤테이션 함수
 * @returns {Object} - BOM 관련 상태와 함수들
 */
export const useBomData = (executeQuery, executeMutation) => {
    const [bomList, setBomList] = useState([]);
    const [selectedBom, setSelectedBom] = useState(null);
    const [searchFilter, setSearchFilter] = useState(SEARCH_CONDITIONS);
    const { generateId, formatGridData } = useGridUtils();
    
    // 상세 데이터 로드 함수 참조
    const [loadDetailFunc, setLoadDetailFunc] = useState(null);

    // 데이터 포맷팅 함수
    const formatBomData = (data) => formatGridData(data, 'getBomList', bom => ({
        ...bom,
        id: bom.bomId || generateId('TEMP')
    }));

    // BOM 관련 데이터 호출 훅
    const {
        loading: isLoading,
        refresh,
        handleGridSearch,
        handleGridSave,
        handleGridDelete
    } = useGridDataCall({
        executeQuery,
        executeMutation,
        query: BOM_GET,
        mutation: BOM_SAVE,
        deleteMutation: BOM_DELETE,
        formatData: formatBomData,
        defaultFilter: SEARCH_CONDITIONS
    });

    // BOM 선택 핸들러
    const handleBomSelect = async (params) => {
        const bom = bomList.find(b => b.id === params.id);
        setSelectedBom(bom);
        return bom;
    };
    
    // 첫 번째 BOM 선택
    const selectFirstBom = async (bomList) => {
        if (bomList && bomList.length > 0) {
            const firstBom = bomList[0];
            setSelectedBom(firstBom);
            
            // 상세 데이터 로드
            if (loadDetailFunc && firstBom?.bomId) {
                await loadDetailFunc(firstBom.bomId);
            }
            
            return firstBom;
        }
        
        setSelectedBom(null);
        return null;
    };
    
    // 상세 데이터 로드 함수 설정
    const setDetailLoadFunction = (func) => {
        setLoadDetailFunc(() => func);
    };

    // 초기 데이터 로드
    const loadInitialData = async () => {
        const result = await refresh({ filter: SEARCH_CONDITIONS });
        setBomList(result);
        setSearchFilter(SEARCH_CONDITIONS);
        return result;
    };

    // 저장 처리
    const handleSave = async (data) => {
        try {
            // 모달 필드값 가공
            const formattedData = mapModalToServerFields(data);

            if (formattedData.bomId) {
                // 수정 요청
                await handleGridSave({
                    createdRows: [],
                    updatedRows: [formattedData]
                });
            } else {
                // 신규 등록 요청
                await handleGridSave({
                    createdRows: [formattedData],
                    updatedRows: []
                });
            }

            // 성공 후 데이터 갱신
            const result = await refresh({ filter: searchFilter });
            setBomList(result);
            return true;
        } catch (error) {
            console.error('BOM 저장 실패:', error);
            Message.showError('BOM 저장 중 오류가 발생했습니다.');
            return false;
        }
    };

    // 삭제 처리
    const handleDelete = async () => {
        if (!selectedBom) {
            Message.showWarning(Message.DELETE_SELECT_REQUIRED);
            return false;
        }

        try {
            await handleGridDelete({
                mutationData: { bomId: selectedBom.bomId },
                setDataList: setBomList,
                newRows: [],
                refreshFilter: { filter: searchFilter },
                customMessage: {
                    html: `
                    <div>
                        <div style="font-size: 1.2em; font-weight: bold; margin-bottom: 10px;">BOM 정보를 삭제하시겠습니까?</div>
                        <div style="color: #ff0000; font-size: 0.9em;">
                        BOM 정보를 삭제하면 BOM 상세정보도 함께 사라집니다.<br>
                        이 작업은 되돌릴 수 없습니다.<br>
                        정말 삭제하시겠습니까?
                        </div>
                    </div>
                `
                },
            });
            
            // 삭제 후 데이터 다시 로드
            const refreshedList = await refresh({ filter: searchFilter });
            setBomList(refreshedList);
            
            // 첫 번째 항목 선택 및 상세 데이터 로드
            await selectFirstBom(refreshedList);
            
            return true;
        } catch (error) {
            console.error('BOM 삭제 실패:', error);
            return false;
        }
    };

    // 검색 처리
    const handleSearch = async (data) => {
        try {
            setSearchFilter(data);
            const result = await handleGridSearch({ filter: data });
            setBomList(result);
            
            // 검색 결과가 있으면 첫 번째 항목 선택
            if (result && result.length > 0) {
                await selectFirstBom(result);
            } else {
                setSelectedBom(null);
            }
            
            return result;
        } catch (error) {
            console.error('BOM 검색 실패:', error);
            return [];
        }
    };

    // 현재 선택된 BOM 데이터 유지하며 데이터 새로고침
    const refreshAndKeepSelection = async () => {
        const result = await refresh({ filter: searchFilter });
        setBomList(result);

        if (!selectedBom) {
            return { bomList: result, selectedBom: null };
        }

        // 기존 선택된 BOM 유지
        const preservedBom = result.find(b => b.bomId === selectedBom.bomId);
        if (preservedBom) {
            setSelectedBom(preservedBom);
            return { bomList: result, selectedBom: preservedBom };
        } else {
            // 선택했던 항목이 없으면 첫 번째 항목 선택
            await selectFirstBom(result);
            return { bomList: result, selectedBom: result.length > 0 ? result[0] : null };
        }
    };

    return {
        bomList,
        setBomList,
        selectedBom,
        setSelectedBom,
        isLoading,
        generateId,
        handleBomSelect,
        loadInitialData,
        handleSave,
        handleDelete,
        handleSearch,
        refreshAndKeepSelection,
        setDetailLoadFunction
    };
};

export default useBomData;