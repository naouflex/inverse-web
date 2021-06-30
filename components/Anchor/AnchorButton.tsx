import { Web3Provider } from '@ethersproject/providers'
import { AnchorOperations } from '@inverse/components/Anchor/AnchorModals'
import { SubmitButton } from '@inverse/components/Button'
import { ANCHOR_ETH } from '@inverse/config'
import { useApprovals } from '@inverse/hooks/useApprovals'
import { useBorrowBalances, useSupplyBalances } from '@inverse/hooks/useBalances'
import { Market } from '@inverse/types'
import { getAnchorContract, getCEtherContract, getERC20Contract } from '@inverse/util/contracts'
import { useWeb3React } from '@web3-react/core'
import { BigNumber, constants } from 'ethers'
import { formatUnits } from 'ethers/lib/utils'

type AnchorButtonProps = {
  operation: AnchorOperations
  asset: Market
  amount: BigNumber
  isDisabled: boolean
}

export const AnchorButton = ({ operation, asset, amount, isDisabled }: AnchorButtonProps) => {
  const { account, library } = useWeb3React<Web3Provider>()
  const { approvals } = useApprovals()
  const { balances: supplyBalances } = useSupplyBalances()
  const { balances: borrowBalances } = useBorrowBalances()

  const contract =
    asset.token === ANCHOR_ETH
      ? getCEtherContract(asset.token, library?.getSigner())
      : getAnchorContract(asset.token, library?.getSigner())

  switch (operation) {
    case AnchorOperations.supply:
      return asset.token !== ANCHOR_ETH && (!approvals || !parseFloat(formatUnits(approvals[asset.token]))) ? (
        <SubmitButton
          onClick={() =>
            getERC20Contract(asset.underlying.address, library?.getSigner()).approve(account, constants.MaxUint256)
          }
          isDisabled={isDisabled}
        >
          Approve
        </SubmitButton>
      ) : (
        <SubmitButton
          onClick={() => contract.mint(asset.token === ANCHOR_ETH ? { value: amount } : amount)}
          isDisabled={isDisabled}
        >
          Supply
        </SubmitButton>
      )

    case AnchorOperations.withdraw:
      return (
        <SubmitButton
          onClick={() => contract.redeemUnderlying(amount)}
          isDisabled={isDisabled || !supplyBalances || !parseFloat(formatUnits(supplyBalances[asset.token]))}
        >
          Withdraw
        </SubmitButton>
      )

    case AnchorOperations.borrow:
      return (
        <SubmitButton onClick={() => contract.borrow(amount)} isDisabled={isDisabled}>
          Borrow
        </SubmitButton>
      )

    case AnchorOperations.repay:
      return asset.token !== ANCHOR_ETH && (!approvals || !parseFloat(formatUnits(approvals[asset.token]))) ? (
        <SubmitButton
          onClick={() =>
            getERC20Contract(asset.underlying.address, library?.getSigner()).approve(account, constants.MaxUint256)
          }
          isDisabled={isDisabled}
        >
          Approve
        </SubmitButton>
      ) : (
        <SubmitButton
          isDisabled={isDisabled || !borrowBalances || !parseFloat(formatUnits(borrowBalances[asset.token]))}
          onClick={() => contract.repayBorrow(asset.token === ANCHOR_ETH ? { value: amount } : amount)}
        >
          Repay
        </SubmitButton>
      )
  }

  return <></>
}