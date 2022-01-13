import { BigNumber, Contract } from 'ethers'
import { formatEther } from 'ethers/lib/utils'
import 'source-map-support'
import { ERC20_ABI, FED_ABI, XCHAIN_FED_ABI } from '@inverse/config/abis'
import { getNetworkConfig, getNetworkConfigConstants } from '@inverse/config/networks'
import { getProvider } from '@inverse/util/providers';
import { getCacheFromRedis, redisSetWithTimestamp } from '@inverse/util/redis'
import { NetworkIds, xChainFed } from '@inverse/types';
import { namedAddress } from '@inverse/util'

export default async function handler(req, res) {

  const { DOLA, INV, DAI, FEDS, XCHAIN_FEDS, TREASURY } = getNetworkConfigConstants(NetworkIds.mainnet);
  const ftmConfig = getNetworkConfig(NetworkIds.ftm, false);
  const cacheKey = `dao-cache`;

  try {

    const validCache = await getCacheFromRedis(cacheKey, true, 300);
    if(validCache) {
      res.status(200).json(validCache);
      return
    }

    const provider = getProvider(NetworkIds.mainnet);
    const dolaContract = new Contract(DOLA, ERC20_ABI, provider);
    const invContract = new Contract(INV, ERC20_ABI, provider);
    const daiContract = new Contract(DAI, ERC20_ABI, provider);

    let invFtmTotalSupply = BigNumber.from('0');
    let dolaFtmTotalSupply = BigNumber.from('0');

    // public rpc for fantom, less reliable
    try {
      const ftmProvider = getProvider(NetworkIds.ftm);
      const dolaFtmContract = new Contract(ftmConfig?.DOLA, ERC20_ABI, ftmProvider);
      const invFtmContract = new Contract(ftmConfig?.INV, ERC20_ABI, ftmProvider);
      dolaFtmTotalSupply = await dolaFtmContract.totalSupply();
      invFtmTotalSupply = await invFtmContract.totalSupply();
    } catch(e) {

    }
    
    const [
      dolaTotalSupply,
      invTotalSupply,
      dolaTreasuryBal,
      invTreasuryBal,
      daiTreasuryBal,
      ...fedSupplies
    ] = await Promise.all([
      dolaContract.totalSupply(),
      invContract.totalSupply(),
      dolaContract.balanceOf(TREASURY),
      invContract.balanceOf(TREASURY),
      daiContract.balanceOf(TREASURY),
      ...FEDS.map((fedAddress: string) => {
        const fedContract = new Contract(fedAddress, FED_ABI, provider);
        return fedContract.supply();
      }),
    ])

    const xChainFedsResults = await Promise.allSettled([
      ...XCHAIN_FEDS.map((xChainFed: xChainFed) => {
        const xChainProvider = getProvider(xChainFed.chainId);
        const xChainFedContract = new Contract(xChainFed.address, XCHAIN_FED_ABI, xChainProvider);
        return xChainFedContract.dstSupply();
      })
    ]);

    const xChainFedsSupplies = xChainFedsResults.map(r => r.status === 'fulfilled' ? r.value : BigNumber.from('0'))

    const resultData = {
      dolaTotalSupply: parseFloat(formatEther(dolaTotalSupply)),
      invTotalSupply: parseFloat(formatEther(invTotalSupply)),
      treasury: {
        dolaBalance: parseFloat(formatEther(dolaTreasuryBal)),
        invBalance: parseFloat(formatEther(invTreasuryBal)),
        daiBalance: parseFloat(formatEther(daiTreasuryBal)),
      },
      fantom: {
        dolaTotalSupply: parseFloat(formatEther(dolaFtmTotalSupply)),
        invTotalSupply: parseFloat(formatEther(invFtmTotalSupply)),
      },
      fedSupplies: FEDS.map((fedAd, i) => ({
        address: fedAd,
        chainId: NetworkIds.mainnet,
        name: namedAddress(fedAd),
        supply: parseFloat(formatEther(fedSupplies[i])),
      })).concat(
        XCHAIN_FEDS.map((xChainFed, i) => {
          return {
            ...xChainFed,
            supply: parseFloat(formatEther(xChainFedsSupplies[i])),
          }
        })
      )
    }

    await redisSetWithTimestamp(cacheKey, resultData);

    res.status(200).json(resultData)
  } catch (err) {
    console.error(err);
    // if an error occured, try to return last cached results
    try {
      const cache = await getCacheFromRedis(cacheKey, false);
      if (cache) {
        console.log('Api call failed, returning last cache found');
        res.status(200).json(cache);
      }
    } catch (e) {
      console.error(e);
    }
  }
}
