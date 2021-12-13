import { useState } from 'react'
import { FormControl, FormLabel, VStack } from '@chakra-ui/react'
import { AddressAutocomplete } from '@inverse/components/common/Input/AddressAutocomplete'
import ScannerLink from '@inverse/components/common/ScannerLink'
import { isAddress } from 'ethers/lib/utils'
import { SubmitButton } from '@inverse/components/common/Button'
import { useEffect } from 'react';
import { AutocompleteItem, NetworkIds, TemplateProposalFormActionFields, Token } from '@inverse/types'
import { getNetworkConfigConstants } from '@inverse/config/networks';
import { RadioCardGroup } from '@inverse/components/common/Input/RadioCardGroup'

const { COMPTROLLER, CONTRACTS } = getNetworkConfigConstants(NetworkIds.mainnet)

const anchorContractsList = Object.entries(CONTRACTS)
    .filter(([address, label]) => label.startsWith('an'))
    .map(([address, label]) => {
        return { value: address, label }
    })

const LABELS = {
    _setMintPaused: 'Pause supplying',
    _setBorrowPaused: 'Pause borrowing',
}

export const AnchorTemplate = ({
    defaultAddress = '',
    defaultValue = '',
    onSubmit,
    type,
}: {
    defaultAddress?: string,
    defaultValue?: string,
    type: '_setMintPaused' | '_setBorrowPaused',
    onSubmit: (action: TemplateProposalFormActionFields) => void,
}) => {
    const [address, setAddress] = useState(defaultAddress);
    const [value, setValue] = useState(defaultValue);
    const [isDisabled, setIsDisabled] = useState(true);

    useEffect(() => {
        setIsDisabled(!['true', 'false'].includes(value) || !address || !isAddress(address))
    }, [value, address])

    const handleValueChange = (val: string) => {
        setValue(val)
    }

    const handleAddressChange = (item: AutocompleteItem | undefined) => {
        setAddress(item?.value || '')
    }

    const handleSubmit = () => {
        const action: TemplateProposalFormActionFields = {
            contractAddress: COMPTROLLER,
            func: `${type}(address anMarket, bool value)`,
            args: [
                { type: 'address', value: address, name: 'destination' },
                { type: 'bool', value: value, name: 'value' },
            ],
            value: '0',
        }
        onSubmit(action)
    }

    return (
        <VStack spacing="2">
            <FormControl>
                <FormLabel>
                    Anchor Market :
                    {
                        defaultAddress && isAddress(defaultAddress) ?
                            <ScannerLink value={defaultAddress} shorten={true} /> : null
                    }
                </FormLabel>
                <AddressAutocomplete
                    title="Available Anchor Markets : "
                    list={anchorContractsList}
                    defaultValue={defaultAddress}
                    onItemSelect={handleAddressChange}
                />
            </FormControl>
            <FormControl>
                <FormLabel>
                    {LABELS[type]} for this market ? :
                </FormLabel>
                {/* <Input defaultValue={defaultValue} onChange={handleValueChange} /> */}
                <RadioCardGroup
                wrapperProps={{ w: 'full', justify: 'center' }}
                    group={{
                        name: 'bool',
                        defaultValue,
                        onChange: handleValueChange,
                    }}
                    radioCardProps={{ w: '80px', textAlign: 'center', p: '1' }}
                    options={[{ label: 'Yes', value: 'true' }, { label: 'No', value: 'false' }]}
                />
            </FormControl>
            <SubmitButton isDisabled={isDisabled} onClick={handleSubmit}>
                ADD ACTION
            </SubmitButton>
        </VStack>
    )
}