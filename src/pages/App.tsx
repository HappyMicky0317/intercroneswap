import { Suspense } from 'react';
import { Route, Switch } from 'react-router-dom';
import styled from 'styled-components';
import GoogleAnalyticsReporter from '../components/analytics/GoogleAnalyticsReporter';
import Header from '../components/Header';
import Footer from '../components/Footer';
import URLWarning from '../components/Header/URLWarning';
import Popups from '../components/Popups';
import Web3ReactManager from '../components/Web3ReactManager';
import DarkModeQueryParamReader from '../theme/DarkModeQueryParamReader';
import AddLiquidity from './AddLiquidity';
import {
  RedirectDuplicateTokenIds,
  RedirectOldAddLiquidityPathStructure,
  RedirectToAddLiquidity,
} from './AddLiquidity/redirects';
import { VoteComingSoon } from './Vote/vote';
import Pool from './Pool';
import Stake from './Stake';
import PoolFinder from './PoolFinder';
import RemoveLiquidity from './RemoveLiquidity';
import { RedirectOldRemoveLiquidityPathStructure } from './RemoveLiquidity/redirects';
import Swap from './Swap';
import Sample from './Sample';
import NFT from './NFT';
import Mint from './Mint';
import NotFound from './404';
import { RedirectPathToSwapOnly, RedirectToSwap } from './Swap/redirects';
import { RedirectToReferal } from './Stake/redirects';

import { isMobile } from '../theme';
import Markets from './Markets';
import { Management } from './NFT/management';
import { AbitrageBots } from './Abitrage';
import LaunchPad from './LaunchPad';

const AppWrapper = styled.div`
  display: flex;
  flex-flow: column;
  align-items: flex-start;
  // overflow-x: hidden;
`;

const HeaderWrapper = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  width: 100%;
  justify-content: space-between;
`;
const FooterWrapper = styled.footer`
  display: flex;
  width: 100%;
  padding: 30px 0 15px 0;
  justify-content: space-between;
  background: linear-gradient(180deg, rgba(28, 28, 28, 0) 0%, rgba(51, 51, 51, 0.4) 18.21%, #333333 38.13%);
`;

const BodyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  // justify-content: center;
  padding-top: 0px;
  align-items: center;
  flex: 1;
  overflow-y: hidden;
  overflow-x: hidden;
  z-index: 10;

  /* ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 16px;
    padding-top: 2rem;
  `}; */

  z-index: 1;
`;

const Marginer = styled.div`
  margin-top: 5rem;
`;

export const StyledHeading = styled.h1`
  font-style: normal;
  font-weight: 900;
  font-size: 56px;
  line-height: 72px;
  text-align: center;
  width: 100%;
  color: ${({ theme }) => theme.gradient1};
  background: ${({ theme }) => theme.gradient1};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  padding: 20px 20px;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
  font-size:46px;
  line-height: 62px;
  `};

  ${({ theme }) => theme.mediaWidth.upToMedium`
  font-size:50px;
  line-height: 66px;
`};
  @media (max-width: 768px) {
    font-size: 26px;
  }
`;

export default function App() {
  return (
    <Suspense fallback={null}>
      <Route component={GoogleAnalyticsReporter} />
      <Route component={DarkModeQueryParamReader} />
      <AppWrapper>
        <URLWarning />
        <HeaderWrapper>
          <Header />
        </HeaderWrapper>
        <BodyWrapper>
          <div style={{ height: '8rem' }} />
          <Popups />
          <Web3ReactManager>
            <Switch>
              <Route exact strict path="/" component={Swap} />
              <Route exact strict path="/swap" component={Swap} />
              <Route exact strict path="/launchPad" component={LaunchPad} />
              <Route exact strict path="/nft" component={NFT} />
              <Route exact strict path="/nft/management" component={Management} />
              <Route exact strict path="/abitrage" component={AbitrageBots} />
              <Route exact strict path="/mint" component={Mint} />
              <Route exact strict path="/dashboard" component={Sample} />
              <Route exact strict path="/audit" component={Sample} />
              <Route exact strict path="/white-paper" component={Sample} />
              <Route exact strict path="/faq" component={Sample} />
              <Route exact strict path="/roadmap" component={Sample} />
              <Route exact strict path="/travel-guide" component={Sample} />

              <Route exact strict path="/swap/:outputCurrency" component={RedirectToSwap} />
              <Route exact strict path="/send" component={RedirectPathToSwapOnly} />
              <Route exact strict path="/find" component={PoolFinder} />
              <Route exact strict path="/pool" component={Pool} />
              <Route exact strict path="/stake" component={Stake} />
              <Route exact strict path="/stake/:referal" component={RedirectToReferal} />
              <Route exact strict path="/markets" component={Markets} />
              <Route exact strict path="/markets/:page" component={Markets} />
              <Route exact strict path="/votepage" component={VoteComingSoon} />
              <Route exact strict path="/create" component={RedirectToAddLiquidity} />
              <Route exact path="/add" component={AddLiquidity} />
              <Route exact path="/add/:currencyIdA" component={RedirectOldAddLiquidityPathStructure} />
              <Route exact path="/add/:currencyIdA/:currencyIdB" component={RedirectDuplicateTokenIds} />
              <Route exact path="/create" component={AddLiquidity} />
              <Route exact path="/create/:currencyIdA" component={RedirectOldAddLiquidityPathStructure} />
              <Route exact path="/create/:currencyIdA/:currencyIdB" component={RedirectDuplicateTokenIds} />
              <Route exact strict path="/remove/:tokens" component={RedirectOldRemoveLiquidityPathStructure} />
              <Route exact strict path="/remove/:currencyIdA/:currencyIdB" component={RemoveLiquidity} />
              <Route component={NotFound} />
            </Switch>
          </Web3ReactManager>
          {!isMobile && <Marginer />}
        </BodyWrapper>
        <FooterWrapper>
          <Footer />
        </FooterWrapper>
      </AppWrapper>
    </Suspense>
  );
}
