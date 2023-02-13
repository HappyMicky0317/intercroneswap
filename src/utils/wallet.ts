import { getTokenLogoURL } from './tokenLogo';
import { TokenList } from '@intercroneswap/token-lists';
import { ethAddress } from '@intercroneswap/java-tron-provider';

/**
 * Prompt the user to add a custom token to metamask
 * @param tokenAddress
 * @param tokenSymbol
 * @param tokenDecimals
 * @returns {boolean} true if the token has been added, false otherwise
 */
export const registerToken = async (
  tokenAddress: string,
  tokenSymbol: string,
  tokenDecimals: number,
  allTokens: TokenList[],
) => {
  console.log(tokenAddress, ethAddress.toTron(tokenAddress), 'tokenAddress');

  const tokenAdded = await window?.tronWeb?.request({
    method: 'wallet_watchAsset',
    params: {
      type: 'ERC20',
      options: {
        address: ethAddress.toTron(tokenAddress),
        symbol: tokenSymbol,
        decimals: tokenDecimals,
        image: getTokenLogoURL(tokenAddress, allTokens),
      },
    },
  });

  return tokenAdded;
};
