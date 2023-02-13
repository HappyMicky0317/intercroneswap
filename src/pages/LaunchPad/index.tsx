import { Trade, CurrencyAmount, Token, JSBI } from '@intercroneswap/v2-sdk';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import Rocket from '../../assets/svg/rocket.svg';
import PlaentzLogo from '../../assets/svg/plaentz_logo.svg';
import { ArrowDown, Loader } from 'react-feather';
import { ThemeContext } from 'styled-components';
import AddressInputPanel from '../../components/AddressInputPanel';
import Twitter from '../../assets/svg/Twitter_white.svg';
import Telegram from '../../assets/svg/Telegram_white.svg';
import Facebook from '../../assets/svg/Facebook_white.svg';
import Instagram from '../../assets/svg/Instagram_white.svg';
import Youtube from '../../assets/svg/Youtube_white.svg';
import { ButtonPrimary, ButtonConfirmed, ButtonError } from '../../components/Button';
import { GreyCard } from '../../components/Card';
import Column, { AutoColumn } from '../../components/Column';
import CurrencyInputPanel from '../../components/CurrencyInputPanel';
import ReactGA from 'react-ga';
import ProgressSteps from '../../components/ProgressSteps';
import { AutoRow, RowBetween } from '../../components/Row';
import AdvancedSwapDetailsDropdown from '../../components/swap/AdvancedSwapDetailsDropdown';
import BetterTradeLink, { DefaultVersionLink } from '../../components/swap/BetterTradeLink';
import confirmPriceImpactWithoutFee from '../../components/swap/confirmPriceImpactWithoutFee';
import ConfirmSwapModal from '../../components/swap/ConfirmSwapModal';
import { ArrowWrapper, BottomGrouping, SwapCallbackError } from '../../components/swap/styleds';
import TokenWarningModal from '../../components/TokenWarningModal';
import { getTradeVersion, isTradeBetter } from '../../data/V';
import { useActiveWeb3React } from '../../hooks';
import { useApproveCallbackFromTrade, ApprovalState } from '../../hooks/useApproveCallback';
import '../../styles/swap.scss';
import { useSwapCallback } from '../../hooks/useSwapCallback';
import useToggledVersion, { DEFAULT_VERSION, Version } from '../../hooks/useToggledVersion';
import useWrapCallback, { WrapType } from '../../hooks/useWrapCallback';
import { Field } from '../../state/swap/actions';
import {
  useSwapState,
  useDerivedSwapInfo,
  useSwapActionHandlers,
  useDefaultsForLaunchPad,
} from '../../state/swap/hooks';
import { Divider, ExternalLink, LinkStyledButton, TYPE } from '../../theme';
import { maxAmountSpend } from '../../utils/maxAmountSpend';
import { computeTradePriceBreakdown, warningSeverity } from '../../utils/prices';
import { StyledHeading } from '../App';
import AppBody, { Container } from '../AppBody';
import { Wrapper } from '../Pool/styleds';
import { BETTER_TRADE_LINK_THRESHOLD, LAUNCH_START_TIME } from '../../constants';
import { useCurrency } from '../../hooks/Tokens';
import useENSAddress from '../../hooks/useENSAddress';
import { useWalletModalToggle } from '../../state/application/hooks';
import { useExpertModeManager } from '../../state/user/hooks';
import { MenuItem, SocialIconWrapper } from '../../components/Footer';
import { LaunchCountDown } from '../../components/earn/Countdown';

