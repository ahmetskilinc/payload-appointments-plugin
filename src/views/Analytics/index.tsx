import type { AdminViewProps } from 'payload';

import { DefaultTemplate } from '@payloadcms/next/templates';

import AnalyticsClient from './index.client';

const AnalyticsView: React.FC<AdminViewProps> = async ({
  initPageResult,
  params,
  searchParams,
}) => {
  const { payload } = initPageResult.req;

  return (
    <DefaultTemplate
      i18n={initPageResult.req.i18n}
      locale={initPageResult.locale}
      params={params}
      payload={payload}
      permissions={initPageResult.permissions}
      searchParams={searchParams}
      user={initPageResult.req.user || undefined}
      visibleEntities={initPageResult.visibleEntities}
    >
      <AnalyticsClient />
    </DefaultTemplate>
  );
};

export default AnalyticsView;
