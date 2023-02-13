import { DEFAULT_FEE_LIMIT } from '../../tron-config';
import ReactGA from 'react-ga';
import { useActiveWeb3React } from '../../hooks';
import { ArbiNFTInfo, useAbiBotActionHandlers, useAbiBotState } from '../../state/abibot/hooks';
import { useCallback, useContext } from 'react';
import { AutoColumn } from '../../components/Column';
import { ButtonPrimary } from '../../components/Button';
import { RowBetween, RowFixed } from '../../components/Row';
import { ThemeContext } from 'styled-components';
import TransactionConfirmationModal, { ConfirmationModalContent } from '../../components/TransactionConfirmationModal';
import { GreyCard } from '../../components/Card';
import { TruncatedText } from '../../components/swap/styleds';
import { ETHER, JSBI } from '@intercroneswap/v2-sdk';
import CurrencyLogo from '../../components/CurrencyLogo';
import { TYPE } from '../../theme';
import { ethAddress } from '@intercroneswap/java-tron-provider';
import { useTransactionAdder } from '../../state/transactions/hooks';

export interface MintModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  mintInfo: ArbiNFTInfo;
}

export default function MintModal({ isOpen, onDismiss, mintInfo }: MintModalProps) {
  const { account, chainId, library } = useActiveWeb3React();
  const { onAttemptingTxn, onTxHashChange } = useAbiBotActionHandlers();
  const theme = useContext(ThemeContext);

  const mintState = useAbiBotState();
  const tronweb = window?.tronWeb as any;

  const addTransaction = useTransactionAdder();

  const doMint = useCallback(async () => {
    if (!chainId || !library || !account) {
      return;
    }

    if (!mintState?.typedValue) {
      return;
    }
    const amount = Number(mintState.typedValue);

    try {
      onAttemptingTxn(true);
      const contract = await tronweb.contract().at(ethAddress.toTron(mintInfo.mintAddress));
      const res = await contract.mint(amount).send({
        feeLimit: DEFAULT_FEE_LIMIT,
        callValue: JSBI.toNumber(JSBI.multiply(mintInfo.cost.raw, JSBI.BigInt(amount))),
      });
      console.log('res', res);

      const transactionInfo: any = {
        hash: `0x${res}`,
      };

      addTransaction(transactionInfo, {
        summary: `Mint ${mintState.typedValue} NFTs`,
      });

      onTxHashChange(transactionInfo.hash);

      ReactGA.event({
        category: 'Mint',
        action: 'mint',
        label: `Minted ${mintState.typedValue} Arbibot NFT Tokens`,
      });
      onAttemptingTxn(false);
    } catch (err: any) {
      onAttemptingTxn(false);
      if (err?.code !== 4001) {
        console.error(err);
      }
    }
  }, [account, mintInfo, isOpen, mintState.typedValue]);
  // const [approval, approveCallback] = useApproveCallback(mintInfo?.cost, mintInfo?.mintAddress);

  // const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false);

  // useEffect(() => {
  //   if (approval === ApprovalState.PENDING) {
  //     setApprovalSubmitted(true);
  //   }
  // }, [approval, approvalSubmitted]);

  const modalBottom = useCallback(() => {
    return (
      <AutoColumn justify="center">
        <ButtonPrimary width="50%" onClick={doMint}>
          Mint
        </ButtonPrimary>
      </AutoColumn>
    );
  }, [mintInfo, mintState]);

  const modalHeader = useCallback(() => {
    return (
      <AutoColumn gap="md">
        <GreyCard style={{ padding: '15px', marginTop: '2rem' }}>
          <RowBetween padding=".5rem">
            <TYPE.white>Name</TYPE.white>
            <TYPE.white>{mintInfo.name}</TYPE.white>
          </RowBetween>
          <RowBetween padding=".5rem">
            <TYPE.white>Cost</TYPE.white>
            <TruncatedText>{mintInfo?.cost.toSignificant(4)}</TruncatedText>
          </RowBetween>
          <RowBetween padding=".5rem">
            <TYPE.white>Amount</TYPE.white>
            <TruncatedText>{mintState.typedValue}</TruncatedText>
          </RowBetween>
          <RowBetween padding=".5rem">
            <TYPE.white>Mint Price</TYPE.white>
            <RowFixed>
              <TruncatedText>
                {mintInfo?.cost.multiply(JSBI.BigInt(mintState.typedValue)).toSignificant(4)}
              </TruncatedText>
              <CurrencyLogo currency={ETHER} style={{ paddingLeft: '3px' }} />
              <TYPE.white>{ETHER.symbol}</TYPE.white>
            </RowFixed>
          </RowBetween>
        </GreyCard>
        <RowBetween style={{ background: theme.bg3, borderRadius: '6px' }}></RowBetween>
      </AutoColumn>
    );
  }, [mintInfo, mintState]);

  const confirmationContent = useCallback(() => {
    return (
      <ConfirmationModalContent
        title="Mint"
        onDismiss={onDismiss}
        topContent={modalHeader}
        bottomContent={modalBottom}
      />
    );
  }, [mintInfo, mintState]);

  const pendingText = `Minting ${mintState.typedValue} arbiBot NFTs`;

  return (
    <TransactionConfirmationModal
      isOpen={isOpen}
      onDismiss={onDismiss}
      attemptingTxn={mintState.attemptingTxn}
      hash={mintState.txHash}
      content={confirmationContent}
      pendingText={pendingText}
    />
  );
}
