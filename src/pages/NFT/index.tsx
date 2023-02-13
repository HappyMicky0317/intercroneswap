import '../../styles/nft.scss';
import Anime from '../../assets/images/apiICR.png';
import SunCoin from '../../assets/images/suncoin.png';
import Beaver from '../../assets/images/beaver.png';
import ArrowOne from '../../assets/images/arrow1.png';
import ArrowTwo from '../../assets/images/arrow2.png';
import { Container, Row, Col, Accordion } from 'react-bootstrap';
import Twitter from '../../assets/svg/Twitter_white.svg';
import Telegram from '../../assets/svg/Telegram_white.svg';
import Facebook from '../../assets/svg/Facebook_white.svg';
import Instagram from '../../assets/svg/Instagram_white.svg';
import { useState } from 'react';
import styled from 'styled-components';
import { ExternalLink } from '../../theme';
import { isMobile } from 'react-device-detect';
import { Link } from 'react-router-dom';

const SocialIconWrapper = styled.div`
  margin: 25px auto;
  display: block;
  text-align: center;
  a {
    padding: 15px;
  }
`;
const MenuItem = styled(ExternalLink)`
  flex: 1;
  color: black;

  > svg {
    background: white;
    margin: 0 10px;
    width: 35px;
    height: 35px;
    padding: 7px;
    border-radius: 50%;
  }
`;
const NFT: React.FC = () => {
  const [active, setActive] = useState(false);

  const toggleActive = () => {
    setActive(!active);
  };
  return (
    <>
      <div className="background-image">
        <div className="anime">
          <img src={Anime} alt="" />
        </div>
        <div className="textandbtn">
          <p>WELCOME TO INTERCRONE WORLD ARBIDEX</p>
          <Link to="/mint">
            <button>Mint now !</button>
          </Link>
        </div>
      </div>
      <Container>
        <Row>
          <div className="textwriting">
            <p>
              What is Exchange Arbitrage?
              <br />
              <br />
              The most common type of arbitrage trading is exchange arbitrage, which is when a trader buys the same
              cryptoasset in one exchange and sells it in another. The price of cryptocurrencies can change quickly. If
              you take a look at the price in for thee same asset on different Swaps, you’ll find that the prices are
              almost never exactly the same at exactly the same time. This is where arbitrage traders come in. They try
              to exploit these small differences for profit. This, in turn, makes the underlying market more efficient
              since price stays in a relatively contained range on different trading venues. In this sense, market
              inefficiencies can mean opportunity.
            </p>
          </div>
        </Row>
      </Container>
      <Container>
        <div className="toons">
          <div className="arrowone">
            <img src={ArrowOne} alt="" />
          </div>
          <div className="toon one">
            <img src={SunCoin} alt="" />
            <div className="text">price</div>
            <div className="amt">10.000</div>
          </div>
          <div className="toon two">
            <img src={Anime} alt="" />
            <div className="text">profit</div>
            <div className="amt">0,10</div>
          </div>
          <div className="toon three">
            <img src={Beaver} alt="" />
            <div className="text">price</div>
            <div className="amt">9.999,90</div>
          </div>
          <div className="arrowtwo">
            <img src={ArrowTwo} alt="" />
          </div>
        </div>
      </Container>
      <Container>
        <Row id="arbitron">
          <Col md={6}>
            <Col md={12}>{!isMobile && <img src={Anime} alt="" />}</Col>
          </Col>
          <Col md={6}>
            <Col md={12}>
              <h3>I am ArbiDEX.</h3>
              <p>I only make trades, when i make profits for you!</p>
              {isMobile && <img src={Anime} alt="" />}
              <Link to="/mint">
                <button>get ArbiDEX NOW</button>
              </Link>
            </Col>
          </Col>
        </Row>
      </Container>
      <Container>
        <Row>
          <div id="faq">
            <h3>FAQs</h3>
            {active}
            <Accordion defaultActiveKey="0">
              <Accordion.Item eventKey="0">
                <Accordion.Header onClick={() => toggleActive()} className={active ? 'active' : 'notactive'}>
                  What is an NFT?
                </Accordion.Header>
                <Accordion.Body>
                  NFTs stand for Non-fungible tokens. An NFT is data that is stored or accounted for on the blockchain
                  that represents something specific. The NFT can represent a piece of artwork, a video clip, or any
                  other type of digital file.
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="1">
                <Accordion.Header onClick={() => toggleActive()} className={active ? 'active' : 'notactive'}>
                  How much will it cost to mint an ArbiDEX?
                </Accordion.Header>
                <Accordion.Body>2000 TRX</Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="2">
                <Accordion.Header onClick={() => toggleActive()} className={active ? 'active' : 'notactive'}>
                  Is there a buying limit?
                </Accordion.Header>
                <Accordion.Body>There is no buying limit. The sky is the limit.</Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="3">
                <Accordion.Header onClick={() => toggleActive()} className={active ? 'active' : 'notactive'}>
                  When is the Profit distribution?
                </Accordion.Header>
                <Accordion.Body>
                  Profits will be paidout between 1-5 of the in the following month to all NFT holders.
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="4">
                <Accordion.Header onClick={() => toggleActive()} className={active ? 'active' : 'notactive'}>
                  Can I sell my NFT?
                </Accordion.Header>
                <Accordion.Body>
                  Yes, we will list ArbiDEX later on different NFT marktplaces. But if you sell your NFT you also sell
                  the rights to get the Profit.
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </div>
        </Row>
      </Container>
      <Container>
        <div className="joincom">
          <h2>Join our Community</h2>
          <SocialIconWrapper>
            <MenuItem id="link" href="https://twitter.com/IntercroneWorld">
              <img src={Twitter} alt="" />
            </MenuItem>
            <MenuItem id="link" href="https://www.instagram.com/intercrone">
              <img src={Instagram} alt="" />
            </MenuItem>
            <MenuItem id="link" href="https://www.facebook.com/InterCrone">
              <img src={Facebook} alt="" />
            </MenuItem>
            <MenuItem id="link" href="https://t.me/intercroneworld">
              <img src={Telegram} alt="" />
            </MenuItem>
          </SocialIconWrapper>
        </div>
      </Container>
    </>
  );
};

export default NFT;
