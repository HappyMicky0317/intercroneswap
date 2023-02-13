import { TokenAmount } from '@intercroneswap/v2-sdk';
import { useCallback, useContext } from 'react';
import { ThemeContext } from 'styled-components';
import { ButtonPrimary } from '../../components/Button';
import { AutoColumn } from '../../components/Column';
import { AutoRow, RowBetween } from '../../components/Row';
import TransactionConfirmationModal, { ConfirmationModalContent } from '../../components/TransactionConfirmationModal';
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback';
import { useActiveWeb3React } from '../../hooks';
import { StakingInfo, useStakeActionHandlers, useStakeState } from '../../state/stake/hooks';
import { getStakingContract } from '../../utils';
import { TransactionResponse } from '@ethersproject/providers';
import { DEFAULT_FEE_LIMIT } from '../../tron-config';
import { useTransactionAdder } from '../../state/transactions/hooks';
import { TYPE } from '../../theme';

interface StakeModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  stakingAddress: string;
  balance?: TokenAmount;
  stakingInfo?: StakingInfo;
}

export default function ExitModal({ isOpen, onDismiss, stakingAddress, balance }: StakeModalProps) {
  const { account, chainId, library } = useActiveWeb3React();
  const theme = useContext(ThemeContext);

  const stakeState = useStakeState();
  const { onAttemptingTxn, onTxHashChange } = useStakeActionHandlers();
  const addTransaction = useTransactionAdder();

  async function doExit() {
    if (!chainId || !library || !account) {
      return;
    }

    const stakingContract = getStakingContract(chainId, stakingAddress, library, account);
    console.log('stakingContract', stakingContract);

    const estimate = stakingContract.estimateGas.exit;
    const method: (...args: any) => Promise<TransactionResponse> = stakingContract.exit;
    onAttemptingTxn(true);
    await estimate()
      .then(() =>
        method({
          ...{},
          gasLimit: DEFAULT_FEE_LIMIT,
        }).then((response) => {
          onAttemptingTxn(false);
          addTransaction(response, {
            summary: `Exit`,
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

  const [approveState, approveCallback] = useApproveCallback(balance, stakingAddress);

  const modalBottom = useCallback(() => {
    return (
      <AutoRow justify="center">
        {(approveState === ApprovalState.PENDING || approveState === ApprovalState.NOT_APPROVED) && (
          <ButtonPrimary width="50%" onClick={approveCallback}>
            Approve
          </ButtonPrimary>
        )}
        <ButtonPrimary width="50%" onClick={doExit}>
          Exit
        </ButtonPrimary>
      </AutoRow>
    );
  }, [stakingAddress, approveState]);

  const modalHeader = useCallback(() => {
    return (
      <AutoColumn gap="md">
        <RowBetween>
          <TYPE.white fontWeight={500}>Balance</TYPE.white>
          <TYPE.white fontWeight={500} color={theme.primary3}>
            {balance?.toSignificant()}
          </TYPE.white>
        </RowBetween>
      </AutoColumn>
    );
  }, [stakingAddress, balance]);

  // const toggleWalletModal = useWalletModalToggle(); // toggle wallet when disconnected
  const confirmationContent = useCallback(() => {
    return (
      <ConfirmationModalContent
        title={'Exit'}
        onDismiss={onDismiss}
        topContent={modalHeader}
        bottomContent={modalBottom}
      />
    );
  }, [stakingAddress, approveState]);

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
