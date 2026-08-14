'use client';

import React from 'react';

import { AnalyticsDashboard } from '../Analytics';
import '../Analytics/styles.scss';

export default function BeforeDashboard() {
  // No gutter classes here — the dashboard template already provides its own
  // gutter, and the analytics styles are neutralized for this context in scss.
  return (
    <div className="before-dashboard-analytics">
      <h2 className="before-dashboard-analytics__title">Analytics Overview</h2>
      <AnalyticsDashboard />
    </div>
  );
}
