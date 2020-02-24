import React from 'react';
import { Query } from 'react-apollo';
import FontAwesome from 'react-fontawesome';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import { GET_MY_INTERNAL_USERS } from './channelQueries';
import { ErrorList } from './ErrorList.component';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import 'react-bootstrap-typeahead/css/Typeahead-bs4.css';

const ChannelInviteModal = ({
  title,
  isInviteChannelModalOpen,
  handleCancel,
  handleConfirm,
  InviteUsersToChannel,
  channel,
  invitedUsers,
  updateInvitedUsers
}) => (
  <Query query={GET_MY_INTERNAL_USERS}>
    {({ loading, error, data }) => {
      if (loading)
        return (
          <FontAwesome
            name="spinner"
            spin
            style={{ textShadow: '0 0.5px 0 rgba(0, 0, 0, 0.1' }}
          />
        );

      if (error) return <ErrorList errors={[error]} />;
      const users = data.getMyInternalUsers.users;

      return (
        <div>
          <Modal isOpen={isInviteChannelModalOpen}>
            <ModalHeader>{title}</ModalHeader>
            <ModalBody>
              <Typeahead
                id="channel-invite-invitee-typeahead"
                multiple={true}
                onChange={selected => {
                  // Handle selections...
                  updateInvitedUsers(selected);
                }}
                labelKey="firstNameLastName"
                options={users}
                maxHeight="500px"
                placeholder="Select Invitees..."
              />
            </ModalBody>
            <ModalFooter>
              <Button
                color="primary"
                onClick={e =>
                  handleConfirm({
                    handleInviteUsersToChannel: InviteUsersToChannel
                  })
                }
              >
                Invite
              </Button>{' '}
              <Button color="secondary" onClick={handleCancel}>
                Cancel
              </Button>
            </ModalFooter>
          </Modal>
        </div>
      );
    }}
  </Query>
);

export default ChannelInviteModal;
