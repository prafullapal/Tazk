export const errorResponse = (res, message, error, statusCode) => {
  console.error("Error Response: ", {
    "api-request": res.req.originalUrl,
    error: error,
    message: message || error.message,
    status: statusCode,
  });
  console.error("Error Status: ", error.status);
  const sendError = process.env.NODE_ENV === "development";
  return res.status(statusCode).json({
    success: false,
    status: statusCode,
    error: sendError ? error.stack : {},
    message: message || error.message || "An error occurred, please try again",
  });
};

export const notFoundError = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  errorResponse(res, "URL Not Found", error, 404);
};
