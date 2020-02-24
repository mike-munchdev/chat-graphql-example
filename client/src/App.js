import React, { Fragment } from 'react';
import ReactDOM from 'react-dom';

import { ApolloProvider } from 'react-apollo';
import { Query, Subscription } from 'react-apollo';
import { isEqual } from 'lodash';
import FontAwesome from 'react-fontawesome';
import createClient from './apollo';
import {
  GET_CHANNELS_WITH_FILTERS,
  CHANNEL_ADDED_SUBSCRIPTION,
  CHANNEL_UPDATED_SUBSCRIPTION
} from './components/channelQueries';
import {
  channelAddedUpdate,
  channelUpdatedUpdate,
  markChannelViewedUpdate,
  closeExternalChannelUpdate,
  acceptExternalChannelUpdate
} from './components/mutationUpdates';

import { ErrorList } from './components/ErrorList.component';
import './components/Support.css';
import { FormPage } from './components/FormPage.component';

import { GetChannels } from './components/GetChannels.component';
import { ChannelOperations } from './components/ChannelOperations.component';
import { ChannelMessages } from './components/ChannelMessages.component';
import { ChannelListSearch } from './components/ChannelListSearch.component';
import { ChannelFilter } from './components/ChannelFilter.component';
import { SendMessage } from './components/SendMessage.component';
import { ChannelAlerts } from './components/ChannelAlerts.component';
import {
  defaultFilters,
  defaultSingleChannelFilters,
  defaultUnassignedFilters
} from './components/mutationUpdates';

class App extends FormPage {
  messagesEndRef;

  state = {
    channel: null,
    messageText: '',
    errors: [],
    filters: null,
    assignedToId: null,
    isChannelCloseModalOpen: false,
    isChannelAcceptModalOpen: false,
    isInviteChannelModalOpen: false,
    invitedUsers: [],
    closedReason: '',
    isChannelSearchModalOpen: false,
    channels: [],
    allowRerender: true,
    uniqueId: null,
    apolloClient: null
  };

  async componentWillMount() {
    if (!this.state.apolloClient) {
      const apolloClient = await createClient();
      this.setState({ apolloClient });
    }
    if (this.props.match.params.id) {
      this.setState({
        uniqueId: this.props.match.params.id,
        filters: {
          ...defaultSingleChannelFilters,
          uniqueId: this.props.match.params.id
        }
      });
    } else {
      this.setState({ filters: defaultFilters });
    }
  }
  scrollToBottom = () => {
    if (this.messagesEndRef) {
      this.messagesEndRef.scrollIntoView({
        block: 'nearest',
        inline: 'start'
      });
    }
  };
  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleAddMessageToChannel = async handleSendMessageToChannel => {
    const {
      data: { sendMessageToChannel }
    } = await handleSendMessageToChannel({
      variables: {
        message: {
          channelId: Number(this.state.channel.id),
          text: this.state.messageText
        }
      }
    });

    let errors = [];
    if (!sendMessageToChannel.ok) {
      errors = sendMessageToChannel.errors;
    }

    this.setState({ messageText: '', errors, allowRerender: true });
  };

  setSelectedChannel = (channelId, filters = defaultFilters) => {
    const channel = this.state.channels.find(c => c.id === channelId);

    if (channel) {
      this.setState({ channel });
    } else {
      this.setState({ filters, allowRerender: true }, () => {
        this.setState({ channel });
      });
    }
  };

  handleChannelSelected = async (channel, handleMarkChannelViewed) => {
    const {
      data: { markChannelViewed }
    } = await handleMarkChannelViewed({
      variables: {
        channelId: Number(channel.id)
      }
    });

    let errors = [];
    if (!markChannelViewed.ok) {
      errors = markChannelViewed.errors;
    }

    const { channels } = markChannelViewedUpdate({
      filters: this.state.filters,
      channels: this.state.channels,
      channel: markChannelViewed.channel
    });

    this.setState({
      channels,
      errors,
      channel: channel,
      assignedToId: channel.assignedTo ? channel.assignedTo.id : null,
      messageText: ''
    });
  };

