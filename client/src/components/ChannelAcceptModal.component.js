import React from 'react';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

const ChannelAcceptModal = ({
	title,
	isChannelAcceptModalOpen,
	handleCancel,
	handleConfirm,
	AcceptExternalChannel,
	channel
}) => (
	<div>
		<Modal isOpen={isChannelAcceptModalOpen}>
			<ModalHeader>{title}</ModalHeader>
			<ModalBody>
				Are you sure you want to take responsibility for this channel?
			</ModalBody>
			<ModalFooter>
				<Button
					color="primary"
					onClick={e =>
						handleConfirm({
							handleAcceptExternalChannel: AcceptExternalChannel
						})
					}
				>
					Accept
				</Button>{' '}
				<Button color="secondary" onClick={handleCancel}>
					Cancel
				</Button>
			</ModalFooter>
		</Modal>
	</div>
);

export default ChannelAcceptModal;
