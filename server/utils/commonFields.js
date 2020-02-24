const setCreatedByAndAt = ({ obj, user }) => {
  obj.created_by = user.id;
  obj.created_at = new Date();
};

const setLastModifiedByAndAt = ({ obj, user }) => {
  obj.last_modified_by = user.id;
  obj.last_modified_at = new Date();
};

module.exports = { setCreatedByAndAt, setLastModifiedByAndAt };
