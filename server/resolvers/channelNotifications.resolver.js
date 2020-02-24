const { withFilter } = require('apollo-server-express');

const {
  getChannelNotificationTypeId,
  getChannelNotificationStatusId,
  getChannelNotificationMessage
} = require('../utils/channelNotificationStatus');

const {
  createChannelNotificationsResponse,
  createChannelNotificationResponse,
  createChannelNotification
} = require('../utils/channelNotifications');

const { createChannelMember } = require('../utils/channelMembers');

const {
  channelNotificationIncludes
} = require('../sequelizeIncludes/channelNotifications');
const asyncForEach = require('../utils/asyncForEach');
const convertErrors = require('../utils/convertErrors');
const {
  CHANNEL_INVITATION_ACCEPTED,
  CHANNEL_INVITATION_ADDED,
  CHANNEL_INVITATION_REJECTED,
  CHANNEL_NOTIFICATION_VIEWED
} = require('../utils/constants');

const pubsub = require('../utils/pubsub');

module.exports = {
  Query: {
    notificationsByChannel: async (parent, { channelId }, { db }) => {
      const Op = db.Sequelize.Op;
      const notificationsDb = await db.channelNotifications.findAll({
        where: { channelId: { [Op.eq]: Number(channelId) } }
      });
      return createChannelNotificationsResponse({
        ok: true,
        notifications: notificationsDb
      });
    },
    myOpenChannelNotifications: async (parent, { channelId }, { db, user }) => {
      try {
        const Op = db.Sequelize.Op;

        const sentStatus = await getChannelNotificationStatusId({ db });
        const notificationsDb = await db.channelNotifications.findAll({
          where: {
            [Op.and]: {
              notified_user_id: { [Op.eq]: Number(user.id) },
              notification_status_id: {
                [Op.eq]: sentStatus
              }
            }
          },
          include: channelNotificationIncludes,
          order: [['date_sent', 'DESC']]
        });
        return createChannelNotificationsResponse({
          ok: true,
          notifications: notificationsDb
        });
      } catch (e) {
        return createChannelNotificationsResponse({
          ok: false,
          errors: convertErrors(e, db)
        });
      }
    }
  },
  Mutation: {
    inviteUsersToChannel: async (parent, { invitations }, { db, user }) => {
      try {
        const { channelId, users } = invitations;

        const Op = db.Sequelize.Op;
        const notifications = [];
        const invitationNotificationType = await getChannelNotificationTypeId({
          db,
          action: CHANNEL_INVITATION_ADDED
        });
        await asyncForEach(users, async u => {
          // const existingNotification = await db.channelNotifications.findOne(
          //   {
          //     where: {
          //       [Op.and]: {
          //         channelId: { [Op.eq]: Number(channelId) },
          //         notified_user_id: { [Op.eq]: Number(u) },
          //         notification_type_id: {
          //           [Op.eq]: Number(invitationNotificationType)
          //         }
          //       }
          //     },
          //     include: channelNotificationIncludes
          //   }
          // );

          const notificationObj = db.channelNotifications.build();
          const sentNotificationStatus = await getChannelNotificationStatusId({
            db
          });

          const newNotification = Object.assign({}, notificationObj.toJSON(), {
            notified_by_user_id: user.id,
            notified_user_id: Number(u),
            channelId: Number(channelId),
            notification_status_id: sentNotificationStatus
              ? sentNotificationStatus
              : null,
            notification_type_id: invitationNotificationType
              ? invitationNotificationType
              : null,
            message: `invited you to join an db support channel`
          });

          // create notification
          const notification = await db.channelNotifications.create(
            newNotification
          );

          // get notification for notification response

          const notificationDb = await db.channelNotifications.findByPk(
            notification.id,
            {
              include: channelNotificationIncludes
            }
          );
          // push to array of notifications

          notifications.push(notificationDb);

          // email users
          await emailUserWhenChannelInvite({
            channelNotification: notificationDb
          });
          // publish for subscribers

          pubsub.publish(CHANNEL_INVITATION_ADDED, {
            channelNotificationAdded: createChannelNotificationResponse({
              ok: true,
              notification: notificationDb
            })
          });
        });

        return createChannelNotificationsResponse({
          ok: true,
          notifications: notifications
        });
      } catch (e) {
        return createChannelNotificationsResponse({
          ok: false,
          errors: convertErrors(e, db)
        });
      }
    },
    updateChannelNotification: async (parent, { updates }, { db, user }) => {
      try {
        // 1. check to see what type of update we are performing (invitation acceptance, invitation rejection, viewing)
        // 2. update the notification with the new information (accepted, viewed, rejected)
        // 3. send out any notification based on the status change (invitation-rejected, invitation-accepted, issue-closed-resolved, issue-closed-unresolved, new-channel-message)
        // 4. return the updated notification for the UI to update the cache.
        const Op = db.Sequelize.Op;
        const { status, rejectedReason, notificationId } = updates;

        let statusUpdate;
        let createResponse = false;
        // 1.
        switch (status) {
          case CHANNEL_INVITATION_ACCEPTED:
            statusUpdate = await getChannelNotificationStatusId({
              db,
              action: CHANNEL_INVITATION_ACCEPTED
            });
            createResponse = true;

            break;
          case CHANNEL_INVITATION_REJECTED:
            statusUpdate = await getChannelNotificationStatusId({
              db,
              action: CHANNEL_INVITATION_ACCEPTED
            });
            createResponse = true;

            break;
          case CHANNEL_NOTIFICATION_VIEWED:
            statusUpdate = await getChannelNotificationStatusId({
              db,
              action: CHANNEL_NOTIFICATION_VIEWED
            });
        }

        // 2.
        await db.channelNotifications.update(
          {
            assignedToId: user.id,
            notification_status_id: statusUpdate,
            reject_reason: rejectedReason
          },
          {
            where: {
              id: { [Op.eq]: notificationId }
            }
          }
        );

        const notificationDb = await db.channelNotifications.findByPk(
          notificationId,
          {
            include: channelNotificationIncludes
          }
        );

        if (createResponse) {
          // 3.
          // create new notification
          const sentNotificationStatus = await getChannelNotificationStatusId({
            db
          });

          const notificationType = await getChannelNotificationTypeId({
            db,
            action: status
          });

          const notificationMessage = await getChannelNotificationMessage({
            action: status
          });

          if (status === CHANNEL_INVITATION_ACCEPTED) {
            await createChannelMember({
              db,
              user,
              channelId: notificationDb.channelId
            });
          }
          // create notification
          const createStatusNotification = await createChannelNotification({
            db,
            notified_by_user_id: user.id,
            notified_user_id: Number(notificationDb.notified_by_user_id),
            channelId: Number(notificationDb.channelId),
            notification_status_id: sentNotificationStatus
              ? sentNotificationStatus
              : null,
            notification_type_id: notificationType ? notificationType : null,
            message: notificationMessage,
            link_id: notificationDb.id,
            rejected_reason: rejectedReason
          });

          const statusNotificationDb = await db.channelNotifications.findByPk(
            createStatusNotification.id,
            {
              include: channelNotificationIncludes
            }
          );

          if (status === CHANNEL_INVITATION_REJECTED) {
            // email users
            await emailUserWhenChannelDeny({
              channelNotification: statusNotificationDb
            });
          }
          pubsub.publish(status, {
            channelNotificationAdded: createChannelNotificationResponse({
              ok: true,
              notification: statusNotificationDb
            })
          });
        }

        return createChannelNotificationResponse({
          ok: true,
          notification: notificationDb
        });
      } catch (e) {
        return createChannelNotificationResponse({
          ok: false,
          errors: convertErrors(e, db)
        });
      }
    }
  },
  Subscription: {
    channelNotificationAdded: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(CHANNEL_INVITATION_ADDED),
        (payload, variables, { user }) => {
          return (
            payload.channelNotificationAdded.notification.notifiedUserId ===
            user.id
          );
        }
      )
    }
  }
};