  handleUpdateFilters = filters => {
    this.setState({
      filters,
      allowRerender: true,
      channel: null
    });
  };

  showCloseChannelModal = () => {
    this.setState({
      isChannelCloseModalOpen: true,
      closedReason: ''
    });
  };

  handleCloseChannelCancel = () => {
    this.setState({
      isChannelCloseModalOpen: false,
      closedReason: ''
    });
  };

  handleCloseChannelConfirm = async handleCloseExternalChannel => {
    const {
      data: { closeExternalChannel }
    } = await handleCloseExternalChannel({
      variables: {
        channelId: Number(this.state.channel.id),
        reason: this.state.closedReason
      }
    });

    let errors = [];
    let channels = this.state.channels;
    if (!closeExternalChannel.ok) {
      errors = closeExternalChannel.errors;
    } else {
      channels = closeExternalChannelUpdate({
        channels: this.state.channels,
        filters: this.state.filters,
        channel: closeExternalChannel.channel
      });
    }

    this.setState({
      channels,
      isChannelCloseModalOpen: false,
      closedReason: '',
      errors,
      filters: defaultFilters,
      channel: null,
      allowRerender: true
    });
  };

  handleAcceptChannelConfirm = async ({ handleAcceptExternalChannel }) => {
    const {
      data: { acceptExternalChannel }
    } = await handleAcceptExternalChannel({
      variables: {
        channelId: Number(this.state.channel.id)
      }
    });

    let errors = [];

    if (!acceptExternalChannel.ok) {
      errors = acceptExternalChannel.errors;
    } else {
      acceptExternalChannelUpdate({
        channels: this.state.channels,
        filters: this.state.filters,
        channel: acceptExternalChannel.channel
      });
    }

    this.setState({
      isChannelAcceptModalOpen: false,
      errors,
      filters: defaultFilters,
      allowRerender: true,
      channel: acceptExternalChannel.channel
    });
  };

  showAcceptChannelModal = () => {
    this.setState({
      isChannelAcceptModalOpen: true
    });
  };

  handleAcceptChannelCancel = () => {
    this.setState({
      isChannelAcceptModalOpen: false
    });
  };

  handleInviteChannelConfirm = async ({ handleInviteUsersToChannel }) => {
    const {
      data: { inviteUsersToChannel }
    } = await handleInviteUsersToChannel({
      variables: {
        invitations: {
          channelId: Number(this.state.channel.id),
          users: this.state.invitedUsers
        }
      }
    });

    let errors = [];
    if (!inviteUsersToChannel.ok) {
      errors = inviteUsersToChannel.errors;
    }

    this.setState({
      isInviteChannelModalOpen: false,
      errors,
      filters: defaultFilters,
      allowRerender: true
    });
  };

  showInviteChannelModal = () => {
    this.setState({
      isInviteChannelModalOpen: true
    });
  };

  handleInviteChannelCancel = () => {
    this.setState({
      isInviteChannelModalOpen: false
    });
  };

  handleUpdateInvitedUsers = users => {
    const invitedUsers = users.map(u => Number(u.id));

    this.setState({
      invitedUsers: invitedUsers
    });
  };

  handleSearchChannelConfirm = async ({ filters }) => {
    this.setState({
      filters,
      isChannelSearchModalOpen: false,
      channel: null,
      allowRerender: true
    });
  };

  showChannelSearchModal = () => {
    this.setState({
      isChannelSearchModalOpen: true
    });
  };

  handleSearchChannelCancel = () => {
    this.setState({
      isChannelSearchModalOpen: false
    });
  };

  handleDisplayErrors = errors => {
    this.setState({
      errors
    });
  };
  get canSend() {
    if (!this.state.channel) return false;

    const member = this.state.channel.members.find(
      m => m.user.id === this.props.login.user.id
    );

    return this.state.messageText.length > 0 && member;
  }

