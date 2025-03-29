const express = require("express");
const router = express.Router();
const registration = require("../model/registration");
const stake2 = require("../model/stake");
const dailyroi = require("../model/dailyroi");
const WithdrawalModel = require("../model/withdraw");
const levelStake = require("../model/levelStake");
const apprveWithdraw = require("../model/apprveWithdraw");
const moment = require("moment-timezone");
const { verifyToken } = require("../Middleware/jwtToken");

const Web3 = require("web3");
const notification = require("../model/notification");
require('dotenv').config();

const web3 = new Web3(
  new Web3.providers.HttpProvider(process.env.RPC_URL, {
    reconnect: {
      auto: true,
      delay: 5000, // ms
      maxAttempts: 15,
      onTimeout: false,
    },
  })
);

const ABI = [{ "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "investor", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "netAmt", "type": "uint256" }], "name": "MemberPayment", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" }], "name": "OwnershipTransferred", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "account", "type": "address" }], "name": "Paused", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": true, "internalType": "address", "name": "referrer", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "userId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "referrerId", "type": "uint256" }, { "indexed": false, "internalType": "string", "name": "regby", "type": "string" }], "name": "Registration", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "token", "type": "uint256" }, { "indexed": false, "internalType": "string", "name": "plan", "type": "string" }, { "indexed": false, "internalType": "string", "name": "tyyp", "type": "string" }, { "indexed": false, "internalType": "uint256", "name": "plantype", "type": "uint256" }], "name": "Stake", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "token", "type": "uint256" }, { "indexed": false, "internalType": "string", "name": "plan", "type": "string" }], "name": "ToppedUp", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "account", "type": "address" }], "name": "Unpaused", "type": "event" }, { "inputs": [], "name": "DSC", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "LASTLEVEL", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "PERCENT_DIVIDER", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "TIME_STEP", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "USDT", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "admin", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "adminAchivers", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "airdropAmount", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "airdropLevelShares", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "airdropPerMonth", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "airdropUserCount", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address[]", "name": "path", "type": "address[]" }], "name": "getCurrentPrice", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "amountUsd", "type": "uint256" }], "name": "getPriceFromUniswapV2", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "idToAddress", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_usdt", "type": "address" }, { "internalType": "address", "name": "_dsc", "type": "address" }, { "internalType": "address", "name": "_stdsc", "type": "address" }, { "internalType": "address", "name": "_owner", "type": "address" }], "name": "initialize", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "isAdminAchived", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "isAirdropPaused", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "user", "type": "address" }], "name": "isUserExists", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "joiningFee", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "lastUserId", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "levelBonusShares", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "levelRoiPerDay", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "levelShare", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "maxStake", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "minStake", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "minWithdraw", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "multipler", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address payable[]", "name": "_contributors", "type": "address[]" }, { "internalType": "uint256[]", "name": "_balances", "type": "uint256[]" }, { "internalType": "uint256", "name": "totalQty", "type": "uint256" }, { "internalType": "contract IERC20", "name": "_TKN", "type": "address" }], "name": "multisendToken", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [], "name": "operator", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "pause", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "paused", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_user", "type": "address" }, { "internalType": "address", "name": "_referral", "type": "address" }], "name": "registerbyDSC", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_user", "type": "address" }, { "internalType": "address", "name": "_referral", "type": "address" }], "name": "registerbystDSC", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_user", "type": "address" }, { "internalType": "address", "name": "_referral", "type": "address" }], "name": "registrationUSDT", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "roiPerDay", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "stDSC", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "uint256", "name": "plan", "type": "uint256" }], "name": "stakeDSC", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "uint256", "name": "plan", "type": "uint256" }], "name": "stakeUSDT", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "uint256", "name": "plan", "type": "uint256" }], "name": "stakestDSC", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "totalStaked", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "totalWithdrawal", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "newOwner", "type": "address" }], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "uniswapRouter", "outputs": [{ "internalType": "contract IUniswapV2Router02", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "unpause", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "users", "outputs": [{ "internalType": "uint256", "name": "userId", "type": "uint256" }, { "internalType": "address", "name": "referrer", "type": "address" }, { "internalType": "uint256", "name": "partnerCount", "type": "uint256" }, { "internalType": "uint256", "name": "totalStake", "type": "uint256" }, { "internalType": "uint256", "name": "directBusiness", "type": "uint256" }, { "internalType": "uint256", "name": "teamBusiness", "type": "uint256" }, { "internalType": "uint256", "name": "lastinvest", "type": "uint256" }, { "internalType": "uint256", "name": "rewTaken", "type": "uint256" }, { "internalType": "uint256", "name": "stakecount", "type": "uint256" }, { "internalType": "uint256", "name": "partnersCount", "type": "uint256" }, { "internalType": "uint256", "name": "levelIncome", "type": "uint256" }, { "internalType": "bool", "name": "onof", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "WithAmt", "type": "uint256" }], "name": "withdrawLost", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "QtyAmt", "type": "uint256" }, { "internalType": "contract IERC20", "name": "_TOKEN", "type": "address" }], "name": "withdrawLostTokenFromBalance", "outputs": [], "stateMutability": "nonpayable", "type": "function" }]
const contract = new web3.eth.Contract(ABI, process.env.MAIN_CONTRACT);

const limit = 100;

router.get("/deposite", async (req, res) => {
  try {
    const page = parseInt(req.query.page || 1);
    const limit = 100;
    const searchQuery = req.query.search ? req.query.search.trim() : "";

    let filter = {};
    if (searchQuery) {
      filter = {
        $or: [
          { user: { $regex: searchQuery, $options: "i" } },
          { "joinedData.name": { $regex: searchQuery, $options: "i" } },
        ],
      };
    }

    const totalCount = await stake2.aggregate([
      { $match: {} },
      {
        $lookup: {
          from: "signup",
          localField: "user",
          foreignField: "wallet_add",
          as: "joinedData",
        },
      },
      { $unwind: { path: "$joinedData", preserveNullAndEmptyArrays: true } },
      { $match: filter },
      { $count: "totalCount" },
    ]);

    const data = await stake2.aggregate([
      { $match: {} },
      {
        $lookup: {
          from: "signup",
          localField: "user",
          foreignField: "wallet_add",
          as: "joinedData",
        },
      },
      { $unwind: { path: "$joinedData", preserveNullAndEmptyArrays: true } },
      {
        $match: {
          $or: [
            { "joinedData.name": { $regex: searchQuery, $options: "i" } },
            { user: { $regex: searchQuery, $options: "i" } },
          ],
        },
      },
      {
        $project: {
          user: 1,
          timestamp: 1,
          amount: 1,
          token: 1,
          ratio: 1,
          txHash: 1,
          createdAt: 1,
          Name: "$joinedData.name",
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ]);

    return res.json({
      status: 200,
      error: false,
      data,
      totalCount,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    return res.json({
      error: true,
      status: 500,
      message: error.message,
    });
  }
});

router.get("/withdraw-referal", verifyToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 2;
    const limit = pageSize;
    const searchQuery = req.query.search ? req.query.search.trim() : "";
    const payment = req.query.paymentMethod
      ? req.query.paymentMethod.trim()
      : "";

    let paymentFilter = {};
    if (payment) {
      paymentFilter.payment_method = payment;
    }

    let filter = {
      ...paymentFilter,
    };
    if (searchQuery) {
      filter.$or = [
        { user: { $regex: searchQuery, $options: "i" } },
        { "joinedData.userId": { $regex: searchQuery, $options: "i" } },
      ];
    }

    const totalCountPipeline = [
      {
        $match: {
          wallet_type: "referral",
          isapprove: false,
          isreject: false
        },
      },
      {
        $lookup: {
          from: "registration",
          let: { userId: "$user" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$user", "$$userId"] },
              },
            },
          ],
          as: "joinedData",
        },
      },
      { $unwind: { path: "$joinedData", preserveNullAndEmptyArrays: true } },
      { $match: filter },
      { $count: "totalCount" },
    ];

    const totalCountResult = await WithdrawalModel.aggregate(
      totalCountPipeline
    );
    const totalCount =
      totalCountResult.length > 0 ? totalCountResult[0].totalCount : 0;

    const dataPipeline = [
      {
        $match: {
          wallet_type: "referral",
          isapprove: false,
          isreject: false,
          ...paymentFilter,
        },
      },
      {
        $lookup: {
          from: "signup",
          let: { userId: "$user" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$wallet_add", "$$userId"] },
              },
            },
          ],
          as: "joinedData",
        },
      },
      { $unwind: { path: "$joinedData", preserveNullAndEmptyArrays: true } },
      { $match: filter },
      {
        $project: {
          _id: 1,
          user: 1,
          withdrawAmount: 1,
          wallet_type: 1,
          recurr_status: 1,
          createdAt: 1,
          payment_method: 1,
          recurr_status: 1,
          isapprove: 1,
          isreject: 1,
          trxnHash: 1,
          Name: "$joinedData.name",
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ];

    const data = await WithdrawalModel.aggregate(dataPipeline);
    //console.log("data :: ",data)
    return res.json({
      status: 200,
      error: false,
      data,
      totalCount,
    });
  } catch (error) {
    console.log("Error In Withdraw Roi", error);
    return res.status(500).json({
      status: 500,
      error: true,
      message: "Internal Server Error",
    });
  }
});

