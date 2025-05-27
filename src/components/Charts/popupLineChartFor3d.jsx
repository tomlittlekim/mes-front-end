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

const PopupChartFor3d = ({ open, onClose, deviceNumber, coordinates }) => {
    const [range, setRange] = useState("day");
    const [date, setDate] = useState(new Date());
    const [data, setData] = useState([]);
    const [lines, setLines] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (coordinates) {
            console.log('3D 좌표:', coordinates);
        }
    }, [coordinates]);

    useEffect(() => {
        if (open && deviceNumber) {
            handleSearch();
        }
    }, [open, deviceNumber]);

    useEffect(() => {
        if (date && range && deviceNumber) {
            handleSearch();
        }
    }, [date, range, deviceNumber]);

    const handleSearch = useCallback(() => {
        if (!deviceNumber) {
            setError('장치 번호가 필요합니다.');
            return;
        }

        setError(null);
        const query = `
          query getPopupPowerDataFor3dView($filter: KpiFilterFor3d) {
            getPopupPowerDataFor3dView(filter: $filter) {
              timeLabel
              label
              value
              deviceNumber
            }
          }
        `;

        graphFetch(
            query,
            {
                filter: {
                    "date": format(date, 'yyyy-MM-dd'),
                    "range": range,
                    "deviceNumber": parseInt(deviceNumber)
                }
            }
        ).then((data) => {
            if (data.errors) {
                console.error('데이터 조회 중 오류 발생:', data.errors);
                setError('데이터 조회 중 오류가 발생했습니다.');
                return;
            }

            const result = data.getPopupPowerDataFor3dView;
            if (!result || result.length === 0) {
                setError('조회된 데이터가 없습니다.');
                setData([]);
                setLines([]);
                return;
            }

            const deviceIds = new Set();
            const isHourBased = range === "day";

            const grouped = {};

            result.forEach(item => {
                const { timeLabel, label, value } = item;

                if (!grouped[timeLabel]) {
                    grouped[timeLabel] = { timeLabel };
                }
                grouped[timeLabel][label] = Number(parseFloat(value).toFixed(2));
                deviceIds.add(item.label);
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
            const newLines = Array.from(deviceIds).map((deviceId, idx) => ({
                key: deviceId,
                color: availableColors[idx % availableColors.length]
            }));
            setLines(newLines);
        }).catch((err) => {
            console.error('API 호출 중 오류 발생:', err);
            setError('API 호출 중 오류가 발생했습니다.');
        });
    }, [date, range, deviceNumber]);

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
                {error ? (
                    <Typography color="error" sx={{ mt: 2 }}>
                        {error}
                    </Typography>
                ) : (
                    <LineChartBase
                        data={data}
                        lines={lines}
                        xAxisLabel={range === "day" ? "시간(h)" : "일자(d)"}
                        yAxisLabel="전력 (W)"
                    />
                )}
            </DialogContent>
        </Dialog>
    );
};

export default PopupChartFor3d;