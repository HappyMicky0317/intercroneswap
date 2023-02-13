import { REWARDS_DURATION_DAYS, REWARDS_DURATION_DAYS_180, StakingRewardsInfo } from '../../state/stake/constants';
import { ethAddress } from '@intercroneswap/java-tron-provider';
import { JSBI, TokenAmount, ZERO } from '@intercroneswap/v2-sdk';
import { orderBy } from 'lodash';
import { KeyboardEvent, RefObject, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RouteComponentProps } from 'react-router-dom';
import { ThemeContext } from 'styled-components';

import CopyHelper from '../../components/AccountDetails/Copy';
import { ButtonPrimary, ButtonSecondary } from '../../components/Button';
import { GreyCard, LightCard } from '../../components/Card';
import { AutoColumn } from '../../components/Column';
import PoolCard from '../../components/earn/PoolCard';
import { ResponsiveSizedTextMedium } from '../../components/earn/styleds';
import { AutoRow, RowBetween } from '../../components/Row';
import { SearchInput } from '../../components/SearchModal/styleds';
import { Dots } from '../../components/swap/styleds';
import { USDT, getTokensFromDefaults, ICR, fetchTokens } from '../../constants/tokens';
import { useActiveWeb3React } from '../../hooks';
import { useWalletModalToggle } from '../../state/application/hooks';
import { StakingInfo, useStakeActionHandlers, useStakingInfo } from '../../state/stake/hooks';
import { Button, MEDIA_WIDTHS, TYPE } from '../../theme';
import { StyledHeading } from '../App';
import HarvestModal from './HarvestModal';
import StakeModal from './StakeModal';
import { WordBreakDiv, PageWrapper, ReferalButton, TitleRow } from './styleds';
import CurrencyLogo from '../../components/CurrencyLogo';
import { Form, Pagination } from 'react-bootstrap';
import ExitModal from './ExitModal';
import useInterval from '../../hooks/useInterval';

let stakingInfosRaw: {
  [chainId: number]: {
    [version: string]: {
      [address: string]: string;
    };
  };
} = {};
fetch('https://raw.githubusercontent.com/InterCroneworldOrg/token-lists/main/staking-addresses_new.json')
  .then((response) => response.json())
  .then((data) => (stakingInfosRaw = data));

let inAktivStakingInfosRaw: {
  [chainId: number]: {
    [version: string]: {
      [address: string]: string;
    };
  };
} = {};
fetch('https://raw.githubusercontent.com/InterCroneworldOrg/token-lists/main/staking-addresses_new_inaktiv.json')
  .then((response) => response.json())
  .then((data) => (inAktivStakingInfosRaw = data));

