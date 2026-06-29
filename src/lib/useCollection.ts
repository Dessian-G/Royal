import { useState, useEffect, useCallback } from 'react'

export function useCollection<T>(fetcher: () => Promise<T[]>) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetcher().then(result => {
      if (!cancelled) {
        setData(result)
        setLoading(false)
      }
    }).catch(() => {
      if (!cancelled) setLoading(false)
    })
    return () => { cancelled = true }
  }, [version])

  const refresh = useCallback(() => setVersion(v => v + 1), [])

  return { data, loading, refresh }
}

export function useSingle<T>(fetcher: () => Promise<T | null>, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetcher().then(result => {
      if (!cancelled) {
        setData(result)
        setLoading(false)
      }
    }).catch(() => {
      if (!cancelled) setLoading(false)
    })
    return () => { cancelled = true }
  }, [...deps, version])

  const refresh = useCallback(() => setVersion(v => v + 1), [])

  return { data, loading, refresh }
}
