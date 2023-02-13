import { TokenList } from '@intercroneswap/token-lists';
import { ethAddress } from '@intercroneswap/java-tron-provider';
import { PLZ } from '../constants/tokens';

const coinTopFormats = ['png', 'jpeg', 'jpg'];

export const getTokenLogoURL = (address: string, allTokens: TokenList[]): string[] => {
  if (address.toLocaleLowerCase() === PLZ.address.toLowerCase())
    return [
      'https://static.tronscan.org/production/upload/logo/new/TYK71t3eD1pTxpkDp7gbqXM5DYfaVdfKjV.png?t=1668077389818',
    ];
  const default_list_logo = allTokens
    .flatMap((tokens) => tokens.tokens)
    .find((token) => token.address.toLowerCase() === address.toLowerCase())?.logoURI;
  const coin_top_main_url = `https://coin.top/production/upload/logo/${ethAddress.toTron(address)}.`;
  const static_tronscan_url = `https://static.tronscan.org/production/upload/logo/new/${ethAddress.toTron(address)}.`;
  const allCoinTopFormats = coinTopFormats.map((format) => `${coin_top_main_url}${format}`);
  const newStaticFormats = coinTopFormats.map((format) => `${static_tronscan_url}${format}`);
  const allImageTypes = allCoinTopFormats.concat(newStaticFormats);
  return default_list_logo ? [default_list_logo] : allImageTypes;
};