router.get("/withdraw-roi", verifyToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 2;
    const limit = pageSize;
    const searchQuery = req.query.search ? req.query.search.trim() : "";
    const payment = req.query.paymentMethod
      ? req.query.paymentMethod.trim()
      : "";

    let paymentFilter = {};
    if (payment) {
      paymentFilter.payment_method = payment;
    }

    let filter = {
      ...paymentFilter,
    };
    if (searchQuery) {
      filter.$or = [
        { user: { $regex: searchQuery, $options: "i" } },
        { "joinedData.userId": { $regex: searchQuery, $options: "i" } },
      ];
    }

    const totalCountPipeline = [
      {
        $match: {
          wallet_type: "referral",
          isapprove: false,
          isreject: false
        },
      },
      {
        $lookup: {
          from: "registration",
          let: { userId: "$user" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$user", "$$userId"] },
              },
            },
          ],
          as: "joinedData",
        },
      },
      { $unwind: { path: "$joinedData", preserveNullAndEmptyArrays: true } },
      { $match: filter },
      { $count: "totalCount" },
    ];


    const totalUser = await WithdrawalModel.find(
      { isapprove: false, isreject: false }
    ).countDocuments()

    const tokenPrice = await contract.methods.getCurrentPrice([
      '0x55d398326f99059fF775485246999027B3197955',
      '0xE0eAe74BEc76696Cc82dF119Ea35653506D54155'
    ]).call();

    // Calculate the number of tokens to be received
    console.log("tokenPrice ", tokenPrice / 1e18)
    //const data=await WithdrawalModel.find({isapprove : false, isreject : false}).skip((page - 1)*pageSize).limit(pageSize).sort({createdAt : -1})

    const totalCountResult = await WithdrawalModel.aggregate(
      totalCountPipeline
    );
    const totalCount =
      totalCountResult.length > 0 ? totalCountResult[0].totalCount : 0;

    const dataPipeline = [
      {
        $match: {
          isapprove: false,
          isreject: false,
          ...paymentFilter,
        },
      },
      {
        $lookup: {
          from: "registration",
          let: { userId: "$user" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$user", "$$userId"] },
              },
            },
          ],
          as: "joinedData",
        },
      },
      { $unwind: { path: "$joinedData", preserveNullAndEmptyArrays: true } },
      { $match: filter },
      {
        $project: {
          _id: 1,
          user: 1,
          withdrawAmount: 1,
          createdAt: 1,
          isapprove: 1,
          isreject: 1,
          trxnHash: 1,
          wallet_type: 1,
          Name: "$joinedData.userId",
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ];

    const data = await WithdrawalModel.aggregate(dataPipeline);
    console.log("data withdrawal  ", data)
    const updatedRecords = data.map(record => {
      const tokens_received = record.withdrawAmount * (tokenPrice / 1e18);
      record.tokens_received = tokens_received; // Assuming you want to add this field to the record
      return {
        ...record,
        tokens_received, // Adding this field directly to the returned object
      };
    });

    await Promise.all(updatedRecords);

    //const tokens_received = amount * (tokenPrice / 1e18);


    return res.json({
      status: 200,
      error: false,
      data,
      totalCount: totalUser,
    });
  } catch (error) {
    console.log("Error In Withdraw Roi", error);
    return res.status(500).json({
      status: 500,
      error: true,
      message: "Internal Server Error",
    });
  }
});

router.get("/withdraw-roi-confirm", verifyToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 2;
    const limit = pageSize;
    const searchQuery = req.query.search ? req.query.search.trim() : "";
    const payment = req.query.paymentMethod
      ? req.query.paymentMethod.trim()
      : "";

    let paymentFilter = {};
    if (payment) {
      paymentFilter.payment_method = payment;
    }

    let filter = {
      ...paymentFilter,
    };
    if (searchQuery) {
      filter.$or = [
        { user: { $regex: searchQuery, $options: "i" } },
        { "joinedData.userId": { $regex: searchQuery, $options: "i" } },
      ];
    }

    const totalCountPipeline = [
      {
        $match: {
          isapprove: true,
          isreject: false
        },
      },
      {
        $lookup: {
          from: "registration",
          let: { userId: "$user" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$user", "$$userId"] },
              },
            },
          ],
          as: "joinedData",
        },
      },
      { $unwind: { path: "$joinedData", preserveNullAndEmptyArrays: true } },
      { $match: filter },
      { $count: "totalCount" },
    ];


    const totalCountResult = await WithdrawalModel.aggregate(
      totalCountPipeline
    );
    const totalCount =
      totalCountResult.length > 0 ? totalCountResult[0].totalCount : 0;

    const dataPipeline = [
      {
        $match: {
          isapprove: true,
          isreject: false,
          ...paymentFilter,
        },
      },
      {
        $lookup: {
          from: "registration",
          let: { userId: "$user" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$user", "$$userId"] },
              },
            },
          ],
          as: "joinedData",
        },
      },
      { $unwind: { path: "$joinedData", preserveNullAndEmptyArrays: true } },
      { $match: filter },
      {
        $project: {
          _id: 1,
          user: 1,
          withdrawAmount: 1,
          createdAt: 1,
          isapprove: 1,
          isreject: 1,
          trxnHash: 1,
          wallet_type: 1,
          withdrawToken: 1,
          sendToken: 1,
          Name: "$joinedData.userId",
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ];

    const data = await WithdrawalModel.aggregate(dataPipeline);

    //const tokens_received = amount * (tokenPrice / 1e18);


    return res.json({
      status: 200,
      error: false,
      data,
      totalUser: totalCount,
    });
  } catch (error) {
    console.log("Error In Withdraw Roi", error);
    return res.status(500).json({
      status: 500,
      error: true,
      message: "Internal Server Error",
    });
  }
});

router.get("/withdraw-roi-confirmm", verifyToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 2;
    const limit = pageSize;
    const searchQuery = req.query.search ? req.query.search.trim() : "";
    const payment = req.query.paymentMethod
      ? req.query.paymentMethod.trim()
      : "";

    let paymentFilter = {};
    if (payment) {
      paymentFilter.payment_method = payment;
    }

    let filter = {
      ...paymentFilter,
    };
    if (searchQuery) {
      filter.$or = [
        { user: { $regex: searchQuery, $options: "i" } },
      ];
    }


    const totalUser = await WithdrawalModel.find(
      { isapprove: true, isreject: false }
    ).countDocuments()

    const data = await WithdrawalModel.find({ isapprove: true, isreject: false }).skip((page - 1) * pageSize).limit(pageSize).sort({ createdAt: -1 })




    return res.json({
      status: 200,
      error: false,
      data,
      totalUser,
    });
  } catch (error) {
    console.log("Error In Withdraw Roi", error);
    return res.status(500).json({
      status: 500,
      error: true,
      message: "Internal Server Error",
    });
  }
});

router.get("/depoesite-user", verifyToken, async (req, res) => {
  try {
    const user = req.query.user;
    const page = parseInt(req.query.page) || 1;

    const totalUser = await stake2.find({ user: user }).countDocuments();
    const data = await stake2
      .find({ user: user })
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.json({
      status: 200,
      data,
      totalUser,
    });
  } catch (error) {
    console.log("Error In depoesite-user", error);
  }
});

router.get("/withdraw-user", verifyToken, async (req, res) => {
  try {
    const user = req.query.user;
    const page = parseInt(req.query.page) || 1;

    const totalUser = await WithdrawalModel.find({
      user: user,
    }).countDocuments();
    const data = await WithdrawalModel.find({ user: user })
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.json({
      status: 200,
      data,
      totalUser,
    });
  } catch (error) {
    console.log("Error In Withdraw-user", error);
  }
});

