import React from 'react';
import StatCard from '../components/Dashboard/StatCard';

const StatCardContainer = ({ title, data }) => {
  return (
      <StatCard
          title={title}
          value={data.value}
          trend={data.trend}
          status={data.status}
      />
  );
};

export default StatCardContainer;