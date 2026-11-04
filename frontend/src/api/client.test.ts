import test from 'node:test';
import assert from 'node:assert/strict';
import { apiClient } from './client.ts';

test('apiClient sets and gets tenantId and token correctly', () => {
  apiClient.setTenantId('tenant-test-123');
  assert.equal(apiClient.getTenantId(), 'tenant-test-123');

  apiClient.setToken('test-bearer-token');
  assert.equal(apiClient.getToken(), 'test-bearer-token');

  apiClient.setToken(null);
  assert.equal(apiClient.getToken(), null);
});

test('apiClient handles health check with offline fallback', async () => {
  const isOnline = await apiClient.checkBackendHealth();
  assert.equal(typeof isOnline, 'boolean');
});

