import { useState, useEffect } from 'react';

// 전력량 센서 데이터를 위한 커스텀 훅
export const usePowerSensorData = () => {
  const [powerData, setPowerData] = useState({
    sensor1: {
      current: 0,
      voltage: 0,
      power: 0,
      energy: 0,
      status: 'online',
      history: Array(30).fill(0).map((_, i) => ({
        time: new Date(Date.now() - (29 - i) * 60000).toLocaleTimeString(),
        power: Math.random() * 250 + 750  // 750W ~ 1000W 사이의 임의 값
      }))
    },
    sensor2: {
      current: 0,
      voltage: 0,
      power: 0,
      energy: 0,
      status: 'online',
      history: Array(30).fill(0).map((_, i) => ({
        time: new Date(Date.now() - (29 - i) * 60000).toLocaleTimeString(),
        power: Math.random() * 200 + 500  // 500W ~ 700W 사이의 임의 값
      }))
    }
  });

  // 실시간 데이터 업데이트를 시뮬레이션
  useEffect(() => {
    const interval = setInterval(() => {
      setPowerData(prev => {
        const newData = { ...prev };
        
        // 센서 1 데이터 업데이트
        const voltage1 = Math.random() * 5 + 220; // 220V ~ 225V
        const current1 = Math.random() * 1 + 4; // 4A ~ 5A
        const power1 = voltage1 * current1;
        
        newData.sensor1 = {
          ...newData.sensor1,
          voltage: Number(voltage1.toFixed(1)),
          current: Number(current1.toFixed(2)),
          power: Number(power1.toFixed(1)),
          energy: Number((prev.sensor1.energy + power1 / 3600).toFixed(3)), // kWh 계산
          history: [
            ...newData.sensor1.history.slice(1),
            {
              time: new Date().toLocaleTimeString(),
              power: Number(power1.toFixed(1))
            }
          ]
        };
        
        // 센서 2 데이터 업데이트
        const voltage2 = Math.random() * 5 + 218; // 218V ~ 223V
        const current2 = Math.random() * 1 + 2.5; // 2.5A ~ 3.5A
        const power2 = voltage2 * current2;
        
        newData.sensor2 = {
          ...newData.sensor2,
          voltage: Number(voltage2.toFixed(1)),
          current: Number(current2.toFixed(2)),
          power: Number(power2.toFixed(1)),
          energy: Number((prev.sensor2.energy + power2 / 3600).toFixed(3)), // kWh 계산
          history: [
            ...newData.sensor2.history.slice(1),
            {
              time: new Date().toLocaleTimeString(),
              power: Number(power2.toFixed(1))
            }
          ]
        };
        
        return newData;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return powerData;
};

// 전력 효율 계산을 위한 커스텀 훅
export const usePowerEfficiency = (powerData) => {
  const [efficiency, setEfficiency] = useState({
    sensor1: {
      efficiency: 0,
      trend: 'stable',
      status: 'normal'
    },
    sensor2: {
      efficiency: 0,
      trend: 'stable',
      status: 'normal'
    }
  });

  useEffect(() => {
    // 전력 효율 계산 로직
    const calculateEfficiency = (power) => {
      // 예시: 기준 전력량 800W 대비 효율 계산 (낮을수록 효율적)
      const baselinePower = 800;
      const eff = ((baselinePower - power) / baselinePower) * 100;
      return Number(eff.toFixed(1));
    };

    // 상태 및 추세 결정 로직
    const determineStatus = (eff) => {
      if (eff > 10) return 'good';
      if (eff > -10) return 'normal';
      return 'warning';
    };

    const determineTrend = (currentPower, history) => {
      if (history.length < 5) return 'stable';
      
      const lastFive = history.slice(-5);
      const avgPower = lastFive.reduce((sum, item) => sum + item.power, 0) / 5;
      
      if (currentPower > avgPower * 1.1) return 'increasing';
      if (currentPower < avgPower * 0.9) return 'decreasing';
      return 'stable';
    };

    setEfficiency({
      sensor1: {
        efficiency: calculateEfficiency(powerData.sensor1.power),
        trend: determineTrend(powerData.sensor1.power, powerData.sensor1.history),
        status: determineStatus(calculateEfficiency(powerData.sensor1.power))
      },
      sensor2: {
        efficiency: calculateEfficiency(powerData.sensor2.power),
        trend: determineTrend(powerData.sensor2.power, powerData.sensor2.history),
        status: determineStatus(calculateEfficiency(powerData.sensor2.power))
      }
    });
  }, [powerData]);

  return efficiency;
}; 