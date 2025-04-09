import {Card, CardContent, Typography, useTheme} from '@mui/material';
import {DOMAINS, useDomain} from "../../contexts/DomainContext";

const ChartCard = ({ title, subtitle, children }) => {
    const theme = useTheme();
    const {domain} = useDomain();
    const isDarkMode = theme.palette.mode === 'dark';

    const getSecondaryTextColor = () => {
        if (domain === DOMAINS.PEMS) {
            return isDarkMode ? 'rgba(240, 230, 217, 0.7)' : 'rgba(0, 0, 0, 0.6)';
        }
        return isDarkMode ? 'rgba(179, 197, 230, 0.7)' : 'rgba(0, 0, 0, 0.6)';
    };

    // 도메인별 배경색 가져오기
    const getCardBgColor = () => {
        if (domain === DOMAINS.PEMS) {
            return isDarkMode ? '#2d1e0f' : '#ffffff';
        }
        return isDarkMode ? '#102a43' : '#ffffff';
    };

    // 도메인별 테두리 색상 가져오기
    const getBorderColor = () => {
        if (domain === DOMAINS.PEMS) {
            return isDarkMode ? '#3d2814' : '#f5e8d7';
        }
        return isDarkMode ? '#2d4764' : '#e0e0e0';
    };


    return (
        <Card sx={{ boxShadow: 3,
            bgcolor: getCardBgColor(),
            border: `1px solid ${getBorderColor()}`,
            height: '100%'
        }}>
            <CardContent sx={
                {
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    p: 2,
                    pb: 3,
                    '&:last-child': { pb: 3 }
                }
            }>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    {title}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, color: getSecondaryTextColor() }}>
                    {subtitle}
                </Typography>
                {children}
            </CardContent>
        </Card>
    );
};

export default ChartCard;