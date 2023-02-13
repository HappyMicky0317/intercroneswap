import { DoubleTokenAmount, GetAmountInUSDT } from '../../utils/tokenAmountCalculations';
import { ETHER, JSBI, Percent, TokenAmount, ZERO } from '@intercroneswap/v2-sdk';
import { useContext, useState } from 'react';
import { ChevronDown, ChevronUp } from 'react-feather';
import { ThemeContext } from 'styled-components';
import { YEARLY_RATE } from '../../constants';
import { USDT } from '../../constants/tokens';
import { PairState, usePair } from '../../data/Reserves';
import { useTotalSupply } from '../../data/TotalSupply';

import { useActiveWeb3React } from '../../hooks';
import useUSDTPrice from '../../hooks/useUSDTPrice';
import { Dots } from '../../pages/Stake/styleds';
import { StakingInfo } from '../../state/stake/hooks';
import { useTokenBalance } from '../../state/wallet/hooks';
import { Divider, ExternalLink, MEDIA_WIDTHS, TYPE } from '../../theme';
import { unwrappedToken } from '../../utils/wrappedCurrency';
import { ButtonEmpty, ButtonPrimary } from '../Button';
import { LightCard } from '../Card';
import { AutoColumn } from '../Column';
import CurrencyLogo from '../CurrencyLogo';
import { AutoRow } from '../Row';
import DetailsDropdown from './DetailsDropdown';
import { AutoRowToColumn, ButtonAutoRow, ResponsiveSizedTextMedium, ResponsiveSizedTextNormal } from './styleds';

interface PoolCardProps {
  stakingInfo: StakingInfo;
  address: string;
  handleStake: (address: string, lpSupply?: TokenAmount, stakingInfo?: StakingInfo) => void;
  handleHarvest: (address: string) => void;
  handleExit: (address: string) => void;
  toggleToken: boolean;
}

