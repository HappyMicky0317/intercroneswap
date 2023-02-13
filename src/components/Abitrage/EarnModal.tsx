import { TransactionResponse } from '@ethersproject/abstract-provider';
import { Token } from '@intercroneswap/v2-sdk';
import { useContext, useCallback } from 'react';
import { ThemeContext } from 'styled-components';
import { ButtonPrimary } from '../Button';
import { AutoColumn } from '../Column';
import { AutoRow, RowBetween } from '../Row';
import TransactionConfirmationModal, { ConfirmationModalContent } from '../TransactionConfirmationModal';
import { useActiveWeb3React } from '../../hooks';
import { useStakeActionHandlers, useStakeState } from '../../state/stake/hooks';
import { useTransactionAdder } from '../../state/transactions/hooks';
import { TYPE } from '../../theme';
import { DEFAULT_FEE_LIMIT } from '../../tron-config';
import { getEarningContract } from '../../utils';
import { EARNING_CONTRACT } from '../../constants';

interface EarnModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  token: Token | string | undefined;
  abitrageAddress: string | undefined;
}

export default function EarnModal({ isOpen, onDismiss, token, abitrageAddress }: EarnModalProps) {
  const { account, chainId, library } = useActiveWeb3React();
  const theme = useContext(ThemeContext);

  const { onAttemptingTxn, onTxHashChange } = useStakeActionHandlers();
  const addTransaction = useTransactionAdder();
  const stakeState = useStakeState();

  async function doEarning() {
    if (!chainId || !library || !account) {
      return;
    }

    const earningContract = getEarningContract(chainId, abitrageAddress || EARNING_CONTRACT, library, account);

    const tokenAddress = token instanceof Token ? token?.address : token;
    const estimate = earningContract.estimateGas.makeEarning;
    const method: (...args: any) => Promise<TransactionResponse> = earningContract.makeEarning;
    const args: Array<string | string[] | number> = [tokenAddress ?? ''];

    onAttemptingTxn(true);
    await estimate(...args, {})
      .then(() =>
        method(...args, {
          ...{},
          gasLimit: DEFAULT_FEE_LIMIT,
        }).then((response) => {
          onAttemptingTxn(false);
          addTransaction(response, {
            summary: `Make earning on: ${token}`,
          });
          onTxHashChange(response.hash);
        }),
      )
      .catch((err) => {
        onAttemptingTxn(false);
        if (err?.code !== 4001) {
          console.error(err);
        }
      });
  }

  const modalBottom = useCallback(() => {
    return (
      <AutoRow justify="center">
        <ButtonPrimary width="50%" onClick={doEarning}>
          Earn
        </ButtonPrimary>
      </AutoRow>
    );
  }, [token]);

  const modalHeader = useCallback(() => {
    return (
      <AutoColumn gap="md">
        <RowBetween>
          <TYPE.white fontWeight={500}>Earning</TYPE.white>
          <TYPE.white fontWeight={500} color={theme.primary3}>
            {token instanceof Token ? token?.symbol : token}
          </TYPE.white>
        </RowBetween>
      </AutoColumn>
    );
  }, [token]);

  // const toggleWalletModal = useWalletModalToggle(); // toggle wallet when disconnected
  const confirmationContent = useCallback(() => {
    return (
      <ConfirmationModalContent
        title={'Earn'}
        onDismiss={onDismiss}
        topContent={modalHeader}
        bottomContent={modalBottom}
      />
    );
  }, [token, stakeState]);

  return (
    <TransactionConfirmationModal
      isOpen={isOpen}
      onDismiss={onDismiss}
      attemptingTxn={stakeState.attemptingTxn}
      hash={stakeState.txHash}
      content={confirmationContent}
      pendingText={''}
    />
  );
}
