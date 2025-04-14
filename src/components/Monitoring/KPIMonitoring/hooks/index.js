import { useState, useEffect } from 'react';

// 에너지 사용량 및 KPI 데이터를 위한 커스텀 훅
export const useEnergyKPIData = () => {
  const [kpiData, setKPIData] = useState({
    // 기간별 전력 사용량 데이터 (일/주/월/연도별)
    usage: {
      daily: Array(24).fill(0).map((_, i) => ({
        hour: `${i}:00`,
        sensor1: Math.random() * 300 + 700,
        sensor2: Math.random() * 200 + 500,
      })),
      weekly: Array(7).fill(0).map((_, i) => {
        const days = ['일', '월', '화', '수', '목', '금', '토'];
        return {
          day: days[i],
          sensor1: Math.random() * 2000 + 15000,
          sensor2: Math.random() * 1500 + 10000,
        };
      }),
      monthly: Array(30).fill(0).map((_, i) => ({
        date: `${i+1}일`,
        sensor1: Math.random() * 2500 + 17500,
        sensor2: Math.random() * 2000 + 15000,
      })),
      yearly: Array(12).fill(0).map((_, i) => {
        const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
        return {
          month: months[i],
          sensor1: Math.random() * 75000 + 525000,
          sensor2: Math.random() * 60000 + 450000,
        };
      }),
    },
    
    // KPI 지표
    kpis: {
      // 에너지 효율 (Wh/unit) - 생산 단위당 전력 사용량
      energyEfficiency: {
        current: 0.75,
        target: 0.65,
        trend: Array(12).fill(0).map((_, i) => ({
          month: `${i+1}월`,
          value: 0.9 - (Math.random() * 0.25),
        })),
      },
      
      // 피크 전력 감소율 (%)
      peakReduction: {
        current: 8.5,
        target: 15,
        trend: Array(12).fill(0).map((_, i) => ({
          month: `${i+1}월`,
          value: Math.random() * 10 + 5,
        })),
      },
      
      // 대기 전력 (W)
      standbyPower: {
        current: 35,
        target: 25,
        trend: Array(12).fill(0).map((_, i) => ({
          month: `${i+1}월`,
          value: Math.random() * 20 + 30,
        })),
      },
      
      // 에너지 비용 절감률 (%)
      costSavings: {
        current: 12.3,
        target: 20,
        trend: Array(12).fill(0).map((_, i) => ({
          month: `${i+1}월`,
          value: Math.random() * 15 + 5,
        })),
      },
      
      // 전력 품질 지수 (%)
      powerQuality: {
        current: 92.1,
        target: 95,
        trend: Array(12).fill(0).map((_, i) => ({
          month: `${i+1}월`,
          value: Math.random() * 5 + 90,
        })),
      },
    },
    
    // 센서별 가동 및 효율 데이터
    sensors: {
      sensor1: {
        uptime: 99.7,
        averagePower: 887.3,
        peakTime: '14:30',
        peakPower: 1120.5,
        dailyEnergy: 21.3, // kWh
        monthlyEnergy: 640.2, // kWh
        status: 'normal'
      },
      sensor2: {
        uptime: 98.2,
        averagePower: 612.8,
        peakTime: '13:15',
        peakPower: 850.2,
        dailyEnergy: 14.7, // kWh
        monthlyEnergy: 442.5, // kWh
        status: 'normal'
      }
    },
    
    // 비교 데이터 (전주, 전월 대비)
    comparison: {
      weekly: {
        sensor1: 3.2, // 3.2% 증가
        sensor2: -1.8, // 1.8% 감소
      },
      monthly: {
        sensor1: -5.4, // 5.4% 감소
        sensor2: -7.2, // 7.2% 감소
      }
    }
  });

  // 실시간 데이터 업데이트를 시뮬레이션 (더 긴 간격으로 업데이트)
  useEffect(() => {
    const interval = setInterval(() => {
      setKPIData(prev => {
        // KPI 데이터의 일부만 업데이트
        const newData = { ...prev };
        
        // 센서 상태 업데이트
        newData.sensors = {
          sensor1: {
            ...prev.sensors.sensor1,
            averagePower: Number((prev.sensors.sensor1.averagePower + (Math.random() * 4 - 2)).toFixed(1)),
            uptime: Number(Math.min(100, prev.sensors.sensor1.uptime + (Math.random() * 0.1 - 0.05)).toFixed(1)),
            dailyEnergy: Number((prev.sensors.sensor1.dailyEnergy + Math.random() * 0.01).toFixed(1))
          },
          sensor2: {
            ...prev.sensors.sensor2,
            averagePower: Number((prev.sensors.sensor2.averagePower + (Math.random() * 3 - 1.5)).toFixed(1)),
            uptime: Number(Math.min(100, prev.sensors.sensor2.uptime + (Math.random() * 0.1 - 0.05)).toFixed(1)),
            dailyEnergy: Number((prev.sensors.sensor2.dailyEnergy + Math.random() * 0.008).toFixed(1))
          }
        };
        
        // 에너지 효율 KPI 업데이트
        const randomEfficiencyChange = Math.random() * 0.01 - 0.005;
        newData.kpis.energyEfficiency.current = Number(
          (prev.kpis.energyEfficiency.current + randomEfficiencyChange).toFixed(2)
        );
        
        // 전력 품질 업데이트
        const randomQualityChange = Math.random() * 0.2 - 0.1;
        newData.kpis.powerQuality.current = Number(
          Math.min(100, (prev.kpis.powerQuality.current + randomQualityChange).toFixed(1))
        );
        
        return newData;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return kpiData;
};

// KPI 달성률 계산을 위한 커스텀 훅
export const useKPIAchievement = (kpiData) => {
  const [achievement, setAchievement] = useState({
    overall: 0,
    byCategory: {}
  });

  useEffect(() => {
    if (!kpiData || !kpiData.kpis) return;
    
    const kpis = kpiData.kpis;
    const categories = Object.keys(kpis);
    const categoryAchievements = {};
    
    // 각 KPI 카테고리별 달성률 계산
    categories.forEach(category => {
      const kpi = kpis[category];
      let achievementRate;
      
      // KPI 유형에 따라 달성률 계산 방식 분리
      if (category === 'powerQuality' || category === 'costSavings' || category === 'peakReduction') {
        // 높을수록 좋은 지표의 경우
        achievementRate = (kpi.current / kpi.target) * 100;
      } else if (category === 'energyEfficiency' || category === 'standbyPower') {
        // 낮을수록 좋은 지표의 경우 (역수 계산)
        achievementRate = (kpi.target / kpi.current) * 100;
      }
      
      // 100%를 초과하지 않도록 제한
      categoryAchievements[category] = Number(Math.min(100, achievementRate).toFixed(1));
    });
    
    // 전체 달성률 계산 (모든 카테고리의 평균)
    const overallAchievement = Object.values(categoryAchievements).reduce((sum, value) => sum + value, 0) / categories.length;
    
    setAchievement({
      overall: Number(overallAchievement.toFixed(1)),
      byCategory: categoryAchievements
    });
  }, [kpiData]);

  return achievement;
}; 