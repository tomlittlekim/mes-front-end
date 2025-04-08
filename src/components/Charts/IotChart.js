// components/IOTChart.jsx
import LineChartBase from './LineChartBase';
import ChartCard from "./ChartCard";

const iotData = [
    { x: 0, 온도: 20, 압력: 30 },
    { x: 1, 온도: 30, 압력: 20 },
    { x: 2, 온도: 25, 압력: 40 },
    { x: 3, 온도: 35, 압력: 45 },
    { x: 4, 온도: 32, 압력: 25 },
    // 필요 시 데이터 더 추가
];

const IOTChart = () => (
    <ChartCard title="IOT 지표" subtitle="설비 온도 및 압력 실시간 모니터링 데이터입니다.">
        <LineChartBase
            data={iotData}
            lines={[
                { key: '온도', color: 'blue' },
                { key: '압력', color: 'deeppink' },
            ]}
        />
    </ChartCard>
);

export default IOTChart;