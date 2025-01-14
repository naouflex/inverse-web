import { Flex, HStack, Stack, Switch, Text, useMediaQuery, VStack } from '@chakra-ui/react'
import { Avatar } from '@app/components/common/Avatar'
import { Breadcrumbs } from '@app/components/common/Breadcrumbs'
import Container from '@app/components/common/Container'
import Layout from '@app/components/common/Layout'
import { AppNav } from '@app/components/common/Navbar'
import { SkeletonBlob } from '@app/components/common/Skeleton'
import Table from '@app/components/common/Table'
import { useTopDelegates } from '@app/hooks/useDelegates'
import { Delegate, Proposal, ProposalStatus } from '@app/types'
import { useRouter } from 'next/dist/client/router'
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import Head from 'next/head'
import { useNamedAddress } from '@app/hooks/useNamedAddress'
import { getBnToNumber, shortenNumber } from '@app/util/markets'
import { useProposals } from '@app/hooks/useProposals'
import useEtherSWR from '@app/hooks/useEtherSWR'
import { getGovernanceAddress } from '@app/util/contracts';
import { EraBadge, StatusBadge } from '@app/components/Governance'
import { useState } from 'react'
import { useContractEvents } from '@app/hooks/useContractEvents'
import { INV_ABI } from '@app/config/abis'
import { getNetworkConfigConstants } from '@app/util/networks'
import ScannerLink from '@app/components/common/ScannerLink'
import { BlockTimestamp } from '@app/components/common/BlockTimestamp'
import { BURN_ADDRESS } from '@app/config/constants'
import Link from '@app/components/common/Link'
import { ArrowDownIcon, ArrowUpIcon } from '@chakra-ui/icons';
import { AnimatedInfoTooltip } from '@app/components/common/Tooltip'

const { INV } = getNetworkConfigConstants();

type Supporter = { address: string, inv: number, xinv: number, delegatedPower: number }
type DelegateVote = Proposal & { hasVoted: boolean, hasVotedFor: boolean, hasVotedWith: number }
type DelegateEventItem = { blockNumber: number, txHash: string, delegator: string, fromDelegate: string, toDelegate: string, isNewSupport: boolean }

const DelegateName = ({ delegate, delegator, asLink = true }: { delegate: string, asLink?: boolean, delegator?: string }) => {
  const { addressName } = useNamedAddress(delegate);
  const label = delegate === BURN_ADDRESS ? 'Nobody' : delegate === delegator ? 'Self' : addressName
  return delegate === BURN_ADDRESS || !asLink ?
    <Text>{label}</Text>
    :
    <Link textDecoration="underline" href={`/governance/delegates/${delegate}`}>
      {label}
    </Link>;
}

