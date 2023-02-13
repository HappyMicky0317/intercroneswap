import { TokenAmount, Pair, Currency } from '@intercroneswap/v2-sdk';
import { useMemo, useState } from 'react';
import { abi as ISwapV1PairABI } from '@intercroneswap/v1-core/build/IISwapV1Pair.json';
import { Interface } from '@ethersproject/abi';
import { useActiveWeb3React } from '../hooks';

import { useMultipleContractSingleData } from '../state/multicall/hooks';
import { wrappedCurrency } from '../utils/wrappedCurrency';
const PAIR_INTERFACE = new Interface(ISwapV1PairABI);

export enum PairState {
  LOADING,
  NOT_EXISTS,
  EXISTS,
  INVALID,
}

export function usePairs(currencies: [Currency | undefined, Currency | undefined][]): [PairState, Pair | null][] {
  const { chainId, library } = useActiveWeb3React();
  const [pairAddresses, setPairAddresses] = useState<(string | undefined)[]>([]);
  const tokens = useMemo(
    () =>
      currencies.map(([currencyA, currencyB]) => [
        wrappedCurrency(currencyA, chainId),
        wrappedCurrency(currencyB, chainId),
      ]),
    [chainId, currencies],
  );

  useMemo(() => {
    if (library) {
      Promise.all(
        tokens.map(([tokenA, tokenB]) => {
          if (tokenA && tokenB) {
            return Pair.getAddressAsync(tokenA, tokenB, library);
          }
          return undefined;
        }),
      ).then((res) => {
        setPairAddresses(res);
      });
    }
  }, [JSON.stringify(tokens)]);

  const results = useMultipleContractSingleData(pairAddresses, PAIR_INTERFACE, 'getReserves');

  return useMemo(() => {
    return tokens.map(([tokenA, tokenB], i) => {
      const { result: reserves, loading } = results[i] || {};

      if (loading) return [PairState.LOADING, null];
      if (!tokenA || !tokenB || tokenA.equals(tokenB)) return [PairState.INVALID, null];
      if (!reserves) return [PairState.NOT_EXISTS, null];
      const { reserve0, reserve1 } = reserves;
      const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA];
      return [
        PairState.EXISTS,
        new Pair(
          new TokenAmount(token0, reserve0.toString()),
          new TokenAmount(token1, reserve1.toString()),
          pairAddresses[i],
        ),
      ];
    });
  }, [results, pairAddresses, JSON.stringify(tokens)]);
}

export function usePair(tokenA?: Currency, tokenB?: Currency): [PairState, Pair | null] {
  return usePairs([[tokenA, tokenB]])[0];
}
