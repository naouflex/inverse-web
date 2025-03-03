import { Text, Flex, HStack } from '@chakra-ui/react';
import { AnimatedInfoTooltip } from '@app/components/common/Tooltip';
import { SlippageRadioGroup } from '@app/components/common/Input/SlippageRadioGroup';
import { Token } from '@app/types';

export const BondSlippage = ({
    maxSlippage,
    toToken,
    toAmount,
    onChange,
}: {
    maxSlippage: number,
    toToken: Token,
    toAmount: string,
    onChange: (v: string) => void,
}) => {
    const minReceived = toAmount === '' ? '0' : (parseFloat(toAmount) - (parseFloat(toAmount) * maxSlippage / 100))
    const color = 'whiteAlpha.800'

    return (
        <HStack alignItems="center" color={color} w='full' spacing="2">
            <Flex flexDirection={{ base: 'column', sm: 'row' }}>
                <Text minW="120px" color={color} display="flex" alignItems="center" justifyContent={{ base: 'center', sm: 'left' }} w="full" fontSize="12px" mr="2">
                    <AnimatedInfoTooltip type="tooltip" size="intermediary" message="The maximum slippage accepted for the bond, if the slippage exceeds the maximum chosen the transaction will fail." />
                    Max. slippage :
                </Text>
                <SlippageRadioGroup defaultValue={maxSlippage.toString()} onChange={onChange} />
            </Flex>
            <Flex flexDirection={{ base: 'column', sm: 'row' }} color={color} display="flex" alignItems="center" justifyContent={{ base: 'center', sm: 'right' }} w="full" fontSize="12px" ml="2">
                <Text color={color}>
                    <AnimatedInfoTooltip type="tooltip" size="intermediary" message={`The minimum amount of ${toToken.symbol} that you will receive`} />
                    Min. received&nbsp;:&nbsp;
                </Text>
                <Text color={color}><b>{minReceived}</b></Text>
            </Flex>
        </HStack>
    )
}