import { TokenAmount } from '@intercroneswap/v2-sdk';
import { createReducer } from '@reduxjs/toolkit';
import { addStakeAmounts, setAttemptingTxn, setTxHash, typeInput } from './actions';

export interface StakeState {
  typedValue: string;
  attemptingTxn: boolean;
  txHash: string;
  stakeAmounts: {
    [stakeAddress: string]: [TokenAmount, TokenAmount];
  };
}

const initialState: StakeState = {
  typedValue: '',
  txHash: '',
  attemptingTxn: false,
  stakeAmounts: {},
};

export default createReducer<StakeState>(initialState, (builder) => {
  builder.addCase(typeInput, (state, { payload: { typedValue } }) => {
    return {
      ...state,
      typedValue,
    };
  });
  builder.addCase(setTxHash, (state, { payload: { txHash } }) => {
    return {
      ...state,
      txHash,
    };
  });
  builder.addCase(setAttemptingTxn, (state, { payload: { attemptingTxn } }) => {
    return {
      ...state,
      attemptingTxn,
    };
  });
  builder.addCase(addStakeAmounts, (state, { payload: { stakeAddress, stakedAmounts } }) => {
    let currentAmounts = state.stakeAmounts[stakeAddress];
    if (currentAmounts) {
      currentAmounts = stakedAmounts;
    } else {
      state.stakeAmounts[stakeAddress] = stakedAmounts;
    }

    return {
      ...state,
    };
  });
});
