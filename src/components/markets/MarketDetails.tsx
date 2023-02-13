import { useActiveWeb3React } from '../../hooks';
import { Divider, ExternalLink, MEDIA_WIDTHS, TYPE } from '../../theme';
import { Pair, TokenAmount } from '@intercroneswap/v2-sdk';
import { useEffect, useMemo, useState } from 'react';
import { AutoColumnToRow } from '../earn/styleds';
import { AutoRow, RowBetween } from '../Row';
import { ButtonEmpty } from '../Button';
import CurrencyLogo from '../CurrencyLogo';
import { unwrappedToken } from '../../utils/wrappedCurrency';
import { GreyCard } from '../Card';
import useCoinGeckoInfo from '../../hooks/useCoinGeckoInfo';
import { currencyFormatter } from '../../utils';
import useUSDTPrice from '../../hooks/useUSDTPrice';

interface MarketDetailsParams {
  pair: Pair;
}

export default function MarketDetails({ pair }: MarketDetailsParams) {
  //   const theme = useContext(ThemeContext);
  const { chainId } = useActiveWeb3React();
  const isMobile = window.innerWidth <= MEDIA_WIDTHS.upToMedium;

  const [activeTokenAmount, setActiveTokenAmount] = useState<TokenAmount>(pair.reserve0);
  const currency0 = unwrappedToken(pair.token0);
  const currency1 = unwrappedToken(pair.token1);
  const [coingGeckoInfo, setCoinGeckoInfo] = useState<any>(undefined);
  const fetchCoinGeckoData = async (coin: string | undefined): Promise<any> => {
    if (!coin) {
      return undefined;
    }
    try {
      const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coin}`);

      const data = await response.json();
      if (data.id === coin) {
        setCoinGeckoInfo(data);
      }
    } catch (error) {
      console.error('Error getting coingecko data', error);
    }
  };
  useEffect(() => {
    const activeCurrency = unwrappedToken(activeTokenAmount.token);
    fetchCoinGeckoData(activeCurrency.name?.toLowerCase().split(' ')[0]);
  }, [chainId, activeTokenAmount]);

  const truncatedAddress = useMemo(() => {
    const len = activeTokenAmount.token.address.length;
    return (
      activeTokenAmount.token.address.substring(0, 5) + '...' + activeTokenAmount.token.address.substring(len - 5, len)
    );
  }, [activeTokenAmount]);

  const geckoInfo = useCoinGeckoInfo(unwrappedToken(activeTokenAmount.token), coingGeckoInfo);
  const price0 = useUSDTPrice(pair.token0);
  const price1 = useUSDTPrice(pair.token1);

  return (
    <AutoColumnToRow padding="0 2rem">
      {!isMobile && <Divider />}
      <RowBetween>
        <GreyCard style={{ width: '15%' }} alignItems="center" padding="0rem 1rem">
          <ButtonEmpty
            selected={activeTokenAmount.token.equals(pair.token0)}
            onClick={() => setActiveTokenAmount(pair.reserve0)}
            style={{ width: '100%' }}
          >
            <CurrencyLogo currency={currency0} style={{ marginRight: '.5rem' }} />
            <TYPE.white>{currency0?.symbol}</TYPE.white>
          </ButtonEmpty>
          <ButtonEmpty
            selected={activeTokenAmount.token.equals(pair.token1)}
            onClick={() => setActiveTokenAmount(pair.reserve1)}
            style={{ width: '100%' }}
          >
            <CurrencyLogo currency={currency1} style={{ marginRight: '.5rem' }} />
            <TYPE.white>{currency1?.symbol}</TYPE.white>
          </ButtonEmpty>
        </GreyCard>
        <AutoRow style={{ width: '40%' }}>
          <RowBetween>
            <TYPE.white>Liquidity</TYPE.white>
            <TYPE.yellow>{activeTokenAmount.toSignificant(4)}</TYPE.yellow>
          </RowBetween>
          <RowBetween>
            <TYPE.white>Circulating Supply</TYPE.white>
            <TYPE.yellow>{geckoInfo.circulatingSupply}</TYPE.yellow>
          </RowBetween>
          <RowBetween>
            <TYPE.white>Contract address</TYPE.white>
            <TYPE.yellow>{truncatedAddress}</TYPE.yellow>
          </RowBetween>
          <RowBetween>
            <TYPE.white>Market cap</TYPE.white>
            <TYPE.yellow>{currencyFormatter.format(Number(geckoInfo.marketCap))}</TYPE.yellow>
          </RowBetween>
        </AutoRow>
        <AutoRow style={{ width: '40%' }}>
          <RowBetween>
            <TYPE.white>Market Cap Rank</TYPE.white>
            <TYPE.yellow>{geckoInfo.marketCapRank ?? '-'}</TYPE.yellow>
          </RowBetween>
          <RowBetween>
            <TYPE.white>Trading Volume 24H</TYPE.white>
            <TYPE.yellow>{currencyFormatter.format(geckoInfo.marketCapChange24h) ?? '-'}</TYPE.yellow>
          </RowBetween>
          <RowBetween>
            <TYPE.white>Price</TYPE.white>

            <TYPE.yellow>
              {`$ ${
                activeTokenAmount.token === pair.token0 ? price0?.adjusted.toFixed(4) : price1?.adjusted.toFixed(4)
              }`}
            </TYPE.yellow>
          </RowBetween>
          <RowBetween style={{ textAlign: 'right' }}>
            <ExternalLink
              href={`https://www.coingecko.com/en/coins/${geckoInfo?.id}`}
              style={{ color: 'white', textDecorationLine: 'underline' }}
            >
              View on CoinGecko
            </ExternalLink>
            <ExternalLink
              href={`https://www.coingecko.com/en/coins/${geckoInfo?.id}`}
              style={{ color: 'white', textDecorationLine: 'underline' }}
            >
              View Chart
            </ExternalLink>
          </RowBetween>
        </AutoRow>
      </RowBetween>
    </AutoColumnToRow>
  );
}