export default function LaunchPad() {
  const loadedUrlParams = useDefaultsForLaunchPad();

  // token warning stuff
  const [loadedInputCurrency, loadedOutputCurrency] = [
    useCurrency(loadedUrlParams?.inputCurrencyId),
    useCurrency(loadedUrlParams?.outputCurrencyId),
  ];

  const [dismissTokenWarning, setDismissTokenWarning] = useState<boolean>(false);
  const urlLoadedTokens: Token[] = useMemo(
    () => [loadedInputCurrency, loadedOutputCurrency]?.filter((c): c is Token => c instanceof Token) ?? [],
    [loadedInputCurrency, loadedOutputCurrency],
  );
  const handleConfirmTokenWarning = useCallback(() => {
    setDismissTokenWarning(true);
  }, []);

  const { account } = useActiveWeb3React();
  const theme = useContext(ThemeContext);

  // toggle wallet when disconnected
  const toggleWalletModal = useWalletModalToggle();

  // for expert mode
  // const toggleSettings = useToggleSettingsMenu();
  const [isExpertMode] = useExpertModeManager();

  // get custom setting values for user
  const allowedSlippage = 2000;

  // swap state
  const { independentField, typedValue, recipient } = useSwapState();
  const {
    vTrade,
    v1Trade,
    currencyBalances,
    parsedAmount,
    currencies,
    inputError: swapInputError,
  } = useDerivedSwapInfo();
  const {
    wrapType,
    execute: onWrap,
    inputError: wrapInputError,
  } = useWrapCallback(currencies[Field.INPUT], currencies[Field.OUTPUT], typedValue);
  const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE;
  const { address: recipientAddress } = useENSAddress(recipient);
  const toggledVersion = useToggledVersion();
  const tradesByVersion = {
    [Version.v]: vTrade,
    [Version.v1]: v1Trade,
  };
  const trade = showWrap ? undefined : tradesByVersion[toggledVersion];
  const defaultTrade = showWrap ? undefined : tradesByVersion[DEFAULT_VERSION];

  const betterTradeLinkVersion: Version | undefined =
    toggledVersion === Version.v1 && isTradeBetter(v1Trade, vTrade, BETTER_TRADE_LINK_THRESHOLD)
      ? Version.v
      : toggledVersion === Version.v && isTradeBetter(vTrade, v1Trade)
      ? Version.v1
      : undefined;

  const parsedAmounts = showWrap
    ? {
        [Field.INPUT]: parsedAmount,
        [Field.OUTPUT]: parsedAmount,
      }
    : {
        [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
        [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount,
      };
  // onSwitchTokens
  const { onCurrencySelection, onUserInput, onChangeRecipient } = useSwapActionHandlers();
  const isValid = !swapInputError;
  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT;

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.INPUT, value);
    },
    [onUserInput],
  );
  const handleTypeOutput = useCallback(
    (value: string) => {
      onUserInput(Field.OUTPUT, value);
    },
    [onUserInput],
  );

  // modal and loading
  const [{ showConfirm, tradeToConfirm, swapErrorMessage, attemptingTxn, txHash }, setSwapState] = useState<{
    showConfirm: boolean;
    tradeToConfirm: Trade | undefined;
    attemptingTxn: boolean;
    swapErrorMessage: string | undefined;
    txHash: string | undefined;
  }>({
    showConfirm: false,
    tradeToConfirm: undefined,
    attemptingTxn: false,
    swapErrorMessage: undefined,
    txHash: undefined,
  });

  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: showWrap
      ? parsedAmounts[independentField]?.toExact() ?? ''
      : parsedAmounts[dependentField]?.toSignificant(6) ?? '',
  };

  const route = trade?.route;
  const userHasSpecifiedInputOutput = Boolean(
    currencies[Field.INPUT] && currencies[Field.OUTPUT] && parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0)),
  );
  const noRoute = !route;

  // check whether the user has approved the router on the input token
  const [approval, approveCallback] = useApproveCallbackFromTrade(trade, allowedSlippage);

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false);

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      setApprovalSubmitted(true);
    }
  }, [approval, approvalSubmitted]);

  const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(currencyBalances[Field.INPUT]);
  const atMaxAmountInput = Boolean(maxAmountInput && parsedAmounts[Field.INPUT]?.equalTo(maxAmountInput));

  // the callback to execute the swap
  const { callback: swapCallback, error: swapCallbackError } = useSwapCallback(trade, allowedSlippage, recipient);

  const { priceImpactWithoutFee } = computeTradePriceBreakdown(trade);

  const handleSwap = useCallback(() => {
    if (priceImpactWithoutFee && !confirmPriceImpactWithoutFee(priceImpactWithoutFee)) {
      return;
    }
    if (!swapCallback) {
      return;
    }
    setSwapState({ attemptingTxn: true, tradeToConfirm, showConfirm, swapErrorMessage: undefined, txHash: undefined });
    swapCallback()
      .then((hash) => {
        setSwapState({ attemptingTxn: false, tradeToConfirm, showConfirm, swapErrorMessage: undefined, txHash: hash });

        ReactGA.event({
          category: 'Swap',
          action:
            recipient === null
              ? 'Swap w/o Send'
              : (recipientAddress ?? recipient) === account
              ? 'Swap w/o Send + recipient'
              : 'Swap w/ Send',
          label: [
            trade?.inputAmount?.currency?.symbol,
            trade?.outputAmount?.currency?.symbol,
            getTradeVersion(trade),
          ].join('/'),
        });
      })
      .catch((error) => {
        setSwapState({
          attemptingTxn: false,
          tradeToConfirm,
          showConfirm,
          swapErrorMessage: error.message,
          txHash: undefined,
        });
      });
  }, [tradeToConfirm, account, priceImpactWithoutFee, recipient, recipientAddress, showConfirm, swapCallback, trade]);

  // errors
  // const [showInverted, setShowInverted] = useState<boolean>(false);

  // warnings on slippage
  const priceImpactSeverity = warningSeverity(priceImpactWithoutFee);

  // show approve flow when: no error on inputs, not approved or pending, or approved in current session
  // never show if price impact is above threshold in non expert mode
  const showApproveFlow =
    !swapInputError &&
    (approval === ApprovalState.NOT_APPROVED ||
      approval === ApprovalState.PENDING ||
      (approvalSubmitted && approval === ApprovalState.APPROVED)) &&
    !(priceImpactSeverity > 3 && !isExpertMode);

  const handleConfirmDismiss = useCallback(() => {
    setSwapState({ showConfirm: false, tradeToConfirm, attemptingTxn, swapErrorMessage, txHash });
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.INPUT, '');
    }
  }, [attemptingTxn, onUserInput, swapErrorMessage, tradeToConfirm, txHash]);
  const handleAcceptChanges = useCallback(() => {
    setSwapState({ tradeToConfirm: trade, swapErrorMessage, txHash, attemptingTxn, showConfirm });
  }, [attemptingTxn, showConfirm, swapErrorMessage, trade, txHash]);

  const handleInputSelect = useCallback(
    (inputCurrency) => {
      setApprovalSubmitted(false); // reset 2 step UI for approvals
      onCurrencySelection(Field.INPUT, inputCurrency);
    },
    [onCurrencySelection],
  );

  const handleMaxInput = useCallback(() => {
    console.log(maxAmountInput, 'maxAmount');
    maxAmountInput && onUserInput(Field.INPUT, maxAmountInput.toExact());
  }, [maxAmountInput, onUserInput]);

  const handleOutputSelect = useCallback(
    (outputCurrency) => onCurrencySelection(Field.OUTPUT, outputCurrency),
    [onCurrencySelection],
  );

  return (
    <>
      <LaunchCountDown exactStart={LAUNCH_START_TIME} />
      <StyledHeading>
        InterCrone Launchpad<img className="rocketimg" style={{ padding: '2rem' }} src={Rocket}></img>
      </StyledHeading>
      <TokenWarningModal
        isOpen={urlLoadedTokens.length > 0 && !dismissTokenWarning}
        tokens={urlLoadedTokens}
        onConfirm={handleConfirmTokenWarning}
      />
      <Container>
        <AppBody>
          <Divider />
          <Wrapper id="swap-page">
            <ConfirmSwapModal
              isOpen={showConfirm}
              trade={trade}
              originalTrade={tradeToConfirm}
              onAcceptChanges={handleAcceptChanges}
              attemptingTxn={attemptingTxn}
              txHash={txHash}
              recipient={recipient}
              allowedSlippage={allowedSlippage}
              onConfirm={handleSwap}
              swapErrorMessage={swapErrorMessage}
              onDismiss={handleConfirmDismiss}
            />
            <AutoColumn gap={'md'}>
              <CurrencyInputPanel
                label=""
                // label={independentField === Field.OUTPUT && !showWrap && trade ? 'From (estimated)' : 'From'}
                value={formattedAmounts[Field.INPUT]}
                showMaxButton={!atMaxAmountInput}
                disableCurrencySelect={true}
                currency={currencies[Field.INPUT]}
                onUserInput={handleTypeInput}
                onMax={handleMaxInput}
                onCurrencySelect={handleInputSelect}
                otherCurrency={currencies[Field.OUTPUT]}
                id="swap-currency-input"
              />
              <AutoColumn style={{ height: '3rem' }} />
              <CurrencyInputPanel
                value={formattedAmounts[Field.OUTPUT]}
                onUserInput={handleTypeOutput}
                label=""
                disableCurrencySelect={true}
                // label={independentField === Field.INPUT && !showWrap && trade ? 'To (estimated)' : 'To'}
                showMaxButton={false}
                currency={currencies[Field.OUTPUT]}
                onCurrencySelect={handleOutputSelect}
                otherCurrency={currencies[Field.INPUT]}
                id="swap-currency-output"
              />

              {recipient !== null && !showWrap ? (
                <>
                  <AutoRow justify="space-between" style={{ padding: '0 0rem' }}>
                    <ArrowWrapper clickable={false}>
                      <ArrowDown size="16" color={theme.text2} />
                    </ArrowWrapper>
                    <LinkStyledButton id="remove-recipient-button" onClick={() => onChangeRecipient(null)}>
                      - Remove send
                    </LinkStyledButton>
                  </AutoRow>
                  <AddressInputPanel id="recipient" value={recipient} onChange={onChangeRecipient} />
                </>
              ) : null}
            </AutoColumn>
            <BottomGrouping className="submtBtn">
              <div style={{ maxWidth: '350px', margin: '0 auto' }}>
                {!account ? (
                  <ButtonPrimary onClick={toggleWalletModal}>Connect Wallet</ButtonPrimary>
                ) : showWrap ? (
                  <ButtonPrimary disabled={Boolean(wrapInputError)} onClick={onWrap}>
                    {wrapInputError ??
                      (wrapType === WrapType.WRAP ? 'Wrap' : wrapType === WrapType.UNWRAP ? 'Unwrap' : null)}
                  </ButtonPrimary>
                ) : noRoute && userHasSpecifiedInputOutput ? (
                  <GreyCard style={{ textAlign: 'center' }}>
                    <TYPE.main mb="4px">Insufficient liquidity for this trade.</TYPE.main>
                  </GreyCard>
                ) : showApproveFlow ? (
                  <RowBetween>
                    <ButtonConfirmed
                      onClick={approveCallback}
                      disabled={approval !== ApprovalState.NOT_APPROVED || approvalSubmitted}
                      width="48%"
                      altDisabledStyle={approval === ApprovalState.PENDING} // show solid button while waiting
                      confirmed={approval === ApprovalState.APPROVED}
                    >
                      {approval === ApprovalState.PENDING ? (
                        <AutoRow gap="6px" justify="center">
                          Approving <Loader stroke="white" />
                        </AutoRow>
                      ) : approvalSubmitted && approval === ApprovalState.APPROVED ? (
                        'Approved'
                      ) : (
                        'Approve ' + currencies[Field.INPUT]?.symbol
                      )}
                    </ButtonConfirmed>
                    <ButtonError
                      onClick={() => {
                        if (isExpertMode) {
                          handleSwap();
                        } else {
                          setSwapState({
                            tradeToConfirm: trade,
                            attemptingTxn: false,
                            swapErrorMessage: undefined,
                            showConfirm: true,
                            txHash: undefined,
                          });
                        }
                      }}
                      width="48%"
                      id="swap-button"
                      disabled={
                        !isValid || approval !== ApprovalState.APPROVED || (priceImpactSeverity > 3 && !isExpertMode)
                      }
                      error={isValid && priceImpactSeverity > 2}
                    >
                      <TYPE.white fontSize={16} fontWeight={500}>
                        {priceImpactSeverity > 3 && !isExpertMode
                          ? `Price Impact High`
                          : `Swap${priceImpactSeverity > 2 ? ' Anyway' : ''}`}
                      </TYPE.white>
                    </ButtonError>
                  </RowBetween>
                ) : (
                  <ButtonError
                    onClick={() => {
                      if (isExpertMode) {
                        handleSwap();
                      } else {
                        setSwapState({
                          tradeToConfirm: trade,
                          attemptingTxn: false,
                          swapErrorMessage: undefined,
                          showConfirm: true,
                          txHash: undefined,
                        });
                      }
                    }}
                    id="swap-button"
                    disabled={!isValid || (priceImpactSeverity > 3 && !isExpertMode) || !!swapCallbackError}
                    error={isValid && priceImpactSeverity > 2 && !swapCallbackError}
                  >
                    <TYPE.white fontSize={20} fontWeight={500}>
                      {swapInputError
                        ? swapInputError
                        : priceImpactSeverity > 3 && !isExpertMode
                        ? `Price Impact Too High`
                        : `Swap${priceImpactSeverity > 2 ? ' Anyway' : ''}`}
                    </TYPE.white>
                  </ButtonError>
                )}
              </div>

              {showApproveFlow && (
                <Column style={{ marginTop: '1rem' }}>
                  <ProgressSteps steps={[approval === ApprovalState.APPROVED]} />
                </Column>
              )}
              {isExpertMode && swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
              {betterTradeLinkVersion ? (
                <BetterTradeLink version={betterTradeLinkVersion} />
              ) : toggledVersion !== DEFAULT_VERSION && defaultTrade ? (
                <DefaultVersionLink />
              ) : null}
            </BottomGrouping>
          </Wrapper>
        </AppBody>
        <AutoRow justify="start">
          <AppBody>
            <AutoColumn gap=".5rem">
              <img src={PlaentzLogo} />
              <Divider />
              <TYPE.white>
                PLZ is the official Token that powers the PLÅNTZ ecosystem. Pay your PLÅNTZ NFT or use it for products
                in their onlineshop.
              </TYPE.white>
              <ExternalLink href="https://plaentz.com">https://plaentz.com</ExternalLink>
            </AutoColumn>
          </AppBody>
          <AppBody>
            <AutoColumn gap="2rem">
              <TYPE.white>
                In launchpad the slippage is set higher to help not lose TRX due to failed transactions.
              </TYPE.white>
              <TYPE.white>
                The launch of PLÅNTZ (PLZ) will be an important step for PLÅNTZ ecosystem to flourish and give their
                community and NFT holders passive income through staking rewards. If you hold a PLÅNTZ Token you will be
                able to stake it for a period of time and receive PLZ when you unstake it.{' '}
              </TYPE.white>
              <TYPE.white>
                PLZ will be their governance token for our future projects in Gamefi, NFT marketplace and Metaverse.
              </TYPE.white>
            </AutoColumn>
          </AppBody>
        </AutoRow>
        <div>
          <AdvancedSwapDetailsDropdown trade={trade} />
        </div>
      </Container>
      <AutoColumn justify="center">
        <TYPE.white>Follow plaentz on social media</TYPE.white>
        <SocialIconWrapper>
          <MenuItem id="link" href="https://twitter.com/plaentz">
            <img src={Twitter} alt="" />
          </MenuItem>
          <MenuItem id="link" href="https://www.instagram.com/plaentz_com/">
            <img src={Instagram} alt="" />
          </MenuItem>
          <MenuItem id="link" href="https://www.facebook.com/plaentz/">
            <img src={Facebook} alt="" />
          </MenuItem>
          <MenuItem id="link" href="https://t.me/+2K4XHVj5ln0zODk8">
            <img src={Telegram} alt="" />
          </MenuItem>
          <MenuItem id="link" href="https://www.youtube.com/channel/UCFhk0JazFaU5iR2TmJ46Rdw">
            <img src={Youtube} alt="" />
          </MenuItem>
        </SocialIconWrapper>
      </AutoColumn>
    </>
  );
}
