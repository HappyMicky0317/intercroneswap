import { Divider, ExternalLink, TYPE } from '../../theme';
import styled from 'styled-components';
import { RowBetween } from '../Row';

export const CardRow = styled(RowBetween)`
  width: 13%;
  ${({ theme }) => theme.mediaWidth.upToMedium`
        width: 100%;
    `};
`;

export const MobileOnlyText = styled(TYPE.white)`
  display: none;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: block;
    `};
`;

export const MobileCenteredCurrencyLink = styled(ExternalLink)`
  width: 20%;
  display: flex;
  ${({ theme }) => theme.mediaWidth.upToMedium`
        width: 100%;
        justify-content: center;
    `}
`;

export const MobileOnlyDivider = styled(Divider)`
  display: none;
  ${({ theme }) => theme.mediaWidth.upToMedium`
        display: block;
    `}
`;

export const MobileHiddenButtons = styled(RowBetween)`
  width: 25%;
  ${({ theme }) => theme.mediaWidth.upToMedium`
        display: none;
    `}
`;
