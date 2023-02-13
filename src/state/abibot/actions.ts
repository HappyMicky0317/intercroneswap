import { createAction } from '@reduxjs/toolkit';

export const typeInput = createAction<{ typedValue: string }>('abibot/typeInput');
export const setTxHash = createAction<{ txHash: string }>('abibot/setTxHash');
export const setAttemptingTxn = createAction<{ attemptingTxn: boolean }>('abibot/setAttemptingTxattemptingTxn');