export default function Stake({
  match: {
    params: { referal },
  },
}: RouteComponentProps<{ referal?: string }>) {
  const { t } = useTranslation();
  const MAX_STAKE_PER_PAGE = 6;
  const theme = useContext(ThemeContext);
  const isMobile = window.innerWidth <= MEDIA_WIDTHS.upToMedium;
  const { account, chainId } = useActiveWeb3React();
  const [pagingInfo, setPagingInfo] = useState<any>({});
  const [isActive, setActive] = useState<boolean>(true);

  useInterval(() => {
    fetchTokens();
  }, 60000);

  useEffect(() => {
    fetchTokens();
  }, []);

  const stakingRewardInfos: StakingRewardsInfo[] = useMemo(() => {
    const tmpinfos: StakingRewardsInfo[] = [];
    if (isActive) {
      stakingInfosRaw && chainId && stakingInfosRaw[chainId]
        ? Object.keys(stakingInfosRaw[chainId]).map((version) => {
            const vals = stakingInfosRaw[chainId][version];
            Object.keys(vals).map((stakingRewardAddress) => {
              const tokensFromDefault = getTokensFromDefaults(vals[stakingRewardAddress]);
              if (tokensFromDefault) {
                tmpinfos.push({
                  stakingRewardAddress,
                  tokens: tokensFromDefault,
                  rewardsDays: version !== 'v0' ? REWARDS_DURATION_DAYS_180 : REWARDS_DURATION_DAYS,
                });
              }
            });
          })
        : undefined;
    } else {
      inAktivStakingInfosRaw && chainId && inAktivStakingInfosRaw[chainId]
        ? Object.keys(inAktivStakingInfosRaw[chainId]).map((version) => {
            const vals = inAktivStakingInfosRaw[chainId][version];
            Object.keys(vals).map((stakingRewardAddress) => {
              const tokensFromDefault = getTokensFromDefaults(vals[stakingRewardAddress]);
              if (tokensFromDefault) {
                tmpinfos.push({
                  stakingRewardAddress,
                  tokens: tokensFromDefault,
                  rewardsDays: version !== 'v0' ? REWARDS_DURATION_DAYS_180 : REWARDS_DURATION_DAYS,
                });
              }
            });
          })
        : undefined;
    }

    console.log(tmpinfos.length);
    setPagingInfo({
      page: 1,
      maxPages: Math.floor(tmpinfos.length / MAX_STAKE_PER_PAGE) + 1,
    });

    return tmpinfos.reverse();
  }, [chainId, stakingInfosRaw, inAktivStakingInfosRaw, isActive]);

  const currentStakingRewardInfos: StakingRewardsInfo[] = useMemo(() => {
    if (stakingRewardInfos !== null && stakingRewardInfos.length >= 0) {
      return stakingRewardInfos.slice(
        (pagingInfo.page - 1) * MAX_STAKE_PER_PAGE,
        Math.min(pagingInfo.page * MAX_STAKE_PER_PAGE, stakingRewardInfos.length),
      );
    }
    return [];
  }, [chainId, isActive, stakingRewardInfos, pagingInfo]);

  const stakingInfos = useStakingInfo(currentStakingRewardInfos);

  const [stakeAddress, setStakeAddress] = useState<string>('');
  const [uplinkAddress, setUplinkAddress] = useState<string | undefined>(undefined);
  const [stakeInfo, setStakeInfo] = useState<StakingInfo | undefined>(undefined);
  const [lpBalance, setLPBalance] = useState<TokenAmount | undefined>(undefined);
  const [toggleToken, setToggleToken] = useState(false);
  const [toggleSearch, setToggleSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<'latest' | 'liquidity' | 'earned' | 'apy'>('latest');
  const [showStake, setShowStake] = useState<boolean>(false);
  const [showReferal, setShowReferal] = useState<boolean>(false);
  const [showHarvest, setShowHarvest] = useState<boolean>(false);
  const [showExit, setShowExit] = useState<boolean>(false);
  const [isStakedOnly, setStakedOnly] = useState<boolean>(false);
  const { onUserInput, onTxHashChange } = useStakeActionHandlers();

  const toggleWalletModal = useWalletModalToggle();

  const bindSortSelect = (event: any) => {
    console.log(event.target.value, 'Select event');
    setSortOption(event.target.value);
  };

  const onStakedOnlyAction = () => {
    setStakedOnly(!isStakedOnly);
    if (isActive) {
      setPagingInfo({
        maxPages: !isStakedOnly
          ? Math.floor(stakedOnlyPools.length / MAX_STAKE_PER_PAGE) + 1
          : Math.floor(activePools.length / MAX_STAKE_PER_PAGE) + 1,
        page: 1,
      });
    } else {
      setPagingInfo({
        maxPages: !isStakedOnly
          ? Math.floor(stakedInactivePools.length / MAX_STAKE_PER_PAGE) + 1
          : Math.floor(inactivePools.length / MAX_STAKE_PER_PAGE) + 1,
        page: 1,
      });
    }
  };

  const onSwitchAction = () => {
    setActive(!isActive);
    setPagingInfo({
      maxPages: !isActive
        ? Math.floor(activePools.length / MAX_STAKE_PER_PAGE) + 1
        : Math.floor(inactivePools.length / MAX_STAKE_PER_PAGE) + 1,
      page: 1,
    });
  };

  const handleExit = (address: string) => {
    setStakeAddress(address);
    setShowExit(true);
  };

  const handleHarvest = (address: string) => {
    setStakeAddress(address);
    setShowHarvest(true);
  };

  const handleDismissHarvest = useCallback(() => {
    setStakeAddress('');
    setShowHarvest(false);
    onTxHashChange('');
  }, [stakeAddress, showHarvest]);

  const handleDismissExit = useCallback(() => {
    setStakeAddress('');
    setShowExit(false);
    onTxHashChange('');
  }, [stakeAddress, showExit]);
  const inputRef = useRef<HTMLInputElement>();

  const handleStake = (address: string, pairSupply?: TokenAmount, stakingInfo?: StakingInfo) => {
    setShowStake(true);
    setStakeAddress(address);
    setStakeInfo(stakingInfo);
    setLPBalance(pairSupply);
  };

  const handleDismissStake = useCallback(() => {
    setShowStake(false);
    setStakeAddress('');
    setStakeInfo(undefined);
    setLPBalance(undefined);
    onUserInput('');
    onTxHashChange('');
  }, [stakeAddress, showStake]);

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

  const confirmUpline = useCallback(() => {
    return account ? (
      <>
        <TYPE.white fontSize={18} fontWeight={600}>
          Your upline
        </TYPE.white>
        {uplinkAddress ? (
          <TYPE.white>{uplinkAddress}</TYPE.white>
        ) : (
          <>
            <WordBreakDiv>Confirm your upline {referal}</WordBreakDiv>
            <ButtonPrimary width="10rem" onClick={() => setUplinkAddress(referal ?? ethAddress.toTron(account))}>
              <TYPE.white>Confirm</TYPE.white>
            </ButtonPrimary>
          </>
        )}
      </>
    ) : undefined;
  }, [referal, uplinkAddress]);

  const uplineComponent = useCallback(() => {
    return account ? (
      <AutoColumn
        justify="center"
        gap="3px"
        style={{
          display: showReferal ? 'grid' : 'none',
          background: theme.bg3,
          borderRadius: '2rem',
          padding: '0.5rem',
          margin: '0',
        }}
      >
        {referal ? confirmUpline() : undefined}
        <ResponsiveSizedTextMedium fontWeight=".5rem">Your referral link</ResponsiveSizedTextMedium>
        <WordBreakDiv>{`${window.location.origin}/#/stake/${ethAddress.toTron(account)}`}</WordBreakDiv>
        <CopyHelper toCopy={`${window.location.origin}/#/stake/${ethAddress.toTron(account)}`}>Copy Address</CopyHelper>
      </AutoColumn>
    ) : undefined;
  }, [uplinkAddress, showReferal]);

  const activePools = stakingInfos.filter((info) => info.active && info.periodFinish);
  const inactivePools = stakingInfos.filter((info) => !info.active || (info.active && !info.periodFinish));
  const stakedOnlyPools = activePools.filter(
    (info) => info.stakedAmount && JSBI.greaterThan(info.stakedAmount.numerator, ZERO),
  );
  const stakedInactivePools = inactivePools.filter(
    (info) => info.stakedAmount && JSBI.greaterThan(info.stakedAmount.numerator, ZERO),
  );

  const stakingList = useCallback(
    (poolsToDisplay: StakingInfo[]): StakingInfo[] => {
      let tmpList: StakingInfo[] = poolsToDisplay;
      if (searchQuery) {
        if (!toggleSearch) {
          tmpList = poolsToDisplay.filter((info: StakingInfo) => {
            return (
              info.tokens[0].symbol?.toLowerCase().includes(searchQuery) ||
              info.tokens[0].name?.toLowerCase().includes(searchQuery) ||
              info.tokens[1].symbol?.toLowerCase().includes(searchQuery) ||
              info.tokens[1].name?.toLowerCase().includes(searchQuery)
            );
          });
        } else {
          tmpList = poolsToDisplay.filter((info: StakingInfo) => {
            return (
              info.earnedAmount.token.symbol?.toLowerCase().includes(searchQuery) ||
              info.earnedAmount.token.name?.toLowerCase().includes(searchQuery)
            );
          });
        }
      }
      return tmpList;
    },
    [searchQuery],
  );

  const chosenPoolsMemoized = useMemo(() => {
    let chosenPools = [];
    const sortPools = (infos: StakingInfo[]): StakingInfo[] => {
      switch (sortOption) {
        case 'liquidity':
          return orderBy(infos, (info) => (info.stakedAmount ? Number(info.stakedAmount.numerator) : 0), 'desc');
        case 'earned':
          return orderBy(infos, (info) => (info.earnedAmount ? Number(info.earnedAmount.numerator) : 0), 'desc');
        case 'latest':
          return orderBy(infos, (info) => (info.periodFinish ? info.periodFinish.getTime() : Number.MAX_VALUE), 'desc');
        default:
          return infos;
      }
    };
    chosenPools = stakingList(stakingInfos);
    if (isActive) {
      chosenPools = isStakedOnly ? stakingList(stakedOnlyPools) : stakingList(activePools);
    }
    if (!isActive) {
      chosenPools = isStakedOnly ? stakingList(stakedInactivePools) : stakingList(inactivePools);
    }
    return sortPools(chosenPools);
  }, [sortOption, stakingInfos, searchQuery, isActive, isStakedOnly, pagingInfo, currentStakingRewardInfos]);

  const pagination = useCallback(() => {
    const maxPages = Math.floor(stakingRewardInfos.length / MAX_STAKE_PER_PAGE) + 1;
    return (
      <Pagination color={theme.text1} style={{ background: theme.bg1, marginTop: '2rem' }}>
        <Pagination.First style={{ background: theme.bg1 }} onClick={() => setPagingInfo({ ...pagingInfo, page: 1 })} />
        {pagingInfo.page > 1 && (
          <Pagination.Prev onClick={() => setPagingInfo({ ...pagingInfo, page: pagingInfo.page - 1 })} />
        )}
        {pagingInfo.page > 2 && (
          <Pagination.Item onClick={() => setPagingInfo({ ...pagingInfo, page: 1 })}>1</Pagination.Item>
        )}
        {pagingInfo.page > 3 && <Pagination.Ellipsis />}
        {Array.from({ length: 3 }, (_, i) => i + pagingInfo.page - 1).map((val) => {
          if (val <= maxPages && val > 0) {
            return (
              <Pagination.Item
                key={val}
                active={pagingInfo.page === val}
                disabled={pagingInfo.page === val}
                onClick={() => setPagingInfo({ ...pagingInfo, page: val })}
              >
                {val}
              </Pagination.Item>
            );
          }
          return undefined;
        })}
        {pagingInfo.page < maxPages - 2 && <Pagination.Ellipsis />}
        {pagingInfo.page < maxPages - 1 && (
          <Pagination.Item onClick={() => setPagingInfo({ ...pagingInfo, page: maxPages })}>{maxPages}</Pagination.Item>
        )}
        {pagingInfo.page !== maxPages && (
          <Pagination.Next onClick={() => setPagingInfo({ ...pagingInfo, page: pagingInfo.page + 1 })} />
        )}
        <Pagination.Last onClick={() => setPagingInfo({ ...pagingInfo, page: maxPages })} />
      </Pagination>
    );
  }, [chosenPoolsMemoized, stakingRewardInfos, pagingInfo]);

  return (
    <>
      <StyledHeading>LP Staking</StyledHeading>
      <TitleRow style={{ marginTop: '1rem' }} textAlign="center" padding={'0'}>
        <TYPE.mediumHeader width="100%" style={{ marginTop: '0.5rem', justifySelf: 'center', color: theme.text1 }}>
          Stake Liquidity Pool (LP) tokens to earn
        </TYPE.mediumHeader>
      </TitleRow>
      <PageWrapper>
        <StakeModal
          isOpen={showStake}
          stakingAddress={stakeAddress}
          stakingInfo={stakeInfo}
          onDismiss={handleDismissStake}
          balance={lpBalance}
          referalAddress={uplinkAddress}
        />
        <HarvestModal
          isOpen={showHarvest}
          stakingAddress={stakeAddress}
          stakingInfo={stakeInfo}
          onDismiss={handleDismissHarvest}
        />
        <ExitModal
          isOpen={showExit}
          stakingAddress={stakeAddress}
          stakingInfo={stakeInfo}
          onDismiss={handleDismissExit}
        />
        <RowBetween marginTop="1rem">
          {isMobile ? (
            <ButtonSecondary width={'45%'} justifySelf="start" onClick={() => setToggleToken(!toggleToken)}>
              <ResponsiveSizedTextMedium>Token Value</ResponsiveSizedTextMedium>
              <CurrencyLogo currency={toggleToken ? ICR : USDT} style={{ marginLeft: '1rem' }} />
            </ButtonSecondary>
          ) : (
            <div />
          )}
          <ReferalButton
            height="3rem"
            margin="0"
            padding=".5rem"
            onClick={() => setShowReferal(!showReferal)}
            style={{
              width: isMobile ? '45%' : '16rem',
              justifySelf: 'flex-end',
            }}
          >
            Show referal link
          </ReferalButton>
        </RowBetween>
        <LightCard style={{ marginTop: '20px' }} padding="1rem 1rem">
          {!account ? (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Button style={{ maxWidth: '260px' }} onClick={toggleWalletModal}>
                Connect Wallet
              </Button>
            </div>
          ) : (
            <AutoRow gap={'20px'} style={{ margin: 0 }} justify="space-between"></AutoRow>
          )}
          <AutoColumn gap="1rem" justify="center">
            <AutoColumn gap="1rem" style={{ width: '100%' }}>
              {uplineComponent()}
              {isMobile ? (
                <RowBetween>
                  <Form.Switch
                    label="Active"
                    id="active-staking"
                    onChange={onSwitchAction}
                    defaultChecked={true}
                    style={{ color: theme.text1 }}
                  />
                  <Form.Switch
                    label="Staked only"
                    id="staked-only"
                    onChange={onStakedOnlyAction}
                    defaultChecked={isStakedOnly}
                    style={{ color: theme.text1 }}
                  />
                </RowBetween>
              ) : undefined}
              <RowBetween style={{ marginBottom: isMobile ? '-1rem' : '-1.5rem' }}>
                <AutoRow gap=".3rem" width={isMobile ? '40%' : '14%'}>
                  <ResponsiveSizedTextMedium
                    onClick={() => setToggleSearch(false)}
                    color={!toggleSearch ? theme.primary3 : theme.text1}
                    style={{ textDecorationLine: 'underline', cursor: 'pointer' }}
                  >
                    LP token
                  </ResponsiveSizedTextMedium>
                  <ResponsiveSizedTextMedium
                    onClick={() => setToggleSearch(true)}
                    color={toggleSearch ? theme.primary3 : theme.text1}
                    style={{ textDecorationLine: 'underline', cursor: 'pointer' }}
                  >
                    Earn token
                  </ResponsiveSizedTextMedium>
                </AutoRow>
                {!isMobile && (
                  <AutoRow>
                    <ButtonSecondary width={'15rem'} onClick={() => setToggleToken(!toggleToken)}>
                      <ResponsiveSizedTextMedium>Token Value</ResponsiveSizedTextMedium>
                      <CurrencyLogo currency={toggleToken ? ICR : USDT} style={{ marginLeft: '1rem' }} />
                    </ButtonSecondary>
                  </AutoRow>
                )}
                <AutoRow style={{ width: isMobile ? '45%' : '15%' }}>
                  <TYPE.white justifyContent="left" textAlign="start">
                    Sort by
                  </TYPE.white>
                </AutoRow>
              </RowBetween>
              <RowBetween>
                <SearchInput
                  type="text"
                  id="token-search-input"
                  placeholder={t('poolSearchPlaceholder')}
                  value={searchQuery}
                  ref={inputRef as RefObject<HTMLInputElement>}
                  onChange={handleInput}
                  onKeyDown={handleEnter}
                  width="1rem"
                  style={{ fontSize: '.9rem', width: isMobile ? '60%' : '194px' }}
                />
                <AutoRow gap="2rem" justify="flex-end">
                  {!isMobile ? (
                    <>
                      <Form.Switch
                        label="Active"
                        id="active-staking"
                        onChange={onSwitchAction}
                        defaultChecked={true}
                        style={{ color: theme.text1 }}
                      />
                      <Form.Switch
                        label="Staked only"
                        id="staked-only"
                        onChange={onStakedOnlyAction}
                        defaultChecked={false}
                        style={{ color: theme.text1 }}
                      />
                    </>
                  ) : undefined}
                  <Form.Select
                    style={{
                      color: theme.text3,
                      background: theme.bg3,
                      border: 'none',
                      width: isMobile ? '45%' : '150px',
                      borderRadius: '8px',
                      padding: '16px',
                      cursor: 'pointer',
                    }}
                    onChange={bindSortSelect}
                    value={sortOption}
                  >
                    <option value={'latest'}>Latest</option>
                    <option value={'liquidity'}>Liquidity</option>
                    <option value={'earned'}>Earned</option>
                    <option value={'apy'}>APY</option>
                  </Form.Select>
                </AutoRow>
              </RowBetween>
              {!account ? (
                <GreyCard padding="1rem">
                  <TYPE.body color={theme.text1} textAlign="left">
                    Connect to a wallet to view your liquidity.
                  </TYPE.body>
                </GreyCard>
              ) : stakingInfos.length === 0 ? (
                <GreyCard padding="1rem">
                  <TYPE.body color={theme.text1} textAlign="left">
                    <Dots>Loading</Dots>
                  </TYPE.body>
                </GreyCard>
              ) : chosenPoolsMemoized?.length > 0 ? (
                <>
                  {chosenPoolsMemoized.map((stakingInfo) => (
                    <PoolCard
                      key={stakingInfo.stakingRewardAddress}
                      stakingInfo={stakingInfo}
                      address={stakingInfo.stakingRewardAddress}
                      handleStake={handleStake}
                      handleHarvest={handleHarvest}
                      handleExit={handleExit}
                      toggleToken={toggleToken}
                    ></PoolCard>
                  ))}
                </>
              ) : (
                <GreyCard style={{ padding: '12px' }}>
                  <TYPE.body color={theme.text1} textAlign="left">
                    No liquidity found.
                  </TYPE.body>
                </GreyCard>
              )}
            </AutoColumn>
          </AutoColumn>
        </LightCard>
      </PageWrapper>
      {pagingInfo && pagingInfo.maxPages > 1 && pagination()}
    </>
  );
}
