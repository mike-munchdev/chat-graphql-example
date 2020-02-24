import React from 'react';
import { Query } from 'react-apollo';
import FontAwesome from 'react-fontawesome';
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  FormGroup,
  Input,
  Label
} from 'reactstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import { GET_MY_USERS } from './channelQueries';
import { ErrorList } from './ErrorList.component';
import { FormPage } from './FormPage.component';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import 'react-bootstrap-typeahead/css/Typeahead-bs4.css';

export class ChannelSearchModal extends FormPage {
  state = {
    keywords: '',
    members: [],
    startDate: '',
    endDate: '',
    assigned: 'my',
    status: 'open',
    assignedList: [
      { label: 'My Chats', value: 'my' },
      { label: 'Unassigned', value: 'un' },
      { label: 'All', value: 'all' }
    ],
    statusList: [
      { label: 'Open', value: 'open' },
      { label: 'Closed', value: 'closed' },
      { label: 'Flagged', value: 'flagged' }
    ]
  };
  componentDidMount() {}

  componentWillReceiveProps(nextProps) {
    if (nextProps.filters) {
      const {
        assigned,
        status,
        keywords,
        members,
        startDate,
        endDate
      } = nextProps.filters;

      this.setState({
        assigned,
        status,
        keywords,
        members,
        startDate,
        endDate
      });
    }
  }
  render() {
    const {
      title,
      isChannelSearchModalOpen,
      handleCancel,
      handleConfirm,
      filters
    } = this.props;

    return (
      <Query query={GET_MY_USERS}>
        {({ loading, error, data }) => {
          if (loading)
            return (
              <FontAwesome
                name="spinner"
                spin
                style={{
                  textShadow: '0 0.5px 0 rgba(0, 0, 0, 0.1'
                }}
              />
            );

          if (error) return <ErrorList errors={[error]} />;
          const users = data.getMyUsers.users || [];

          return (
            <div>
              <Modal isOpen={isChannelSearchModalOpen}>
                <ModalHeader>{title}</ModalHeader>
                <ModalBody>
                  <FormGroup>
                    <Input
                      type="select"
                      name="assigned"
                      id="assignedInput"
                      onChange={this.handleChange}
                      value={this.state.assigned}
                    >
                      {this.state.assignedList.map(a => (
                        <option key={a.value} value={a.value}>
                          {a.label}
                        </option>
                      ))}
                    </Input>
                  </FormGroup>
                  <FormGroup>
                    <Input
                      type="select"
                      name="status"
                      id="statusInput"
                      onChange={this.handleChange}
                      value={this.state.status}
                    >
                      {this.state.statusList.map(a => (
                        <option key={a.value} value={a.value}>
                          {a.label}
                        </option>
                      ))}
                    </Input>
                  </FormGroup>
                  <FormGroup>
                    <Typeahead
                      multiple={true}
                      onChange={selected => {
                        // Handle selections...
                        this.setState({
                          members: selected.map(m => {
                            return {
                              id: m.id,
                              firstNameLastName: m.firstNameLastName
                            };
                          })
                        });
                        // updateInvitedUsers(selected);
                      }}
                      labelKey="firstNameLastName"
                      options={users}
                      maxHeight="500px"
                      placeholder="Select User..."
                      id="invitationTypeAhead"
                      selected={this.state.members}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Input
                      type="text"
                      name="keywords"
                      id="keywords"
                      placeholder="Keywords"
                      value={this.state.keywords}
                      onChange={this.handleChange}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label className="ml-1" for="startDate">
                      Start Date
                    </Label>
                    <Input
                      type="date"
                      name="startDate"
                      id="startDate"
                      placeholder="Start Date"
                      onChange={this.handleChange}
                      value={this.state.startDate}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label className="ml-1" for="endDate">
                      End Date
                    </Label>
                    <Input
                      type="date"
                      name="endDate"
                      id="endDate"
                      placeholder="End Date"
                      onChange={this.handleChange}
                      value={this.state.endDate}
                    />
                  </FormGroup>
                </ModalBody>
                <ModalFooter>
                  <Button
                    color="primary"
                    onClick={e =>
                      handleConfirm({
                        filters: {
                          ...filters,
                          assigned: this.state.assigned,
                          status: this.state.status,
                          members: this.state.members,
                          keywords: this.state.keywords,
                          startDate: this.state.startDate,
                          endDate: this.state.endDate
                        }
                      })
                    }
                  >
                    Search
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
  }
}
