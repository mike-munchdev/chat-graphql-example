import React, { Fragment } from 'react';
import FontAwesome from 'react-fontawesome';
import { Input } from 'reactstrap';
import { FormPage } from './FormPage.component';

export class ChannelNotification extends FormPage {
  state = {
    rejectingInvitation: false,
    loading: false,
    rejectionReason: ''
  };
  displayInvitationNotification = options => {
    const {
      notification,
      UpdateChannelNotification,
      onUpdateNotification
    } = options;

    if (this.state.loading) {
      return (
        <FontAwesome
          name="spinner"
          spin
          style={{ textShadow: '0 0.5px 0 rgba(0, 0, 0, 0.1)' }}
        />
      );
    } else if (this.state.rejectingInvitation) {
      return (
        <Fragment>
          <div className="notification-item-message">
            <Input
              name="rejectionReason"
              id="rejectionReason"
              type="text"
              placeholder="Reason"
              value={this.state.rejectionReason}
              onChange={this.handleChange}
            />
          </div>
          <div className="notification-item-operations">
            {this.state.rejectionReason.length > 0 ? (
              <FontAwesome
                name="save"
                className="notification-save-invitation-button"
                size={'lg'}
                onClick={e => {
                  onUpdateNotification({
                    handleUpdateNotification: UpdateChannelNotification,
                    notificationId: notification.id,
                    status: 'CHANNEL_INVITATION_REJECTED',
                    rejectedReason: this.state.rejectionReason
                  });
                }}
              />
            ) : (
              <div />
            )}{' '}
            <FontAwesome
              name="times-circle"
              className="notification-save-invitation-button"
              onClick={e => {
                e.stopPropagation();
                this.setState({ rejectingInvitation: false });
              }}
              size={'lg'}
            />
          </div>
        </Fragment>
      );
    } else {
      return (
        <Fragment>
          <div className="notification-item-message">
            <strong>{`${notification.notifiedBy.firstName} ${notification.notifiedBy.lastName}`}</strong>{' '}
            {`${notification.message}`}{' '}
            <em>{`${notification.channel.friendlyName}`}</em>
          </div>
          <div className="notification-item-operations">
            <FontAwesome
              name="check-circle"
              className="notification-accept-invitation-button"
              size="lg"
              onClick={e => {
                onUpdateNotification({
                  handleUpdateNotification: UpdateChannelNotification,
                  notificationId: notification.id,
                  status: 'CHANNEL_INVITATION_ACCEPTED'
                });
              }}
            />
            <FontAwesome
              name="times-circle"
              className="notification-reject-invitation-button"
              onClick={e => {
                e.stopPropagation();
                this.setState({ rejectingInvitation: true });
              }}
              size="lg"
            />{' '}
          </div>
        </Fragment>
      );
    }
  };

  displayInvitationAcceptedNotification = options => {
    const {
      notification,
      UpdateChannelNotification,
      onUpdateNotification
    } = options;
    return (
      <Fragment>
        <div className="notification-item-message">
          <strong>{`${notification.notifiedBy.firstName} ${notification.notifiedBy.lastName}`}</strong>{' '}
          {`${notification.message}`}{' '}
          <em>{`${notification.channel.friendlyName}`}</em>
        </div>
        <div className="notification-item-operations">
          <FontAwesome
            name="check-circle"
            className="notification-accept-invitation-button"
            size="lg"
            onClick={e => {
              onUpdateNotification({
                handleUpdateNotification: UpdateChannelNotification,
                notificationId: notification.id,
                status: 'CHANNEL_NOTIFICATION_VIEWED'
              });
            }}
          />
        </div>
      </Fragment>
    );
  };

  displayInvitationRejectedNotification = options => {
    const {
      notification,
      UpdateChannelNotification,
      onUpdateNotification
    } = options;
    return (
      <Fragment>
        <div className="notification-item-message">
          <strong>{`${notification.notifiedBy.firstName} ${notification.notifiedBy.lastName}`}</strong>{' '}
          {`${notification.message}`}{' '}
          <em>{`${notification.channel.friendlyName}`}</em>
        </div>
        <div className="notification-item-operations">
          <FontAwesome
            name="check-circle"
            className="notification-accept-invitation-button"
            size="lg"
            onClick={e => {
              onUpdateNotification({
                handleUpdateNotification: UpdateChannelNotification,
                notificationId: notification.id,
                status: 'CHANNEL_NOTIFICATION_VIEWED'
              });
            }}
          />
        </div>
      </Fragment>
    );
  };
  displayNewChannelMessage = options => {
    const {
      notification,
      UpdateChannelNotification,
      onUpdateNotification
    } = options;
    return (
      <Fragment>
        <div className="notification-item-message">
          <strong>{`${notification.notifiedBy.firstName} ${notification.notifiedBy.lastName}`}</strong>{' '}
          {`${notification.message}`}{' '}
          <em>{`${notification.channel.friendlyName}`}</em>
        </div>
        <div className="notification-item-operations">
          <FontAwesome
            name="check-circle"
            className="notification-accept-invitation-button"
            size="lg"
            onClick={e => {
              onUpdateNotification({
                handleUpdateNotification: UpdateChannelNotification,
                notificationId: notification.id,
                status: 'CHANNEL_NOTIFICATION_VIEWED'
              });
            }}
          />
        </div>
      </Fragment>
    );
  };
  displayNotification = options => {
    const { notification } = options;

    if (notification.type.slug === 'invitation') {
      return this.displayInvitationNotification(options);
    } else if (notification.type.slug === 'invitation-accepted') {
      return this.displayInvitationAcceptedNotification(options);
    } else if (notification.type.slug === 'invitation-rejected') {
      return this.displayInvitationRejectedNotification(options);
    } else if (notification.type.slug === 'new-channel-message') {
      return this.displayNewChannelMessage(options);
    } else {
      return <Fragment />;
    }
  };

  render() {
    const {
      notification,
      UpdateChannelNotification,
      onUpdateNotification
    } = this.props;

    return (
      <div className="notification-item-container">
        {this.displayNotification({
          notification,
          UpdateChannelNotification,
          onUpdateNotification
        })}
      </div>
    );
  }
}
