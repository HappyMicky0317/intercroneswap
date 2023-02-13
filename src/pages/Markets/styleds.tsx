import { RowBetween } from '../../components/Row';
import styled from 'styled-components';

export const MarketHeader = styled(RowBetween)`
  padding: 0 3rem;
  ${({ theme }) => theme.mediaWidth.upToMedium`
        display: none;
    `};
`;