export const DelegatingEventsTable = ({
  srcAddress = undefined,
  fromDelegate = undefined,
  toDelegate = undefined,
}: {
  srcAddress?: string,
  fromDelegate?: string,
  toDelegate?: string,
}) => {
  const { events: eventsByDelegator, isLoading: isLoading1 } = useContractEvents(INV, INV_ABI, 'DelegateChanged', [srcAddress, undefined, undefined], true, 'DelegateChanged-src' + srcAddress);
  const { events: eventsFromDelegate, isLoading: isLoading2 } = useContractEvents(INV, INV_ABI, 'DelegateChanged', [undefined, fromDelegate, undefined], true, 'DelegateChanged-from' + fromDelegate);
  const { events: eventsToDelegate, isLoading: isLoading3 } = useContractEvents(INV, INV_ABI, 'DelegateChanged', [undefined, undefined, toDelegate], true, 'DelegateChanged-to' + toDelegate);

  const totalEvents = eventsByDelegator
    .concat(eventsFromDelegate, eventsToDelegate)
    .map(e => ({ ...e, uniqueKey: e.transactionHash + e.logIndex }))
    // unique
    .filter((value, index, self) => self.findIndex(event => event.uniqueKey === value.uniqueKey) === index)
    // filter syncs
    .filter(event => event.args.fromDelegate !== event.args.toDelegate);

  const isSrcDelegate = fromDelegate || toDelegate;

  const items = totalEvents.map(e => {
    return {
      blockNumber: e.blockNumber,
      txHash: e.transactionHash,
      delegator: e.args.delegator,
      fromDelegate: e.args.fromDelegate,
      toDelegate: e.args.toDelegate,
      isNewSupport: e.args.toDelegate === srcAddress,
    }
  });

  items.sort((a, b) => b.blockNumber - a.blockNumber);

  const columns = [
    {
      field: 'txHash',
      label: 'TX',
      header: ({ ...props }) => <Flex justify="flex-start" minWidth={'120px'} {...props} />,
      value: ({ txHash }: DelegateEventItem) => <Flex justify="flex-start" minWidth={'120px'}>
        <ScannerLink type="tx" value={txHash} />
      </Flex>,
    },
    {
      field: 'blockNumber',
      label: 'Date',
      header: ({ ...props }) => <Flex justify="flex-start" minW={'120px'} {...props} />,
      value: ({ blockNumber }: DelegateEventItem) => <Flex justify="flex-start" minW={'120px'}>
        <BlockTimestamp blockNumber={blockNumber} />
      </Flex>,
    },
    {
      field: 'delegator',
      label: 'Delegator',
      header: ({ ...props }) => <Flex justify="center" minWidth={'120px'} {...props} />,
      value: ({ delegator }: DelegateEventItem) => <Flex justify="center" minWidth={'120px'}>
        <DelegateName delegate={delegator} delegator={''} />
      </Flex>,
    },
    {
      field: 'fromDelegate',
      label: 'Old Delegate',
      header: ({ ...props }) => <Flex justify="center" minWidth={'120px'} {...props} />,
      value: ({ fromDelegate, delegator }: DelegateEventItem) => <Flex justify="center" minWidth={'120px'}>
        <DelegateName delegate={fromDelegate} delegator={delegator} />
      </Flex>,
    },
    {
      field: 'toDelegate',
      label: 'New Delegate',
      header: ({ ...props }) => <Flex justify="center" minWidth={'120px'} {...props} />,
      value: ({ toDelegate, delegator }: DelegateEventItem) => <Flex justify="center" minWidth={'120px'}>
        <DelegateName delegate={toDelegate} delegator={delegator} />
      </Flex>,
    },
    {
      field: 'isNewSupport',
      label: 'Result',
      header: ({ ...props }) => <Flex justify="flex-end" minWidth={'120px'} {...props} />,
      value: ({ isNewSupport, delegator, toDelegate }: DelegateEventItem) => <Flex justify="flex-end" minWidth={'120px'}>
        {
          isSrcDelegate && (delegator !== srcAddress) ?
            (isNewSupport ?
              <Text color="secondary"><ArrowUpIcon fontSize="12px" /> Delegators</Text>
              :
              <Text color="warning"><ArrowDownIcon fontSize="12px" /> Delegators</Text>
            )
            : (isNewSupport ?
              'Self-Delegate' : 'Delegate')
        }
      </Flex>,
    },
  ];

  return (
    <Container
      label="Delegation Events"
      description="All the Delegation events involving the Delegate/Delegator"
      noPadding
      contentProps={{ maxW: { base: '90vw', sm: '100%' }, overflowX: 'auto' }}
      collapsable={true}
    >
      {
        isLoading1 || isLoading2 || isLoading3 ?
          <SkeletonBlob />
          :
          items.length > 0 ?
            <Table
              columns={columns}
              items={items}
              keyName={'uniqueKey'}
              defaultSort="blockNumber"
              defaultSortDir="desc"
            />
            :
            <Text>No Delegation Events yet</Text>
      }
    </Container>
  )
}

