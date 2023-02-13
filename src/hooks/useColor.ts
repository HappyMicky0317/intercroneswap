import { useState, useLayoutEffect } from 'react';
import { shade } from 'polished';
import Vibrant from 'node-vibrant';
import { hex } from 'wcag-contrast';
import { Token, ChainId } from '@intercroneswap/v2-sdk';
import { useAllLists } from '../state/lists/hooks';
import { TokenList } from '@intercroneswap/token-lists';

async function getColorFromToken(token: Token, allTokenList?: TokenList[]): Promise<string | null> {
  if (token.chainId === ChainId.SHASTA && token.address === '0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735') {
    return Promise.resolve('#FAAB14');
  }

  const path =
    allTokenList
      ?.flatMap((tokenLists) => tokenLists.tokens)
      .find((t) => t.address.toLowerCase() === token.address.toLowerCase())?.logoURI ??
    `https://coin.top/production/upload/logo/${token.address}.png`;

  return Vibrant.from(path)
    .getPalette()
    .then((palette) => {
      if (palette?.Vibrant) {
        let detectedHex = palette.Vibrant.hex;
        let AAscore = hex(detectedHex, '#FFF');
        while (AAscore < 3) {
          detectedHex = shade(0.005, detectedHex);
          AAscore = hex(detectedHex, '#FFF');
        }
        return detectedHex;
      }
      return null;
    })
    .catch(() => null);
}

export function useColor(token?: Token) {
  const [color, setColor] = useState('#2172E5');
  const allTokenList = useAllLists();

  useLayoutEffect(() => {
    let stale = false;

    if (token) {
      getColorFromToken(token, allTokenList).then((tokenColor) => {
        if (!stale && tokenColor !== null) {
          setColor(tokenColor);
        }
      });
    }

    return () => {
      stale = true;
      setColor('#2172E5');
    };
  }, [token]);

  return color;
}
