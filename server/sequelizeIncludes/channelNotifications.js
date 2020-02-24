const { allChannelIncludes } = require("./channels");
const channelNotificationIncludes = [
  { association: "channel", required: true, include: allChannelIncludes },
  { association: "notifiedBy", required: true },
  { association: "notified", required: true },
  { association: "status", required: true },
  { association: "type", required: true }
];

module.exports = { channelNotificationIncludes };
