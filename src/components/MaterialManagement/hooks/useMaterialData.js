import { useState, useEffect } from 'react';
import { gql } from '@apollo/client';
import {ALL_MATERIALS_QUERY} from "../../../graphql-queries/material-master/materialQueries";

const GET_ALL_MATERIALS = gql`${ALL_MATERIALS_QUERY}`;

export const useMaterialData = (executeQuery) => {
    const [materials, setMaterials] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadMaterialData = async () => {
        try {
            const result = await executeQuery(GET_ALL_MATERIALS);

            if (result.data?.getAllMaterials) {
                const flattenedMaterials = result.data.getAllMaterials.reduce((acc, typeGroup) => {
                    if (!typeGroup || !typeGroup.materialType) return acc;

                    const typeMaterials = typeGroup.categories?.reduce((materials, category) => {
                        const categoryMaterials = category.materials?.map(material => ({
                            ...material,
                            materialType: typeGroup.materialType,
                            materialCategory: category.materialCategory
                        })) || [];
                        return [...materials, ...categoryMaterials];
                    }, []) || [];

                    return [...acc, ...typeMaterials];
                }, []);

                setMaterials(flattenedMaterials);
                setIsLoading(false);
            }
        } catch (error) {
            console.error('자재 데이터 로드 실패:', error);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadMaterialData();
    }, []);

    const getCategoriesByType = (materialType) => {
        if (!materialType) return [];
        return [...new Set(
            materials
                .filter(m => m.materialType === materialType)
                .map(m => m.materialCategory)
        )];
    };

    const getMaterialsByTypeAndCategory = (materialType, materialCategory) => {
        if (!materialType || !materialCategory) return [];
        return materials.filter(
            m => m.materialType === materialType && m.materialCategory === materialCategory
        );
    };

    const getMaterialById = (systemMaterialId) => {
        if (!systemMaterialId) return null;
        return materials.find(m => m.systemMaterialId === systemMaterialId) || null;
    };

    return {
        materials,
        isLoading,
        getCategoriesByType,
        getMaterialsByTypeAndCategory,
        getMaterialById,
        refresh: loadMaterialData
    };
}; 