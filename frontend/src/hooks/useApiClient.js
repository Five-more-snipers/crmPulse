// @ts-check
import apiClient from '../services/apiClient';

/**
 * Custom hook returning preconfigured apiClient methods
 */
export function useApiClient() {
  return {
    client: apiClient,
    get: apiClient.get,
    post: apiClient.post,
    put: apiClient.put,
    patch: apiClient.patch,
    delete: apiClient.delete,
  };
}
