import { ProposalFormActionFields } from '@inverse/types';
import { useState } from 'react'
import { FormControl, FormLabel, Text, Box, Flex, Divider } from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { ProposalInput } from './ProposalInput';

export const ProposalFormAction = ({
    action,
    index,
    onChange,
    onDelete,
    onFuncChange,
}: {
    action: ProposalFormActionFields,
    index: number,
    onChange: (field: string, e: any) => void,
    onDelete: () => void,
    onFuncChange: (e: any) => void,
}) => {
    const { contractAddress, func, args, value } = action
    const [hideBody, setHideBody] = useState(false)

    const handleArgChange = (e: any, i: number) => {
        const newArgs = [...args];
        newArgs[i] = { ...newArgs[i], value: e.currentTarget.value };
        onChange('args', newArgs);
    }

    const argInputs = args.map((arg, i) => {
        return (
            <FormControl key={i}>
                <FormLabel>Argument #{i + 1} ({arg.type})</FormLabel>
                <ProposalInput value={arg.value || ''} placeholder="Argument data" onChange={(e: any) => handleArgChange(e, i)} />
            </FormControl>
        )
    })

    return (
        <Box bgColor="purple.700" borderRadius="5" p="4">
            <Flex alignItems="center">
                <Text fontWeight="bold" cursor="pointer" fontSize="20" onClick={() => setHideBody(!hideBody)}>
                    Action #{index + 1}
                </Text>
                <DeleteIcon ml="2" cursor="pointer" color="red.400" onClick={onDelete} />
            </Flex>
            {
                hideBody ? null :
                    <>
                        <Divider mt="2" mb="2" />
                        <FormControl>
                            <FormLabel >Contract Address</FormLabel>
                            <ProposalInput placeholder="0x..." value={contractAddress} onChange={(e: any) => onChange('contractAddress', e.currentTarget.value)} />
                        </FormControl>
                        <FormControl>
                            <FormLabel mt="2">Value (wei)</FormLabel>
                            <ProposalInput placeholder="10000000000000000" value={value} onChange={(e: any) => onChange('value', e.currentTarget.value)} />
                        </FormControl>
                        <FormControl>
                            <FormLabel mt="2">Contract Function</FormLabel>
                            <ProposalInput placeholder="transfer(address,uint)" value={func} onChange={onFuncChange} />
                        </FormControl>
                        {
                            args?.length ?
                                <FormControl pl="5" mt="2">
                                    {argInputs}
                                </FormControl>
                                : null
                        }
                    </>
            }
        </Box>
    )
}