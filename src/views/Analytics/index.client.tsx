'use client';

import { useStepNav } from '@payloadcms/ui';
import { useEffect } from 'react';

import { AnalyticsDashboard } from '../../components/Analytics';
import '../../components/Analytics/styles.scss';

const AnalyticsClient: React.FC = () => {
  const { setStepNav } = useStepNav();

  useEffect(() => {
    setStepNav([
      {
        label: 'Analytics',
      },
    ]);
  }, [setStepNav]);

  return (
    <div className="collection-list analytics-view">
      <header className="list-header">
        <h1>Analytics</h1>
      </header>
      <div className="list-controls" />
      <AnalyticsDashboard />
    </div>
  );
};

export default AnalyticsClient;
