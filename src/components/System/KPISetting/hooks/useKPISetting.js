import { useState, useEffect, useCallback } from 'react';
import { useGraphQL } from '../../../../apollo/useGraphQL';
import { 
  GET_BRANCH_COMPANIES, 
  GET_KPI_INDICATORS, 
  GET_KPI_SUBSCRIPTIONS,
  SAVE_KPI_SETTINGS 
} from '../graphql/queries';
import Message from "../../../../utils/message/Message";

// KPI 선택 가능한 최대 개수
const MAX_KPI_SELECTION = 2;

/**
 * KPI 설정 관리 hook
 * 
 * @returns {Object} KPI 설정 관련 상태 및 함수들
 */
export const useKPISetting = () => {
    const [branchList, setBranchList] = useState([]);
    const [kpiIndicators, setKPIIndicators] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState(null); // 선택된 지부
    const [initialData, setInitialData] = useState([]);
    
    const { executeQuery, executeMutation } = useGraphQL();
    
    // 데이터 초기화
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // 지점 및 회사 정보 조회
                const branchResult = await executeQuery(GET_BRANCH_COMPANIES);
                
                // KPI 지표 정보 조회
                const indicatorResult = await executeQuery(GET_KPI_INDICATORS);
                
                // 회사별 구독 정보 조회
                const subscriptionResult = await executeQuery(GET_KPI_SUBSCRIPTIONS);
                
                if (branchResult?.data && indicatorResult?.data) {
                    // 지부 및 회사 데이터 구조 가공
                    const branches = branchResult.data.getBranchCompanies.map(branch => ({
                        id: branch.id,
                        name: branch.name,
                        companies: branch.companies.map(company => {
                            // 해당 회사의 구독 정보 조회
                            const companySubscriptions = subscriptionResult?.data?.getKpiSubscriptions?.filter(
                                sub => sub.site === branch.id && sub.compCd === company.id
                            ) || [];
                            
                            // 구독 정보에서 KPI ID만 추출
                            const selectedKPIs = companySubscriptions.map(sub => sub.kpiIndicatorCd);
                            
                            return {
                                id: company.id,
                                name: company.name,
                                selectedKPIs: selectedKPIs
                            };
                        })
                    }));

                    // KPI 지표 데이터 구조 가공 (DB 필드명에 맞게 수정)
                    const indicators = indicatorResult.data.getKpiIndicators.map(indicator => ({
                        id: indicator.kpiIndicatorCd,            // 프론트엔드에서는 id로 사용
                        name: indicator.kpiIndicatorNm,          // 화면에 표시할 이름
                        description: indicator.description,       // 설명
                        category: indicator.categoryNm,          // 화면에 표시할 카테고리명
                        categoryCd: indicator.categoryCd,        // 백엔드 저장용 카테고리 코드
                        targetValue: indicator.targetValue,      // 목표값
                        unit: indicator.unit,                    // 단위
                        chartType: indicator.chartType           // 차트 타입
                    }));

                    setBranchList(branches);
                    setKPIIndicators(indicators);
                    
                    // 초기 데이터 저장 (딥 카피)
                    setInitialData(JSON.parse(JSON.stringify(branches)));
                    
                    // 초기 선택값 설정 (첫 번째 지부)
                    if (branches.length > 0) {
                        setSelectedBranch(branches[0].id);
                    }
                } else {
                    throw new Error('데이터가 올바르게 조회되지 않았습니다.');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                Message.showError('데이터 초기화 중 오류가 발생했습니다.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    /**
     * 지부 선택 처리
     * @param {string} branchId - 선택된 지부 ID
     */
    const handleBranchChange = useCallback((branchId) => {
        setSelectedBranch(branchId);
    }, []);

    /**
     * 회사별 KPI 변경 처리
     * 
     * @param {string} branchId - 지점 ID (SITE)
     * @param {string} companyId - 회사 ID (COMP_CD)
     * @param {Array} selectedKPIs - 선택된 KPI 지표 ID 배열
     */
    const handleCompanyKPIChange = useCallback((branchId, companyId, selectedKPIs) => {
        // 최대 선택 가능한 KPI 개수를 초과하는 경우 처리
        if (selectedKPIs.length > MAX_KPI_SELECTION) {
            Message.showWarning(`KPI 지표는 최대 ${MAX_KPI_SELECTION}개까지 선택 가능합니다.`);
            selectedKPIs = selectedKPIs.slice(0, MAX_KPI_SELECTION);
        }

        setBranchList(prevList => {
            return prevList.map(branch => {
                if (branch.id === branchId) {
                    return {
                        ...branch,
                        companies: branch.companies.map(company => {
                            if (company.id === companyId) {
                                return {
                                    ...company,
                                    selectedKPIs
                                };
                            }
                            return company;
                        })
                    };
                }
                return branch;
            });
        });
    }, []);

    /**
     * KPI 지표 선택/해제 처리
     * 
     * @param {string} branchId - 지점 ID (SITE)
     * @param {string} companyId - 회사 ID (COMP_CD)
     * @param {string} kpiId - KPI 지표 ID (KPI_INDICATOR_CD)
     * @param {boolean} isSelected - 선택 여부
     * @returns {boolean} 선택 성공 여부
     */
    const handleKPIIndicatorSelection = useCallback((branchId, companyId, kpiId, isSelected) => {
        let selectionSuccess = true;
        
        setBranchList(prevList => {
            return prevList.map(branch => {
                if (branch.id === branchId) {
                    return {
                        ...branch,
                        companies: branch.companies.map(company => {
                            if (company.id === companyId) {
                                // 이미 선택된 KPI 제거할 경우
                                if (!isSelected) {
                                    return {
                                        ...company,
                                        selectedKPIs: company.selectedKPIs.filter(id => id !== kpiId)
                                    };
                                }
                                
                                // 새로운 KPI 추가할 경우, 최대 선택 개수 체크
                                if (company.selectedKPIs.length >= MAX_KPI_SELECTION) {
                                    // 최대 개수 초과 시 추가하지 않음
                                    selectionSuccess = false;
                                    return company; // 상태 변경 없이 그대로 반환
                                }
                                
                                // 정상적으로 추가
                                return {
                                    ...company,
                                    selectedKPIs: [...company.selectedKPIs, kpiId]
                                };
                            }
                            return company;
                        })
                    };
                }
                return branch;
            });
        });
        
        return selectionSuccess;
    }, []);

    /**
     * KPI 설정 저장
     * 변경된 회사의 KPI 설정 정보만 서버로 전송하는 방식으로 구현
     */
    const saveSettings = useCallback(async () => {
        try {
            if (!selectedBranch) {
                Message.showWarning('저장할 지부를 선택해주세요.');
                return;
            }
            
            setIsSaving(true);
            
            // 선택된 지부 찾기
            const branch = branchList.find(b => b.id === selectedBranch);
            if (!branch) {
                throw new Error('선택된 지부 정보를 찾을 수 없습니다.');
            }
            
            // 초기 데이터에서 해당 지부 정보 찾기
            const initialBranch = initialData.find(b => b.id === selectedBranch);
            if (!initialBranch) {
                throw new Error('초기 데이터에서 지부 정보를 찾을 수 없습니다.');
            }
            
            // 변경된 회사 목록 찾기
            const changedCompanies = [];
            
            branch.companies.forEach(company => {
                // 초기 데이터에서 해당 회사 찾기
                const initialCompany = initialBranch.companies.find(c => c.id === company.id);
                
                // 초기 데이터가 없거나 KPI 선택 상태가 변경된 경우
                if (!initialCompany || 
                    JSON.stringify(initialCompany.selectedKPIs.sort()) !== JSON.stringify(company.selectedKPIs.sort())) {
                    changedCompanies.push(company);
                }
            });
            
            if (changedCompanies.length === 0) {
                Message.showInfo('변경된 설정이 없습니다.');
                setIsSaving(false);
                return;
            }
            
            console.log(`저장 대상: ${branch.name} - 변경된 회사: ${changedCompanies.length}개`);
            
            // 변경된 회사의 모든 KPI 지표 데이터만 저장
            const settingsData = [];
            
            // 변경된 회사만 처리
            changedCompanies.forEach(company => {
                // 모든 KPI 지표 가져오기
                kpiIndicators.forEach(indicator => {
                    // 해당 KPI가 선택되었는지 확인
                    const isSelected = company.selectedKPIs.includes(indicator.id);
                    
                    // 모든 KPI 지표를 전송 (선택된 것은 flagActive=true, 아닌 것은 flagActive=false)
                    settingsData.push({
                        site: branch.id,                   // SITE
                        compCd: company.id,                // COMP_CD
                        kpiIndicatorCd: indicator.id,      // KPI_INDICATOR_CD
                        categoryId: indicator.categoryCd,  // CATEGORY_ID
                        description: `${company.name}의 ${indicator.name} 모니터링`, // DESCRIPTION
                        sort: isSelected ? (company.selectedKPIs.indexOf(indicator.id) + 1) : 0, // 정렬 순서
                        flagActive: isSelected             // 활성화 여부
                    });
                });
            });

            console.log('Saving KPI settings:', settingsData);

            // 실제 API 호출
            const result = await executeMutation(SAVE_KPI_SETTINGS, {
                settings: settingsData
            });

            if (result?.data?.saveKpiSettings?.success) {
                Message.showSuccess('KPI 설정이 저장되었습니다.');
                
                // 저장 성공 시 초기 데이터 업데이트
                setInitialData(JSON.parse(JSON.stringify(branchList)));
            } else {
                throw new Error(result?.data?.saveKpiSettings?.message || '저장 중 오류가 발생했습니다.');
            }
        } catch (error) {
            console.error('Error while saving KPI settings:', error);
            Message.showError(`KPI 설정 저장 중 오류가 발생했습니다: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    }, [branchList, initialData, kpiIndicators, executeMutation, selectedBranch]);

    return {
        branchList,
        kpiIndicators,
        isLoading,
        isSaving,
        selectedBranch,
        handleBranchChange,
        handleCompanyKPIChange,
        handleKPIIndicatorSelection,
        saveSettings,
        maxKpiSelection: MAX_KPI_SELECTION  // 최대 선택 가능 개수 추가
    };
}; 