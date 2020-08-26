const errorHandler = (err, req, res, next) => {
  console.log(err);
  res.status(err.status || 404).json({
    message: err.message || "Something went wrong. Try again later",
  });
};

module.exports = errorHandler;
