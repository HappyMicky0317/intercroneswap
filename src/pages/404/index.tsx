import '../../styles/404.scss';
import { Container, Row, Col } from 'react-bootstrap';
import NotFoundImg from '../../assets/images/notfound.png';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <>
      <Container id="notfound">
        <h2>we lost you in outer space, our quokka is on the way to find you!</h2>
        <Row className="content">
          <Col md={4}>
            <p>You can check out our other pages instead</p>
            <div className="redirectbtns">
              <Link to="/swap">
                <button>Exchange</button>
              </Link>
              <Link to="/pool">
                <button>Liquidity</button>
              </Link>
              <Link to="/stake">
                <button>Staking</button>
              </Link>
            </div>
          </Col>
          <Col md={8}>
            <img className="notfoundimg" src={NotFoundImg} alt="notfound" />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default NotFound;
