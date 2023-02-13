// Stablecoin amounts used when calculating spot price for a given currency.

import { ChainId, Price, Token, TokenAmount, TradeType } from '@intercroneswap/v2-sdk';
import { useMemo } from 'react';
import { useActiveWeb3React } from '.';
import { USDT } from '../constants/tokens';
import { tryParseAmount } from '../state/swap/hooks';
import { useBestV2Trade } from './useBestV2Trade';

// The amount is large enough to filter low liquidity pairs.
export const STABLECOIN_AMOUNT_OUT: { [chainId: number]: TokenAmount } = {
  [ChainId.MAINNET]: new TokenAmount(USDT, 100),
};

/**
 * Returns the price in USDT of the input currency
 * @param currency currency to compute the USDT price of
 */
export default function useUSDTPrice(currency?: Token): Price | undefined {
  const chainId = currency?.chainId;

  const amountOut = chainId ? STABLECOIN_AMOUNT_OUT[chainId] : undefined;
  const stablecoin = amountOut?.token;

  // TODO(#2808): remove dependency on useBestV2Trade
  const v2USDTTrade = useBestV2Trade(TradeType.EXACT_OUTPUT, amountOut, currency, {
    maxHops: 2,
  });

  return useMemo(() => {
    if (!currency || !stablecoin) {
      return undefined;
    }

    // handle usdc
    if (currency?.wrapped.equals(stablecoin)) {
      return new Price(stablecoin, stablecoin, '1', '1');
    }

    if (
      currency?.wrapped.symbol?.toLowerCase().startsWith('usd') ||
      currency?.wrapped.symbol?.toLowerCase().endsWith('usd')
    ) {
      return new Price(currency, currency, '1', '1');
    }

    // use v2 price if available, v3 as fallback
    if (v2USDTTrade) {
      const { numerator, denominator } = v2USDTTrade.route.midPrice;
      return new Price(currency, stablecoin, denominator, numerator);
    }
    return undefined;
  }, [currency, stablecoin, v2USDTTrade]);
}

export function useUSDTValue(currencyAmount: TokenAmount | undefined | null) {
  const price = useUSDTPrice(currencyAmount?.token);

  return useMemo(() => {
    if (!price || !currencyAmount) return null;
    try {
      return price.quote(currencyAmount);
    } catch (error) {
      return null;
    }
  }, [currencyAmount, price]);
}

/**
 *
 * @param fiatValue string representation of a USD amount
 * @returns CurrencyAmount where currency is stablecoin on active chain
 */
export function useStablecoinAmountFromFiatValue(fiatValue: string | null | undefined) {
  const { chainId } = useActiveWeb3React();
  const stablecoin = chainId ? STABLECOIN_AMOUNT_OUT[chainId]?.currency : undefined;

  return useMemo(() => {
    if (fiatValue === null || fiatValue === undefined || !chainId || !stablecoin) {
      return undefined;
    }

    // trim for decimal precision when parsing
    const parsedForDecimals = parseFloat(fiatValue).toFixed(stablecoin.decimals).toString();
    try {
      // parse USD string into CurrencyAmount based on stablecoin decimals
      return tryParseAmount(parsedForDecimals, stablecoin);
    } catch (error) {
      return undefined;
    }
  }, [chainId, fiatValue, stablecoin]);
}
