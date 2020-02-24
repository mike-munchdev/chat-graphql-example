const channelIncludesWithoutChannelStatus = [
  { association: "account", required: false },
  { association: "channelType", required: true },
  {
    association: "members",
    required: false,
    include: {
      association: "user",
      required: true
    }
  },
  { association: "assignedTo", required: false },
  { association: "createdBy", required: true },

  { association: "lastModifiedBy", required: true }
];

const channelEmailNotificationIncludes = [
  { association: "createdBy", required: true },
  { association: "lastModifiedBy", required: true }
];

module.exports = {
  channelEmailNotificationIncludes,
  channelIncludesWithoutChannelStatus,
  allChannelIncludes: [
    ...channelIncludesWithoutChannelStatus,
    { association: "channelStatus", required: true },
    { association: "lastViews", required: false }
  ]
};