export const PastVotesTable = ({ delegate }: { delegate: Partial<Delegate> }) => {
  const router = useRouter();
  const { proposals } = useProposals();

  const { data } = useEtherSWR([
    ...proposals.map(p => {
      return [getGovernanceAddress(p.era), 'getReceipt', p.id, delegate.address];
    })
  ]);

  proposals.sort((a, b) => b.proposalNum - a.proposalNum);

  const proposalsWithVotes = proposals.map((p, i) => {
    return {
      ...p,
      hasVoted: data && data[i] && data[i][0],
      hasVotedFor: data && data[i] && data[i][0] && data[i][1],
      hasVotedWith: data && data[i] && data[i][2] && getBnToNumber(data[i][2]),
    }
  });

  const columns = [
    {
      field: 'proposalNum',
      label: 'Proposal',
      header: ({ ...props }) => <Flex justify="flex-start" minWidth={'120px'} {...props} />,
      value: ({ id, era }: DelegateVote) => <Flex justify="flex-start" minWidth={'120px'}>
        <EraBadge id={id} era={era} />
      </Flex>,
    },
    {
      field: 'title',
      label: 'Title',
      header: ({ ...props }) => <Flex justify="flex-start" maxW={'200px'} minW={'200px'} {...props} />,
      value: ({ title }: DelegateVote) => <Flex justify="flex-start" maxW={'200px'} minW={'200px'}>
        <Text maxW={'200px'} minW={'200px'} textAlign="left" fontSize="12px">{title}</Text>
      </Flex>,
    },
    {
      field: 'hasVoted',
      label: 'Voted?',
      header: ({ ...props }) => <Flex justify="center" minWidth={'80px'} {...props} />,
      value: ({ hasVoted, status }: DelegateVote) => <Flex color={hasVoted ? 'secondary' : 'warning'} justify="center" minWidth={'80px'}>
        {!data ? <>...</> : status === ProposalStatus.active ? hasVoted ? 'Voted' : 'Not Yet' : hasVoted ? 'Voted' : 'Abstained'}
      </Flex>,
    },
    {
      field: 'hasVotedFor',
      label: 'Decision',
      header: ({ ...props }) => <Flex justify="center" minWidth={'70px'} {...props} />,
      value: ({ hasVoted, hasVotedFor }: DelegateVote) => <Flex fontWeight="extrabold" color={hasVoted ? hasVotedFor ? 'secondary' : 'info' : 'white'} justify="center" minWidth={'70px'}>
        {!data ? <>...</> : hasVoted ? hasVotedFor ? 'FOR' : 'AGAINST' : '-'}
      </Flex>,
    },
    {
      field: 'hasVotedWith',
      label: 'Power',
      tooltip: "Delegate's Voting Power at the time of the Proposal creation that was used when voting",
      header: ({ ...props }) => <Flex justify="center" minWidth={'70px'} {...props} />,
      value: ({ hasVoted, hasVotedWith }: DelegateVote) => <Flex fontWeight="extrabold" justify="center" minWidth={'70px'}>
        {!data ? <>...</> : hasVoted ? shortenNumber(hasVotedWith) : '-'}
      </Flex>,
    },
    {
      field: 'status',
      label: 'Status',
      header: ({ ...props }) => <Flex justify="flex-end" minWidth={'75px'} {...props} />,
      value: ({ status }: DelegateVote) => <Flex justify="flex-end" minWidth={'75px'}>
        <StatusBadge status={status} />
      </Flex>,
    },
  ];

  return (
    <Container
      noPadding
      label="Voting Activity"
      description="The proposal list is Updated every 15 min"
      contentProps={{ maxW: { base: '90vw', sm: '100%' }, overflowX: 'auto' }}
      collapsable={true}
    >
      <Table
        columns={columns}
        items={proposalsWithVotes}
        keyName={'proposalNum'}
        defaultSort="proposalNum"
        defaultSortDir="desc"
        onClick={({ id, era }: DelegateVote) => router.push(`/governance/proposals/${era}/${id}`)}
      />
    </Container>
  )
}

const SupporterField = ({ address }: { address: string }) => {
  const { addressName } = useNamedAddress(address);
  return (
    (
      <Stack direction="row" align="flex-start" spacing={4} minWidth={'200px'}>
        <Stack direction="row" align="flex-start">
          <Avatar address={address} sizePx={24} />
          <Flex>{addressName}</Flex>
        </Stack>
      </Stack>
    )
  )
}

