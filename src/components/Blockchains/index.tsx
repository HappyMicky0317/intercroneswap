import { ExternalLink } from '../../theme';
import EthLogo from '../../assets/images/eth-logo.png';
import BTTLogo from '../../assets/images/bttlogo.png';
import BSCLogo from '../../assets/images/bsclogo.png';
import Style from '../../styles/footer.module.css';

export default function Blockchains() {
  return (
    <>
      <ExternalLink href="https://trx.intercroneswap.com/" className="trxlogo active">
        <span>TRX</span>
        <span style={{ marginLeft: '7px' }}>
          <img width={25} src={EthLogo} alt="" />
        </span>
      </ExternalLink>
      <ExternalLink href="https://btt.intercroneswap.com/" className="bttlogo">
        <span>BTT</span>
        <span style={{ marginLeft: '7px' }}>
          <img width={25} src={BTTLogo} alt="" />
        </span>
      </ExternalLink>
      <ExternalLink href="https://bsc.intercroneswap.com/" className="bsclogo">
        <span>BSC</span>
        <span style={{ marginLeft: '7px' }}>
          <img width={25} src={BSCLogo} alt="" />
        </span>
      </ExternalLink>
    </>
  );
}

export function FooterBlockchains() {
  return (
    <ul className={Style.ul}>
      <li>
        <ExternalLink href="https://trx.intercroneswap.com/" className={`trxlogo ${Style.link} nav-link`}>
          <span>TRX</span>
          <span style={{ marginLeft: '7px' }}>
            <img width={25} src={EthLogo} alt="" />
          </span>
        </ExternalLink>
      </li>
      <li>
        <ExternalLink href="https://bsc.intercroneswap.com/" className={`bsclogo ${Style.link} nav-link `}>
          <span>BSC</span>
          <span style={{ marginLeft: '7px' }}>
            <img width={25} src={BSCLogo} alt="" />
          </span>
        </ExternalLink>
      </li>
      <li>
        <ExternalLink href="https://btt.intercroneswap.com/" className={`bttlogo ${Style.link} nav-link `}>
          <span>BTT</span>
          <span style={{ marginLeft: '7px' }}>
            <img width={25} src={BTTLogo} alt="" />
          </span>
        </ExternalLink>
      </li>
    </ul>
  );
}
