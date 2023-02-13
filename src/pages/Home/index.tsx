import styled from 'styled-components';
import Banner from '../../assets/images/rocket.png';
import Rectangle from '../../assets/images/rectangle.png';
import { Col, Container, Row } from 'react-bootstrap';
import Styles from '../../styles/home.module.css';
import TRXLogo from '../../assets/images/trxlogo.png';
import BSCLogo from '../../assets/images/bsclogo.png';
import BTTLogo from '../../assets/images/bttlogo.png';
import Beaver from '../../assets/images/beaver.png';
import Space from '../../assets/images/space.png';
import Send from '../../assets/images/send.png';
import Facebook from '../../assets/images/facebook.png';
import Twitter from '../../assets/images/twitter.png';
import Instagram from '../../assets/images/instagram.png';
import Communitychessicon from '../../assets/images/communitychessicon.png';
import Last1 from '../../assets/images/last1.png';
import Last2 from '../../assets/images/last2.png';
import Last3 from '../../assets/images/last3.png';
import Last4 from '../../assets/images/last4.png';
import Last5 from '../../assets/images/last5.png';
import Last6 from '../../assets/images/last6.png';

const BannerWrapper = styled.div`
  background-image: url(${Banner});

  height: 800px;
  background-size: cover;
  width: 100%;
  background-repeat: no-repeat;
  background-position: center;
  @media (max-width: 768px) {
    height: 250px;
    background-image: url(${Banner});
  }
  @media (min-width: 1600px) {
    height: 1200px;
  }
`;
const BannerBottom = styled.div`
  background-image: url(${Rectangle});
  height: 240px;
  background-size: cover;
  width: 100%;
  background-repeat: no-repeat;
  background-position: center;
  margin-top: -190px;
  @media (min-width: 1600px) {
    height: 345px;
  }
`;

const BannerContent = styled.div`
  padding: 50px;
  margin-top: 100px;
  @media (max-width: 768px) {
    padding: 60px 20px;
    margin-top: unset;
    position: relative;
    bottom: -130px;
  }
`;

const BannerHeading = styled.h1`
  font-family: Jost;
  font-size: 56px;
  font-weight: 800;
  line-height: 72px;
  letter-spacing: 0em;
  text-align: left;
  background: -webkit-linear-gradient(360deg, #ffb807 38.83%, #ffea00 79.17%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  @media (max-width: 768px) {
    font-size: 24px;
    text-align: center;
    line-height: unset;
    margin: unset;
  }
`;

const BannerDescription = styled.p`
  font-family: Poppins;
  font-size: 30px;
  font-weight: 400;
  line-height: 36px;
  letter-spacing: 0em;
  text-align: left;
  color: rgba(255, 255, 255, 1);
  width: 50%;
  @media (max-width: 768px) {
    width: 80%;
    background: rgba(42, 42, 42, 1);
    font-size: 12px;
    padding: 15px;
    text-align: center;
    margin: 0 auto;
    line-height: unset;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.5);
    border-radius: 8px;
    position: absolute;
    //bottom: -125px;
    left: 50%;
    transform: translate(-50%);
  }
`;

