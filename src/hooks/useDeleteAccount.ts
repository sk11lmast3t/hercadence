import { useState, useCallback } from 'react';
import { useEdgeFunction } from './useSupabase';

interface DeleteAccountState {
  isDeleting: boolean;
  error: string | null;
  deleted: boolean;
}

/**
 * Handles account deletion by calling the delete-account Edge Function.
 * Requires explicit typed confirmation "DELETE_MY_ACCOUNT".
 */
export function useDeleteAccount() {
  const { invoke } = useEdgeFunction();
  const [state, setState] = useState<DeleteAccountState>({
    isDeleting: false,
    error: null,
    deleted: false,
  });

  const deleteAccount = useCallback(async () => {
    setState({ isDeleting: true, error: null, deleted: false });
    try {
      const data = await invoke<{ success: boolean; message: string; warnings?: string[] }>(
        'delete-account',
        { confirmation: 'DELETE_MY_ACCOUNT' }
      );

      if (data.success) {
        // Clear all local storage
        localStorage.clear();
        setState({ isDeleting: false, error: null, deleted: true });
      } else {
        setState({
          isDeleting: false,
          error: data.warnings?.join(', ') || 'Deletion completed with warnings',
          deleted: true,
        });
      }
      return data;
    } catch (err) {
      setState({ isDeleting: false, error: (err as Error).message, deleted: false });
      throw err;
    }
  }, [invoke]);

  return { ...state, deleteAccount };
}
