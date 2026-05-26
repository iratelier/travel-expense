import { useState, useEffect, useCallback } from "react";

const CACHE_KEY = "xr_cache_v2";
const CACHE_TTL = 1000 * 60 * 60; // 1시간

/**
 * 환율 훅 — KRW 기준 환산
 * API: https://github.com/fawazahmed0/exchange-api (무료·CDN)
 */
export function useExchangeRate() {
  const [rates, setRates] = useState(null); // { JPY: 9.5, USD: 1350, ... }

  const load = useCallback(async () => {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, ts } = JSON.parse(cached);
        if (Date.now() - ts < CACHE_TTL) {
          setRates(data);
          return;
        }
      }

      // 1 KRW = ? 각 통화 → 역수를 취해 1 단위당 KRW 환산율 계산
      const res = await fetch(
        "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/krw.json"
      );
      const json = await res.json();

      const map = { KRW: 1 };
      for (const [k, v] of Object.entries(json.krw ?? {})) {
        if (v) map[k.toUpperCase()] = Math.round((1 / v) * 100) / 100;
      }

      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data: map, ts: Date.now() }));
      setRates(map);
    } catch {
      // 환율 로드 실패 시 조용히 무시
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  /** 수동 환율 저장 — 캐시 갱신 후 state 반영 */
  function saveManualRates(overrides) {
    const base = rates ?? {};
    const next = { ...base, ...overrides };
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data: next, ts: Date.now() }));
    setRates(next);
  }

  /** toKRW(amount, currency) → 원화 환산 금액 (정수) or null */
  function toKRW(amount, currency) {
    if (!rates || !amount || currency === "KRW" || currency === "ETC") return null;
    const rate = rates[currency];
    if (!rate) return null;
    return Math.round(Number(amount) * rate);
  }

  return { rates, toKRW, saveManualRates, refreshRates: load };
}
