import styled from 'styled-components';
import { AutoRow } from '../Row';
import { TYPE } from '../../theme';

export const AutoRowToColumn = styled.div<{
  gap?: 'sm' | 'md' | 'lg' | string;
  justify?: 'stretch' | 'center' | 'start' | 'end' | 'flex-start' | 'flex-end' | 'space-between';
}>`
  display: grid;
  width: 100%
  grid-auto-rows: auto;
  grid-row-gap: ${({ gap }) => (gap === 'sm' && '8px') || (gap === 'md' && '12px') || (gap === 'lg' && '24px') || gap};
  justify-items: ${({ justify }) => justify && justify};
  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: flex;
    padding: 0;
    width: 100%;
    justify-content: space-between;
    flex-wrap: wrap;
    align-items: center;
  `}
`;

export const AutoColumnToRow = styled(AutoRow)`
  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: grid;
    margin: .5rem 0;
    padding: 0;
    width: 100%;
    grid-auto-rows: auto;
    justify-content: space-between;
  `}
`;

export const SpacedToCenteredAutoRow = styled(AutoRow)`
  justify-content: center;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    justify-content: space-between;
  `}
`;

export const RowBetweenToDiv = styled.div`
  display: flex;
  gap: 2rem;
  justify-content: center;
  padding: 0 1rem;
  align-items: center;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    justify-content: space-between;
    width: 100%;
    padding: 0;
    gap: 0;
  `}
`;

export const ResponsiveSizedTextNormal = styled(TYPE.white)`
  font-size: 1rem;
`;

export const ResponsiveSizedTextMedium = styled(TYPE.white)`
  font-size: 1rem;
`;

export const ButtonAutoRow = styled(AutoRow)`
  width: 450px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: 100%;
  `}
`;
