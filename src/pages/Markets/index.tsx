import { Divider, MEDIA_WIDTHS, TYPE } from '../../theme';
import { RefObject, useCallback, useRef, useState, KeyboardEvent, useMemo, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { StyledHeading } from '../App';
import { PageWrapper } from '../Stake/styleds';
import { LightCard } from '../../components/Card';
import { AutoRow, RowBetween } from '../../components/Row';
import { SearchInput } from '../../components/SearchModal/styleds';
import MarketCard from '../../components/markets/MarketCard';
import { ChainId, Token } from '@intercroneswap/v2-sdk';
import { AutoColumn } from '../../components/Column';
import { getTokensFromDefaults } from '../../constants/tokens';
import { StakingRewardsInfo, REWARDS_DURATION_DAYS_180, REWARDS_DURATION_DAYS } from '../../state/stake/constants';
import { useActiveWeb3React } from '../../hooks';
import useInterval from '../../hooks/useInterval';
import { BACKEND_URL } from '../../constants';
import { useMarkets, MarketInfo } from '../../hooks/useMarkets';
import { RouteComponentProps } from 'react-router-dom';
import { Pagination } from 'react-bootstrap';
import { ThemeContext } from 'styled-components';
import { MarketHeader } from './styleds';
import { currencyFormatter } from '../../utils';

const tokenPairsAreEqual = (tokens1: [Token, Token], tokens2?: [Token, Token]): boolean => {
  if (!tokens2) {
    return false;
  }
  const [token10, token11] = tokens1;
  const [token20, token21] = tokens2;

  if (!token10.equals(token20) && !token10.equals(token21)) return false;
  if (!token11.equals(token20) && !token11.equals(token21)) return false;
  return true;
};

let stakingInfosRaw: {
  [chainId: number]: {
    [version: string]: {
      [tokens: string]: string;
    };
  };
} = {};
fetch('https://raw.githubusercontent.com/InterCroneworldOrg/token-lists/main/staking-addresses.json')
  .then((response) => response.json())
  .then((data) => (stakingInfosRaw = data));

export default function Markets({
  match: {
    params: { page },
  },
}: RouteComponentProps<{ page?: string }>) {
  const { t } = useTranslation();
  const theme = useContext(ThemeContext);

  const [totalValueLocked, setTotalValueLocked] = useState('');
  const fetchTotalValueLocked = async () => {
    const response = await (
      await fetch(`${BACKEND_URL}/markets/totalLocked?chainId=${chainId && ChainId.MAINNET}`)
    ).json();
    setTotalValueLocked(response.data.usdAmount);
  };
  useInterval(() => {
    fetchTotalValueLocked();
  }, 1000 * 30);
  useEffect(() => {
    fetchTotalValueLocked();
  }, [totalValueLocked]);
  const isMobile = window.innerWidth <= MEDIA_WIDTHS.upToMedium;
  const { chainId } = useActiveWeb3React();
  const inputRef = useRef<HTMLInputElement>();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pairInfos, setPairInfos] = useState<any[]>([]);
  const [pagingInfo, setPagingInfo] = useState<any>(undefined);
  const fetchData = async () => {
    const response = await (
      await fetch(`${BACKEND_URL}/markets?chainId=${chainId && ChainId.MAINNET}&page=${page}`)
    ).json();
    setPairInfos(response.data.markets);
    setPagingInfo(response.data.pagination);
  };
  useInterval(() => {
    fetchData();
  }, 1000 * 30);
  useEffect(() => {
    fetchData();
  }, [page]);

  const markets = useMarkets(pairInfos);

  const marketList = useMemo(() => {
    if (searchQuery) {
      return markets?.filter((info: MarketInfo) => {
        return (
          info.pair.token0.symbol?.toLowerCase().includes(searchQuery) ||
          info.pair.token0.name?.toLowerCase().includes(searchQuery) ||
          info.pair.token1.symbol?.toLowerCase().includes(searchQuery) ||
          info.pair.token1.name?.toLowerCase().includes(searchQuery)
        );
      });
    }
    return markets;
  }, [markets, searchQuery, page]);

  const stakingRewardInfos: StakingRewardsInfo[] = useMemo(() => {
    const tmpinfos: StakingRewardsInfo[] = [];
    stakingInfosRaw && chainId && stakingInfosRaw[chainId]
      ? Object.keys(stakingInfosRaw[chainId]).map((version) => {
          const vals = stakingInfosRaw[chainId][version];
          Object.keys(vals).map((tokens) => {
            const tokensFromDefault = getTokensFromDefaults(tokens);
            if (tokensFromDefault) {
              tmpinfos.push({
                stakingRewardAddress: vals[tokens],
                tokens: tokensFromDefault,
                rewardsDays: version !== 'v0' ? REWARDS_DURATION_DAYS_180 : REWARDS_DURATION_DAYS,
              });
            }
          });
        })
      : undefined;
    return tmpinfos;
  }, [chainId, stakingInfosRaw]);

  const handleInput = useCallback((event) => {
    const input = event.target.value;
    setSearchQuery(input.toLowerCase());
  }, []);

  const handleEnter = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        const s = searchQuery.toLowerCase().trim();
        setSearchQuery(s);
      }
    },
    [searchQuery],
  );

  return (
    <>
      <StyledHeading>Markets</StyledHeading>
      <AutoRow justify="center" gap="1rem" style={{ marginBottom: isMobile ? '.5rem' : '2rem' }}>
        <TYPE.white fontSize="1.3rem">Total value locked</TYPE.white>
        <TYPE.yellow fontSize="1.3rem">{currencyFormatter.format(Number(totalValueLocked))}</TYPE.yellow>
      </AutoRow>
      <PageWrapper>
        <LightCard style={{ marginTop: '20px' }}>
          <AutoColumn gap="1rem" justify="center">
            {pagingInfo && pagingInfo.page === 1 && (
              <RowBetween>
                <TYPE.white style={{ fontSize: '2rem' }}>Top Pools</TYPE.white>
              </RowBetween>
            )}
            <MarketHeader>
              <TYPE.white width="20%">Pair</TYPE.white>
              <TYPE.white width="13%">Liquidity</TYPE.white>
              <TYPE.white width="13%">24h volume</TYPE.white>
              <TYPE.white width="13%">APY</TYPE.white>
              <TYPE.white width="13%">LP Staking</TYPE.white>
              <SearchInput
                type="text"
                id="token-search-input"
                placeholder={t('poolSearchPlaceholder')}
                value={searchQuery}
                ref={inputRef as RefObject<HTMLInputElement>}
                onChange={handleInput}
                onKeyDown={handleEnter}
                style={{ fontSize: '.9rem', width: isMobile ? '57%' : '25%' }}
              />
            </MarketHeader>
            <Divider />
            {marketList &&
              marketList.length > 0 &&
              marketList.map((market) => (
                <>
                  <MarketCard
                    key={market.pair.liquidityToken.address}
                    pair={market.pair}
                    liquidity={market.usdAmount}
                    stakingAddress={
                      stakingRewardInfos.find((info) =>
                        tokenPairsAreEqual(info.tokens, [market.pair.token0, market.pair.token1]),
                      )?.stakingRewardAddress
                    }
                  />
                </>
              ))}
          </AutoColumn>
        </LightCard>
      </PageWrapper>
      {pagingInfo && (
        <Pagination color={theme.text1} style={{ background: theme.bg1, marginTop: '2rem' }}>
          <Pagination.First style={{ background: theme.bg1 }} href={`/#/markets/1`} />
          {pagingInfo.page > 1 && <Pagination.Prev href={`/#/markets/${pagingInfo.page - 1}`} />}
          {pagingInfo.page > 2 && <Pagination.Item href={`/#/markets/1`}>1</Pagination.Item>}
          {pagingInfo.page > 3 && <Pagination.Ellipsis />}
          {Array.from({ length: 3 }, (_, i) => i + pagingInfo.page - 1).map((val) => {
            if (val <= pagingInfo.maxPages && val > 0) {
              return (
                <Pagination.Item
                  key={val}
                  active={pagingInfo.page === val}
                  disabled={pagingInfo.page === val}
                  href={`/#/markets/${val}`}
                >
                  {val}
                </Pagination.Item>
              );
            }
            return undefined;
          })}
          {pagingInfo.page < pagingInfo.maxPages - 2 && <Pagination.Ellipsis />}
          {pagingInfo.page < pagingInfo.maxPages - 1 && (
            <Pagination.Item href={`/#/markets/${pagingInfo.maxPages}`}>{pagingInfo.maxPages}</Pagination.Item>
          )}
          {pagingInfo.page !== pagingInfo.maxPages && <Pagination.Next href={`/#/markets/${pagingInfo.page + 1}`} />}
          <Pagination.Last href={`/#/markets/${pagingInfo.maxPages}`} />
        </Pagination>
      )}
    </>
  );
}
