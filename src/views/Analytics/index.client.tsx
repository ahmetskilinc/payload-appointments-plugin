'use client';

import { useConfig, useStepNav } from '@payloadcms/ui';
import { useEffect } from 'react';

import { AnalyticsDashboard } from '../../components/Analytics';
import { getClientSettings } from '../../lib/clientSettings';
import '../../components/Analytics/styles.scss';

const AnalyticsClient: React.FC = () => {
  const { setStepNav } = useStepNav();
  const { config } = useConfig();
  const label = getClientSettings(config).views.analytics.label;

  useEffect(() => {
    setStepNav([
      {
        label,
      },
    ]);
  }, [label, setStepNav]);

  return (
    <div className="collection-list analytics-view">
      <header className="list-header">
        <h1>{label}</h1>
      </header>
      <div className="list-controls" />
      <AnalyticsDashboard />
    </div>
  );
};

export default AnalyticsClient;