const BoxContent = styled.p`
  font-family: Poppins;
  font-size: 24px;
  font-weight: 400;
  line-height: 36px;
  letter-spacing: 0em;
  text-align: center;
  color: rgba(243, 201, 20, 1);
  @media (max-width: 768px) {
    font-size: 16px;
    margin: unset;
  }
`;
const YellowBox = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 10px;
  background: linear-gradient(180deg, #ffea00 0%, #ffb807 100%);
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 8px;
  cursor: pointer;
  @media (max-width: 768px) {
    padding: 5px 15px;
  }
`;

const YellowBoxContent = styled.p`
  font-family: 'Poppins';
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  text-align: center;
  color: #4a4a4a;
  margin: unset;
`;

const DefiBox = styled.section`
  background: radial-gradient(50% 50% at 50% 50%, rgba(105, 105, 105, 0.39) 35.94%, rgba(35, 35, 35, 0.03) 100%);
  padding: 50px;
  @media (max-width: 768px) {
    padding: 20px;
    position: relative;
  }
`;
const CommunityBox = styled.section`
  padding: 50px;
  width: 100%;
  @media (max-width: 768px) {
    padding: unset;
    position: relative;
  }
`;

const DefiContent = styled.h2`
  font-family: 'Jost';
  font-style: normal;
  font-weight: 800;
  font-size: 40px;
  line-height: 72px;
  background: linear-gradient(360deg, #ffb807 38.83%, #ffea00 79.17%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
  @media (max-width: 768px) {
    font-size: 24px;
    line-height: unset;
    text-align: center;
  }
`;

const DefiDescriptionsBox = styled.div`
  display: block;
  text-align: left;
`;

const DefiDescription = styled.p`
  font-family: Poppins;
  font-size: 24px;
  width: 65%;
  font-weight: 400;
  line-height: 36px;
  letter-spacing: 0em;
  text-align: left;
  color: rgba(255, 255, 255, 1);
  @media (max-width: 768px) {
    font-size: 16px;
    line-height: unset;
    text-align: center;
    width: 100%;
  }
`;

const ExchangeBox = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 8px;
  background: linear-gradient(90deg, #ffb807 8.49%, #ffea00 100%);
  border-radius: 8px;
  width: 30%;
  @media (max-width: 768px) {
    width: 50%;
    font-size: 16px;
    margin: 0 auto;
  }
`;
const ExchangeBoxText = styled.div`
  font-family: Poppins;
  font-size: 18px;
  font-weight: 500;
  color: rgba(0, 0, 0, 1);
  letter-spacing: 0em;
  @media (max-width: 768px) {
    text-align: center;
    font-size: 16px;
  }
`;
const CommunityText = styled.h2`
  font-family: Jost;
  font-size: 48px;
  font-weight: 900;
  line-height: 72px;
  letter-spacing: 0em;
  text-align: center;
  background: -webkit-linear-gradient(360deg, #ffb807 38.83%, #ffea00 79.17%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  @media (max-width: 768px) {
    text-align: center;
    font-size: 24px;
    line-height: unset;
  }
`;

const CommunityTextBox = styled.div`
  width: 60%;
  margin: 0 auto;
  position: relative;
`;

const SocialIcons = styled.div`
  margin-top: 20px;
  display: flex;
  justify-content: space-around;
  > img {
    width: 35px;
  }
`;

const ComingSoonHeading = styled.h2`
  font-family: Jost;
  font-size: 48px;
  font-weight: 800;
  line-height: 72px;
  letter-spacing: 0em;
  text-align: center;
  background: -webkit-linear-gradient(360deg, #ffb807 38.83%, #ffea00 79.17%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  width: 60%;
  margin: 0 auto;
`;

const ComingSoonBox = styled.section`
  padding: 50px;
`;

const ComingSoonContent = styled.p`
  font-family: Poppins;
  font-size: 24px;
  font-weight: 400;
  line-height: 36px;
  letter-spacing: 0em;
  text-align: center;
  color: rgba(255, 255, 255, 1);
  width: 60%;
  margin: 0 auto;
`;

const LastSection = styled.section`
  display: flex;
  justify-content: space-between;
  overflow: hidden;
  padding: 50px;
`;

const ImageBox = styled.div`
  &:first-child {
    margin-left: -32px;
    opacity: 0.4;
  }
  &:last-child {
    margin-right: -32px;
    opacity: 0.4;
  }
`;

const Home = () => {
  return (
    <>
      <BannerWrapper>
        <BannerContent>
          <BannerHeading>Welcome to InterCrone!</BannerHeading>
          <BannerDescription>Join the coolest multichain swapping platform in the whole universe!</BannerDescription>
        </BannerContent>
      </BannerWrapper>
      <BannerBottom></BannerBottom>

      <Container className="containerstyle">
        <Row>
          <Col md={4}>
            <Col md={12} className={Styles.box}>
              <img src={TRXLogo} className={Styles.icon} />
              <BoxContent>TRX Blockchain</BoxContent>
              <YellowBox>
                <YellowBoxContent>Active</YellowBoxContent>
              </YellowBox>
            </Col>
          </Col>
          <Col md={4}>
            <Col md={12} className={Styles.box}>
              <img src={BSCLogo} className={Styles.icon} />
              <BoxContent>BSC Blockchain</BoxContent>
              <YellowBox
                style={{
                  background: 'linear-gradient(rgb(169 155 4) 0%, rgb(116 85 5) 100%)',
                }}
              >
                <YellowBoxContent style={{ color: 'white' }}>Coming Soon</YellowBoxContent>
              </YellowBox>
            </Col>
          </Col>
          <Col md={4}>
            <Col md={12} className={Styles.box}>
              <img src={BTTLogo} className={Styles.icon} />
              <BoxContent>BTT Blockchain</BoxContent>
              <YellowBox
                style={{
                  background: 'linear-gradient(rgb(169 155 4) 0%, rgb(116 85 5) 100%)',
                }}
              >
                <YellowBoxContent style={{ color: 'white' }}>Coming Soon</YellowBoxContent>
              </YellowBox>
            </Col>
          </Col>
        </Row>
      </Container>

      <DefiBox>
        <Container>
          <Row>
            <Col md={4}>
              <img className={Styles.imagestyle} style={{ width: '100%' }} src={Beaver} />
            </Col>
            <Col md={8}>
              <DefiDescriptionsBox>
                <DefiContent>DeFi. Multichain. and Quokkas.</DefiContent>
                <DefiDescription>Trade, pool and stake crypto and get rewarded with InterCrone. </DefiDescription>
                <ExchangeBox>
                  <ExchangeBoxText>go to Exchange</ExchangeBoxText>
                </ExchangeBox>
              </DefiDescriptionsBox>
            </Col>
          </Row>
        </Container>
      </DefiBox>
      <CommunityBox>
        <Container style={{ backgroundImage: `url(${Space})`, backgroundSize: 'cover', padding: '50px' }}>
          <Row style={{ position: 'relative' }}>
            <CommunityTextBox>
              <CommunityText>Join our Intercrone and Quokka Community</CommunityText>
              <SocialIcons>
                <img src={Send} />
                <img src={Twitter} />
                <img src={Facebook} />
                <img src={Instagram} />
              </SocialIcons>
            </CommunityTextBox>
            <img className={Styles.chessicon} src={Communitychessicon} />
          </Row>
        </Container>
      </CommunityBox>
      <ComingSoonBox>
        <ComingSoonHeading>ICR Quokka Warriors NFT´s</ComingSoonHeading>
        <ComingSoonContent>
          Mint and trade Quokka NFTs and support the Quokkas in Australia and the Intercrone Community
        </ComingSoonContent>
        <YellowBox
          style={{
            background: 'linear-gradient(rgb(169 155 4) 0%, rgb(116 85 5) 100%)',
            width: '20%',
            margin: '25px auto',
          }}
        >
          <YellowBoxContent style={{ color: 'white' }}>Coming Soon</YellowBoxContent>
        </YellowBox>
      </ComingSoonBox>
      <LastSection>
        <ImageBox>
          <img src={Last1} alt="" />
        </ImageBox>
        <ImageBox>
          <img src={Last2} alt="" />
        </ImageBox>
        <ImageBox>
          <img src={Last3} alt="" />
        </ImageBox>
        <ImageBox>
          <img src={Last4} alt="" />
        </ImageBox>
        <ImageBox>
          <img src={Last5} alt="" />
        </ImageBox>
        <ImageBox>
          <img src={Last6} alt="" />
        </ImageBox>
      </LastSection>
    </>
  );
};

export default Home;