router.get("/all-data", verifyToken, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 20; // Number of documents per page
  const skip = (page - 1) * limit;
  const searchQuery = req.query.search || "";
  const planfilter = req.query.planwise || "";
  const idstatus = req.query.idstatus || "";

  try {
    // Build the search filter if a search query is provided
    let filter = {};
    if (searchQuery) {
      filter.$or = [
        { user: { $regex: searchQuery, $options: "i" } }, // Case-insensitive search for user
        { userId: { $regex: searchQuery, $options: "i" } } // Case-insensitive search for userId
      ];
    }

    if (planfilter) {
      if (planfilter === 'beginner') {
        filter.$and = [
          { stake_amount: { $gt: 60 } },
          { stake_amount: { $lt: 1000 } }
        ];
      } else if (planfilter === 'learner') {
        filter.$and = [
          { stake_amount: { $gt: 1000 } },
          { stake_amount: { $lt: 3000 } }
        ];
      } else if (planfilter === 'expert') {
        filter.$and = [
          { stake_amount: { $gt: 3000 } },
          { stake_amount: { $lt: 10000 } }
        ];
      }
    }

    // Count total number of documents in the collection based on the filter
    let totalUsers = await registration.countDocuments(filter);

    // Fetch data with pagination, filtering, and sorting by createdAt in descending order
    const data = await registration.find(filter)
      .sort({ createdAt: -1 }) // Sort by createdAt descending
      .skip(skip)
      .limit(limit);

    let filteredData = [];
    let documentCount = 0;

    if (idstatus) {

      const documentAllcount = await registration.aggregate([
        {
          $match: {
            return: { $ne: 0 } // Exclude documents where 'return' is 0
          }
        },
        {
          $addFields: {
            percentage: {
              $multiply: [
                { $divide: ["$totalIncome", "$return"] },
                100
              ]
            }
          }
        },
        {
          $match: {
            $expr: {
              $cond: {
                if: { $eq: [idstatus, "below"] },
                then: { $lt: ["$percentage", 25] },
                else: {
                  $cond: {
                    if: { $eq: [idstatus, "half_done"] },
                    then: { $and: [{ $gte: ["$percentage", 25] }, { $lte: ["$percentage", 50] }] },
                    else: { $gt: ["$percentage", 50] }
                  }
                }
              }
            }
          }
        }
      ]);

      // Find the length of the resulting array
      documentCount = documentAllcount.length;

      filteredData = await registration.aggregate([
        {
          $match: {
            return: { $ne: 0 } // Exclude documents where 'return' is 0
          }
        },
        {
          $addFields: {
            percentage: {
              $multiply: [
                { $divide: ["$totalIncome", "$return"] },
                100
              ]
            }
          }
        },
        {
          $match: {
            $expr: {
              $cond: {
                if: { $eq: [idstatus, "below"] },
                then: { $lt: ["$percentage", 25] },
                else: {
                  $cond: {
                    if: { $eq: [idstatus, "half_done"] },
                    then: { $and: [{ $gte: ["$percentage", 25] }, { $lte: ["$percentage", 50] }] },
                    else: { $gt: ["$percentage", 50] }
                  }
                }
              }
            }
          }
        },
        {
          $sort: { createdAt: -1 } // Sort by createdAt in descending order
        },
        {
          $skip: skip // Skip the first `skip` number of documents
        },
        {
          $limit: limit // Limit the result to `limit` number of documents
        }
      ])

    } else {
      filteredData = data; // Return an empty array if no idstatus provided
    }


    // Return the data with total users count
    return res.json({
      status: 200,
      data: filteredData,
      totalUsers: documentCount > 0 ? documentCount : totalUsers,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});


router.post("/withdraw-block", verifyToken, async (req, res) => {
  try {
    const { user, status } = req.body;
    console.log(user, status);
    const User = await stakeRegister.find({
      user: user,
    });

    if (!User) {
      return res.json({
        status: 400,
        message: "User not found",
      });
    }

    if (status == 1) {
      const result = await stakeRegister.updateOne(
        { user: user },
        { $set: { withdraw_status: status } }
      );

      return res.json({
        status: 200,
        message: "Withdraw blocked successfully",
      });
    } else if (status == 0) {
      const result = await stakeRegister.updateOne(
        { user: user },
        { $set: { withdraw_status: status } }
      );
      return res.json({
        status: 200,
        message: "Withdraw Unblock successfully",
      });
    } else {
      return res.json({
        status: 400,
        message: "Something went Wrong",
      });
    }
  } catch (error) {
    console.log(error);
  }
});

router.get("/block-list", verifyToken, async (req, res) => {
  try {
    const data = await stakeRegister.find({ withdraw_status: 1 });

    return res.json({
      status: 200,
      data,
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/commission-user", async (req, res) => {
  let user = req.query.user;
  try {
    const requireobject = {
      _id: 0,
      user: 1,
      totalWithdraw: 1,
      lapseIncome: 1,
      referalIncome: 1,
      levelIncome: 1,
      recurrIncome: 1,
      rankbonus: 1,
      rankboosterlevel: 1,
      topup_amount: 1,
      totalIncome: 1,
      wallet_rewards: 1,
      referalIncome: 1,
      totalIncome: 1,
      wallet_roi: 1,
      wallet_recurr: 1,
      poolbonus: 1,
      roi_withdraw: 1,
      openlevel: 1,
      poolIncome: 1,
    };

    const allTeamMembers = await findAllDescendants(user);

    const result = await stake2.aggregate([
      { $match: { user: { $in: allTeamMembers } } },
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
    ]);

    const teamBussines = result.length > 0 ? result[0].totalAmount : 0;

    const users = await stakeRegister.findOne({ user: user }, requireobject);
    const records = await registration
      .find({ referrer: user })
      .sort({ directplusteambiz: -1 })
      .exec();
    let seventyPercentOfHighest = 0;
    if (records.length > 0) {
      const highestValue = records[0].directplusteambiz;
      seventyPercentOfHighest = highestValue;
    }
    let thirtyPercentOfRemainingSum = 0;
    if (records.length > 1) {
      const remainingSum = records
        .slice(1)
        .reduce((acc, record) => acc + record.directplusteambiz, 0);
      thirtyPercentOfRemainingSum = remainingSum;
    }

    if (!users) {
      return res.json({
        status: 400,
        error: true,
        message: "No User Found",
      });
    }
    return res.json({
      error: false,
      status: 200,
      data: {
        users,
        teamBussines,
        seventyPercentOfHighest,
        thirtyPercentOfRemainingSum,
      },
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/protocol-details", verifyToken, async (req, res) => {
  try {
    const firstProtocol = await stake2.aggregate([
      {
        $match: {
          $or: [{ ratio: "10" }, { ratio: 10 }],
          token: "WYZ-stUSDT",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    const secondProtocol = await stake2.aggregate([
      {
        $match: { $or: [{ ratio: "20" }, { ratio: 20 }], token: "WYZ-stUSDT" },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    const thirdProtocol = await stake2.aggregate([
      {
        $match: { $or: [{ ratio: "30" }, { ratio: 30 }], token: "WYZ-stUSDT" },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);
    const fourthProtocol = await stake2.aggregate([
      {
        $match: { $or: [{ ratio: "40" }, { ratio: 40 }], token: "WYZ-stUSDT" },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);
    const fifthProtocol = await stake2.aggregate([
      {
        $match: { $or: [{ ratio: "50" }, { ratio: 50 }], token: "WYZ-stUSDT" },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);
    const sixProtocol = await stake2.aggregate([
      { $match: { ratio: 15, token: "sUSDT-stUSDT" } },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);
    const sevenProtocol = await stake2.aggregate([
      { $match: { ratio: 20, token: "sUSDT-stUSDT" } },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);
    const eightProtocol = await stake2.aggregate([
      { $match: { ratio: 25, token: "sUSDT-stUSDT" } },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    const firstdata = firstProtocol[0]?.total;
    const seconddata = secondProtocol[0]?.total;
    const thirddata = thirdProtocol[0]?.total;
    const fourthdata = fourthProtocol[0]?.total;
    const fifthdata = fifthProtocol[0]?.total;
    const sixdata = sixProtocol[0]?.total;
    const sevendata = sevenProtocol[0]?.total;
    const eightdata = eightProtocol[0]?.total;
    return res.json({
      error: false,
      status: 200,
      data: {
        firstdata,
        seconddata,
        thirddata,
        fourthdata,
        fifthdata,
        sixdata,
        sevendata,
        eightdata,
      },
    });
  } catch (error) {
    console.log(error);
  }
});

router.post("/protocol-data", verifyToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;
    const token = req.query.token;
    const ratio = req.query.ratio;
    const ratioParam = ratio;
    const Ratio = Number(ratioParam);
    const result = await stake2.aggregate([
      {
        $match: {
          token: token,
          $or: [{ ratio: ratio }, { ratio: Ratio }],
        },
      },
      {
        $count: "totalUser",
      },
    ]);
    const totalUser = result[0]?.totalUser;

    const protocol = await stake2.aggregate([
      {
        $match: {
          token: token,
          $or: [{ ratio: ratio }, { ratio: Ratio }],
        },
      },
      {
        $lookup: {
          from: "registration",
          localField: "user",
          foreignField: "user",
          as: "registration_data",
        },
      },
      {
        $lookup: {
          from: "signup",
          localField: "user",
          foreignField: "wallet_add",
          as: "signup",
        },
      },
      {
        $unwind: {
          path: "$registration_data",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$signup",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          token: 1,
          ratio: 1,
          user: 1,
          amount: 1,
          createdAt: 1,
          txHash: 1,
          userId: "$registration_data.userId",
          referrerId: "$registration_data.referrerId",
          name: "$signup.name",
          phone: "$signup.phone",
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);
    return res.json({
      status: 200,
      protocol,
      totalUser,
    });
  } catch (error) {
    return res.json("Error occurred while fetching protocol data", error);
  }
});

router.get("/topup-data", verifyToken, async (req, res) => {
  try {
    const searchQuery = req.query.search ? req.query.search.trim() : "";
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;
    let filter = {};
    if (searchQuery) {
      filter = {
        $or: [
          { user: { $regex: searchQuery, $options: "i" } },
          { "signup.name": { $regex: searchQuery, $options: "i" } },
        ],
      };
    }

    const totalCountPipeline = [
      {
        $lookup: {
          from: "signup",
          localField: "user",
          foreignField: "wallet_add",
          as: "joinedData",
        },
      },
      { $unwind: { path: "$joinedData", preserveNullAndEmptyArrays: true } },
      { $match: filter },
      { $count: "totalCount" },
    ];

    const totalCountResult = await topup2.aggregate(totalCountPipeline);
    const totalCount =
      totalCountResult.length > 0 ? totalCountResult[0].totalCount : 0;

    const data = await topup2.aggregate([
      {
        $lookup: {
          from: "signup",
          localField: "user",
          foreignField: "wallet_add",
          as: "signup",
        },
      },
      {
        $unwind: {
          path: "$signup",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: filter,
      },
      {
        $project: {
          _id: 1,
          user: 1,
          amount: 1,
          txHash: 1,
          plan: 1,
          createdAt: 1,
          name: "$signup.name",
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $skip: skip
      }, {
        $limit: limit
      }
    ]);
    return res.json({
      status: 200,
      data,
      totalCount,
    });
  } catch (error) {
    console.log(error);
  }
});

async function getTotalTeam(user, page, limit, sortField1, sortField2) {
  try {
    if (user) {
      let skip = (page - 1) * limit;
      let total = await registration.aggregate([
        { $match: { user: user } },
        {
          $graphLookup: {
            from: "registration",
            startWith: "$user",
            connectFromField: "user",
            connectToField: "referrer",
            maxDepth: 19,
            depthField: "level",
            as: "children",
          },
        },
        { $unwind: "$children" },
        { $group: { _id: null, count: { $sum: 1 } } },
      ]);

      let total_team = await registration.aggregate([
        { $match: { user: user } },
        {
          $graphLookup: {
            from: "registration",
            startWith: "$user",
            connectFromField: "user",
            connectToField: "referrer",
            maxDepth: 19,
            depthField: "level",
            as: "children",
          },
        },
        { $unwind: "$children" },
        {
          $group: {
            _id: "$children._id",
            userId: { $first: "$children.userId" },
            user: { $first: "$children.user" },
            rank: { $first: "$children.rank" },
            teamBusiness: { $first: "$children.teamBusiness" },
            directCount: { $first: "$children.directCount" },
            teamCount: { $first: "$children.teamCount" },
            wysStaked: { $first: "$children.wysStaked" },
            timestamp: { $first: "$children.timestamp" },
            directplusteambiz: { $first: "$children.directplusteambiz" },
            staketeambusiness: { $first: "$children.staketeambusiness" },
            level: { $first: { $add: ["$children.level", 1] } },
          },
        },
        { $sort: { [sortField1]: 1, [sortField2]: -1, level: 1 } },

        { $skip: Number(skip) },
        { $limit: Number(limit) },
        {
          $lookup: {
            from: "signup",
            localField: "user",
            foreignField: "wallet_add",
            as: "userDetails",
          },
        },
        {
          $unwind: {
            path: "$userDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            phone: "$userDetails.phone",
            name: "$userDetails.name",
          },
        },
        {
          $lookup: {
            from: "registration",
            localField: "user",
            foreignField: "user",
            as: "user_Details",
          },
        },
        {
          $unwind: {
            path: "$user_Details",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "stakeregisters",
            localField: "user",
            foreignField: "user",
            as: "stakeregisters_data",
          },
        },
        {
          $unwind: {
            path: "$stakeregisters_data",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "topup2",
            let: { user_var: "$user" },
            pipeline: [
              { $match: { $expr: { $eq: ["$user", "$$user_var"] } } },
              { $project: { amount: 1 } },
              { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
            ],
            as: "topup2_data",
          },
        },
        {
          $lookup: {
            from: "stake2",
            let: { user_var: "$user" },
            pipeline: [
              { $match: { $expr: { $eq: ["$user", "$$user_var"] } } },
              { $project: { token: 1, ratio: 1, amount: 1 } },
              { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
            ],
            as: "staking2_data",
          },
        },
        {
          $lookup: {
            from: "stake2",
            let: { user_var: "$user" },
            pipeline: [
              { $match: { $expr: { $eq: ["$user", "$$user_var"] } } },
              { $project: { token: 1, ratio: 1, amount: 1 } },
              { $sort: { createdAt: 1 } },
              { $limit: 1 },
            ],
            as: "staking2_latest",
          },
        },
        {
          $unwind: {
            path: "$topup2_data",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: "$staking2_data",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: "$staking2_latest",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            referrerId: "$user_Details.referrerId",
            wysStaked: "$user_Details.wysStaked",
            teamBusiness: "$user_Details.staketeambusiness",
            txHash: "$user_Details.txHash",
            teamBusiness20level: "$user_Details.teamBusiness20level",
            stakeamount: "$stakeregisters_data.stake_amount",
            totalStak: "$stakeregisters_data.topup_amount",
            topup: "$topup2_data.totalAmount",
            stakingAmount: "$staking2_data.totalAmount",
            rankdata: "$stakeregisters_data.rank",
            token: "$staking2_latest.token",
            ratio: "$staking2_latest.ratio",
            amountfirst: "$staking2_latest.amount",
          },
        },
        {
          $project: {
            userDetails: 0,
            user_Details: 0,
            stakeregisters_data: 0,
            topup2_data: 0,
            staking2_data: 0,
            staking2_latest: 0,
          },
        },
      ]);
      if (total_team) {
        return { totalTeam: total_team, totalTeamCount: total[0]?.count };
      } else {
        return false;
      }
    }
  } catch (error) {
    console.log("Error in getTeamList", error, user, page, limit);
    return false;
  }
}

async function findAllDescendants(referrer) {
  const allUserIds = new Set();
  let currentLevel = [referrer];

  while (currentLevel.length > 0) {
    const directMembers = await registration.aggregate([
      { $match: { referrer: { $in: currentLevel } } },
      { $group: { _id: null, users: { $addToSet: "$user" } } },
    ]);

    if (directMembers.length === 0) {
      break;
    }

    currentLevel = directMembers[0].users;
    currentLevel.forEach((id) => allUserIds.add(id));
  }

  return Array.from(allUserIds);
}

router.get("/team-list", async (req, res) => {
  let user = req.query.user;
  let page = req.query.page;
  let limit = req.query.limit;
  let sortField1 = req.query.sortField1;
  let sortField2 = req.query.sortField2;
  try {
    let { totalTeamCount, totalTeam } = await getTotalTeam(
      user,
      page,
      limit,
      sortField1,
      sortField2
    );
    return res.json({
      status: 200,
      user: user,
      data: totalTeam,
      totalDataCount: totalTeamCount,
      page: page,
      limit: limit,
    });
  } catch (e) {
    console.log("Error in Team List", e);
    return res.json({
      status: 500,
      message: "Some thing went Wrong !",
    });
  }
});

router.post("/approve-withdrawOld", async (req, res) => {
  const { user, txHash, id, amount } = req.body;
  console.log("txHash ", txHash)
  console.log("id ", id)
  const timestamp = moment().format("YYYY-MM-DDTHH:mm:ss.SSSZ");
  try {
    const result = await WithdrawalModel.updateMany(
      { _id: { $in: id } },
      { $set: { isapprove: true, trxnHash: txHash, timestamp: timestamp } }
    );
    if (result) {
      return res.json({
        status: 200,
        message: "Withdraw Approved Successfully",
      });
    } else {
      return res.json({
        status: 400,
        message: "Something went wrong !",
      });
    }
  } catch (error) {
    console.log("Error in approve withdraw", error);
  }
});

router.post("/approve-withdraw", async (req, res) => {
  const { user, txHash, id, rate, amount } = req.body;
  console.log("txHash ", txHash);
  console.log("id ", id);
  const timestamp = moment().format("YYYY-MM-DDTHH:mm:ss.SSSZ");

  try {
    // Ensure id and rate arrays have the same length
    if (id.length !== amount.length) {
      return res.json({
        status: 400,
        message: "The number of ids and rates must be the same.",
      });
    }

    // Update each document individually
    const updatePromises = id.map((itemId, index) =>
      WithdrawalModel.updateOne(
        { _id: itemId },
        {
          $set: {
            isapprove: true,
            trxnHash: txHash,
            timestamp: timestamp,
            sendToken: amount[index] // Set rate from the corresponding index
          }
        }
      )
    );

    // Wait for all updates to complete
    const results = await Promise.all(updatePromises);

    // Check if at least one document was updated
    const modifiedCount = results.reduce((count, result) => count + result.modifiedCount, 0);
    if (modifiedCount > 0) {
      return res.json({
        status: 200,
        message: "Withdraw Approved Successfully",
      });
    } else {
      return res.json({
        status: 400,
        message: "No records were updated!",
      });
    }
  } catch (error) {
    console.log("Error in approve withdraw", error);
    return res.json({
      status: 500,
      message: "Internal Server Error",
    });
  }
});

router.post("/reject-withdraw", async (req, res) => {
  const { user, amount, id } = req.body;

  try {
    const users = await WithdrawalModel.updateOne(
      { _id: id },
      { $set: { isreject: true } }
    );

    if (users.modifiedCount > 0) {
      const udeta = await WithdrawalModel.findOne({ _id: id })
      const wallet_type = udeta.wallet_type;
      if (wallet_type === "working") {
        const walletUpdate = await registration.updateOne(
          { user: user },
          { $inc: { walletreg_income: amount, totalRegWithdraw: -amount } }
        );
        console.log("reject-withdraw api", walletUpdate)
        return res.json({
          status: 200,
          message: "Withdraw Rejected Successfully",
        });
      } else if (wallet_type === "nonworking") {
        const walletUpdate = await registration.updateOne(
          { user: user },
          { $inc: { wallet_income: amount, totalWithdraw: -amount } }
        );
        console.log("reject-withdraw api", walletUpdate)
        return res.json({
          status: 200,
          message: "Withdraw Rejected Successfully",
        });
      }
    } else {
      return res.json({
        status: 400,
        message: "Something went wrong !",
      });
    }
  } catch (error) {
    console.log("Error in reject withdraw", error);
    return res.json({
      status: 500,
      message: "Internel Error !",
    });
  }
});
router.post("/reject-roi-withdraw", async (req, res) => {
  const { user, amount, id } = req.body;
  try {
    const users = await WithdrawalModel.updateOne(
      { _id: id },
      { $set: { isreject: true } }
    );

    const currentDate = new Date();
    if (users) {
      const walletUpdate = await stakeRegister.updateOne(
        { user: user },
        {
          $inc: {
            wallet_roi: amount,
            totalWithdraw: -amount,
            roi_withdraw: -amount,
          },
          $set: { withdraw_endate: currentDate },
        }
      );

      return res.json({
        status: 200,
        message: "Withdraw Rejected Successfully",
      });
    } else {
      return res.json({
        status: 400,
        message: "Something went wrong !",
      });
    }
  } catch (error) {
    console.log("Error in reject withdraw", error);
    return res.json({
      status: 500,
      message: "Internel Error !",
    });
  }
});

router.get("/approved-withdraw", verifyToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 100;
    const searchQuery = req.query.search ? req.query.search.trim() : "";

    let filter = {};
    if (searchQuery) {
      filter = {
        $or: [
          { user: { $regex: searchQuery, $options: "i" } },
          { "joinedData.name": { $regex: searchQuery, $options: "i" } },
        ],
      };
    }

    const totalCountPipeline = [
      {
        $match: { wallet_type: "referral", isapprove: true, isreject: false },
      },
      {
        $lookup: {
          from: "signup",
          localField: "user",
          foreignField: "wallet_add",
          as: "joinedData",
        },
      },
      { $unwind: { path: "$joinedData", preserveNullAndEmptyArrays: true } },
      { $match: filter },
      { $count: "totalCount" },
    ];

    const totalCountResult = await WithdrawalModel.aggregate(
      totalCountPipeline
    );
    const totalCount =
      totalCountResult.length > 0 ? totalCountResult[0].totalCount : 0;

    const dataPipeline = [
      {
        $match: { wallet_type: "referral", isapprove: true, isreject: false },
      },
      {
        $lookup: {
          from: "signup",
          localField: "user",
          foreignField: "wallet_add",
          as: "joinedData",
        },
      },
      { $unwind: { path: "$joinedData", preserveNullAndEmptyArrays: true } },
      { $match: filter },
      {
        $group: {
          _id: "$_id",
          user: { $first: "$user" },
          withdrawAmount: { $first: "$withdrawAmount" },
          wallet_type: { $first: "$wallet_type" },
          recurr_status: { $first: "$recurr_status" },
          createdAt: { $first: "$createdAt" },
          payment_method: { $first: "$payment_method" },
          isapprove: { $first: "$isapprove" },
          isreject: { $first: "$isreject" },
          trxnHash: { $first: "$trxnHash" },
          timestamp: { $first: "$timestamp" },
          Name: { $first: "$joinedData.name" },
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ];

    const data = await WithdrawalModel.aggregate(dataPipeline);

    return res.json({
      status: 200,
      error: false,
      data,
      totalCount,
    });
  } catch (error) {
    console.log("Error In Withdraw Roi", error);
    return res.status(500).json({
      status: 500,
      error: true,
      message: "Internal Server Error",
    });
  }
});
router.get("/reject-withdraw", verifyToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 100;
    const searchQuery = req.query.search ? req.query.search.trim() : "";

    let filter = {};
    if (searchQuery) {
      filter = {
        $or: [
          { user: { $regex: searchQuery, $options: "i" } },
          { "joinedData.name": { $regex: searchQuery, $options: "i" } },
        ],
      };
    }

    const totalCountPipeline = [
      {
        $match: { isapprove: false, isreject: true },
      },
      {
        $lookup: {
          from: "signup",
          localField: "user",
          foreignField: "wallet_add",
          as: "joinedData",
        },
      },
      { $unwind: { path: "$joinedData", preserveNullAndEmptyArrays: true } },
      { $match: filter },
      { $count: "totalCount" },
    ];

    const totalCountResult = await WithdrawalModel.aggregate(
      totalCountPipeline
    );
    const totalCount =
      totalCountResult.length > 0 ? totalCountResult[0].totalCount : 0;

    const dataPipeline = [
      {
        $match: { isapprove: false, isreject: true },
      },
      {
        $lookup: {
          from: "signup",
          localField: "user",
          foreignField: "wallet_add",
          as: "joinedData",
        },
      },
      { $unwind: { path: "$joinedData", preserveNullAndEmptyArrays: true } },
      { $match: filter },
      {
        $project: {
          _id: 1,
          user: 1,
          withdrawAmount: 1,
          wallet_type: 1,
          recurr_status: 1,
          createdAt: 1,
          payment_method: 1,
          recurr_status: 1,
          isapprove: 1,
          isreject: 1,
          trxnHash: 1,
          Name: "$joinedData.name",
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ];

    const data = await WithdrawalModel.aggregate(dataPipeline);

    return res.json({
      status: 200,
      error: false,
      data,
      totalCount,
    });
  } catch (error) {
    console.log("Error In Withdraw Roi", error);
    return res.status(500).json({
      status: 500,
      error: true,
      message: "Internal Server Error",
    });
  }
});

router.get("/top-twenty", verifyToken, async (req, res) => {
  try {
    const limitdata = 50;
    const data = await stakeRegister.aggregate([
      {
        $lookup: {
          from: "registration",
          localField: "user",
          foreignField: "user",
          as: "registration_data",
        },
      },
      {
        $lookup: {
          from: "signup",
          localField: "registration_data.user",
          foreignField: "wallet_add",
          as: "signup_data",
        },
      },
      {
        $unwind: {
          path: "$registration_data",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $unwind: {
          path: "$signup_data",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          _id: 0,
          stake_amount: 1,
          user: 1,
          topup_amount: 1,
          phone: "$signup_data.phone",
          name: "$signup_data.name",
          userId: "$registration_data.userId",
          referrerId: "$registration_data.referrerId",
          teamBussines: "$registration_data.staketeambusiness",
          createdAt: 1,
        },
      },
      {
        $sort: { teamBussines: -1 },
      },
      {
        $limit: limitdata,
      },
    ]);

    return res.json({
      status: 200,
      data,
    });
  } catch (error) {
    console.log(error);
  }
});

async function getOfferData(user, startDate, endDate) {
  try {
    if (!user) return false;

    const start = moment(startDate).utc().toDate();
    const end = moment(endDate).utc().toDate();

    const recentStakes = await stake2
      .find({
        createdAt: { $gte: start, $lte: end },
      })
      .select("user");
    const topup = await topup2
      .find({
        createdAt: { $gte: start, $lte: end },
      })
      .select("user");

    const recentStake2Users = recentStakes.map((stake) => stake.user);
    const topupdata = topup.map((stake) => stake.user);

    let total_team = await registration.aggregate([
      { $match: { user: user } },
      {
        $graphLookup: {
          from: "registration",
          startWith: "$user",
          connectFromField: "user",
          connectToField: "referrer",
          maxDepth: 19,
          depthField: "level",
          as: "children",
        },
      },
      { $unwind: "$children" },
      { $match: { "children.user": { $in: recentStake2Users } } },
      {
        $lookup: {
          from: "stake2",
          localField: "children.user",
          foreignField: "user",
          as: "stake2_data",
        },
      },
      { $unwind: "$stake2_data" },
      { $match: { "stake2_data.createdAt": { $gte: start, $lte: end } } },
      {
        $group: {
          _id: 0,
          stakes: {
            $push: {
              amount: "$stake2_data.amount",
              ratio: "$stake2_data.ratio",
              token: "$stake2_data.token",
            },
          },
        },
      },
    ]);
    const topupTeam = await registration.aggregate([
      { $match: { user: user } },
      {
        $graphLookup: {
          from: "registration",
          startWith: "$user",
          connectFromField: "user",
          connectToField: "referrer",
          maxDepth: 19,
          depthField: "level",
          as: "children",
        },
      },
      { $unwind: "$children" },
      { $match: { "children.user": { $in: topupdata } } },
      {
        $lookup: {
          from: "topup2",
          localField: "children.user",
          foreignField: "user",
          as: "topup_data",
        },
      },
      { $unwind: "$topup_data" },
      { $match: { "topup_data.createdAt": { $gte: start, $lte: end } } },
      {
        $group: {
          _id: 0,
          topups: {
            $push: {
              amount: "$topup_data.amount",
              topup_data: "$topup_data.topup_data",
              protocol: "$topup_data.protocol",
            },
          },
        },
      },
    ]);

    const teamTopupAmount = topupTeam[0]
      ? topupTeam[0].topups.reduce((acc, topup) => acc + topup.amount, 0)
      : 0;

    return { totalTeam: total_team, toupdata: topupTeam, teamTopupAmount };
  } catch (error) {
    console.error("Error in getOfferData", error);
    return false;
  }
}

function processStakeData(data) {
  const allStakes = data.map((item) => item.stakes).flat();
  const filteredStakes = allStakes.filter((stake) => {
    const condition1 = stake.ratio == "10" && stake.token == "WYZ-stUSDT";
    const condition2 = stake.ratio == "20" && stake.token == "WYZ-stUSDT";
    const condition3 = stake.ratio == "30" && stake.token == "WYZ-stUSDT";
    const condition4 = stake.ratio == "40" && stake.token == "WYZ-stUSDT";
    const condition5 = stake.ratio == "50" && stake.token == "WYZ-stUSDT";
    const condition6 = stake.ratio == "15" && stake.token == "sUSDT-stUSDT";
    const condition7 = stake.ratio == "20" && stake.token == "sUSDT-stUSDT";
    const condition8 = stake.ratio == "25" && stake.token == "sUSDT-stUSDT";
    return (
      condition1 ||
      condition2 ||
      condition3 ||
      condition4 ||
      condition5 ||
      condition6 ||
      condition7 ||
      condition8
    );
  });

  const totalAmount = filteredStakes.reduce(
    (total, stake) => total + stake.amount,
    0
  );
  const ratioMultiplier = {
    10: 0.1,
    20: 0.2,
    30: 0.3,
    40: 0.4,
    50: 0.5,
  };

  const totalWYZByProtocol = filteredStakes.reduce((acc, stake) => {
    const ratio = ratioMultiplier[stake.ratio];
    if (!ratio) return acc;

    let factor = ratio;

    const partialValue = (stake.amount * factor) / 20;

    if (!acc[stake.ratio]) {
      acc[stake.ratio] = 0;
    }

    acc[stake.ratio] += partialValue;

    return acc;
  }, {});

  const toalwyz = filteredStakes.reduce((acc, stake) => {
    if (stake.ratio == "10") return acc + (stake.amount * 0.1) / 20;
    if (stake.ratio == "20") return acc + (stake.amount * 0.2) / 20;
    if (stake.ratio == "30") return acc + (stake.amount * 0.3) / 20;
    if (stake.ratio == "40") return acc + (stake.amount * 0.4) / 20;
    if (stake.ratio == "50") return acc + (stake.amount * 0.5) / 20;
    if (stake.ratio == "15" && stake.token == "sUSDT-stUSDT")
      return acc + (stake.amount * 0.15) / 20;
    if (stake.ratio == "20" && stake.token == "sUSDT-stUSDT")
      return acc + (stake.amount * 0.2) / 20;
    if (stake.ratio == "25" && stake.token == "sUSDT-stUSDT")
      return acc + (stake.amount * 0.25) / 20;
    return acc;
  }, 0);

  const toalstusdt = filteredStakes.reduce((acc, stake) => {
    if (stake.ratio == "10") return acc + stake.amount * 0.9;
    if (stake.ratio == "20") return acc + stake.amount * 0.8;
    if (stake.ratio == "30") return acc + stake.amount * 0.7;
    if (stake.ratio == "40") return acc + stake.amount * 0.6;
    if (stake.ratio == "50") return acc + stake.amount * 0.5;
    if (stake.ratio == "15" && stake.token == "sUSDT-stUSDT")
      return acc + stake.amount * 0.85;
    if (stake.ratio == "20" && stake.token == "sUSDT-stUSDT")
      return acc + stake.amount * 0.8;
    if (stake.ratio == "25" && stake.token == "sUSDT-stUSDT")
      return acc + stake.amount * 0.75;
    return acc;
  }, 0);

  const ratioMultiplierstusdt = {
    10: 0.9,
    20: 0.8,
    30: 0.7,
    40: 0.6,
    50: 0.5,
  };
  const totalstudtProtocol = filteredStakes.reduce((acc, stake) => {
    const ratio = ratioMultiplierstusdt[stake.ratio];
    if (!ratio) return acc;

    let factor = ratio;

    const partialValue = stake.amount * factor;

    if (!acc[stake.ratio]) {
      acc[stake.ratio] = 0;
    }

    acc[stake.ratio] += partialValue;

    return acc;
  }, {});

  const ratiusdtWYZ = {
    15: 0.15,
    20: 0.2,
    25: 0.25,
  };

  const totalWYSusdt = filteredStakes.reduce((acc, stake) => {
    if (
      stake.token !== "sUSDT-stUSDT" ||
      !(stake.ratio == "15" || stake.ratio == "20" || stake.ratio == "25")
    ) {
      return acc;
    }

    const ratio = ratiusdtWYZ[stake.ratio];
    if (!ratio) return acc;

    const partialValue = stake.amount * ratio;

    if (!acc[stake.ratio]) {
      acc[stake.ratio] = 0;
    }

    acc[stake.ratio] += partialValue;

    return acc;
  }, {});

  const ratiusdt = {
    15: 0.85,
    20: 0.8,
    25: 0.75,
  };

  const totalStudtUSDT = filteredStakes.reduce((acc, stake) => {
    if (
      stake.token !== "sUSDT-stUSDT" ||
      !(stake.ratio == "15" || stake.ratio == "20" || stake.ratio == "25")
    ) {
      return acc;
    }

    const ratio = ratiusdt[stake.ratio];
    if (!ratio) return acc;

    const partialValue = stake.amount * ratio;

    if (!acc[stake.ratio]) {
      acc[stake.ratio] = 0;
    }

    acc[stake.ratio] += partialValue;

    return acc;
  }, {});
  const totalByProtocol = filteredStakes.reduce((acc, stake) => {
    if (!acc[stake.token]) {
      acc[stake.token] = {};
    }
    if (!acc[stake.token][stake.ratio]) {
      acc[stake.token][stake.ratio] = 0;
    }
    acc[stake.token][stake.ratio] += stake.amount;
    return acc;
  }, {});

  return {
    totalstudtProtocol,
    totalWYZByProtocol,
    toalwyz,
    totalWYSusdt,
    totalStudtUSDT,
    totalAmount,
    toalstusdt,
    totalByProtocol,
  };
}

router.post("/team-data", async (req, res) => {
  const { user, startDate, endDate } = req.body;

  try {
    const users = await registration.findOne(
      { user: user },
      { userId: 1, _id: 0 }
    );
    console.log(user, "users");
    let { totalTeam, teamTopupAmount } = await getOfferData(
      user,
      startDate,
      endDate
    );

    let {
      toalstusdt,
      toalwyz,
      totalAmount,
      totalstudtProtocol,
      totalWYZByProtocol,
      totalWYSusdt,
      totalStudtUSDT,
      totalByProtocol,
    } = processStakeData(totalTeam);

    const start = moment(startDate).utc().toDate();
    const end = moment(endDate).utc().toDate();

    const totalWithdraw = await WithdrawalModel.aggregate([
      {
        $match: {
          user: user,
          isapprove: true,
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$withdrawAmount" },
        },
      },
    ]);
    const totalWithdrawAmount =
      (totalWithdraw.length > 0 ? totalWithdraw[0].totalAmount : 0) * 0.95;
    const totaldeposite = await stake2.aggregate([
      {
        $match: {
          user: user,
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);
    const totaldepositeAmount =
      totaldeposite.length > 0 ? totaldeposite[0].totalAmount : 0;

    const totaltopup = await topup2.aggregate([
      {
        $match: {
          user: user,
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);
    const totalTopupAmount =
      totaltopup.length > 0 ? totaltopup[0].totalAmount : 0;

    return res.json({
      status: 200,
      toalstusdt,
      toalwyz,
      totalAmount,
      totalstudtProtocol,
      totalWYZByProtocol,
      totalWithdrawAmount,
      totaldepositeAmount,
      totalTopupAmount,
      teamTopupAmount,
      totalStudtUSDT,
      totalWYSusdt,
      totalByProtocol,
      data: users?.userId,
    });
  } catch (e) {
    console.log("Error in Team List", e);
    return res.json({
      status: 500,
      message: "Some thing went Wrong !",
    });
  }
});

router.get("/fifty-fifty", verifyToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page || 1);
    const limit = 100;
    const searchQuery = req.query.search ? req.query.search.trim() : "";

    let filter = {};
    if (searchQuery) {
      filter = {
        $or: [
          { user: { $regex: searchQuery, $options: "i" } },
          { "joinedData.name": { $regex: searchQuery, $options: "i" } },
        ],
      };
    }

    const totalCount = await stake2.aggregate([
      { $match: { regBy: "Admin" } },
      {
        $lookup: {
          from: "signup",
          localField: "user",
          foreignField: "wallet_add",
          as: "joinedData",
        },
      },
      { $unwind: { path: "$joinedData", preserveNullAndEmptyArrays: true } },
      { $match: filter },
      { $count: "totalCount" },
    ]);

    const data = await stake2.aggregate([
      { $match: { regBy: "Admin" } },
      {
        $lookup: {
          from: "signup",
          localField: "user",
          foreignField: "wallet_add",
          as: "joinedData",
        },
      },
      { $unwind: { path: "$joinedData", preserveNullAndEmptyArrays: true } },
      {
        $match: {
          $or: [
            { "joinedData.name": { $regex: searchQuery, $options: "i" } },
            { user: { $regex: searchQuery, $options: "i" } },
          ],
        },
      },
      {
        $project: {
          user: 1,
          timestamp: 1,
          amount: 1,
          token: 1,
          ratio: 1,
          txHash: 1,
          createdAt: 1,
          Name: "$joinedData.name",
        },
      },
      { $sort: { timestamp: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ]);

    return res.json({
      status: 200,
      error: false,
      data,
      totalCount,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    return res.json({
      error: true,
      status: 500,
      message: error.message,
    });
  }
});

router.get("/withdraw-data-protocol", async (req, res) => {
  try {
    const data = await stake2.aggregate([
      {
        $match: {
          $or: [{ ratio: "10", ratio: 10 }],
        },
      },
      {
        $project: {
          _id: 0,
          user: 1,
        },
      },
      {
        $lookup: "",
      },
    ]);
    return res.json({
      status: 200,
      data,
    });
  } catch (error) {
    console.log(error, "Error In withdraw-data-protocol ");
  }
});

router.post("/pool-achivers", async (req, res) => {
  try {
    const rank = req.query.rank;
    const totaluser = await stakeReward.find({ rank: rank }).countDocuments();
    const data = await stakeReward.aggregate([
      {
        $lookup: {
          from: "signup",
          localField: "user",
          foreignField: "wallet_add",
          as: "signup_data",
        },
      },
      {
        $unwind: "$signup_data",
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $group: {
          _id: "$signup_data.userId",
          latestData: { $first: "$$ROOT" },
        },
      },
      {
        $replaceRoot: {
          newRoot: "$latestData",
        },
      },
      {
        $project: {
          _id: 0,
          name: "$signup_data.name",
          referrerId: "$signup_data.referrerId",
          userId: "$signup_data.userId",
          user: 1,
          amount: 1,
          directteam: 1,
          directbusiness: 1,
          teamsize: 1,
          targetbusiness: 1,
          seventy: 1,
          thirty: 1,
          rank: 1,
          rankno: 1,
          send_status: 1,
          createdAt: 1,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $match: {
          rank: rank,
        },
      },
    ]);

    return res.json({
      status: 200,
      data,
      totaluser,
    });
  } catch (error) {
    console.log(error, "Error In pool-achivers");
  }
});

router.get("/withdraw-info", verifyToken, async (req, res) => {
  {
    try {
      const firstdata = await stake2.aggregate([
        {
          $match: {
            token: "WYZ-stUSDT",
            $or: [{ ratio: "10" }, { ratio: 10 }],
          },
        },
        {
          $group: {
            _id: "$user",
            tokens: { $addToSet: "$token" },
            ratios: { $addToSet: "$ratio" },
            count: { $sum: 1 },
          },
        },
        {
          $match: {
            tokens: ["WYZ-stUSDT"],
            ratios: { $in: ["10", 10], $size: 1 },
            count: 1,
          },
        },
        {
          $lookup: {
            from: "withdrawals",
            localField: "_id",
            foreignField: "user",
            as: "lookupResult_data",
          },
        },
        {
          $unwind: "$lookupResult_data",
        },
        {
          $match: {
            "lookupResult_data.isapprove": true,
          },
        },
        {
          $group: {
            _id: null,
            totalAmountCount: { $sum: "$lookupResult_data.withdrawAmount" },
          },
        },
        {
          $project: {
            _id: 0,
            totalAmountCount: 1,
          },
        },
      ]);
      const secondData = await stake2.aggregate([
        {
          $match: {
            token: "WYZ-stUSDT",
            $or: [{ ratio: "20" }, { ratio: 20 }],
          },
        },
        {
          $group: {
            _id: "$user",
            tokens: { $addToSet: "$token" },
            ratios: { $addToSet: "$ratio" },
          },
        },
        {
          $match: {
            tokens: ["WYZ-stUSDT"],
            ratios: { $size: 1, $in: ["20", 20] },
          },
        },
        {
          $lookup: {
            from: "withdrawals",
            localField: "_id",
            foreignField: "user",
            as: "lookupResult_data",
          },
        },
        {
          $unwind: "$lookupResult_data",
        },
        {
          $match: {
            "lookupResult_data.isapprove": true,
          },
        },
        {
          $group: {
            _id: null,
            totalAmountCount: { $sum: "$lookupResult_data.withdrawAmount" },
          },
        },
        {
          $project: {
            _id: 0,
            totalAmountCount: 1,
          },
        },
      ]);
      const thirdData = await stake2.aggregate([
        {
          $match: {
            token: "WYZ-stUSDT",
            $or: [{ ratio: "30" }, { ratio: 30 }],
          },
        },
        {
          $group: {
            _id: "$user",
            tokens: { $addToSet: "$token" },
            ratios: { $addToSet: "$ratio" },
          },
        },
        {
          $match: {
            tokens: ["WYZ-stUSDT"],
            ratios: { $size: 1, $in: ["30", 30] },
          },
        },
        {
          $lookup: {
            from: "withdrawals",
            localField: "_id",
            foreignField: "user",
            as: "lookupResult_data",
          },
        },
        {
          $unwind: "$lookupResult_data",
        },
        {
          $match: {
            "lookupResult_data.isapprove": true,
          },
        },
        {
          $group: {
            _id: null,
            totalAmountCount: { $sum: "$lookupResult_data.withdrawAmount" },
          },
        },
        {
          $project: {
            _id: 0,
            totalAmountCount: 1,
          },
        },
      ]);
      const fouthData = await stake2.aggregate([
        {
          $match: {
            token: "WYZ-stUSDT",
            $or: [{ ratio: "40" }, { ratio: 40 }],
          },
        },
        {
          $group: {
            _id: "$user",
            tokens: { $addToSet: "$token" },
            ratios: { $addToSet: "$ratio" },
          },
        },
        {
          $match: {
            tokens: ["WYZ-stUSDT"],
            ratios: { $size: 1, $in: ["40", 40] },
          },
        },
        {
          $lookup: {
            from: "withdrawals",
            localField: "_id",
            foreignField: "user",
            as: "lookupResult_data",
          },
        },
        {
          $unwind: "$lookupResult_data",
        },
        {
          $match: {
            "lookupResult_data.isapprove": true,
          },
        },
        {
          $unwind: "$lookupResult_data",
        },
        {
          $group: {
            _id: null,
            totalAmountCount: { $sum: "$lookupResult_data.withdrawAmount" },
          },
        },
        {
          $project: {
            _id: 0,
            totalAmountCount: 1,
          },
        },
      ]);
      const fifthData = await stake2.aggregate([
        {
          $match: {
            token: "WYZ-stUSDT",
            $or: [{ ratio: "50" }, { ratio: 50 }],
          },
        },
        {
          $group: {
            _id: "$user",
            tokens: { $addToSet: "$token" },
            ratios: { $addToSet: "$ratio" },
          },
        },
        {
          $match: {
            tokens: ["WYZ-stUSDT"],
            ratios: { $size: 1, $in: ["50", 50] },
          },
        },
        {
          $lookup: {
            from: "withdrawals",
            localField: "_id",
            foreignField: "user",
            as: "lookupResult_data",
          },
        },
        {
          $unwind: "$lookupResult_data",
        },
        {
          $match: {
            "lookupResult_data.isapprove": true,
          },
        },
        {
          $group: {
            _id: null,
            totalAmountCount: { $sum: "$lookupResult_data.withdrawAmount" },
          },
        },
        {
          $project: {
            _id: 0,
            totalAmountCount: 1,
          },
        },
      ]);
      const sixData = await stake2.aggregate([
        {
          $match: {
            token: "sUSDT-stUSDT",
            $or: [{ ratio: "15" }, { ratio: 15 }],
          },
        },
        {
          $group: {
            _id: "$user",
            tokens: { $addToSet: "$token" },
            ratios: { $addToSet: "$ratio" },
          },
        },
        {
          $match: {
            tokens: ["sUSDT-stUSDT"],
            ratios: { $size: 1, $in: ["15", 15] },
          },
        },
        {
          $lookup: {
            from: "withdrawals",
            localField: "_id",
            foreignField: "user",
            as: "lookupResult_data",
          },
        },
        {
          $unwind: "$lookupResult_data",
        },
        {
          $match: {
            "lookupResult_data.isapprove": true,
          },
        },
        {
          $group: {
            _id: null,
            totalAmountCount: { $sum: "$lookupResult_data.withdrawAmount" },
          },
        },
        {
          $project: {
            _id: 0,
            totalAmountCount: 1,
          },
        },
      ]);
      const sevenData = await stake2.aggregate([
        {
          $match: {
            token: "sUSDT-stUSDT",
            $or: [{ ratio: "20" }, { ratio: 20 }],
          },
        },
        {
          $group: {
            _id: "$user",
            tokens: { $addToSet: "$token" },
            ratios: { $addToSet: "$ratio" },
          },
        },
        {
          $match: {
            tokens: ["sUSDT-stUSDT"],
            $expr: { $eq: [{ $size: "$ratios" }, 1] },
            ratios: { $size: 1, $in: ["20", 20] },
          },
        },
        {
          $lookup: {
            from: "withdrawals",
            localField: "_id",
            foreignField: "user",
            as: "lookupResult_data",
          },
        },
        {
          $unwind: "$lookupResult_data",
        },
        {
          $group: {
            _id: null,
            totalAmountCount: { $sum: "$lookupResult_data.withdrawAmount" },
          },
        },
        {
          $project: {
            _id: 0,
            totalAmountCount: 1,
          },
        },
      ]);
      const eightData = await stake2.aggregate([
        {
          $match: {
            token: "sUSDT-stUSDT",
            $or: [{ ratio: "25" }, { ratio: 25 }],
          },
        },
        {
          $group: {
            _id: "$user",
            tokens: { $addToSet: "$token" },
            ratios: { $addToSet: "$ratio" },
            count: { $sum: 1 },
          },
        },
        {
          $match: {
            tokens: ["sUSDT-stUSDT"],
            ratios: { $size: 1, $in: ["25", 25] },
          },
        },
        {
          $lookup: {
            from: "withdrawals",
            localField: "_id",
            foreignField: "user",
            as: "lookupResult_data",
          },
        },
        {
          $unwind: "$lookupResult_data",
        },
        {
          $match: {
            "lookupResult_data.isapprove": true,
          },
        },
        {
          $group: {
            _id: null,
            totalAmountCount: { $sum: "$lookupResult_data.withdrawAmount" },
          },
        },
        {
          $project: {
            _id: 0,
            totalAmountCount: 1,
          },
        },
      ]);
      const firstProtocol = firstdata[0]?.totalAmountCount;
      const secondProtocol = secondData[0]?.totalAmountCount;
      const thirdProtocol = thirdData[0]?.totalAmountCount;
      const fourthProtocol = fouthData[0]?.totalAmountCount;
      const fifthProtocol = fifthData[0]?.totalAmountCount;
      const sithProtocol = sixData[0]?.totalAmountCount;
      const sevenProtocol = sevenData[0]?.totalAmountCount;
      const eightProtocol = eightData[0]?.totalAmountCount;
      return res.json({
        status: 200,
        firstProtocol,
        secondProtocol,
        thirdProtocol,
        fourthProtocol,
        fifthProtocol,
        sithProtocol,
        sevenProtocol,
        eightProtocol,
      });
    } catch (error) {
      console.log(error, "Error In withdraw-info");
    }
  }
});

router.post("/pool-data", verifyToken, async (req, res) => {
  try {
    const pool = parseInt(req.query.pool) || 50000;
    const page = parseInt(req.query.page) || 1;
    const limit = 100;
    const skip = (page - 1) * limit;
    const totaluser = await stakePool.find({ pool: pool }).countDocuments();

    const data = await stakePool.aggregate([
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $group: {
          _id: "$user",
          latestPool: { $first: "$pool" },
          user: { $first: "$user" },
          seventy: { $first: "$seventy" },
          thirty: { $first: "$thirty" },
          createdAt: { $first: "$createdAt" },
        },
      },
      {
        $match: {
          latestPool: pool,
        },
      },
      {
        $lookup: {
          from: "signup",
          localField: "user",
          foreignField: "wallet_add",
          as: "signup_data",
        },
      },
      {
        $unwind: "$signup_data",
      },
      {
        $project: {
          _id: 0,
          user: 1,
          name: "$signup_data.name",
          phone: "$signup_data.phone",
          referrerId: "$signup_data.referrerId",
          userId: "$signup_data.userId",
          seventy: 1,
          thirty: 1,
          createdAt: 1,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);
    return res.json({
      status: 200,
      data,
      totaluser,
    });
  } catch (error) {
    console.log(error, "Error In Pool Data");
  }
});

router.get("/roi-approve", verifyToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 100;
    const searchQuery = req.query.search ? req.query.search.trim() : "";

    let filter = {};
    if (searchQuery) {
      filter = {
        $or: [
          { user: { $regex: searchQuery, $options: "i" } },
          { "joinedData.name": { $regex: searchQuery, $options: "i" } },
        ],
      };
    }

    const totalCountPipeline = [
      { $match: { wallet_type: "roi", isapprove: true, isreject: false } },
      {
        $lookup: {
          from: "signup",
          localField: "user",
          foreignField: "wallet_add",
          as: "joinedData",
        },
      },
      { $unwind: { path: "$joinedData", preserveNullAndEmptyArrays: true } },
      { $match: filter },
      { $count: "totalCount" },
    ];

    const totalCountResult = await WithdrawalModel.aggregate(
      totalCountPipeline
    );
    const totalCount =
      totalCountResult.length > 0 ? totalCountResult[0].totalCount : 0;

    const dataPipeline = [
      { $match: { wallet_type: "roi", isapprove: true, isreject: false } },
      {
        $lookup: {
          from: "signup",
          localField: "user",
          foreignField: "wallet_add",
          as: "joinedData",
        },
      },
      { $unwind: { path: "$joinedData", preserveNullAndEmptyArrays: true } },
      { $match: filter },
      {
        $group: {
          _id: "$_id",
          user: { $first: "$user" },
          withdrawAmount: { $first: "$withdrawAmount" },
          wallet_type: { $first: "$wallet_type" },
          recurr_status: { $first: "$recurr_status" },
          createdAt: { $first: "$createdAt" },
          payment_method: { $first: "$payment_method" },
          isapprove: { $first: "$isapprove" },
          isreject: { $first: "$isreject" },
          trxnHash: { $first: "$trxnHash" },
          timestamp: { $first: "$timestamp" },
          Name: { $first: "$joinedData.name" },
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ];

    const data = await WithdrawalModel.aggregate(dataPipeline);

    return res.json({
      status: 200,
      error: false,
      data,
      totalCount,
    });
  } catch (error) {
    console.log("Error In Withdraw Roi", error);
    return res.status(500).json({
      status: 500,
      error: true,
      message: "Internal Server Error",
    });
  }
});

router.get("/complete-3x", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 100;
    const searchQuery = req.query.search ? req.query.search.trim() : "";
    const applyEqualFilter = req.query.status == "true";

    let filter = {};
    if (searchQuery) {
      filter = {
        $or: [
          { user: { $regex: searchQuery, $options: "i" } },
          { "signup_data.name": { $regex: searchQuery, $options: "i" } },
        ],
      };
    }

    const totalCountPipeline = [
      {
        $lookup: {
          from: "signup",
          localField: "user",
          foreignField: "wallet_add",
          as: "signup_data",
        },
      },
      { $unwind: { path: "$signup_data", preserveNullAndEmptyArrays: true } },
      { $match: filter },
    ];

    if (applyEqualFilter) {
      totalCountPipeline.push({
        $match: {
          $and: [
            { $expr: { $eq: ["$totalIncome", "$return"] } },
            { totalIncome: { $gt: 0 } },
          ],
        },
      });
    } else {
      totalCountPipeline.push({
        $match: {
          $expr: { $ne: ["$totalIncome", "$return"] },
        },
      });
    }

    totalCountPipeline.push({ $count: "totalCount" });

    const totalCountResult = await stakeRegister.aggregate(totalCountPipeline);
    const totalCount =
      totalCountResult.length > 0 ? totalCountResult[0].totalCount : 0;

    const dataPipeline = [
      {
        $lookup: {
          from: "signup",
          localField: "user",
          foreignField: "wallet_add",
          as: "signup_data",
        },
      },
      {
        $lookup: {
          from: "registration",
          localField: "user",
          foreignField: "user",
          as: "regestation_data",
        },
      },
      { $unwind: { path: "$signup_data", preserveNullAndEmptyArrays: true } },
      {
        $unwind: {
          path: "$regestation_data",
          preserveNullAndEmptyArrays: true,
        },
      },
      { $match: filter },
    ];

    if (applyEqualFilter) {
      dataPipeline.push({
        $match: {
          $and: [
            { $expr: { $eq: ["$totalIncome", "$return"] } },
            { totalIncome: { $gt: 0 } },
          ],
        },
      });
    } else {
      dataPipeline.push({
        $match: {
          $expr: { $ne: ["$totalIncome", "$return"] },
        },
      });
    }

    dataPipeline.push(
      {
        $project: {
          _id: 0,
          name: "$signup_data.name",
          user: 1,
          return: 1,
          topup_amount: 1,
          totalIncome: 1,
          totalWithdraw: 1,
          rank: 1,
          teamBusiness: "$regestation_data.staketeambusiness",
          rankbonus: 1,
          createdAt: 1,
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit }
    );

    const data = await stakeRegister.aggregate(dataPipeline);

    return res.json({
      status: 200,
      data,
      totalCount,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/ruccring-income", verifyToken, async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = 100;

    let searchQuery = req.query.search ? req.query.search.trim() : "";

    let filter = {};
    if (searchQuery) {
      filter = {
        $or: [
          { user: { $regex: searchQuery, $options: "i" } },
          { "signup_data.name": { $regex: searchQuery, $options: "i" } },
          { "signup_data.userId": { $regex: searchQuery, $options: "i" } },
        ],
      };
    }
    const totalCountPipeline = [
      {
        $lookup: {
          from: "signup",
          localField: "user",
          foreignField: "wallet_add",
          as: "signup_record",
        },
      },
      { $unwind: { path: "$signup_record", preserveNullAndEmptyArrays: true } },
      { $match: filter },
      { $count: "totalCount" },
    ];

    const totalCountResult = await recurrtransfer.aggregate(totalCountPipeline);
    const totalCount =
      totalCountResult.length > 0 ? totalCountResult[0].totalCount : 0;

    const dataPipeline = [
      {
        $lookup: {
          from: "signup",
          localField: "user",
          foreignField: "wallet_add",
          as: "signup_data",
        },
      },
      { $unwind: { path: "$signup_data", preserveNullAndEmptyArrays: true } },
      { $match: filter },
      {
        $project: {
          _id: 0,
          name: "$signup_data.name",
          userId: "$signup_data.userId",
          user: 1,
          amount: 1,
          totalIncome: 1,
          recurrBalance: 1,
          createdAt: 1,
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ];

    const data = await recurrtransfer.aggregate(dataPipeline);

    return res.json({
      status: 200,
      totalCount,
      data,
    });
  } catch (error) {
    console.log(error, "Ruccring Income");
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
});

router.post("/add-notification", verifyToken, async (req, res) => {
  try {
    const { notify_type, message, criteria } = req.body;

    if (!notify_type && !message) {
      return res.json({
        status: 200,
        message: "Param is required"
      })
    }
    if (notify_type == "target" && !criteria) {
      return res.json({
        status: 200,
        message: "Param is required"
      })
    }
    const isnote = await notification.create({
      notify_type: notify_type,
      message: message,
      criteria: criteria ? criteria : 0
    })
    if (isnote) {
      return res.json({
        status: 200,
        message: "Notification Added Successfully"
      })
    }
  } catch (error) {

  }
})

async function generateRandomString(length) {
  return crypto.randomBytes(Math.ceil(length / 2))
    .toString('hex') // Convert to hexadecimal format
    .slice(0, length); // Trim to desired length
}


router.post("/add-offer-banner", async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(200)
        .json({ status: false, message: "No file uploaded." });
      //   throw new Error('No file uploaded.');
    }

    // uploading aadhar image
    var randomUid = generateRandomString(50);
    const extension = path.extname(req.file.originalname).toLowerCase();
    randomUid = randomUid + extension;
    const uploadPath = path.join(__dirname, "../../public/upload", randomUid);
    require("fs").writeFileSync(uploadPath, req.file.buffer);

    //console.log("file_name",req.file.originalname);

    const filePath = path.join(
      __dirname,
      "/../public",
      "uploads",
      randomUid
    );
    let data = new FormData();
    data.append("file", fs.createReadStream(filePath));


    console.log(error);
    const imagePath = path.join(
      __dirname,
      "../public/upload",
      randomUid
    );
    console.log(imagePath);
    //Helper.deleteFileWithRetry(imagePath);

  } catch (error) {
    console.log(error);
    return error;
  }
})

module.exports = router;
