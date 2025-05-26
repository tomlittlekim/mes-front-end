import React from 'react';
import { Box, Button, Typography, IconButton, Tooltip } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import RefreshIcon from '@mui/icons-material/Refresh';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

/**
 * KPI 설정 헤더 컴포넌트
 * 
 * @param {Object} props - 컴포넌트 속성
 * @param {Function} props.onSave - 저장 처리 함수
 * @param {boolean} props.isDarkMode - 다크모드 여부
 * @returns {JSX.Element}
 */
const KPISettingHeader = ({ onSave, isDarkMode }) => {
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
                pb: 2,
                borderBottom: 1,
                borderColor: 'divider'
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
                    KPI 설정 관리
                </Typography>
                <Tooltip title="각 회사별로 모니터링할 KPI 지표를 설정합니다. 지점별로 회사를 그룹화하여 관리할 수 있습니다.">
                    <IconButton size="small" sx={{ ml: 1 }}>
                        <HelpOutlineIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Box>

            <Box>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    onClick={onSave}
                    sx={{ mr: 1 }}
                >
                    저장
                </Button>
                <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={() => window.location.reload()}
                >
                    새로고침
                </Button>
            </Box>
        </Box>
    );
};

export default KPISettingHeader; 