export const SupportersTable = ({
  delegate,
  delegators,
}: {
  delegate: Partial<Delegate>,
  delegators: Supporter[],
}) => {
  const [isSmaller] = useMediaQuery('(max-width: 500px)')
  const [isOnlyActive, setIsOnlyActive] = useState(true);

  const router = useRouter()

  const columns = [
    {
      field: 'address',
      label: 'Delegator',
      header: ({ ...props }) => <Flex minWidth={'200px'} {...props} />,
      value: ({ address }: Supporter, i: number) => <SupporterField address={address} />
    },
    {
      field: 'delegatedPower',
      label: 'Power',
      tooltip: "The Supporter's Voting Power being delegated",
      header: ({ ...props }) => <Flex justify="flex-end" minWidth={'64px'} {...props} />,
      value: ({ delegatedPower }: Supporter) => <Flex justify="flex-end" minWidth={'64px'}>
        {shortenNumber(delegatedPower, 2, false, true)}
      </Flex>,
    },
  ];

  if (!isSmaller) {
    columns.splice(1, 0,
      {
        field: 'inv',
        label: 'INV',
        header: ({ ...props }) => <Flex justify="center" minWidth={'50px'} {...props} />,
        value: ({ inv }: Supporter) => <Flex justify="center" minWidth={'50px'}>
          {shortenNumber(inv, 2, false, true)}
        </Flex>,
      }
    );
    columns.splice(2, 0, {
      field: 'xinv',
      label: 'Staked INV',
      header: ({ ...props }) => <Flex justify="center" minWidth={'80px'} {...props} />,
      value: ({ xinv }: Supporter) => <Flex justify="center" minWidth={'80px'}>
        {shortenNumber(xinv, 2, false, true)}
      </Flex>,
    })
  }

  //                            .°.°.°.°.
  // ༼ つ ◕_◕ ༽つ .°.°.°.°.°.°.°.°.°.°.°.°.
  // ༼ つ ◕_◕ ༽つ .°.°.°.°.°.°.° ᕙ(⇀‸↼‶)ᕗ
  const genkidama = delegators.filter(d => d.address !== delegate.address).reduce((prev, curr) => prev + curr.delegatedPower, 0);
  const genkidamaPerc = genkidama && delegate?.votingPower ? genkidama / delegate.votingPower * 100 : 0;

  const onlyActive = delegators.filter(d => d.delegatedPower > 0);
  const nbActive = onlyActive.length;

  return (
    <Container
      w='full'
      noPadding
      position="relative"
      collapsable={true}
      label={`${delegators.length} Delegator${delegators.length > 1 ? 's' : ''}${nbActive !== delegators.length ? ` (${nbActive} with power)` : ''} - Updated Every 15 min`}
      description={
        <Stack direction={{ base: 'column', sm: 'row' }} justify="space-between" w='full'>
          <Text fontSize="12px" color="secondaryTextColor">
            Total Power Received Thanks to Supporters: {shortenNumber(genkidama, 2)} / {shortenNumber(delegate.votingPower, 2)} => {shortenNumber(genkidamaPerc, 2)}%{genkidamaPerc > 100 ? ' (% > 100 means that the Cached Supporter list differ a bit from live voting power)' : ''}
            <AnimatedInfoTooltip iconProps={{ ml: '1', fontSize: '10px' }} message={
              <VStack>
                <Text><b>Delegators</b>: Includes the Delegate</Text>
                <Text><b>Supporters</b>: Delegators excluding the Delegate</Text>
              </VStack>
            } />
          </Text>
          <HStack position={{ base: 'static', sm: 'absolute' }} right="24px" alignItems="center">
            <Text fontSize="12px">Only With Power:</Text>
            <Switch isChecked={isOnlyActive} onChange={() => setIsOnlyActive(!isOnlyActive)} />
          </HStack>
        </Stack>
      }
    >
      {
        delegators?.length > 0 ?
          <Table
            columns={columns}
            items={isOnlyActive ? onlyActive : delegators}
            keyName={'address'}
            defaultSort="delegatedPower"
            defaultSortDir="desc"
            onClick={({ address }: Delegate) => router.push(`/governance/delegates/${address}`)}
          />
          :
          <Text>No Delegators</Text>
      }
    </Container>
  )
}

