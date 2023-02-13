import { AutoColumn } from '../../components/Column';
import styled from 'styled-components';
import { TYPE, ExternalLink } from '../../theme';
import { RowBetween } from '../../components/Row';
// import { Link } from 'react-router-dom'
// import { ProposalStatus } from './styled'
// import { ButtonPrimary } from '../../components/Button'

// import { Button } from 'rebass/styled-components'
// import { darken } from 'polished'
import { CardSection, DataCard, CardNoise, CardBGImage } from '../../components/vote/styled';
// import { useAllProposalData, ProposalData, useUserVotes, useUserDelegatee } from '../../state/governance/hooks'
import DelegateModal from '../../components/vote/DelegateModal';
// import { useTokenBalance } from '../../state/wallet/hooks'
// import { useActiveWeb3React } from '../../hooks'
// import { TokenAmount } from '@intercroneswap/v2-sdk'
// import { shortenAddress, getEtherscanLink } from '../../utils'
// import Loader from '../../components/Loader'
// import FormattedCurrencyAmount from '../../components/FormattedCurrencyAmount'
import { useModalOpen, useToggleDelegateModal } from '../../state/application/hooks';
import { ApplicationModal } from '../../state/application/actions';

const PageWrapper = styled(AutoColumn)``;

const TopSection = styled(AutoColumn)`
  max-width: 640px;
  width: 100%;
`;

const VoteCard = styled(DataCard)`
  background: radial-gradient(76.02% 75.41% at 1.84% 0%, #27ae60 0%, #000000 100%);
  overflow: hidden;
`;

export default function Vote() {
  const showDelegateModal = useModalOpen(ApplicationModal.DELEGATE);
  const toggelDelegateModal = useToggleDelegateModal();

  // get data to list all proposals
  // const allProposals: ProposalData[] = useAllProposalData()

  // user data
  // const availableVotes: TokenAmount | undefined = useUserVotes()
  // const userDelegatee: string | undefined = useUserDelegatee()

  // show delegation option if they have have a balance, but have not delegated
  const showUnlockVoting = false;

  return (
    <PageWrapper gap="lg" justify="center">
      <DelegateModal
        isOpen={showDelegateModal}
        onDismiss={toggelDelegateModal}
        title={showUnlockVoting ? 'Unlock Votes' : 'Update Delegation'}
      />
      <TopSection gap="md">
        <VoteCard>
          <CardBGImage />
          <CardNoise />
          <CardSection>
            <AutoColumn gap="md">
              <RowBetween>
                <TYPE.white fontWeight={600}>ISwap Governance</TYPE.white>
              </RowBetween>
              <RowBetween>
                <TYPE.white fontSize={14}>
                  ISWAP tokens represent voting shares in ISwap governance. You can vote on each proposal yourself or
                  delegate your votes to a third party.
                </TYPE.white>
              </RowBetween>
              <ExternalLink
                style={{ color: 'white', textDecoration: 'underline' }}
                href="https://intercroneswap.com/blog/iswap"
                target="_blank"
              >
                <TYPE.white fontSize={14}>Read more about ISwap governance</TYPE.white>
              </ExternalLink>
            </AutoColumn>
          </CardSection>
          <CardBGImage />
          <CardNoise />
        </VoteCard>
      </TopSection>
      {/* <TopSection gap="2px">
        <WrapSmall>
          <TYPE.mediumHeader style={{ margin: '0.5rem 0.5rem 0.5rem 0', flexShrink: 0 }}>Proposals</TYPE.mediumHeader>
          {(!allProposals || allProposals.length === 0) && !availableVotes && <Loader />}
          {showUnlockVoting ? (
            <ButtonPrimary
              style={{ width: 'fit-content' }}
              padding="8px"
              borderRadius="8px"
              onClick={toggelDelegateModal}
            >
              Unlock Voting
            </ButtonPrimary>
          ) : availableVotes && JSBI.notEqual(JSBI.BigInt(0), availableVotes?.raw) ? (
            <TYPE.body fontWeight={500} mr="6px">
              <FormattedCurrencyAmount currencyAmount={availableVotes} /> Votes
            </TYPE.body>
          ) : kwikBalance &&
            userDelegatee &&
            userDelegatee !== ZERO_ADDRESS &&
            JSBI.notEqual(JSBI.BigInt(0), kwikBalance?.raw) ? (
            <TYPE.body fontWeight={500} mr="6px">
              <FormattedCurrencyAmount currencyAmount={kwikBalance} /> Votes
            </TYPE.body>
          ) : (
            ''
          )}
        </WrapSmall>
        {!showUnlockVoting && (
          <RowBetween>
            <div />
            {userDelegatee && userDelegatee !== ZERO_ADDRESS ? (
              <RowFixed>
                <TYPE.body fontWeight={500} mr="4px">
                  Delegated to:
                </TYPE.body>
                <AddressButton>
                  <StyledExternalLink
                    href={getEtherscanLink(ChainId.MAINNET, userDelegatee, 'address')}
                    style={{ margin: '0 4px' }}
                  >
                    {userDelegatee === account ? 'Self' : shortenAddress(userDelegatee)}
                  </StyledExternalLink>
                  <TextButton onClick={toggelDelegateModal} style={{ marginLeft: '4px' }}>
                    (edit)
                  </TextButton>
                </AddressButton>
              </RowFixed>
            ) : (
              ''
            )}
          </RowBetween>
        )}
        {allProposals?.length === 0 && (
          <EmptyProposals>
            <TYPE.body style={{ marginBottom: '8px' }}>No proposals found.</TYPE.body>
            <TYPE.subHeader>
              <i>Proposals submitted by community members will appear here.</i>
            </TYPE.subHeader>
          </EmptyProposals>
        )}
        {allProposals?.map((p: ProposalData, i) => {
          return (
            <Proposal as={Link} to={'/vote/' + p.id} key={i}>
              <ProposalNumber>{p.id}</ProposalNumber>
              <ProposalTitle>{p.title}</ProposalTitle>
              <ProposalStatus status={p.status}>{p.status}</ProposalStatus>
            </Proposal>
          )
        })}
      </TopSection> */}
      <TYPE.subHeader color="text3">
        A minimum threshhold of 1% of the total ISWAP supply is required to submit proposals
      </TYPE.subHeader>
    </PageWrapper>
  );
}
