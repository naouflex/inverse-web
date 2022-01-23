import { Contract, Event } from 'ethers'
import 'source-map-support'
import { getNetworkConfigConstants } from '@inverse/config/networks'
import { getProvider } from '@inverse/util/providers';
import { getCacheFromRedis, redisSetWithTimestamp } from '@inverse/util/redis'
import { FedEvent, NetworkIds } from '@inverse/types';
import { getBnToNumber } from '@inverse/util/markets'
import { getRedisClient } from '@inverse/util/redis';

const client = getRedisClient()

const getEvents = (fedAd: string, abi: string[], chainId: NetworkIds) => {
  const provider = getProvider(chainId);
  const contract = new Contract(fedAd, abi, provider);
  return Promise.all([
    contract.queryFilter(contract.filters.Contraction()),
    contract.queryFilter(contract.filters.Expansion()),
  ])
}

const getTimestamps = (rawEvents: [Event[], Event[]], chainId: NetworkIds) => {
  const provider = getProvider(chainId);
  const events = rawEvents[0].concat(rawEvents[1]);
  return Promise.all(
    events.map(rawEvent => provider.getBlock(rawEvent.blockNumber))
  )
}

const getEventDetails = (log: Event, timestamp: number, fedIndex: number) => {
  const { event, blockNumber, transactionHash, args } = log;
  const isContraction = event === 'Contraction';
  return {
    event,
    fedIndex,
    isContraction,
    blockNumber,
    transactionHash,
    value: getBnToNumber(args![0]) * (isContraction ? -1 : 1),
    timestamp,
  }
}

export default async function handler(req, res) {

  const { FEDS } = getNetworkConfigConstants(NetworkIds.mainnet);
  const cacheKey = `fed-history-cache-v1.0.4`;

  try {

    const validCache = await getCacheFromRedis(cacheKey, true, 900);
    if (validCache) {
      res.status(200).json(validCache);
      return
    }

    const rawEvents = await Promise.all([
      ...FEDS.map(fed => getEvents(fed.address, fed.abi, fed.chainId))
    ]);

    const blockTimestamps: { [key: string]: { [key: string]: number } } = JSON.parse(await client.get('block-timestamps') || '{}');

    // first time
    if (!blockTimestamps[NetworkIds.mainnet]) {
      const timestamps = await Promise.all([
        ...FEDS.map((fed, i) => getTimestamps(rawEvents[i], fed.chainId))
      ]);
      FEDS.forEach((fed, fedIndex) => {
        const events = rawEvents[fedIndex][0].concat(rawEvents[fedIndex][1]);
        events.forEach((event, eventIndex) => {
          if (!blockTimestamps[fed.chainId]) {
            blockTimestamps[fed.chainId] = {};
          }
          blockTimestamps[fed.chainId][event.blockNumber] = timestamps[fedIndex][eventIndex].timestamp;
        })
      })
    }

    // get timestamps for new blocks
    for (let [fedIndex, fed] of FEDS.entries()) {
      const events = rawEvents[fedIndex][0].concat(rawEvents[fedIndex][1]);
      const provider = getProvider(fed.chainId);
      for (let event of events) {
        if (!blockTimestamps[fed.chainId]) {
          blockTimestamps[fed.chainId] = {};
        }
        if (!blockTimestamps[fed.chainId][event.blockNumber]) {
          const block = await provider.getBlock(event.blockNumber);
          blockTimestamps[fed.chainId][event.blockNumber] = block.timestamp;
        }
      }
    }

    let totalAccumulatedSupply = 0;

    const totalEvents = FEDS
      .map((fed, fedIndex) => {
        let accumulatedSupply = 0;
        return {
          ...fed,
          events: rawEvents[fedIndex][0].concat(rawEvents[fedIndex][1])
            .sort((a, b) => a.blockNumber - b.blockNumber)
            .map(e => {
              return getEventDetails(e, blockTimestamps[fed.chainId][e.blockNumber], fedIndex)
            })
            .map(e => {
              accumulatedSupply += e.value;
              return { ...e, newSupply: accumulatedSupply }
            })
        }
      })
      .reduce((prev, curr) => prev.concat(curr.events), [] as FedEvent[])
      .sort((a, b) => a.timestamp - b.timestamp)
      .map(event => {
        totalAccumulatedSupply += event.value
        return { ...event, newTotalSupply: totalAccumulatedSupply }
      })

    const resultData = {
      totalEvents,
    }

    await client.set('block-timestamps', JSON.stringify(blockTimestamps));

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
