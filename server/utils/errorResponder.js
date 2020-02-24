module.exports = function errorResponder(res) {
  return err => {
    console.error("error:", err);
    res.send({
      errors: err.errors
        ? err.errors
        : [{ message: err.message || String(err) }]
    });
  };
};
