import { Currency } from '@intercroneswap/v2-sdk';
import { useMemo } from 'react';

interface coinGeckoInfo {
  id: string;
  marketCap: number;
  marketCapChange24h: number;
  marketCapRank: number;
  circulatingSupply: string;
}

export default function useCoinGeckoInfo(currency: Currency, geckoInfo: any): coinGeckoInfo {
  return useMemo(() => {
    if (!geckoInfo)
      return {
        id: null,
        marketCap: null,
        marketCapChange24h: null,
        marketCapRank: null,
        circulatingSupply: null,
      };
    return {
      id: geckoInfo?.id,
      marketCap: geckoInfo?.market_data.market_cap.usd,
      marketCapChange24h: geckoInfo?.market_data.market_cap_change_24h_in_currency.usd,
      marketCapRank: geckoInfo?.market_data.market_cap_rank,
      circulatingSupply: geckoInfo?.market_data.circulating_supply,
    };
  }, [currency, geckoInfo]);
}
