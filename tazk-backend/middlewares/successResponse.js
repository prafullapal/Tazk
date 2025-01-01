export const successResponse = (res, payload, message, statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        status: statusCode,
        data: {
            ...payload
        },
        message: message || "Success"
    })
};