// components/IOTChart.jsx
import LineChartBase from './LineChartBase';
import ChartCard from "./ChartCard";
import {useEffect, useState} from "react";
import {graphFetch} from "../../api/fetchConfig";
import PopupChart from "./popupLineChart";

const MAX_DATA_LENGTH = 60;

const IOTChart = () => {
    const [data, setData] = useState([]);
    const [lines, setLines] = useState([]); // lines 상태 추가
    const [popupOpen, setPopupOpen] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            const query = `
              query getPowerData {
                getPowerData {
                  timeLabel
                  deviceId
                  power
                }
              }
            `;

            graphFetch(
                query
            ).then((data) => {
                if (data.errors) {
                } else {
                    const result = data.getPowerData;
                    const deviceIds = new Set();

                    if (result && result.length > 0) {
                        // 새 데이터 포인트 생성
                        const newDataPoint = {};
                        // x 값에 createDate를 사용 (모든 데이터의 createDate가 동일하다고 가정)

                        newDataPoint.timeLabel = result[0].timeLabel.replace("T"," ").replace("Z"," ");
                        // 각 센서(deviceId)의 power 값을 해당 키로 저장
                        result.forEach(item => {
                            deviceIds.add(item.deviceId);
                            const raw = parseFloat(item.power);
                            // 소수점 2자리 반올림; Math.round()를 사용하면 숫자로 반환됩니다.
                            newDataPoint[item.deviceId] = Number(raw.toFixed(2));
                        });

                        setData( prev =>{
                            const updated = [...prev, newDataPoint];
                            if(updated.length > MAX_DATA_LENGTH){
                                updated.shift();
                            }
                            return updated
                        });

                        const availableColors = ["blue", "deeppink", "green", "orange", "purple", "red"];
                        // lines 상태 업데이트: deviceIds 집합으로부터 배열 생성
                        const newLines = Array.from(deviceIds).map((deviceId, idx) => ({
                            key: deviceId,
                            color: availableColors[idx % availableColors.length]
                        }));
                        setLines(newLines);
                    }
                }
            })

        }, 30000); // 30초마다

        return () => clearInterval(interval);
    }, []);

    const handleDoubleClick = (e) => {
        setPopupOpen(true);
    };

    return (
    <ChartCard title="IOT 전력량"
               subtitle={
                   <>
                       설비 전력 실시간 모니터링 데이터입니다.{' '}
                       <span style={{ color: 'red', fontWeight: 'bold' }}>더블클릭시 상세보기</span>
                   </>
               }
    >
        <div onDoubleClick={handleDoubleClick}>
            <LineChartBase data={data} lines={lines}/>
        </div>

        <PopupChart
            open={popupOpen}
            onClose={() => setPopupOpen(false)}
        />
    </ChartCard>
    );
};

export default IOTChart;