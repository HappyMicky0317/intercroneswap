import '../../styles/mint.scss';
import { Container } from 'react-bootstrap';
import ApiBTC from '../../assets/images/ApiBTC.png';
import Arrow from '../../assets/images/mintarrow.png';
import { ArbiNFTInfo, useAbiBotActionHandlers, useAbiBotMintInfo, useAbiBotState } from '../../state/abibot/hooks';
import { useCallback, useState } from 'react';
import MintModal from './MintModal';
import { mintData } from '../../constants/minting';

const MINT: React.FC = () => {
  const mintInfos = useAbiBotMintInfo(mintData);
  const [selectedBot, setSelectedBot] = useState<ArbiNFTInfo>(mintInfos[0]);
  const { onUserInput, onTxHashChange } = useAbiBotActionHandlers();
  const { typedValue } = useAbiBotState();

  const [showMint, setShowMint] = useState(false);

  const handleDismissMint = useCallback(() => {
    setShowMint(false);
    onUserInput('1');
    onTxHashChange('');
  }, [showMint, selectedBot]);

  const increaseMintAmount = useCallback(() => {
    console.log('increasing mint amount');

    onUserInput((Number(typedValue) + 1).toString());
  }, [typedValue]);

  const decreaseMintAmount = useCallback(() => {
    if (Number(typedValue) > 1) {
      onUserInput((Number(typedValue) - 1).toString());
    }
  }, [typedValue]);

  return (
    <>
      <h2 className="title">Minting now open !</h2>
      <Container>
        <MintModal isOpen={showMint} onDismiss={handleDismissMint} mintInfo={selectedBot} />
        <div id="bot">
          <h3>Choose your Arbitrage Bot</h3>
          <div className="images">
            {mintInfos &&
              mintInfos.length > 0 &&
              mintInfos.map((info, index) => (
                <div key={index} className="imgparent">
                  <p>{info.maxMintAmount - info.totalSupply} Left</p>
                  <img onClick={() => setSelectedBot(info)} src={info.logo} alt="" />
                  <div>
                    <img className="arrow" src={Arrow} alt="" />
                    <p>earn {info.earnToken}</p>
                  </div>
                </div>
              ))}
            <div className="imgparent">
              <img src={ApiBTC} alt="" />
            </div>
            <div className="imgparent">
              <img src={ApiBTC} alt="" />
            </div>
            <div className="imgparent">
              <img src={ApiBTC} alt="" />
            </div>
          </div>
          {selectedBot ? (
            <div className="buymint">
              <p>
                Max : <span style={{ color: '#E90A0E' }}>{selectedBot?.maxMintPerTransaction}</span>
              </p>
              <div className="plusminus">
                <button onClick={decreaseMintAmount}>-</button>
                <input type="number" placeholder={typedValue} value={typedValue} />
                <button onClick={increaseMintAmount}>+</button>
              </div>
              <div className="mintnft">
                <input disabled={true} type="text" placeholder={selectedBot?.cost.toSignificant() ?? '-'} />
                <button onClick={() => setShowMint(true)}>Mint NFT</button>
              </div>
              <p>Click on mint to Buy your NFT Token.</p>
            </div>
          ) : (
            <div className="buymint">
              <p>Please select a Bot to Mint</p>
            </div>
          )}
        </div>
      </Container>
    </>
  );
};

export default MINT;
