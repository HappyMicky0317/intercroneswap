import { CurrencyAmount, JSBI, Pair, Token, TokenAmount, ZERO } from '@intercroneswap/v2-sdk';
import { abi as ISwapV2StakingRewards } from '@intercroneswap/v2-staking/build/StakingRewards.json';
import { Interface } from 'ethers/lib/utils';
import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { AppDispatch, AppState } from '..';
import { getTokenByAddress, ICR } from '../../constants/tokens';
import { useActiveWeb3React } from '../../hooks';
import { useStakingContract } from '../../hooks/useContract';
import useCurrentBlockTimestamp from '../../hooks/useCurrentBlockTimestamp';
import { NEVER_RELOAD, useMultipleContractSingleData, useSingleCallResult } from '../multicall/hooks';
import { tryParseAmount } from '../swap/hooks';
import { addStakeAmounts, setAttemptingTxn, setTxHash, typeInput } from './actions';
import { StakingRewardsInfo } from './constants';

const ISwapV2StakingRewardsInterface = new Interface(ISwapV2StakingRewards);

export const STAKING_GENESIS = 1647797301;
export interface StakingInfo {
  stakingRewardAddress: string;
  tokens: [Token, Token];
  stakedAmount: TokenAmount;
  earnedAmount: TokenAmount;
  totalStakedAmount: TokenAmount;
  totalRewardRate: TokenAmount;
  rewardRate: TokenAmount;
  rewardForDuration: TokenAmount;
  rewardDuration: number;
  periodFinish: Date | undefined;
  active: boolean;
  fee: number;
  getHypotheticalRewardRate: (
    stakedAmount: TokenAmount,
    totalStakedAmount: TokenAmount,
    totalRewardRate: TokenAmount,
  ) => TokenAmount;
}

export function useStakeState(): AppState['stake'] {
  return useSelector<AppState, AppState['stake']>((state) => state.stake);
}

export function useStakeActionHandlers(): {
  onUserInput: (typedValue: string) => void;
  onTxHashChange: (hashValue: string) => void;
  onAttemptingTxn: (attmeping: boolean) => void;
  onAddStakeAmounts: (payload: { stakeAddress: string; stakedAmounts: [TokenAmount, TokenAmount] }) => void;
} {
  const dispatch = useDispatch<AppDispatch>();

  const onFieldChange = useCallback(
    (typedValue: string) => {
      dispatch(typeInput({ typedValue }));
    },
    [dispatch],
  );

  const onAttemptingTxn = useCallback(
    (attemptingTxn: boolean) => {
      dispatch(setAttemptingTxn({ attemptingTxn }));
    },
    [dispatch],
  );

  const onTxHashChange = useCallback((hash: string) => dispatch(setTxHash({ txHash: hash })), [dispatch]);

  const onAddStakeAmounts = useCallback(
    (payload: { stakeAddress: string; stakedAmounts: [TokenAmount, TokenAmount] }) => {
      dispatch(addStakeAmounts(payload));
    },
    [dispatch],
  );

  return {
    onUserInput: onFieldChange,
    onAttemptingTxn,
    onTxHashChange,
    onAddStakeAmounts,
  };
}

export function useTotalStakedAmount(address: string): JSBI {
  const contract = useStakingContract(address);

  const totalSupply = useSingleCallResult(contract, 'totalSupply')?.result?.[0];
  return totalSupply ? JSBI.BigInt(totalSupply.toString()) : ZERO;
}

