export const INV = '0x41D5D79431A913C4aE7d69a668ecdfE5fF9DFB68'
export const DOLA = '0x865377367054516e17014CcdED1e7d814EDC9ce4'
export const DAI = '0x6B175474E89094C44Da98b954EedeAC495271d0F'
export const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
export const WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
export const YFI = '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e'
export const XSUSHI = '0x8798249c2E607446EfB7Ad49eC89dD1865Ff4272'
export const WBTC = '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'
export const XINV = '0x65b35d6Eb7006e0e607BC54EB2dFD459923476fE'

export const mainnetConfig = {
  INV,
  DOLA,
  DAI,
  USDC,
  WETH,
  YFI,
  XSUSHI,
  WBTC,
  XINV,
  vaults: {
    vaultUsdcEth: '0x89eC5dF87a5186A0F0fa8Cb84EdD815de6047357',
    vaultDaiWbtc: '0xc8f2E91dC9d198edEd1b2778F6f2a7fd5bBeac34',
    vaultDaiYfi: '0x41D079ce7282d49bf4888C71B5D9E4A02c371F9B',
    vaultDaiEth: '0x2dCdCA085af2E258654e47204e483127E0D8b277',
  },
  anchor: {
    comptroller: '0x4dcf7407ae5c07f8681e1659f626e114a7667339',
    stabilizer: '0x7eC0D931AFFBa01b77711C2cD07c76B970795CDd',
    treasury: '0x926df14a23be491164dcf93f4c468a50ef659d5b',
    markets: {
      eth: '0x697b4acAa24430F254224eB794d2a85ba1Fa1FB8',
      dola: '0x7Fcb7DAC61eE35b3D4a51117A7c58D53f0a8a670',
      xsushi: '0xD60B06B457bFf7fc38AC5E7eCE2b5ad16B288326',
      wbtc: '0x17786f3813E6bA35343211bd8Fe18EC4de14F28b',
      yfi: '0xde2af899040536884e062D3a334F2dD36F34b4a4',
    },
  },
  governance: '0x35d9f4953748b318f18c30634bA299b237eeDfff',
  tokens: {
    ETH: {
      address: '',
      name: 'Ethereum',
      symbol: 'ETH',
      coingeckoId: 'ethereum',
      image: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
      decimals: 18,
    },
    [INV]: {
      address: INV,
      name: 'Inverse',
      symbol: 'INV',
      coingeckoId: 'inverse-finance',
      image: '/assets/favicon.png',
      decimals: 18,
    },
    [DOLA]: {
      address: DOLA,
      name: 'Dola',
      symbol: 'DOLA',
      coingeckoId: 'dola-usd',
      image: 'https://assets.coingecko.com/coins/images/14287/small/anchor-logo-1-200x200.png',
      decimals: 18,
    },
    [DAI]: {
      address: DAI,
      name: 'Dai',
      symbol: 'DAI',
      coingeckoId: 'dai',
      image: 'https://assets.coingecko.com/coins/images/9956/small/dai-multi-collateral-mcd.png',
      decimals: 18,
    },
    [USDC]: {
      address: USDC,
      name: 'USD Coin',
      symbol: 'USDC',
      coingeckoId: 'usd-coin',
      image: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png',
      decimals: 6,
    },
    [WETH]: {
      address: WETH,
      name: 'Wrapped Ethereum',
      symbol: 'WETH',
      coingeckoId: 'weth',
      image: 'https://assets.coingecko.com/coins/images/2518/small/weth.png',
      decimals: 18,
    },
    [YFI]: {
      address: YFI,
      name: 'Yearn',
      symbol: 'YFI',
      coingeckoId: 'yearn-finance',
      image: 'https://assets.coingecko.com/coins/images/11849/small/yfi-192x192.png',
      decimals: 18,
    },
    [XSUSHI]: {
      address: XSUSHI,
      name: 'xSUSHI',
      symbol: 'XSUSHI',
      coingeckoId: 'xsushi',
      image: 'https://assets.coingecko.com/coins/images/13725/small/xsushi.png',
      decimals: 18,
    },
    [WBTC]: {
      address: WBTC,
      name: 'Wrapped Bitcoin',
      symbol: 'WBTC',
      coingeckoId: 'wrapped-bitcoin',
      image: 'https://assets.coingecko.com/coins/images/7598/small/wrapped_bitcoin_wbtc.png',
      decimals: 8,
    },
  },
}
