import { createReducer } from '@reduxjs/toolkit';
import { setAttemptingTxn, setTxHash, typeInput } from './actions';

export interface AbiBotState {
  typedValue: string;
  attemptingTxn: boolean;
  txHash: string;
}

const initialState: AbiBotState = {
  typedValue: '1',
  txHash: '',
  attemptingTxn: false,
};

export default createReducer<AbiBotState>(initialState, (builder) => {
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
});
