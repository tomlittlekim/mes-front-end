import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
    TextField,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Grid, Typography,
} from '@mui/material';
import { SearchCondition } from '../../Common';
import {getTextColor} from "../utils/styleUtils";

/**
 * BOM 관리 검색 폼 컴포넌트
 * 
 * @param {Object} props - 컴포넌트 속성
 * @param {Function} props.onSearch - 검색 처리 함수
 * @param {Function} props.onReset - 초기화 처리 함수
 * @returns {JSX.Element}
 */
const SearchForm = ({ onSearch, onReset }) => {
    const SEARCH_CONDITIONS = {
        materialType: '',
        materialName: '',
        bomName: '',
        // flagActive: null
    };

    const { control, handleSubmit } = useForm({
        defaultValues: SEARCH_CONDITIONS
    });

    return (
        <>
        <Typography variant="body2" sx={{ mb: 1 }} color="red">
            * 조회 조건은 BOM 목록에 대해 동작합니다.
        </Typography>
        <SearchCondition
            onSearch={handleSubmit(onSearch)}
            onReset={onReset}
        >
            <Grid item xs={12} sm={6} md={6}>
                <Controller
                    name="materialType"
                    control={control}
                    render={({field}) => (
                        <FormControl variant="outlined" size="small" fullWidth>
                            <InputLabel id="materialType-label">종류</InputLabel>
                            <Select
                                {...field}
                                labelId="materialType-label"
                                label="종류"
                            >
                                <MenuItem value="">전체</MenuItem>
                                <MenuItem value="HALF_PRODUCT">반제품</MenuItem>
                                <MenuItem value="COMPLETE_PRODUCT">완제품</MenuItem>
                            </Select>
                        </FormControl>
                    )}
                />
            </Grid>
            <Grid item xs={12} sm={6} md={6}>
                <Controller
                    name="materialName"
                    control={control}
                    render={({field}) => (
                        <TextField
                            {...field}
                            label="제품명"
                            variant="outlined"
                            size="small"
                            fullWidth
                            placeholder="제품명을 입력하세요"
                        />
                    )}
                />
            </Grid>
            {/*<Grid item xs={12} sm={6} md={3}>*/}
            {/*    <Controller*/}
            {/*        name="bomName"*/}
            {/*        control={control}*/}
            {/*        render={({field}) => (*/}
            {/*            <TextField*/}
            {/*                {...field}*/}
            {/*                label="BOM 명"*/}
            {/*                variant="outlined"*/}
            {/*                size="small"*/}
            {/*                fullWidth*/}
            {/*                placeholder="BOM 명을 입력하세요"*/}
            {/*            />*/}
            {/*        )}*/}
            {/*    />*/}
            {/*</Grid>*/}
        </SearchCondition>
        </>
    );
};

export default SearchForm; 