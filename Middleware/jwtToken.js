const jwt = require("jsonwebtoken");

const verifyToken = async (req, res, next) => {
  try {
    if (req.headers["authorization"] && req.headers.authorization) {
      const token = req.headers["authorization"].split(" ")[1];
      if (token) {
        const jwtkey = process.env.JWT;
        if (jwtkey) {
          jwt.verify(token, jwtkey, (err) => {
            if (err) {
              if (err.name === "TokenExpiredError") {
                return res.json({
                  status: 404,
                  error: true,
                  message: "Token expired",
                  err,
                });
              } else {
                return res.json({
                  status: 404,
                  error: true,
                  message: "Invalid Token",
                });
              }
            }
            // req.user_id = decodedToken.sub;
            next();
          });
        } else {
          return res.json({
            status: 404,
            message: "Invalid Request*",
          });
        }
      } else {
        return res.json({
          status: 404,
          message: "Invalid Token**",
        });
      }
    } else {
      return res.json({
        status: 404,
        message: "Invalid Request**",
      });
    }
  } catch (error) {
    console.log(error);
    return res.json({
      status: 404,
      message: "Invalid token",
      error,
    });
  }
};

module.exports = {verifyToken};
