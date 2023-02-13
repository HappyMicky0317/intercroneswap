import { TokenAmount } from '@intercroneswap/v2-sdk';
import { useContext } from 'react';
import { ThemeContext } from 'styled-components';
import { USDT } from '../../constants/tokens';
import { PairState } from '../../data/Reserves';
import { useActiveWeb3React } from '../../hooks';
import useUSDTPrice from '../../hooks/useUSDTPrice';
import { StakingInfo } from '../../state/stake/hooks';
import { Divider, ExternalLink, MEDIA_WIDTHS } from '../../theme';
import { getEtherscanLink } from '../../utils';
import { unwrappedToken } from '../../utils/wrappedCurrency';
import CurrencyLogo from '../CurrencyLogo';
import { Dots } from '../swap/styleds';
import { Countdown } from './Countdown';
import {
  AutoColumnToRow,
  SpacedToCenteredAutoRow,
  RowBetweenToDiv,
  ResponsiveSizedTextMedium,
  ResponsiveSizedTextNormal,
} from './styleds';

interface DetailsDropDownParams {
  stakingInfo: StakingInfo;
  toggleToken: boolean;
  address: string;
  pairState: PairState;
  stakedAmount: TokenAmount | undefined;
  totalStakedAmount: TokenAmount | undefined;
}

export default function DetailsDropdown({
  stakingInfo,
  toggleToken,
  address,
  pairState,
  stakedAmount,
  totalStakedAmount,
}: DetailsDropDownParams) {
  const theme = useContext(ThemeContext);
  const { chainId } = useActiveWeb3React();
  const isMobile = window.innerWidth <= MEDIA_WIDTHS.upToMedium;

  const currency = stakedAmount ? unwrappedToken(stakedAmount?.token) : undefined;
  const USDPrice = useUSDTPrice(stakedAmount?.token);
  const valueOfStakedAmountInUSDT = stakedAmount && USDPrice?.quote(stakedAmount);
  const valueOfTotalStakedAmountInUSDT = totalStakedAmount && USDPrice?.quote(totalStakedAmount);

  return (
    <AutoColumnToRow justify="center">
      {!isMobile && <Divider style={{ width: '75%' }} />}
      <SpacedToCenteredAutoRow gap=".5rem">
        {stakingInfo.fee > 0 ? (
          <RowBetweenToDiv>
            <ResponsiveSizedTextMedium>Fee</ResponsiveSizedTextMedium>
            <ResponsiveSizedTextMedium>{stakingInfo.fee} %</ResponsiveSizedTextMedium>
          </RowBetweenToDiv>
        ) : undefined}
        <RowBetweenToDiv>
          <Countdown exactEnd={stakingInfo.periodFinish} durationDays={stakingInfo.rewardDuration} />
        </RowBetweenToDiv>
        <RowBetweenToDiv>
          <ResponsiveSizedTextMedium fontWeight="0.7rem">Staked</ResponsiveSizedTextMedium>
          {toggleToken ? (
            <ResponsiveSizedTextNormal fontWeight="0.6rem" color={theme.primary3}>
              {stakedAmount?.toSignificant() ?? '-'} <CurrencyLogo currency={currency} size=".8rem" />
            </ResponsiveSizedTextNormal>
          ) : (
            <ResponsiveSizedTextNormal fontWeight="0.6rem" color={theme.primary3}>
              {valueOfStakedAmountInUSDT?.toFixed(2) ?? '-'} <CurrencyLogo currency={USDT} size=".8rem" />
            </ResponsiveSizedTextNormal>
          )}
        </RowBetweenToDiv>
        <RowBetweenToDiv>
          <ResponsiveSizedTextMedium fontWeight="0.7rem">Total Staked</ResponsiveSizedTextMedium>
          {pairState === PairState.EXISTS ? (
            <>
              {toggleToken ? (
                <ResponsiveSizedTextNormal fontWeight="0.7rem" color={theme.primary3}>
                  {totalStakedAmount?.toSignificant(4)} <CurrencyLogo currency={currency} size=".8rem" />
                </ResponsiveSizedTextNormal>
              ) : (
                <ResponsiveSizedTextNormal fontWeight="0.7rem" color={theme.primary3}>
                  {valueOfTotalStakedAmountInUSDT?.toFixed(2)} <CurrencyLogo currency={USDT} size=".8rem" />
                </ResponsiveSizedTextNormal>
              )}
            </>
          ) : (
            <Dots></Dots>
          )}
        </RowBetweenToDiv>
        <ExternalLink
          style={{ textAlign: 'center', color: '#fff', textDecorationLine: 'underline' }}
          href={chainId ? getEtherscanLink(chainId, address, 'address') : '#'}
        >
          <ResponsiveSizedTextMedium fontWeight="0.7rem">View Smart Contract</ResponsiveSizedTextMedium>
        </ExternalLink>
        <ExternalLink
          style={{ textAlign: 'center', color: '#fff', textDecorationLine: 'underline' }}
          href={chainId ? getEtherscanLink(chainId, stakingInfo.rewardForDuration.token.address ?? '', 'token') : '#'}
        >
          <ResponsiveSizedTextMedium fontWeight="0.7rem">View Token Info</ResponsiveSizedTextMedium>
        </ExternalLink>
      </SpacedToCenteredAutoRow>
    </AutoColumnToRow>
  );
}
