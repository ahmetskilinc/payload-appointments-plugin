import type { User } from 'payload-types';

import { fetchWithAuth } from './api';
import { getServerUrl } from './utils';

const serverUrl = getServerUrl();

export async function getDashboardData() {
  try {
    const response = await fetchWithAuth(`${serverUrl}/api/users/me?depth=10`);
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard data');
    }

    const data: { user: User } = await response.json();

    return data.user;
  } catch (error) {
    console.error(error);
    return null;
  }
}
