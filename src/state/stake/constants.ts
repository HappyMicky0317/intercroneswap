import { Token } from '@intercroneswap/v2-sdk';

export const REWARDS_DURATION_DAYS = 14;
export const REWARDS_DURATION_DAYS_180 = 180;

export interface StakingRewardsInfo {
  tokens: [Token, Token];
  stakingRewardAddress: string;
  rewardsDays: number;
}
