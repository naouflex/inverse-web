import { Flex, Stack, Text } from '@chakra-ui/react'
import Button from '@inverse/components/landing/Button'

const background = {
  bgImage: '/assets/landing/space.png',
  bgRepeat: 'no-repeat',
  bgPosition: 'center top',
}

export const Banner = () => (
  <Flex w="full" h={{ base: 800, md: 900 }} direction="column" align="center" {...background}>
    <Stack
      p={{ base: 4, xl: 0 }}
      mt={{ base: 4, xl: 32 }}
      ml={{ base: 0, xl: '32rem' }}
      textAlign={{ base: 'center', xl: 'start' }}
      maxWidth="2xl"
      spacing={4}>
      <Text lineHeight={1} fontSize={{ base: '5xl', md: '6xl' }} fontWeight="extrabold">
        Invade Traditional Finance with DeFi
      </Text>
      <Text fontSize={{ base: 'lg', md: 'xl' }}>
        Inverse is building a suite of DeFi tools, governed by one of the most active DAO in the
        space. From a capital-efficient money market, to tokenized synthetic assets, traditional
        finance is about to be invaded.
      </Text>
      <Stack direction="row" spacing={4}>
        <Flex width={{ base: 'full', xl: 32 }}>
          <Button>Enter App</Button>
        </Flex>
        <Flex width={{ base: 'full', xl: 32 }}>
          <Button>Learn More</Button>
        </Flex>
      </Stack>
    </Stack>
  </Flex>
)

export default Banner
