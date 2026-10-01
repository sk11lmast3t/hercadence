import { useState, useCallback } from 'react';
import { useEdgeFunction } from './useSupabase';

interface EntitlementState {
  isPremium: boolean;
  planType: string | null;
  expiresAt: string | null;
  status: string;
  loading: boolean;
  error: string | null;
}

/**
 * Checks premium entitlement from the server-side get-entitlement Edge Function.
 * Never trust a frontend boolean — this is the source of truth.
 */
export function usePremiumEntitlement() {
  const { invoke } = useEdgeFunction();
  const [state, setState] = useState<EntitlementState>({
    isPremium: false,
    planType: null,
    expiresAt: null,
    status: 'none',
    loading: false,
    error: null,
  });

  const checkEntitlement = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await invoke<{
        isPremium: boolean;
        planType: string | null;
        expiresAt: string | null;
        status: string;
      }>('get-entitlement');

      setState({
        isPremium: data.isPremium,
        planType: data.planType,
        expiresAt: data.expiresAt,
        status: data.status,
        loading: false,
        error: null,
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: (err as Error).message,
      }));
    }
  }, [invoke]);

  const createSubscription = useCallback(async () => {
    const data = await invoke<{
      subscriptionId: string;
      approvalUrl: string;
      hasHadTrial: boolean;
    }>('paypal-create-subscription');
    return data;
  }, [invoke]);

  const createLifetimeOrder = useCallback(async () => {
    const data = await invoke<{
      orderId: string;
      approvalUrl: string;
    }>('paypal-create-lifetime-order');
    return data;
  }, [invoke]);

  return {
    ...state,
    checkEntitlement,
    createSubscription,
    createLifetimeOrder,
  };
}
