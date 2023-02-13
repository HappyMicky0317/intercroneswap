import { Pair, TokenAmount, JSBI, Token } from '@intercroneswap/v2-sdk';
import { useMemo } from 'react';

export interface MarketInfo {
  pair: Pair;
  usdAmount: string;
}

export function useMarkets(marketInfos: any[]): MarketInfo[] | null {
  return useMemo(() => {
    return marketInfos.map((marketInfo) => {
      const pairAddress = marketInfo.pair.liquidityToken.address;
      const tokenAInfo = marketInfo.pair.tokenAmount0;
      const tokenBInfo = marketInfo.pair.tokenAmount1;
      const tokenA = new Token(
        tokenAInfo.chain_id,
        tokenAInfo.address,
        tokenAInfo.decimals,
        tokenAInfo.symbol,
        tokenAInfo.name,
      );
      const tokenB = new Token(
        tokenBInfo.chain_id,
        tokenBInfo.address,
        tokenBInfo.decimals,
        tokenBInfo.symbol,
        tokenBInfo.name,
      );

      const tokenAmountA = new TokenAmount(tokenA, JSBI.BigInt(tokenAInfo.numerator));
      const tokenAmountB = new TokenAmount(tokenB, JSBI.BigInt(tokenBInfo.numerator));
      const pair = new Pair(tokenAmountA, tokenAmountB, pairAddress);
      return { pair, usdAmount: marketInfo.usdAmount };
    });
  }, [marketInfos]);
}
