import { Web3Provider } from '@ethersproject/providers'
import { UNDERLYING } from '@inverse/config'
import useEtherSWR from '@inverse/hooks/useEtherSWR'
import { SWR } from '@inverse/types'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'

type Approvals = {
  approvals: { [key: string]: BigNumber }
}

export const useApprovals = (): SWR & Approvals => {
  const tokens = Object.entries(UNDERLYING).filter(([_, { address }]) => address)

  const { account } = useWeb3React<Web3Provider>()
  const { data, error } = useEtherSWR(
    tokens.map(([address, underlying]) => [underlying.address, 'allowance', account, address])
  )

  return {
    approvals: data?.reduce((approvals: { [key: string]: BigNumber }, approval: BigNumber, i: number) => {
      approvals[tokens[i][0]] = approval
      return approvals
    }, {}),
    isLoading: !error && !data,
    isError: error,
  }
}