import { ETHER, TokenAmount } from '@intercroneswap/v2-sdk';
import ReactGA from 'react-ga';
import { useCallback, useContext, useEffect, useState } from 'react';
import { ThemeContext } from 'styled-components';
import { ButtonConfirmed, ButtonGray, ButtonPrimary } from '../../components/Button';
import { AutoColumn } from '../../components/Column';
import NumericalInput from '../../components/NumericalInput';
import { AutoRow, RowBetween } from '../../components/Row';
import TransactionConfirmationModal, { ConfirmationModalContent } from '../../components/TransactionConfirmationModal';
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback';
import { useActiveWeb3React } from '../../hooks';
import { StakingInfo, useStakeActionHandlers, useStakeState } from '../../state/stake/hooks';
import { getStakingContract } from '../../utils';
import { TransactionResponse } from '@ethersproject/providers';
import { DEFAULT_FEE_LIMIT } from '../../tron-config';
import { useTransactionAdder } from '../../state/transactions/hooks';
import { Tabs } from '../../components/NavigationTabs';
import { ExternalLink, TYPE } from '../../theme';
import { MaxButton } from './styleds';
import { ethAddress } from '@intercroneswap/java-tron-provider';
import { tryParseAmount } from '../../state/swap/hooks';
import { unwrappedToken } from '../../utils/wrappedCurrency';
import Loader from '../../components/Loader';

interface StakeModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  stakingAddress: string;
  balance?: TokenAmount;
  stakingInfo?: StakingInfo;
  referalAddress?: string;
}

