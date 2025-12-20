'use client';

import React from 'react';

import { AnalyticsDashboard } from '../Analytics';
import '../Analytics/styles.scss';

export default function BeforeDashboard() {
  return (
    <div className="before-dashboard-analytics gutter--left gutter--right">
      <h2 className="before-dashboard-analytics__title">Analytics Overview</h2>
      <AnalyticsDashboard />
    </div>
  );
}
