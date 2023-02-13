import { EarningData } from '../../pages/Abitrage';
import CurrencyLogo from '../../components/CurrencyLogo';
import { TYPE } from '../../theme';
import { ButtonPrimary } from '../Button';
import { GreyCard } from '../Card';
import { AutoColumn } from '../Column';
import { AutoRow } from '../Row';
import { useContext } from 'react';
import { ThemeContext } from 'styled-components';
import { useToken } from '../../hooks/Tokens';
import { WETH } from '@intercroneswap/v2-sdk';

interface AbitrageDetailProps {
  bot: EarningData;
  updateBot: (config: EarningData) => void;
  deleteBot: (config: EarningData) => void;
}

export const AbitrageDetail: React.FC<AbitrageDetailProps> = ({ bot, updateBot, deleteBot }) => {
  const theme = useContext(ThemeContext);
  const token = useToken(bot.token_address);
  return (
    <GreyCard style={{ background: bot.active ? theme.green1 : theme.red2 }}>
      <AutoRow justify="space-around">
        <AutoColumn>
          <CurrencyLogo currency={token ?? WETH[11111]} />
          <TYPE.yellow>{token?.symbol}</TYPE.yellow>
        </AutoColumn>
        <TYPE.yellow>{bot.freq_seconds} s</TYPE.yellow>
        <TYPE.yellow>{bot.active ? 'Active' : 'Inactive'}</TYPE.yellow>
        <ButtonPrimary width="20%" onClick={() => updateBot({ ...bot, active: !bot.active })}>
          {bot.active ? 'Deactivate' : 'Activate'}
        </ButtonPrimary>
        <ButtonPrimary
          width="20%"
          onClick={() => deleteBot({ ...bot, active: !bot.active })}
          style={{ background: theme.red2 }}
        >
          Delete Bot
        </ButtonPrimary>
      </AutoRow>
    </GreyCard>
  );
};