export default function StakeModal({
  isOpen,
  onDismiss,
  stakingAddress,
  balance,
  stakingInfo,
  referalAddress,
}: StakeModalProps) {
  const { account, chainId, library } = useActiveWeb3React();
  const theme = useContext(ThemeContext);
  const stakeState = useStakeState();

  const [isStaking, setIsStaking] = useState<boolean>(true);
  const { onUserInput, onTxHashChange, onAttemptingTxn } = useStakeActionHandlers();
  const token0 = stakingInfo?.tokens[0];
  const token1 = stakingInfo?.tokens[1];

  const currency0 = token0 ? unwrappedToken(token0) : undefined;
  const currency1 = token1 ? unwrappedToken(token1) : undefined;

  const addTransaction = useTransactionAdder();

  const stakeAmount = tryParseAmount(stakeState.typedValue, balance?.token);

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(value);
    },
    [onUserInput],
  );

  async function doWithdraw() {
    if (!chainId || !library || !account) {
      return;
    }

    const stakingContract = getStakingContract(chainId, stakingAddress, library, account);
    console.log('stakeContract', stakingContract);

    if (!stakeState?.typedValue || !balance) {
      return;
    }
    const estimate = stakingContract.estimateGas.withdraw;
    const method: (...args: any) => Promise<TransactionResponse> = stakingContract.withdraw;
    const args: Array<string | string[] | number> = [stakeAmount?.raw.toString() ?? '0'];
    onAttemptingTxn(true);
    await estimate(...args, {})
      .then(() =>
        method(...args, {
          ...{},
          gasLimit: DEFAULT_FEE_LIMIT,
        }).then((response) => {
          onAttemptingTxn(false);
          addTransaction(response, {
            summary: `Withdraw ${stakeState.typedValue}`,
          });

          ReactGA.event({
            category: 'Stake',
            action: 'unstake',
            label: [stakingInfo?.tokens[0]?.symbol, stakingInfo?.tokens[1]?.symbol].join('/'),
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

  const doStake = useCallback(() => {
    if (!chainId || !library || !account) {
      return;
    }

    console.log(stakingAddress);

    const stakingContract = getStakingContract(chainId, stakingAddress, library, account);
    if (!stakeState?.typedValue || !balance) {
      return;
    }
    const estimate = stakingContract.estimateGas.stake;
    const method: (...args: any) => Promise<TransactionResponse> = stakingContract.stake;
    const args: Array<string | string[] | number> = [
      stakeAmount?.raw.toString(),
      referalAddress ? ethAddress.fromTron(referalAddress) : account,
    ];

    onAttemptingTxn(true);
    estimate(...args, {})
      .then(() =>
        method(...args, {
          ...{},
          gasLimit: DEFAULT_FEE_LIMIT,
        }).then((response) => {
          onAttemptingTxn(false);

          addTransaction(response, {
            summary: `Stake ${stakeState.typedValue} LP token`,
          });

          onTxHashChange(response.hash);

          ReactGA.event({
            category: 'Stake',
            action: 'stake',
            label: [stakingInfo?.tokens[0]?.symbol, stakingInfo?.tokens[1]?.symbol].join('/'),
          });
        }),
      )
      .catch((err) => {
        onAttemptingTxn(false);
        if (err?.code !== 4001) {
          console.error(err);
        }
      });
  }, [account, isOpen, stakeState.typedValue]);

  const [approval, approveCallback] = useApproveCallback(balance, stakingAddress);

  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false);

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      setApprovalSubmitted(true);
    }
  }, [approval, approvalSubmitted]);

  const modalBottom = useCallback(() => {
    return (
      <AutoColumn justify="center">
        {approval === ApprovalState.PENDING || approval === ApprovalState.NOT_APPROVED ? (
          <ButtonConfirmed
            onClick={approveCallback}
            disabled={approval !== ApprovalState.NOT_APPROVED || approvalSubmitted}
            width="48%"
            altDisabledStyle={approval === ApprovalState.PENDING} // show solid button while waiting
            confirmed={approval !== ApprovalState.PENDING && approval !== ApprovalState.NOT_APPROVED}
          >
            {approval === ApprovalState.PENDING ? (
              <AutoRow gap="6px" justify="center">
                Approving <Loader stroke="white" />
              </AutoRow>
            ) : (
              'Approve'
            )}
          </ButtonConfirmed>
        ) : (
          <ButtonPrimary
            width="50%"
            onClick={isStaking ? doStake : doWithdraw}
            disabled={
              isStaking
                ? Number(stakeState.typedValue) > Number(balance?.toExact())
                : Number(stakeState.typedValue) > Number(stakingInfo?.stakedAmount?.toExact())
            }
          >
            {isStaking ? 'Deposit' : 'Remove'}
          </ButtonPrimary>
        )}
        <ExternalLink
          href={`#/add/${currency0 === ETHER ? ETHER.symbol : token0?.address}/${
            currency1 === ETHER ? ETHER.symbol : token1?.address
          }`}
        >
          <TYPE.white fontWeight="0.7rem" style={{ textDecorationLine: 'underline' }}>
            Get LP {currency0?.symbol}/{currency1?.symbol}
          </TYPE.white>
        </ExternalLink>
      </AutoColumn>
    );
  }, [stakeState, balance, isStaking, approval, stakingInfo, isOpen]);

  const modalHeader = useCallback(() => {
    return (
      <AutoColumn gap="md">
        <RowBetween>
          <TYPE.white fontWeight={500}>Balance</TYPE.white>
          <TYPE.white fontWeight={500} color={theme.primary3}>
            {isStaking ? balance?.toExact() : stakingInfo?.stakedAmount?.toExact()}
          </TYPE.white>
        </RowBetween>
        <RowBetween style={{ background: theme.bg3, borderRadius: '6px' }}>
          <NumericalInput className="lp-amount-input" value={stakeState.typedValue} onUserInput={handleTypeInput} />
          <MaxButton
            style={{
              border: theme.primary3,
              borderWidth: '1px',
              borderColor: theme.primary3,
              borderStyle: 'solid',
              borderRadius: '8px',
              color: theme.primary3,
              textAlign: 'center',
              alignItems: 'center',
              overflow: 'visible',
            }}
            width="fit-content"
            onClick={() => {
              onUserInput((isStaking ? balance?.toFixed(8) : stakingInfo?.stakedAmount?.toFixed(8)) ?? '');
            }}
          >
            <TYPE.white>MAX</TYPE.white>
          </MaxButton>
        </RowBetween>
      </AutoColumn>
    );
  }, [stakeState, balance, isStaking, stakingInfo, isOpen]);

  // const toggleWalletModal = useWalletModalToggle(); // toggle wallet when disconnected
  const confirmationContent = useCallback(() => {
    return (
      <AutoRow>
        <Tabs style={{ width: '100%', margin: '8px 14px' }}>
          <ButtonGray
            width="48%"
            onClick={() => {
              setIsStaking(true);
              onUserInput('');
            }}
          >
            Stake
          </ButtonGray>
          <ButtonGray
            width="48%"
            onClick={() => {
              setIsStaking(false);
              onUserInput('');
            }}
          >
            Unstake
          </ButtonGray>
        </Tabs>
        <ConfirmationModalContent
          title={isStaking ? 'Deposit' : 'Remove deposit'}
          onDismiss={onDismiss}
          topContent={modalHeader}
          bottomContent={modalBottom}
        />
      </AutoRow>
    );
  }, [onDismiss, modalBottom, modalHeader]);

  const pendingText = `${isStaking ? 'Staking' : 'Withdrawing'} ${stakeState.typedValue} ${
    stakingInfo?.tokens[0].symbol
  } / ${stakingInfo?.tokens[1]?.symbol} LP Tokens`;

  return (
    <TransactionConfirmationModal
      isOpen={isOpen}
      onDismiss={onDismiss}
      attemptingTxn={stakeState.attemptingTxn ?? false}
      hash={stakeState.txHash}
      content={confirmationContent}
      pendingText={pendingText}
    />
  );
}
