import { useState, useEffect, useRef } from 'react';

/**
 * Generic data-fetching hook.
 * Accepts a stable async function (wrap in useCallback if deps change).
 * @param {() => Promise<any>} fetchFn
 * @param {Array} deps
 */
export function useFetch(fetchFn, deps = []) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  // Keeps track of whether the component is still mounted
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchFn();
        if (!cancelled && mountedRef.current) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled && mountedRef.current) {
          setError(err.response?.data?.message || err.message || 'Une erreur est survenue.');
        }
      } finally {
        if (!cancelled && mountedRef.current) {
          setLoading(false);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
      mountedRef.current = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const refetch = () => {
    setLoading(true);
    setError(null);
    fetchFn()
      .then(result => { if (mountedRef.current) setData(result); })
      .catch(err  => { if (mountedRef.current) setError(err.response?.data?.message || err.message); })
      .finally(()  => { if (mountedRef.current) setLoading(false); });
  };

  return { data, loading, error, refetch };
}

export default useFetch;
