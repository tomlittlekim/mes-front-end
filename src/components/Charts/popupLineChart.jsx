import {useCallback, useEffect, useState} from "react";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    Select,
    Typography
} from "@mui/material";
import LineChartBase from "./LineChartBase";
import SearchIcon from "@mui/icons-material/Search";
import {DatePicker, LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDateFns} from "@mui/x-date-pickers/AdapterDateFns";
import {graphFetch} from "../../api/fetchConfig";
import {format} from "date-fns";


const PopupChart = ({ open, onClose }) => {
    const [range, setRange] = useState("day");
    const [date, setDate] = useState(new Date());
    const [data, setData] = useState([]);
    const [lines, setLines] = useState([]);


    useEffect(() =>{
        handleSearch();
    },[open]);

    useEffect(() => {
        if (date && range) {
            handleSearch();
        }
    }, [date, range]);

    const handleSearch = useCallback(() => {
        const query = `
          query getPopupPowerData($filter: PowerHourFilter) {
            getPopupPowerData(filter: $filter) {
              timeLabel
              deviceId
              power
            }
          }
        `;

    graphFetch(
        query,
        {
            filter: {
                "date" : format(date, 'yyyy-MM-dd'),
                "range" : range
            }
        }
    ).then((data) => {
        if (data.errors) {
        } else {
            const result = data.getPopupPowerData;
            const deviceIds = new Set();
            const isHourBased = range === "day"; // 또는 "hour", 또는 필터에서 구분

            // 1. 시간별로 그룹핑
            const grouped = {};

            result.forEach(item => {
                const { timeLabel, deviceId, power } = item;

                if (!grouped[timeLabel]) {
                    grouped[timeLabel] = { timeLabel };
                }
                grouped[timeLabel][deviceId] = Number(parseFloat(power).toFixed(2));
                deviceIds.add(item.deviceId);
            });

            const sorted = Object.values(grouped).sort((a, b) => {
                if (isHourBased) {
                    return Number(a.timeLabel) - Number(b.timeLabel);
                } else {
                    return new Date(a.timeLabel) - new Date(b.timeLabel);
                }
            });
            setData(sorted);

            const availableColors = ["blue", "deeppink", "green", "orange", "purple", "red"];
            // lines 상태 업데이트: deviceIds 집합으로부터 배열 생성
            const newLines = Array.from(deviceIds).map((deviceId, idx) => ({
                key: deviceId,
                color: availableColors[idx % availableColors.length]
            }));
            setLines(newLines);
        }
    }).catch((err) => {
        console.warn("❌ 서버 요청 실패:", err.message);
    });
});

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">📊 상세 보기</Typography>

                    <Box display="flex" alignItems="center" gap={1}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                                label="조회일자"
                                value={date}
                                onChange={(newDate) => setDate(newDate)}
                                slotProps={{ textField: { size: "small" } }}
                            />
                        </LocalizationProvider>

                        <Select
                            size="small"
                            value={range}
                            onChange={(e) => setRange(e.target.value)}
                        >
                            <MenuItem value="day">일간</MenuItem>
                            <MenuItem value="week">주간</MenuItem>
                            <MenuItem value="month">월간</MenuItem>
                        </Select>

                        <Button
                            variant="contained"
                            startIcon={<SearchIcon />}
                            size="small"
                            onClick={handleSearch}
                        >
                            조회
                        </Button>
                    </Box>
                </Box>
            </DialogTitle>
            <DialogContent>
                <LineChartBase
                    data={data}
                    lines={lines}
                />
            </DialogContent>

        </Dialog>
    );
};

export default PopupChart