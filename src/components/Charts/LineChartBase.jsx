// components/LineChartBase.jsx
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer, Label
} from 'recharts';
import {DOMAINS, useDomain} from "../../contexts/DomainContext";
import {useTheme} from "@mui/material";
import React from "react";

const LineChartBase = ({ data, lines,  disableDoubleClick = false, xAxisLabel, yAxisLabel, }) => {
    const theme = useTheme();
    const {domain} = useDomain();
    const isDarkMode = theme.palette.mode === 'dark';

// 도메인별 색상 설정
    const getTextColor = () => {
        if (domain === DOMAINS.PEMS) {
            return isDarkMode ? '#f0e6d9' : 'rgba(0, 0, 0, 0.87)';
        }
        return isDarkMode ? '#b3c5e6' : 'rgba(0, 0, 0, 0.87)';
    };

    const getTooltipBgColor = () => {
        if (domain === DOMAINS.PEMS) {
            return isDarkMode ? '#3d2814' : '#ffffff';
        }
        return isDarkMode ? '#1e3a5f' : '#ffffff';
    };

    const getTooltipBorderColor = () => {
        if (domain === DOMAINS.PEMS) {
            return isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)';
        }
        return isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)';
    };

    return (
        <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data} margin={{top: 5, right: 30, left: 0, bottom: 5}}>
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis
                    dataKey="timeLabel"
                    tick={false}
                >
                    {xAxisLabel && (
                        <Label
                            value={xAxisLabel}
                            position="insideBottom"
                            style={{ fill: getTextColor(), fontSize: 12 }}
                        />
                    )}
                </XAxis>
                <YAxis>
                    {yAxisLabel && (
                        <Label
                            value={yAxisLabel}
                            angle={-90}
                            position="insideLeft"
                            offset={10}
                            style={{ fill: getTextColor(), fontSize: 12 }}
                        />
                    )}
                </YAxis>
                <Tooltip
                    contentStyle={{
                        backgroundColor: getTooltipBgColor(),
                        borderColor: getTooltipBorderColor(),
                        color: getTextColor()
                    }}
                />
                {/*<Legend/>*/}
                {lines.map(({key, color}, index) => (
                    <Line
                        key={index}
                        type="monotone"
                        dataKey={key}
                        stroke={color}
                        strokeWidth={2}
                        // activeDot={{r: 6}}
                        dot = {false}
                    />
                ))}
            </LineChart>
        </ResponsiveContainer>
    );
};

export default LineChartBase;