export function useStakingInfo(stakingRewardsInfos: StakingRewardsInfo[], pairToFilterBy?: Pair | null): StakingInfo[] {
  const { chainId, account } = useActiveWeb3React();

  const currentBlockTimestamp = useCurrentBlockTimestamp();

  const info = useMemo(
    () =>
      chainId
        ? stakingRewardsInfos?.filter((stakingRewardInfo) =>
            pairToFilterBy === undefined
              ? true
              : pairToFilterBy === null
              ? false
              : pairToFilterBy.involvesToken(stakingRewardInfo.tokens[0]) &&
                pairToFilterBy.involvesToken(stakingRewardInfo.tokens[1]),
          ) ?? []
        : [],
    [chainId, pairToFilterBy, stakingRewardsInfos],
  );

  const accountArg = useMemo(() => [account ?? undefined], [account]);

  const rewardsAddresses = useMemo(() => info.map(({ stakingRewardAddress }) => stakingRewardAddress), [info]);
  const rewardsDurations = useMemo(() => info.map(({ rewardsDays }) => rewardsDays), [info]);

  // get all the info from the staking rewards contracts
  const balances = useMultipleContractSingleData(
    rewardsAddresses,
    ISwapV2StakingRewardsInterface,
    'balanceOf',
    accountArg,
  );
  const earnedAmounts = useMultipleContractSingleData(
    rewardsAddresses,
    ISwapV2StakingRewardsInterface,
    'earned',
    accountArg,
  );
  const totalSupplies = useMultipleContractSingleData(rewardsAddresses, ISwapV2StakingRewardsInterface, 'totalSupply');

  // tokens per second, constants
  const rewardRates = useMultipleContractSingleData(
    rewardsAddresses,
    ISwapV2StakingRewardsInterface,
    'rewardRate',
    undefined,
    NEVER_RELOAD,
  );
  const rewardsTokens = useMultipleContractSingleData(
    rewardsAddresses,
    ISwapV2StakingRewardsInterface,
    'rewardsToken',
    undefined,
    NEVER_RELOAD,
  );
  const periodFinishes = useMultipleContractSingleData(
    rewardsAddresses,
    ISwapV2StakingRewardsInterface,
    'periodFinish',
    undefined,
    NEVER_RELOAD,
  );
  const rewardForDurations = useMultipleContractSingleData(
    rewardsAddresses,
    ISwapV2StakingRewardsInterface,
    'getRewardForDuration',
    undefined,
    NEVER_RELOAD,
  );
  const fees = useMultipleContractSingleData(
    rewardsAddresses,
    ISwapV2StakingRewardsInterface,
    'fee',
    undefined,
    NEVER_RELOAD,
  );

  return useMemo(() => {
    if (!chainId) return [];

    return rewardsAddresses.reduce<StakingInfo[]>((memo, rewardsAddress, index) => {
      // these two are dependent on account
      const balanceState = balances[index];
      const earnedAmountState = earnedAmounts[index];

      // these get fetched regardless of account
      const totalSupplyState = totalSupplies[index];
      const rewardRateState = rewardRates[index];
      const rewardsTokenState = rewardsTokens[index];
      const rewardForDurationState = rewardForDurations[index];
      const periodFinishState = periodFinishes[index];
      const feeState = fees[index];

      if (
        // these may be undefined if not logged in
        !balanceState?.loading &&
        !earnedAmountState?.loading &&
        // always need these
        totalSupplyState &&
        !totalSupplyState.loading &&
        rewardRateState &&
        !rewardRateState.loading &&
        rewardForDurationState &&
        !rewardForDurationState.loading &&
        periodFinishState &&
        !periodFinishState.loading &&
        rewardsTokenState &&
        !rewardsTokenState.loading &&
        feeState &&
        !feeState.loading
      ) {
        if (
          balanceState?.error ||
          earnedAmountState?.error ||
          totalSupplyState.error ||
          rewardRateState.error ||
          rewardForDurationState.error ||
          periodFinishState.error ||
          rewardsTokenState.error ||
          feeState.error
        ) {
          console.error('Failed to load staking rewards info');
          return memo;
        }

        // get the LP token
        const tokens = info[index].tokens;
        const dummyPair = new Pair(new TokenAmount(tokens[0], '0'), new TokenAmount(tokens[1], '0'));

        // check for account, if no account set to 0
        const rewardsToken = getTokenByAddress(rewardsTokenState.result?.[0]);
        const stakedAmount = new TokenAmount(dummyPair.liquidityToken, JSBI.BigInt(balanceState?.result?.[0] ?? 0));
        const totalStakedAmount = new TokenAmount(dummyPair.liquidityToken, JSBI.BigInt(totalSupplyState.result?.[0]));
        const totalRewardRate = new TokenAmount(rewardsToken, JSBI.BigInt(rewardRateState.result?.[0]));
        const rewardForDuration = new TokenAmount(rewardsToken, JSBI.BigInt(rewardForDurationState.result?.[0]));

        const getHypotheticalRewardRate = (
          stakedAmount: TokenAmount,
          totalStakedAmount: TokenAmount,
          totalRewardRate: TokenAmount,
        ): TokenAmount => {
          return new TokenAmount(
            rewardsToken,
            JSBI.greaterThan(totalStakedAmount.quotient, JSBI.BigInt(0))
              ? JSBI.divide(JSBI.multiply(totalRewardRate.quotient, stakedAmount.quotient), totalStakedAmount.quotient)
              : JSBI.BigInt(0),
          );
        };

        const individualRewardRate = getHypotheticalRewardRate(stakedAmount, totalStakedAmount, totalRewardRate);

        const periodFinishSeconds = periodFinishState.result?.[0]?.toNumber();
        const periodFinishMs = periodFinishSeconds * 1000;

        // compare period end timestamp vs current block timestamp (in seconds)
        const active =
          periodFinishSeconds && currentBlockTimestamp ? periodFinishSeconds > currentBlockTimestamp.toNumber() : true;
        const fee = feeState.result?.[0]?.toNumber();

        memo.push({
          stakingRewardAddress: rewardsAddress,
          tokens: info[index].tokens,
          periodFinish: periodFinishMs > 0 ? new Date(periodFinishMs) : undefined,
          earnedAmount: new TokenAmount(rewardsToken, JSBI.BigInt(earnedAmountState?.result?.[0] ?? 0)),
          rewardRate: individualRewardRate,
          rewardForDuration,
          rewardDuration: rewardsDurations[index],
          totalRewardRate,
          stakedAmount,
          totalStakedAmount,
          getHypotheticalRewardRate,
          active,
          fee,
        });
      }
      return memo;
    }, []);
  }, [
    balances,
    chainId,
    currentBlockTimestamp,
    earnedAmounts,
    info,
    periodFinishes,
    rewardRates,
    rewardForDurations,
    rewardsDurations,
    rewardsAddresses,
    totalSupplies,
    ICR,
  ]);
}

export function useTotalIcrEarned(): TokenAmount | undefined {
  const stakingInfos = useStakingInfo([]);

  return useMemo(() => {
    return (
      stakingInfos?.reduce(
        (accumulator, stakingInfo) => accumulator.add(stakingInfo.earnedAmount),
        new TokenAmount(ICR, '0'),
      ) ?? new TokenAmount(ICR, '0')
    );
  }, [stakingInfos]);
}

// based on typed value
export function useDerivedStakeInfo(
  typedValue: string,
  stakingToken: Token | undefined,
  userLiquidityUnstaked: TokenAmount | undefined,
): {
  parsedAmount?: CurrencyAmount;
} {
  const parsedInput: CurrencyAmount | undefined = tryParseAmount(typedValue, stakingToken);

  const parsedAmount =
    parsedInput && userLiquidityUnstaked && JSBI.lessThanOrEqual(parsedInput.quotient, userLiquidityUnstaked.quotient)
      ? parsedInput
      : undefined;

  return {
    parsedAmount,
  };
}
