import { useState, useEffect } from 'react';
import { gql } from '@apollo/client';
import { ALL_MATERIALS_QUERY } from "../../../graphql-queries/material-master/materialQueries";
import { getGridCodeList } from '../../../api/standardInfo/commonCodeApi';

const GET_ALL_MATERIALS = gql`${ALL_MATERIALS_QUERY}`;

export const useMaterialData = (executeQuery) => {
    const [materials, setMaterials] = useState([]);
    const [materialsByType, setMaterialsByType] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [commonCodes, setCommonCodes] = useState({});

    // 공통코드 로드
    useEffect(() => {
        const loadCommonCodes = async () => {
            const codeClassIds = [
                'CD20250402131435416', // 단위
                'CD20250428144831625', //자재유형
                'CD20250428150231000', //원부자재 제품반제품 - 자재종류
                'CD20250428150231541', //제품반제품
                'CD20250428145908166' //원부자재
            ];

            try {
                const codes = await getGridCodeList(codeClassIds);
                setCommonCodes(codes);
            } catch (error) {
                console.error('공통코드 로드 실패:', error);
            }
        };

        loadCommonCodes();
    }, []);

    const loadMaterials = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const result = await executeQuery(GET_ALL_MATERIALS);

            if (result.data?.getAllMaterials) {
                const flattenedMaterials = result.data.getAllMaterials.reduce((acc, typeGroup) => {
                    if (!typeGroup || !typeGroup.materialType) return acc;

                    const typeMaterials = typeGroup.categories?.reduce((materials, category) => {
                        const categoryMaterials = category.materials?.map(material => ({
                            ...material,
                            id: material.systemMaterialId,
                            materialType: typeGroup.materialType,
                            materialCategory: category.materialCategory
                        })) || [];
                        return [...materials, ...categoryMaterials];
                    }, []) || [];

                    return [...acc, ...typeMaterials];
                }, []);

                const groupedByType = flattenedMaterials.reduce((acc, material) => {
                    if (!acc[material.materialType]) {
                        acc[material.materialType] = [];
                    }
                    acc[material.materialType].push(material);
                    return acc;
                }, {});

                setMaterials(flattenedMaterials);
                setMaterialsByType(groupedByType);
            }
        } catch (error) {
            console.error('자재 데이터 로드 실패:', error);
            setError(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadMaterials();
    }, []);

    const getMaterialsByType = (materialType) => {
        if (!materialType) return [];
        return materialsByType[materialType] || [];
    };

    const getMaterialById = (systemMaterialId) => {
        if (!systemMaterialId) return null;
        return materials.find(m => m.systemMaterialId === systemMaterialId) || null;
    };

    return {
        materials,
        materialsByType,
        isLoading,
        error,
        getMaterialsByType,
        getMaterialById,
        loadMaterials,
        // 공통코드 옵션들
        unitOptions: commonCodes['CD20250402131435416'] || [],
        materialCategoryOptions: commonCodes['CD20250428144831625'] || [],
        materialTypeOptions: commonCodes['CD20250428150231000'] || [],
        productTypeOptions: commonCodes['CD20250428150231541'] || [],
        rawSubTypeOptions: commonCodes['CD20250428145908166'] || []
    };
};