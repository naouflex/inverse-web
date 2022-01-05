import { SubmitButton } from '@inverse/components/common/Button';
import { Flex } from '@chakra-ui/react';
import { SuccessMessage } from '@inverse/components/common/Messages';
import { PlusSquareIcon, ViewIcon, EditIcon, CheckIcon, CheckCircleIcon } from '@chakra-ui/icons';

export const ProposalFormBtns = ({
    hasTitleAndDescrption,
    hasSuccess,
    previewMode,
    isFormValid,
    isPublicDraft,
    nbActions,
    draftId,
    handleSubmitProposal,
    handlePublishDraft,
    setPreviewMode,
    showTemplateModal,
    addAction,
}: {
    hasTitleAndDescrption: boolean,
    hasSuccess: boolean,
    previewMode: boolean,
    isFormValid: boolean,
    isPublicDraft?: boolean,
    nbActions: number,
    draftId?: number,
    handleSubmitProposal: () => void,
    handlePublishDraft: () => void,
    setPreviewMode: (v: boolean) => void,
    showTemplateModal: () => void,
    addAction: () => void,
}) => {
    return (
        <Flex justify="center" pt="5">
            {
                hasSuccess ?
                    <SuccessMessage description="Your proposal has been created ! It may take some time to appear" />
                    :
                    !previewMode ?
                        <>
                            {
                                nbActions < 20 ?
                                    <SubmitButton disabled={nbActions === 20 || !hasTitleAndDescrption} mr="1" w="fit-content" onClick={showTemplateModal}>
                                        <PlusSquareIcon mr="1" /> Add a Template Action
                                    </SubmitButton>
                                    : null
                            }
                            <SubmitButton disabled={nbActions === 20 || !hasTitleAndDescrption} ml="1" mr="1" w="fit-content" onClick={() => addAction()}>
                            <PlusSquareIcon mr="1" /> {nbActions === 20 ? 'Max number of actions reached' : 'Add an Empty Action'}
                            </SubmitButton>
                            <SubmitButton disabled={!isFormValid} ml="1" w="fit-content" onClick={() => setPreviewMode(true)}>
                                <ViewIcon mr="1" /> Preview Proposal
                            </SubmitButton>
                        </>
                        :
                        <>
                            <SubmitButton mr="1" w="fit-content" onClick={() => setPreviewMode(false)}>
                                <EditIcon mr="1" />Resume Editing
                            </SubmitButton>
                            
                            <SubmitButton disabled={!isFormValid} ml="1" w="fit-content" onClick={handlePublishDraft}>
                                <CheckIcon mr="1" /> { isPublicDraft && draftId ? 'Update' : 'Publish' } the Draft
                            </SubmitButton>
                            
                            <SubmitButton disabled={!isFormValid || !nbActions} ml="2" w="fit-content" onClick={handleSubmitProposal}>
                                <CheckCircleIcon mr="1" /> Submit the Proposal
                            </SubmitButton>
                        </>
            }
        </Flex>
    )
}