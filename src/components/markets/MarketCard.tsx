import { MEDIA_WIDTHS, TYPE } from '../../theme';
import { ChainId, ETHER, Pair, Percent, TokenAmount } from '@intercroneswap/v2-sdk';
import { useContext, useState } from 'react';
import { ThemeContext } from 'styled-components';
import { LightCard } from '../Card';
import { unwrappedToken } from '../../utils/wrappedCurrency';
import CurrencyLogo from '../CurrencyLogo';
import { currencyFormatter, getEtherscanLink } from '../../utils';
import { useWeb3React } from '@web3-react/core';
import { ButtonEmpty, ButtonPrimary } from '../Button';
import { ChevronUp, ChevronDown } from 'react-feather';
import { ResponsiveSizedTextMedium } from '../earn/styleds';
import MarketDetails from './MarketDetails';
import { CardRow, MobileCenteredCurrencyLink, MobileHiddenButtons, MobileOnlyDivider, MobileOnlyText } from './styleds';
import { AutoRow } from '../Row';

export interface MarketCardProps {
  pair: Pair;
  liquidity?: string;
  dailyVolume?: TokenAmount;
  apy?: Percent;
  stakingAddress?: string;
}

export default function MarketCard({
  pair,
  stakingAddress,
  liquidity,
}: // apy,
MarketCardProps) {
  const theme = useContext(ThemeContext);
  const isMobile = window.innerWidth <= MEDIA_WIDTHS.upToMedium;
  const { chainId } = useWeb3React();
  const [showMore, setShowMore] = useState(false);

  const apy: Percent | undefined = undefined;
  const dailyVolume = '';

  const currency0 = unwrappedToken(pair.token0);
  const currency1 = unwrappedToken(pair.token1);

  return (
    <LightCard
      style={{
        marginTop: '2px',
        margin: '0rem',
        padding: '1rem 1rem',
        background: theme.bg3,
      }}
    >
      <AutoRow justify="space-between">
        <MobileCenteredCurrencyLink
          href={getEtherscanLink(chainId ?? ChainId.MAINNET, pair.liquidityToken.address, 'address')}
        >
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
        </MobileCenteredCurrencyLink>
        <MobileOnlyDivider />
        <CardRow>
          <MobileOnlyText>Liquidity</MobileOnlyText>
          <TYPE.yellow>{currencyFormatter.format(Number(liquidity))}</TYPE.yellow>
        </CardRow>
        <CardRow>
          <MobileOnlyText>24H Volume</MobileOnlyText>
          <TYPE.yellow>{dailyVolume ? `$ ${dailyVolume}` : 'Coming Soon'}</TYPE.yellow>
        </CardRow>
        <CardRow>
          <MobileOnlyText>APY</MobileOnlyText>
          <TYPE.yellow>{apy ? `${apy} %` : 'Coming Soon'}</TYPE.yellow>
        </CardRow>
        <CardRow>
          <MobileOnlyText>Staking</MobileOnlyText>
          <TYPE.yellow>{stakingAddress ? 'Active' : 'Inactive'}</TYPE.yellow>
        </CardRow>
        <MobileHiddenButtons>
          <ButtonPrimary
            padding="8px"
            borderRadius="8px"
            width="40%"
            height={45}
            style={{ color: '#000' }}
            onClick={(e) => {
              e.preventDefault();
              window.location.href = `#/swap/${currency0 === ETHER ? ETHER.symbol : pair.token0?.address}/${
                currency1 === ETHER ? ETHER.symbol : pair.token1?.address
              }`;
            }}
          >
            <ResponsiveSizedTextMedium fontWeight="0.7rem" style={{ color: theme.text5 }}>
              Swap
            </ResponsiveSizedTextMedium>
          </ButtonPrimary>
          <ButtonPrimary
            padding="8px"
            borderRadius="8px"
            width="40%"
            height={45}
            style={{ color: '#000' }}
            onClick={(e) => {
              e.preventDefault();
              window.location.href = `#/add/${currency0 === ETHER ? ETHER.symbol : pair.token0?.address}/${
                currency1 === ETHER ? ETHER.symbol : pair.token1?.address
              }`;
            }}
          >
            <ResponsiveSizedTextMedium fontWeight="0.7rem" style={{ color: theme.text5 }}>
              Get LP
            </ResponsiveSizedTextMedium>
          </ButtonPrimary>
          <ButtonEmpty
            padding="0px"
            borderRadius="6"
            width={isMobile ? '100%' : '8%'}
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
        </MobileHiddenButtons>
      </AutoRow>
      {showMore && <MarketDetails pair={pair} />}
    </LightCard>
  );
}