export default function PoolCard({
  stakingInfo,
  address,
  toggleToken,
  handleStake,
  handleHarvest,
  handleExit,
}: PoolCardProps) {
  const theme = useContext(ThemeContext);
  const isMobile = window.innerWidth <= MEDIA_WIDTHS.upToMedium;
  const { account } = useActiveWeb3React();

  const token0 = stakingInfo.tokens[0];
  const token1 = stakingInfo.tokens[1];

  const currency0 = unwrappedToken(token0);
  const currency1 = unwrappedToken(token1);
  const [showMore, setShowMore] = useState(false);
  const [pairState, pair] = usePair(currency0, currency1);

  const LPSupply = useTokenBalance(account ?? undefined, pair?.liquidityToken ?? undefined);
  const LPTotalSupply = useTotalSupply(pair?.liquidityToken);

  // We create a new tokenAmaount as we get wrong pair from stakingInfo
  const totalStakedAmount = pair ? new TokenAmount(pair?.liquidityToken, stakingInfo.totalStakedAmount.raw) : undefined;
  const stakedAmount = pair ? new TokenAmount(pair?.liquidityToken, stakingInfo.stakedAmount.raw) : undefined;

  const USDPrice = useUSDTPrice(token0);
  const USDPriceBackup = useUSDTPrice(token1);
  const earnedUSDPrice = useUSDTPrice(stakingInfo.earnedAmount.token);
  // const USDPriceTRX = useUSDTPrice(weth);
  const ratePerYear = stakingInfo.rewardForDuration.multiply(YEARLY_RATE);
  const ratePerYearUSDT = ratePerYear && earnedUSDPrice?.quote(stakingInfo.rewardForDuration).multiply(YEARLY_RATE);

  // Check if the actual Token is ICR or WETH based
  const stakedInToken =
    !!pair &&
    !!LPTotalSupply &&
    !!LPSupply &&
    stakedAmount &&
    JSBI.greaterThan(LPTotalSupply?.raw, stakingInfo.stakedAmount.raw)
      ? DoubleTokenAmount(pair.getLiquidityValue(USDPrice ? token0 : token1, LPTotalSupply, stakedAmount, false))
      : undefined;

  const totalStakedInToken =
    !!pair &&
    !!LPTotalSupply &&
    !!LPSupply &&
    totalStakedAmount &&
    JSBI.greaterThan(LPTotalSupply?.raw, stakingInfo.totalStakedAmount.raw)
      ? DoubleTokenAmount(pair.getLiquidityValue(USDPrice ? token0 : token1, LPTotalSupply, totalStakedAmount, false))
      : undefined;

  const valueOfTotalStakedAmountInUSDT = GetAmountInUSDT(USDPrice ?? USDPriceBackup, totalStakedInToken);
  const valueOfEarnedAmountInUSDT = GetAmountInUSDT(earnedUSDPrice, stakingInfo.earnedAmount);

  const apr =
    stakingInfo.active &&
    ratePerYearUSDT &&
    valueOfTotalStakedAmountInUSDT &&
    JSBI.greaterThan(valueOfTotalStakedAmountInUSDT.numerator, ZERO)
      ? new Percent(ratePerYearUSDT.numerator, valueOfTotalStakedAmountInUSDT.numerator)
      : undefined;

  return (
    <LightCard
      style={{
        marginTop: '2px',
        margin: '0rem',
        padding: '.5rem 1rem',
        background: theme.bg3,
      }}
    >
      <AutoRow justify="space-between" gap=".2rem">
        <AutoRowToColumn justify="center">
          <AutoRow justify={isMobile ? 'center' : undefined}>
            <CurrencyLogo currency={currency0} size="1.2rem" />
            &nbsp;
            <TYPE.white fontWeight={500} fontSize="1rem">
              {currency0?.symbol}&nbsp;/
            </TYPE.white>
            &nbsp;
            <CurrencyLogo currency={currency1} size="1.2rem" />
            &nbsp;
            <TYPE.white fontWeight={500} fontSize="1rem">
              {currency1?.symbol}
            </TYPE.white>
          </AutoRow>
          <AutoRow gap="2px" justify={isMobile ? 'center' : 'start'}>
            <ResponsiveSizedTextMedium fontWeight={400} fontSize="1rem" style={{ color: theme.primary3 }}>
              Earn {stakingInfo.earnedAmount.token?.symbol}
            </ResponsiveSizedTextMedium>
            <CurrencyLogo currency={stakingInfo.earnedAmount.token} size="1rem" />
          </AutoRow>
        </AutoRowToColumn>
        <AutoRowToColumn gap="2px">
          <ResponsiveSizedTextMedium fontWeight="1.3rem">
            {stakingInfo.active ? 'Ends on' : 'Ended on'}
          </ResponsiveSizedTextMedium>
          <ResponsiveSizedTextNormal fontWeight="0.6rem" color={theme.primary3}>
            {stakingInfo.periodFinish?.toLocaleDateString() || 'Coming soon'}
          </ResponsiveSizedTextNormal>
        </AutoRowToColumn>
        <AutoRowToColumn gap="1px">
          <ResponsiveSizedTextMedium fontWeight={400}>Earned / APY</ResponsiveSizedTextMedium>
          {toggleToken ? (
            <ResponsiveSizedTextNormal fontWeight={400} color={theme.primary3}>
              {stakingInfo.earnedAmount.toSignificant()}
              <CurrencyLogo currency={stakingInfo.earnedAmount.token} size=".8rem" />/{' '}
              {apr ? `${apr.toFixed(2)} %` : '-'}
            </ResponsiveSizedTextNormal>
          ) : (
            <ResponsiveSizedTextNormal fontWeight="0.6rem" color={theme.primary3}>
              {valueOfEarnedAmountInUSDT?.toFixed(2)} <CurrencyLogo currency={USDT} size=".8rem" />/{' '}
              {apr ? `${apr.toFixed(2)} %` : '-'}
            </ResponsiveSizedTextNormal>
          )}
        </AutoRowToColumn>
        <AutoRowToColumn gap="1px" style={{ width: !isMobile ? '8rem' : undefined }}>
          <AutoRow gap={isMobile ? '2rem' : '.2rem'} width="10rem">
            <ResponsiveSizedTextMedium fontWeight={400}>Balance</ResponsiveSizedTextMedium>
            <ExternalLink
              style={{ textAlign: 'left', color: '#fff' }}
              href={`#/add/${currency0 === ETHER ? ETHER.symbol : token0?.address}/${
                currency1 === ETHER ? ETHER.symbol : token1?.address
              }`}
            >
              {stakingInfo.stakedAmount?.greaterThan(ZERO) && (
                <ResponsiveSizedTextMedium fontWeight={400} style={{ textDecorationLine: 'underline' }}>
                  Get LP
                </ResponsiveSizedTextMedium>
              )}
            </ExternalLink>
          </AutoRow>
          {pairState === PairState.EXISTS ? (
            <ResponsiveSizedTextNormal fontWeight={400} color={theme.primary3}>
              {LPSupply?.toSignificant(4)}
            </ResponsiveSizedTextNormal>
          ) : (
            <Dots></Dots>
          )}
        </AutoRowToColumn>
        <ButtonAutoRow gap=".5rem" justify="flex-end">
          {!stakingInfo.active ? (
            <ButtonPrimary
              padding="8px"
              borderRadius="8px"
              width={isMobile ? '43%' : '40%'}
              height={45}
              style={{ color: '#000' }}
              onClick={() => handleExit(address)}
              disabled={stakingInfo.earnedAmount?.equalTo(ZERO)}
            >
              <AutoColumn>
                <ResponsiveSizedTextMedium fontWeight="400" style={{ color: theme.text5 }}>
                  Exit
                </ResponsiveSizedTextMedium>
                <ResponsiveSizedTextNormal fontWeight="400" style={{ color: theme.text5 }}>
                  {stakingInfo.earnedAmount?.toSignificant(4)}
                </ResponsiveSizedTextNormal>
              </AutoColumn>
            </ButtonPrimary>
          ) : (
            <ButtonPrimary
              padding="8px"
              borderRadius="8px"
              width={isMobile ? '43%' : '40%'}
              height={45}
              style={{ color: '#000' }}
              onClick={() => handleHarvest(address)}
              disabled={stakingInfo.earnedAmount?.equalTo(ZERO)}
            >
              <AutoColumn>
                <ResponsiveSizedTextMedium fontWeight="400" style={{ color: theme.text5 }}>
                  Harvest
                </ResponsiveSizedTextMedium>
                <ResponsiveSizedTextNormal fontWeight="400" style={{ color: theme.text5 }}>
                  {stakingInfo.earnedAmount?.toSignificant(4)}
                </ResponsiveSizedTextNormal>
              </AutoColumn>
            </ButtonPrimary>
          )}
          {LPSupply?.greaterThan(ZERO) || stakingInfo.stakedAmount?.greaterThan(ZERO) ? (
            <ButtonPrimary
              padding="8px"
              borderRadius="8px"
              width={isMobile ? '43%' : '40%'}
              disabled={!stakingInfo.active}
              height={45}
              style={{ color: '#000' }}
              onClick={() => handleStake(address, LPSupply, stakingInfo)}
            >
              <AutoColumn>
                <ResponsiveSizedTextMedium fontWeight="0.7rem" style={{ color: theme.text5 }}>
                  Stake / Unstake
                </ResponsiveSizedTextMedium>
              </AutoColumn>
            </ButtonPrimary>
          ) : (
            <ButtonPrimary
              padding="8px"
              borderRadius="8px"
              width={isMobile ? '43%' : '40%'}
              height={45}
              style={{ color: '#000' }}
              onClick={(e) => {
                e.preventDefault();
                window.location.href = `#/add/${currency0 === ETHER ? ETHER.symbol : token0?.address}/${
                  currency1 === ETHER ? ETHER.symbol : token1?.address
                }`;
              }}
            >
              <ResponsiveSizedTextMedium fontWeight="0.7rem" style={{ color: theme.text5 }}>
                Get LP
              </ResponsiveSizedTextMedium>
            </ButtonPrimary>
          )}
          {showMore && isMobile && <Divider />}
          <ButtonEmpty
            padding="0px"
            borderRadius="6"
            width={isMobile ? '100%' : '6%'}
            onClick={() => setShowMore(!showMore)}
          >
            {showMore ? (
              <>
                {/* {' '}
                  Manage */}
                <ChevronUp size="20" style={{ marginLeft: '0px', color: '#fff' }} />
              </>
            ) : (
              <>
                {/* Manage */}
                <ChevronDown size="20" style={{ marginLeft: '0px', color: '#fff' }} />
              </>
            )}
          </ButtonEmpty>
        </ButtonAutoRow>
      </AutoRow>

      {showMore && (
        <DetailsDropdown
          stakingInfo={stakingInfo}
          stakedAmount={stakedInToken}
          totalStakedAmount={totalStakedInToken}
          pairState={pairState}
          address={address}
          toggleToken={toggleToken}
        />
      )}
    </LightCard>
  );
}
