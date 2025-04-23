import { useState, useEffect } from 'react';
import { gql } from '@apollo/client';
import {ALL_MATERIALS_QUERY} from "../../../graphql-queries/material-master/materialQueries";

const GET_ALL_MATERIALS = gql`${ALL_MATERIALS_QUERY}`;

export const useMaterialData = (executeQuery) => {
    const [materials, setMaterials] = useState([]);
    const [materialsByType, setMaterialsByType] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadMaterials = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const result = await executeQuery(GET_ALL_MATERIALS);

            if (result.data?.getAllMaterials) {
                // 모든 자재를 하나의 배열로 평탄화하고 id 추가
                const flattenedMaterials = result.data.getAllMaterials.reduce((acc, typeGroup) => {
                    if (!typeGroup || !typeGroup.materialType) return acc;

                    const typeMaterials = typeGroup.categories?.reduce((materials, category) => {
                        const categoryMaterials = category.materials?.map(material => ({
                            ...material,
                            id: material.systemMaterialId, // 고유 id 추가
                            materialType: typeGroup.materialType,
                            materialCategory: category.materialCategory
                        })) || [];
                        return [...materials, ...categoryMaterials];
                    }, []) || [];

                    return [...acc, ...typeMaterials];
                }, []);

                // 타입별로 그룹화
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
        loadMaterials
    };
}; 