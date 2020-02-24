import React from 'react';
import ReactDOM from 'react-dom';
import { Button } from 'reactstrap';
import { Mutation } from 'react-apollo';

import { ChannelNotification } from './ChannelNotification.component';
import { UPDATE_CHANNEL_NOTIFICATION } from './channelQueries';
import { updateChannelNotificationsUpdate } from './mutationUpdates';
import { defaultFilters } from './mutationUpdates';
import './Support.css';
// Styles mostly from Bootstrap.
const styles = {
  tooltip: {
    position: 'absolute',
    padding: '0 5px',
    marginLeft: '-150px'
    // transition: 'all 0.2s ease-out 0.2s',
  },
  inner: {
    padding: '3px 8px',
    color: '#fff',
    textAlign: 'center',
    borderRadius: 3,
    backgroundColor: '#000',
    opacity: 0.75
  },
  arrow: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderStyle: 'solid',
    opacity: 0.75,
    marginTop: '-5px'
  }
};

const placementStyles = {
  bottom: {
    tooltip: {
      marginBottom: 3,
      padding: '5px 0'
    },

    arrow: {
      top: 0,
      borderWidth: '0 5px 5px',
      borderColor: 'transparent transparent #232323 transparent'
    }
  }
};
export class ChannelNotificationList extends React.Component {
  componentDidMount() {
    if (this.props.myOpenChannelNotifications) {
      this.setState({
        notifications: this.props.myOpenChannelNotifications.notifications || []
      });
    }
    this.props.subscribeToNewNotifications();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.myOpenChannelNotifications) {
      this.setState({
        notifications: nextProps.myOpenChannelNotifications.notifications
      });
    }
  }

  state = {
    notifications: [],

    placement: 'bottom',
    popupVisible: false
  };

  handleUpdateChannelNotification = async ({
    handleUpdateNotification,
    notificationId,
    status,
    rejectedReason
  }) => {
    const {
      data: { updateChannelNotification }
    } = await handleUpdateNotification({
      variables: {
        updates: {
          notificationId: Number(notificationId),
          status,
          rejectedReason: rejectedReason || ''
        }
      }
    });

    let errors = [];
    if (!updateChannelNotification.ok) {
      errors = updateChannelNotification.errors;
    }

    if (this.props.setSelectedChannel) {
      this.props.setSelectedChannel(
        updateChannelNotification.notification.channel.id,
        defaultFilters
      );
    }
    this.setState({
      errors
    });
  };

  handleClick = () => {
    if (!this.state.popupVisible) {
      // attach/remove event handler
      document.addEventListener('click', this.handleOutsideClick, false);
    } else {
      document.removeEventListener('click', this.handleOutsideClick, false);
    }

    this.setState(prevState => ({
      popupVisible: !prevState.popupVisible
    }));
  };

  handleOutsideClick = e => {
    // ignore clicks on the component itself
    if (this.node) {
      if (this.node.contains(e.target)) {
        return;
      }
    }

    const className = e.target.className;
    // allow buttons in notifications to handle their own click events
    if (
      !className.includes('notification-reject-invitation-button') &&
      !className.includes('notification-save-invitation-button') &&
      !className.includes('notification-accept-invitation-button')
    ) {
      this.handleClick();
    }
  };
  componentWillUnmount() {
    document.removeEventListener('click', this.handleOutsideClick, false);
  }

  render() {
    return (
      <Mutation
        mutation={UPDATE_CHANNEL_NOTIFICATION}
        update={(cache, { data: { updateChannelNotification } }) => {
          if (updateChannelNotification.ok) {
            updateChannelNotificationsUpdate({ cache });
          } else {
            this.props.displayErrors(updateChannelNotification.errors);
          }
        }}
      >
        {(UpdateChannelNotification, args) => (
          <div
            className="notification-container"
            ref={node => {
              this.node = node;
            }}
          >
            <Button
              id="PopoverFocus"
              type="button"
              ref={c => {
                this.target = c && ReactDOM.findDOMNode(c);
              }}
              onClick={this.handleClick}
            >
              <i className="fa fa-bell fa-lg" />
              {this.state.notifications.length > 0 ? (
                <div className="notification-counter">
                  {this.state.notifications.length}
                </div>
              ) : (
                <div />
              )}
            </Button>

            {this.state.popupVisible ? (
              <div
                style={{
                  ...styles.tooltip,
                  ...placementStyles['bottom'].tooltip,

                  zIndex: 1
                }}
              >
                {this.state.notifications.length > 0 ? (
                  this.state.notifications.map(n => (
                    <ChannelNotification
                      key={n.id}
                      notification={n}
                      UpdateChannelNotification={UpdateChannelNotification}
                      onUpdateNotification={
                        this.handleUpdateChannelNotification
                      }
                    />
                  ))
                ) : (
                  <div className="notification-item-container text-center d-inline-block">
                    No notifications
                  </div>
                )}
              </div>
            ) : (
              <div />
            )}
          </div>
        )}
      </Mutation>
    );
  }
}
