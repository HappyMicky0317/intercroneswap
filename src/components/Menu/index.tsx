import { useRef } from 'react';
import { Facebook, Youtube, Twitter, Instagram, Send, Info, BookOpen } from 'react-feather';
import styled from 'styled-components';
import { ReactComponent as MenuIcon } from '../../assets/images/menu.svg';
// import { useActiveWeb3React } from '../../hooks'
import { useOnClickOutside } from '../../hooks/useOnClickOutside';
import { ApplicationModal } from '../../state/application/actions';
import { useModalOpen, useToggleModal } from '../../state/application/hooks';

import { ExternalLink } from '../../theme';
// import { ButtonPrimary } from '../Button'

const StyledMenuIcon = styled(MenuIcon)`
  path {
    stroke: ${({ theme }) => theme.settingMenuiconStrokeColor};
    // stroke: #707070;
  }
`;

const StyledMenuButton = styled.button`
  width: 100%;
  height: 100%;
  border: none;
  background-color: transparent;
  margin: 0;
  padding: 0;
  height: 35px;
  background-color: ${({ theme }) => theme.bg3};

  padding: 0.15rem 0.5rem;
  border-radius: 0.5rem;

  :hover,
  :focus {
    cursor: pointer;
    outline: none;
    background-color: ${({ theme }) => theme.bg4};
  }

  svg {
    margin-top: 2px;
  }
`;

const StyledMenu = styled.div`
  margin-left: 0.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border: none;
  text-align: left;
`;

const MenuFlyout = styled.span`
  min-width: 9.125rem;
  background-color: ${({ theme }) => theme.bg1};
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
  border-radius: 12px;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  font-size: 1rem;
  position: absolute;
  top: 4rem;
  right: 0rem;
  z-index: 100;

  ${({ theme }) => theme.mediaWidth.upToMedium`
  z-index: 100;
    top: 4rem;
  `};
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const MenuItem = styled(ExternalLink)`
  flex: 1;
  padding: 0.5rem 0.5rem;
  color: ${({ theme }) => theme.text2};
  :hover {
    color: ${({ theme }) => theme.text1};
    cursor: pointer;
    text-decoration: none;
  }
  > svg {
    margin-right: 8px;
  }
`;

// const CODE_LINK = 'https://github.com/ISwap/ISwap-interface'

export default function Menu() {
  const node = useRef<HTMLDivElement>();
  const open = useModalOpen(ApplicationModal.MENU);
  const toggle = useToggleModal(ApplicationModal.MENU);
  useOnClickOutside(node, open ? toggle : undefined);
  // const openClaimModal = useToggleModal(ApplicationModal.ADDRESS_CLAIM)

  // TODO: Redesign Menu elements
  return (
    // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/30451
    <StyledMenu ref={node as any}>
      <StyledMenuButton onClick={toggle}>
        <StyledMenuIcon />
      </StyledMenuButton>

      {open && (
        <MenuFlyout>
          {/* <MenuItem id="link" href="https://intercroneswap.com/">
            <Info size={14} />
            About
          </MenuItem>
          <MenuItem id="link" href="https://intercroneswap.com/docs/v1">
            <BookOpen size={14} />
            Docs
          </MenuItem> */}
          {/* <MenuItemNav id="link" to="/swap" onClick={toggle}>
            Exchange
          </MenuItemNav>
          <MenuItemNav id="link" to="/stake" onClick={toggle}>
            Stake
          </MenuItemNav>
          <MenuItem id="link" href="https://intercroneswap.com/nft/minting">
            <Image size={14} />
            NFT
          </MenuItem>
          <MenuItem id="link" href="https://trx.intercroneswap.com">
            <Activity size={14} />
            TRADING
          </MenuItem> */}
          <MenuItem id="link" href="https://t.me/intercroneworld">
            <Send size={14} />
            Telegram
          </MenuItem>
          <MenuItem id="link" href="https://www.facebook.com/InterCrone">
            <Facebook size={14} />
            Facebook
          </MenuItem>
          <MenuItem id="link" href="https://twitter.com/IntercroneWorld">
            <Twitter size={14} />
            Twitter
          </MenuItem>
          <MenuItem id="link" href="https://www.youtube.com/c/InterCroneWorld">
            <Youtube size={14} />
            Youtube
          </MenuItem>
          <MenuItem id="link" href="https://www.instagram.com/intercrone">
            <Instagram size={14} />
            Instagram
          </MenuItem>
          <MenuItem id="link" href="https://docs.intercroneswap.finance">
            <Info size={14} />
            FAQs
          </MenuItem>
          <MenuItem id="link" href="https://github.com/InterCroneworldOrg">
            <BookOpen size={14} />
            Docs
          </MenuItem>
          {/* <MenuItem id="link" href={CODE_LINK}>
            <Code size={14} />
            Code
          </MenuItem> */}
          {/* <MenuItem id="link" href="https://info.intercroneswap.com/">
            <PieChart size={14} />
            Analytics
          </MenuItem> */}
        </MenuFlyout>
      )}
    </StyledMenu>
  );
}
