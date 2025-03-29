const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Admin = require("../model/admin_login");
const admin_login = require("../model/admin_login");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");

// router.post("/admin-signup", async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const user = await Admin({
//       email: email,
//       password: hashedPassword,
//     }).save();
//     if (user) {
//       return res.json({
//         error: false,
//         status: 200,
//         user,
//       });
//     } else {
//       return res.json({
//         error: true,
//         status: 400,
//         message: "User Not Created",
//       });
//     }
//   } catch (error) {
//     console.log(error);
//     return res.json({
//       error: true,
//       status: 500,
//       message: "Something Went Wrong",
//     });
//   }
// });

router.post("/admin-login", async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email && !password) {
      return res.json({
        error: true,
        status: 400,
        message: "Email And Password Is Required",
      });
    }

    const user = await Admin.findOne({ email });
    if (!user) {
      return res.json({
        error: true,
        status: 400,

        message: "Email Id Not Found",
      });
    } else {
      if (user.password) {
        const passwordMatch = await bcrypt.compare(password, user.password);
        const token = jwt.sign({ email: user.email }, process.env.JWT, {
          expiresIn: "12h",
        });

        const expirationTimestamp = Date.now() + 12 * 3600000;

        if (!passwordMatch) {
          return res.json({
            error: true,
            status: 400,
            message: "Password Incorrect",
          });
        } else {
          return res.json({
            token,
            email: user.email,
            expiresIn: expirationTimestamp,
            status: 200,
            error: false,
            message: "Logged in Successfully",
          });
        }
      }
    }
  } catch (error) {
    console.log(error);
    return res.json({
      error: true,
      status: 500,
      message: "Something Went Wrong",
    });
  }
});

router.post("/generate-secret", async (req, res) => {
  const { email } = req.body;
  console.log(email, "gdgdf");
  const user = await admin_login.findOne({ email: email });
  if (!user) return res.status(400).json({ message: "User not found" });

  const secret = speakeasy.generateSecret({ name: "MySecureApp" });
  console.log(secret, "sercret");
  user.secret = secret.base32;
  await user.save();
  qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
    res.json({ secret: secret.base32, qrCode: data_url });
  });
});
router.post("/verify-token", async (req, res) => {
  try {
    const { email, token } = req.body;
    const user = await admin_login.findOne({ email: email });

    if (!user) {
      return res.json({
        status: 400,
        message: "User not found",
      });
    }

    const verified = speakeasy.totp.verify({
      secret: user.secret,
      encoding: "base32",
      token,
    });
    return res.json({
      verified,
      status: 200,
    });
  } catch (err) {
    console.error("Error verifying 2FA token:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});
module.exports = router;
