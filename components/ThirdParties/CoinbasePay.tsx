import { Box, ButtonProps, Image, Spinner, useDisclosure } from '@chakra-ui/react';
import { generateOnRampURL } from '@coinbase/cbpay-js';
import { useState } from 'react';
import { SubmitButton } from '@app/components/common/Button';
import { Modal } from '@app/components/common/Modal';

const appId = '033abd6f-0903-4abc-bc2f-fed226b408a2';

export const CoinbasePayButton = ({
    account,
    text = 'Coinbase Pay',
    children,
    ...props
}: {
    account: string
    text?: string
} & ButtonProps) => {
    const { isOpen, onClose, onOpen } = useDisclosure();
    const [url, setUrl] = useState('');

    const handleClick = () => {
        const newUrl = generateOnRampURL({
            appId,
            destinationWallets: [
                {
                    address: account,
                    blockchains: ['ethereum'],
                },
            ],
        })
        setUrl(newUrl);
        onOpen();
    };

    const handleClose = () => {
        setUrl('');
        onClose();
    }

    return <>
        <Modal
            header="On-Ramp with Coinbase"
            isOpen={isOpen && !!url}
            onClose={handleClose}
            size={'2xl'}
            p="10px"
        >
            <Spinner
                zIndex="-1"
                position="absolute"
                margin="auto"
                top="0"
                bottom="0"
                left="0"
                right="0"
            />
            <iframe
                width='100%'
                height='500px'
                src={url}
            />
        </Modal>
        {
            children ? 
                <Box display="inherit" w='full' onClick={handleClick}>
                    {children}
                </Box> :
                <SubmitButton
                    {...props}
                    color="mainTextColor"
                    w='fit-content'
                    onClick={handleClick}
                    isLoading={isOpen && !url}
                    disabled={!account}
                >
                    {text} <Image src="/assets/projects/coinbase.svg" h="20px" ml="2" />
                </SubmitButton>
        }
    </>
};