const DelegatesTable = () => {
  const { chainId } = useWeb3React<Web3Provider>()

  const { delegates, isLoading } = useTopDelegates()
  const router = useRouter()

  const totalVotes = delegates.reduce((totalVotes: number, { votingPower }: Delegate) => (totalVotes += votingPower), 0)

  const columns = [
    {
      field: 'rank',
      label: 'Rank',
      header: ({ ...props }) => <Flex minWidth={64} {...props} />,
      value: ({ address, rank }: Delegate, i: number) => {
        return (
          (
            <Stack direction="row" align="center" spacing={4} minWidth={64}>
              <Flex w={4} justify="center">
                {rank}
              </Flex>
              <Stack direction="row" align="center">
                <Avatar address={address} sizePx={24} />
                <DelegateName delegate={address} asLink={false} />
              </Stack>
            </Stack>
          )
        )
      },
    },
    {
      field: 'delegators',
      label: 'Delegators',
      header: ({ ...props }) => <Flex justify="flex-end" minWidth={32} {...props} />,
      value: ({ delegators }: Delegate) => <Flex justify="flex-end" minWidth={32}>{`${delegators.length}`}</Flex>,
    },
    {
      field: 'votes',
      label: 'Proposals Voted',
      header: ({ ...props }) => <Flex justify="flex-end" minWidth={32} {...props} />,
      value: ({ votes }: Delegate) => <Flex justify="flex-end" minWidth={32}>{`${votes.length}`}</Flex>,
    },
    {
      field: 'votingPower',
      label: 'Votes',
      header: ({ ...props }) => <Flex justify="flex-end" minWidth={32} {...props} />,
      value: ({ votingPower }: Delegate) => <Flex justify="flex-end" minWidth={32}>{`${votingPower.toFixed(2)}`}</Flex>,
    },
    {
      field: 'votingPower',
      label: 'Vote weight',
      header: ({ ...props }) => <Flex justify="flex-end" minWidth={32} {...props} />,
      value: ({ votingPower }: Delegate) => (
        <Flex justify="flex-end" minWidth={32}>{`${((votingPower / totalVotes) * 100).toFixed(2)}%`}</Flex>
      ),
    },
  ]

  if (isLoading) {
    return (
      <Container label="Delegate Top 100 - Updated every 15 min" description="Top delegates by voting weight">
        <SkeletonBlob skeletonHeight={6} noOfLines={4} />
      </Container>
    )
  }

  return (
    <Container label="Delegate Top 100 - Updated every 15 min" description="Top delegates by voting weight">
      <Table
        columns={columns}
        items={delegates.slice(0, 100)}
        keyName={'address'}
        onClick={({ address }: Delegate) => router.push(`/governance/delegates/${address}`)}
      />
    </Container>
  )
}

export const Stake = () => (
  <Layout>
    <Head>
      <title>{process.env.NEXT_PUBLIC_TITLE} - Delegates</title>
      <meta name="og:title" content="Inverse Finance - Governance" />
      <meta name="og:description" content="Top 100 delegates" />
      <meta name="og:image" content="https://images.ctfassets.net/kfs9y9ojngfc/6yAG6AVICeMaq6CPntNZqZ/d25e6524959cbba190f4af4b42dbfb83/cover-governance.png?w=3840&q=75" />
      <meta name="description" content="Inverse Finance DAO's top 100 delegates" />
      <meta name="keywords" content="Inverse Finance, dao, inv, token, proposal, governance, voting power, delegates" />
    </Head>
    <AppNav active="Governance" activeSubmenu="Delegates" />
    <Breadcrumbs
      w="7xl"
      breadcrumbs={[
        { label: 'Governance', href: '/governance' },
        { label: 'Delegates', href: '#' },
      ]}
    />
    <Flex w="full" align="center" direction="column">
      <Flex w={{ base: 'full', xl: '7xl' }} align="center">
        <DelegatesTable />
      </Flex>
    </Flex>
  </Layout>
)

export default Stake
