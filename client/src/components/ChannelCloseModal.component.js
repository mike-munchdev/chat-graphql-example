import React from 'react';
import {
	Button,
	Modal,
	ModalBody,
	ModalFooter,
	ModalHeader,
	Input,
	FormGroup
} from 'reactstrap';

const ChannelCloseModal = ({
	title,
	isChannelCloseModalOpen,
	handleCancel,
	handleConfirm,
	CloseExternalChannel,
	canClose,
	closedReason,
	handleChange
}) => (
	<div>
		<Modal isOpen={isChannelCloseModalOpen}>
			<ModalHeader>{title}</ModalHeader>
			<ModalBody>
				<FormGroup>
					<div>Please enter a reason for closing this channel?</div>
					<Input
						type="text"
						placeholder="Reason"
						multiple
						className="form-control"
						name="closedReason"
						onChange={handleChange}
						value={closedReason}
					/>
				</FormGroup>
			</ModalBody>
			<ModalFooter>
				<Button
					color="primary"
					onClick={e => handleConfirm(CloseExternalChannel)}
					disabled={!canClose}
				>
					Close
				</Button>{' '}
				<Button color="secondary" onClick={handleCancel}>
					Cancel
				</Button>
			</ModalFooter>
		</Modal>
	</div>
);

export default ChannelCloseModal;