  get canViewHistory() {
    return true;
  }

  get canClose() {
    return this.state.closedReason;
  }

  render() {
    if (this.state.errors.length > 0)
      return <ErrorList errors={this.state.errors} />;
    return this.state.filters && this.state.apolloClient ? (
      <ApolloProvider client={this.state.apolloClient}>
        <Subscription
          subscription={CHANNEL_UPDATED_SUBSCRIPTION}
          onSubscriptionData={({ client, subscriptionData }) => {
            const { channelUpdated } = subscriptionData.data;

            const channelIndex = this.state.channels.findIndex(
              c => c.id === channelUpdated.channel.id
            );
            if (channelIndex >= 0) {
              const { channels } = channelUpdatedUpdate({
                filters: this.state.filters,
                channels: this.state.channels,
                channelUpdated
              });

              let channel;
              if (this.state.channel) {
                channel = channels.find(c => c.id === this.state.channel.id);
              }

              if (channel) {
                this.setState({
                  channels,
                  channel
                });
              } else {
                this.setState({
                  channels,
                  channel: null
                });
              }
            }
          }}
          fetchPolicy="network-only"
        >
          {({ data, loading }) => {
            return (
              <Subscription
                subscription={CHANNEL_ADDED_SUBSCRIPTION}
                onSubscriptionData={({ client, subscriptionData }) => {
                  const { channelAdded } = subscriptionData.data;

                  if (isEqual(this.state.filters, defaultUnassignedFilters)) {
                    const channels = channelAddedUpdate({
                      filters: this.state.filters,
                      channels: this.state.channels,
                      channel: channelAdded.channel
                    });
                    const channel = channels.find(
                      c => c.id === this.state.channel.id
                    );

                    if (channel) {
                      this.setState({
                        channels,
                        channel
                      });
                    } else {
                      this.setState({
                        channels,
                        channel: channelAdded.channel
                      });
                    }
                  }
                }}
                fetchPolicy="network-only"
              >
                {({ data, loading }) => {
                  return (
                    <Query
                      query={GET_CHANNELS_WITH_FILTERS}
                      variables={{
                        filters: this.state.filters
                      }}
                      onCompleted={data => {
                        if (this.state.allowRerender) {
                          const selectedChannel =
                            data.getChannelsWithFilters.channels.length > 0
                              ? data.getChannelsWithFilters.channels[0]
                              : null;
                          this.setState({
                            allowRerender: false,
                            channels: data.getChannelsWithFilters.channels,
                            channel: selectedChannel
                          });
                        }
                      }}
                      fetchPolicy="network-only"
                    >
                      {({ loading, error, data }) => {
                        if (loading)
                          return (
                            <FontAwesome
                              name="spinner"
                              spin
                              style={{
                                textShadow: '0 0.5px 0 rgba(0, 0, 0, 0.1)'
                              }}
                            />
                          );

                        if (error) {
                          return <ErrorList errors={[error]} />;
                        }

                        return (
                          <div className="container-fluid">
                            <div className="row mb-5">
                              <h2>Support Desk</h2>
                              <ChannelAlerts
                                setSelectedChannel={this.setSelectedChannel}
                                displayErrors={this.handleDisplayErrors}
                              />
                            </div>
                            <div className="messaging">
                              <div className="chat-window">
                                <div className="chat-left-pane">
                                  <div className="chat-header-left">
                                    {this.state.uniqueId ? (
                                      <div className="chat-search-bar" />
                                    ) : (
                                      <Fragment>
                                        <ChannelListSearch
                                          filters={this.state.filters}
                                          showChannelSearchModal={
                                            this.showChannelSearchModal
                                          }
                                          onSearchChannelConfirm={
                                            this.handleSearchChannelConfirm
                                          }
                                          onSearchChannelCancel={
                                            this.handleSearchChannelCancel
                                          }
                                          isChannelSearchModalOpen={
                                            this.state.isChannelSearchModalOpen
                                          }
                                        />
                                        <ChannelFilter
                                          filters={this.state.filters}
                                          onUpdateFilters={
                                            this.handleUpdateFilters
                                          }
                                        />
                                      </Fragment>
                                    )}
                                  </div>
                                  <GetChannels
                                    onChannelSelected={
                                      this.handleChannelSelected
                                    }
                                    selectedChannel={this.state.channel}
                                    filters={this.state.filters}
                                    showAcceptChannelModal={
                                      this.showAcceptChannelModal
                                    }
                                    onAcceptChannelConfirm={
                                      this.handleAcceptChannelConfirm
                                    }
                                    onAcceptChannelCancel={
                                      this.handleAcceptChannelCancel
                                    }
                                    isChannelAcceptModalOpen={
                                      this.state.isChannelAcceptModalOpen
                                    }
                                    showInviteChannelModal={
                                      this.showInviteChannelModal
                                    }
                                    onInviteChannelConfirm={
                                      this.handleInviteChannelConfirm
                                    }
                                    onInviteChannelCancel={
                                      this.handleInviteChannelCancel
                                    }
                                    isInviteChannelModalOpen={
                                      this.state.isInviteChannelModalOpen
                                    }
                                    invitedUsers={this.state.invitedUsers}
                                    updateInvitedUsers={
                                      this.handleUpdateInvitedUsers
                                    }
                                    user={this.props.login.user}
                                    client={this.props.client}
                                    channels={this.state.channels}
                                    displayErrors={this.handleDisplayErrors}
                                  />
                                </div>
                                <div className="chat-right_pane">
                                  <div className="chat-header-right">
                                    <ChannelOperations
                                      showCloseChannelModal={
                                        this.showCloseChannelModal
                                      }
                                      isChannelCloseModalOpen={
                                        this.state.isChannelCloseModalOpen
                                      }
                                      onCloseChannelCancel={
                                        this.handleCloseChannelCancel
                                      }
                                      onCloseChannelConfirm={
                                        this.handleCloseChannelConfirm
                                      }
                                      channel={this.state.channel}
                                      filters={this.state.filters}
                                      canClose={this.canClose}
                                      closedReason={this.state.closedReason}
                                      handleChange={this.handleChange}
                                      displayErrors={this.handleDisplayErrors}
                                    />
                                  </div>
                                  <div className="chat-history-container">
                                    <div className="chat-history-section">
                                      <div className="chat-message-history">
                                        <div
                                          style={{
                                            float: 'left',
                                            clear: 'both'
                                          }}
                                          ref={c => {
                                            this.messagesEndRef =
                                              c && ReactDOM.findDOMNode(c);
                                          }}
                                        />
                                        <ChannelMessages
                                          channel={this.state.channel}
                                          user={this.props.login.user}
                                          canView={this.canViewHistory}
                                          scrollToBottom={this.scrollToBottom}
                                          displayErrors={
                                            this.handleDisplayErrors
                                          }
                                        />
                                      </div>
                                    </div>
                                  </div>
                                  <SendMessage
                                    messageText={this.state.messageText}
                                    onAddMessageToChannel={
                                      this.handleAddMessageToChannel
                                    }
                                    channel={this.state.channel}
                                    canSend={this.canSend}
                                    handleChange={this.handleChange}
                                    filters={this.state.filters}
                                    displayErrors={this.handleDisplayErrors}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }}
                    </Query>
                  );
                }}
              </Subscription>
            );
          }}
        </Subscription>
      </ApolloProvider>
    ) : (
      <FontAwesome
        name="spinner"
        spin
        style={{
          textShadow: '0 0.5px 0 rgba(0, 0, 0, 0.1)'
        }}
      />
    );
  }
}

export default App;
