const express = require("express");
const router = express.Router();
const registration = require("../model/registration");
const stake2 = require("../model/stake");
const moment = require("moment-timezone");
const WithdrawalModel = require("../model/withdraw");
const { verifyToken } = require("../Middleware/jwtToken");
const { compareSync } = require("bcrypt");
const SlotPurchased = require("../model/slotPurchased");
const UserIncome = require("../model/userIncome");
const newuserplace = require("../model/newuserplace");
const LevelIncome = require("../model/LevelIncome");
const cron = require("node-cron");
const AsyncLock = require("async-lock");
const Web3 = require("web3");
const Profile = require("../model/Profile");
const reEntry = require("../model/reEntry");
const lock = new AsyncLock();

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

const ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "reciever",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "reward",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "level",
        type: "uint256",
      },
    ],
    name: "LevelIncome",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      {
        indexed: true,
        internalType: "address",
        name: "referrer",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "place",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "level",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "cycle",
        type: "uint256",
      },
    ],
    name: "NewUserPlace",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      {
        indexed: false,
        internalType: "uint256",
        name: "level",
        type: "uint256",
      },
    ],
    name: "ReEntry",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      {
        indexed: true,
        internalType: "address",
        name: "referrer",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "userId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "referrerId",
        type: "uint256",
      },
    ],
    name: "Registration",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "receiver",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "level",
        type: "uint256",
      },
    ],
    name: "UserIncome",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      {
        indexed: false,
        internalType: "uint256",
        name: "weeklyReward",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "nonce",
        type: "uint256",
      },
    ],
    name: "Withdraw",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "onOwnershipTransferred",
    type: "event",
  },
  {
    inputs: [],
    name: "ETHER",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "JOINING_AMT",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "LAST_LEVEL",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "USDT",
    outputs: [{ internalType: "contract IERC20", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "findReferrer",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_user", type: "address" },
      { internalType: "uint256", name: "weeklyReward", type: "uint256" },
      { internalType: "uint256", name: "deadline", type: "uint256" },
    ],
    name: "getWithdrawHash",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "idToAddress",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_usdt", type: "address" },
      { internalType: "address", name: "_owner", type: "address" },
      { internalType: "address", name: "_signOperator", type: "address" },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "isUserExists",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_referrel", type: "address" }],
    name: "joinPlan",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "lastUserId",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "nonce",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_newSignOperator", type: "address" },
    ],
    name: "setSignOperator",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "signOperator",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "users",
    outputs: [
      { internalType: "uint256", name: "id", type: "uint256" },
      { internalType: "address", name: "referrer", type: "address" },
      { internalType: "uint256", name: "partnersCount", type: "uint256" },
      { internalType: "uint256", name: "holdIncome", type: "uint256" },
      { internalType: "uint256", name: "matrixIncome", type: "uint256" },
      { internalType: "uint256", name: "levelIncome", type: "uint256" },
      { internalType: "uint256", name: "weeklyIncome", type: "uint256" },
      { internalType: "uint256", name: "reinvestCount", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
    name: "withdrawUSD",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "weeklyReward", type: "uint256" },
      { internalType: "uint8", name: "v", type: "uint8" },
      { internalType: "bytes32", name: "r", type: "bytes32" },
      { internalType: "bytes32", name: "s", type: "bytes32" },
      { internalType: "uint256", name: "deadline", type: "uint256" },
    ],
    name: "withdrawWithSignature",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "x3CurrentvId",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "x3Index",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "x3vId_number",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
];
const contract = new web3.eth.Contract(ABI, process.env.MAIN_CONTRACT);

router.get("/dashboard", async (req, res) => {
  const { address } = req.query;
  console.log(address, "address");

  try {
    // Find the user
    const user = await registration.findOne({ user: address });

    if (!user) {
      return res.status(404).json({ msg: "User not found", success: false });
    }

    // Fetch income records from both collections
    const userIncomeRecords = await UserIncome.find({ receiver: address });
    const levelIncomeRecords = await LevelIncome.find({ receiver: address });
    const totalWithdraw = await WithdrawalModel.find({receiver: address})

    // Calculate totals
    const totalUserIncome = userIncomeRecords.reduce(
      (sum, record) => sum + record.amount,
      0
    );
    const totalLevelIncome = levelIncomeRecords.reduce(
      (sum, record) => sum + record.reward, 
      0
    );

    const totalWeeklyReward = totalWithdraw.reduce(
      (sum, record)=> sum + record.weeklyReward,
      0
    );

    const directReff = await registration.find({ referrer: address });

    // Create enhanced user object
    const userWithIncome = {
      ...user.toObject(), // Convert mongoose document to plain object
      userIncome: totalUserIncome,
      levelIncome: totalLevelIncome,
      directRefferer : directReff.length,
      totalWithdraw: totalWeeklyReward,
      uid: user.uId

    };

    res.status(200).json({
      msg: "Data fetch successful",
      success: true,
      user: userWithIncome,
    });
  } catch (error) {
    res.status(500).json({
      msg: "Error in data fetching",
      success: false,
      error: error.message,
    });
  }
});

router.get("/reEntryReport", async(req,res) =>{
  const {address} = req.query;

  const ReentryData = await reEntry.find({user: address});

  res
  .status(200)
  .json({ msg: "Data fetch successful", success: true, ReEntryData: ReentryData });

})

router.get("/Matrix", async (req, res) => {
  const { address } = req.query;
  try {
    const user = await newuserplace.find({ referrer: address });

    if (!user) {
      return res.status(404).json({ msg: "User not found", success: false });
    }

    const mergedData = await Promise.all(
      user.map(async (record) => {
        const userDetails = await registration.findOne({ user: record.user }); // Assuming userId is stored in newuserplace records

        // Step 3: Merge the user details with the newuserplace record
        return {
          ...record.toObject(), // Convert Mongoose document to plain JavaScript object
          userId: userDetails ? userDetails.userId : null, // Add user details to the record
        };
      })
    );

    res
      .status(200)
      .json({ msg: "Data fetch successful", success: true, user: mergedData });
  } catch (error) {
    res.status(500).json({
      msg: "Error in data fetching",
      success: false,
      error: error.message,
    });
  }
});
router.get("/userIncomeByUser", async (req, res) => {
  const { receiver } = req.query;
  try {
    const user = await UserIncome.find({ receiver: receiver });

    if (!user) {
      return res.status(404).json({ msg: "User not found", success: false });
    }

    const mergedData = await Promise.all(
      user.map(async (record) => {
        const userDetails = await registration.findOne({ user: record.sender }); // Assuming userId is stored in newuserplace records

        // Step 3: Merge the user details with the newuserplace record
        return {
          ...record.toObject(), // Convert Mongoose document to plain JavaScript object
          userId: userDetails ? userDetails.userId : null, // Add user details to the record
        };
      })
    );

    res
      .status(200)
      .json({ msg: "Data fetch successful", success: true, user: mergedData });
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Error in data fetching", success: false, error: error });
  }
});
router.get("/levelIncomeByUser", async (req, res) => {
  const { receiver } = req.query;
  try {
    const user = await LevelIncome.find({ receiver: receiver });

    if (!user) {
      return res.status(404).json({ msg: "User not found", success: false });
    }

    const mergedData = await Promise.all(
      user.map(async (record) => {
        const userDetails = await registration.findOne({ user: record.sender }); // Assuming userId is stored in newuserplace records

        // Step 3: Merge the user details with the newuserplace record
        return {
          ...record.toObject(), // Convert Mongoose document to plain JavaScript object
          userId: userDetails ? userDetails.userId : null, // Add user details to the record
        };
      })
    );

    res
      .status(200)
      .json({ msg: "Data fetch successful", success: true, user: mergedData });
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Error in data fetching", success: false, error: error });
  }
});
router.get("/withdrawReport", async (req, res) => {
  const { address } = req.query;
  try {
    const user = await WithdrawalModel.find({ user: address });

    if (!user) {
      return res.status(404).json({ msg: "User not found", success: false });
    }

    const mergedData = await Promise.all(
      user.map(async (record) => {
        const userDetails = await registration.findOne({ user: record.user }); // Assuming userId is stored in newuserplace records

        // Step 3: Merge the user details with the newuserplace record
        return {
          ...record.toObject(), // Convert Mongoose document to plain JavaScript object
          userId: userDetails ? userDetails.userId : null, // Add user details to the record
        };
      })
    );

    res
      .status(200)
      .json({ msg: "Data fetch successful", success: true, user: mergedData });
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Error in data fetching", success: false, error: error });
  }
})
router.get("/directReferrer", async (req, res) => {
  let { address } = req.query;
  if (!address) {
    return res.status(400).json({ success: false, message: "Invalid input" });
  }

  const data = await registration.find({ referrer: address });

  return res.status(200).json({
    data,
  });
});

router.get("/getTeam", async (req, res)=>{

    const {address} = req.query
    
      try {
        const userData = await registration
          .aggregate([
            { $match: { user: address } },
            {
              $graphLookup: {
                from: "Registration",
                startWith: "$user",
                connectFromField: "user",
                connectToField: "referrer",
                as: "team",
                maxDepth: 5,
                depthField: "level",
              },
            },
            { $unwind: "$team" },
            {
              $project: {
                _id: 0,
                userId: "$team.userId",
                user: "$team.user",
                referrer: "$team.referrer",
                referrerId: "$team.referrerId",
                timestamp: "$team.timestamp",
                createdAt: "$team.createdAt",
              },
            },
          ])
          .sort({ createdAt: 1 });
    
        const teamSize = userData.length;
        console.log(`Team size for ${address}: ${teamSize}`);


            res.json(userData)
       
        
      } catch (error) {
        console.error(`Error fetching team size for ${address}:`, error);
      }
    
})
router.get("/getAddressbyRefrralIdd", async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const record = await registration.findOne({ userId: userId });

    res.status(200).json(record.user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});
router.get("/getdetailbyUserId", async (req, res) => {
  try {
    const { address } = req.query;

    if (!address) {
      return res.status(400).json({ error: "address is required" });
    }

    const record = await registration.findOne({ user: address });

    res.status(200).json(record);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});


async function todayTotalIncome(address) {
  try {
    // Get start and end of today
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setUTCHours(23, 59, 59, 999);

    // Filter for today's income for given address
    const levelIncomeToday = await LevelIncome.find({
      receiver: address,
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    const userIncomeToday = await UserIncome.find({
      receiver: address,
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    // Sum rewards (make sure to convert BigInt-like numbers properly)
    const totalLevelIncome = levelIncomeToday.reduce(
      (sum, item) => sum + Number(item.reward),
      0
    );
    const totalUserIncome = userIncomeToday.reduce(
      (sum, item) => sum + Number(item.amount),
      0
    );

    const total = totalLevelIncome + totalUserIncome;
   
    return total;
  } catch (err) {
    console.error("Error calculating today's income:", err);
    throw new Error("Failed to fetch today's income");
  }
}

async function weeklyTotalIncome(address) {
  try {
    const now = new Date();

    // Get current UTC day (0 = Sunday, 6 = Saturday)
    const day = now.getUTCDay();

    // Calculate start and end of current week (Sunday to Saturday)
    const startOfWeek = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() - day,
      0, 0, 0, 0
    ));

    const endOfWeek = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + (6 - day),
      23, 59, 59, 999
    ));

    // Find matching incomes
    const levelIncome = await LevelIncome.find({
      receiver: address,
      createdAt: { $gte: startOfWeek, $lte: endOfWeek },
    });

    const userIncome = await UserIncome.find({
      receiver: address,
      createdAt: { $gte: startOfWeek, $lte: endOfWeek },
    });

    // Sum up rewards
    const totalLevelIncome = levelIncome.reduce(
      (sum, item) => sum + Number(item.reward),
      0
    );

    const totalUserIncome = userIncome.reduce(
      (sum, item) => sum + Number(item.amount),
      0
    );

    const total = totalLevelIncome + totalUserIncome;

    return total;
  } catch (err) {
    console.error("Error calculating weekly income:", err);
    throw new Error("Failed to fetch weekly income");
  }
}



router.put("/updateUserProfile", async (req, res) => {
  try {
    const { address, profileUrl, name } = req.body;

    if (!address) {
      return res.status(400).json({ error: "Address is required" });
    }

    const updatedProfile = await Profile.updateOne(
      { address }, // Filter by address
      {
        $set: {
          profileUrl,
          name,
        },
      },
      { upsert: true } // Create a new document if none matches
    );

    res
      .status(200)
      .json({ message: "Profile updated successfully", data: updatedProfile });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/getUserProfile", async (req, res) => {
  try {
    const { address } = req.query;

    if (!address) {
      return res.status(400).json({ error: "Address is required" });
    }

    // Fetch profile
    const profile = await Profile.findOne({ address });
    
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const user = await registration.findOne({user: address})
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Parallel data fetching for efficiency
    const [ todayIncome, weeklyIncome] = await Promise.all([
      todayTotalIncome(address),
      weeklyTotalIncome(address)
    ]);

    // Return all collected data
    res.status(200).json({
      message: "Profile fetched successfully",
      data: {
        profile,
        user,
        todayIncome,
        weeklyIncome
      }
    });

  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
async function processWithdrawal(userAddress, hash, amount) {
  try {
    const lastWithdrawFund = await WithdrawalModel.findOne({
      user: userAddress,
    }).sort({ createdAt: -1 });
    console.log(lastWithdrawFund, "lastWithdrawFund::::");
    let prevNonce = 0;
    if (!lastWithdrawFund) {
      prevNonce = -1;
    } else {
      prevNonce = lastWithdrawFund.nonce;
    }

    const currNonce = await contract.methods.nonce(userAddress).call();
    console.log(
      currNonce,
      "currNonce:::,",
      prevNonce,
      "currNonce:::111,",
      Number(currNonce)
    );
    if (prevNonce + 1 !== Number(currNonce)) {
      throw new Error("Invalid withdrawal request!");
    }
    const vrsSign = await giveVrsForWithdrawLpc(
      userAddress,
      hash,
      Number(currNonce),
      web3.utils.toWei(amount.toString(), "ether")
    );

    return vrsSign;
  } catch (error) {
    console.error("Error in processWithdrawal:", error);
    throw error;
  }
}

function giveVrsForWithdrawLpc(user, hash, nonce, amount) {
  return new Promise(async (resolve, reject) => {
    try {
      const data = {
        user,
        amount,
      };

      const account = web3.eth.accounts.privateKeyToAccount(
        process.env.Operator_Wallet
      );

      web3.eth.accounts.wallet.add(account);
      web3.eth.defaultAccount = account.address;

      const signature = await web3.eth.sign(hash, account.address);

      const vrsValue = parseSignature(signature);
      data["signature"] = vrsValue;
      resolve({ ...data, amount });

      console.log(data, "data::::");
    } catch (error) {
      console.error("Error in signing the message:", error);
      reject(error);
    }
  });
}

function parseSignature(signature) {
  const sigParams = signature.substr(2);
  const v = "0x" + sigParams.substr(64 * 2, 2);
  const r = "0x" + sigParams.substr(0, 64);
  const s = "0x" + sigParams.substr(64, 64);

  return { v, r, s };
}
async function getTeamSize(address) {

  if (!address) {
    console.error("Invalid address provided.");
    return;
  }

  try {
    const userData = await registration
      .aggregate([
        { $match: { user: address } },
        {
          $graphLookup: {
            from: "Registration",
            startWith: "$user",
            connectFromField: "user",
            connectToField: "referrer",
            as: "team",
            maxDepth: 5,
            depthField: "level",
          },
        },
        { $unwind: "$team" },
        {
          $project: {
            _id: 0,
            userId: "$team.userId",
            user: "$team.user",
            referrer: "$team.referrer",
            referrerId: "$team.referrerId",
            timestamp: "$team.timestamp",
            createdAt: "$team.createdAt",
          },
        },
      ])
      .sort({ createdAt: 1 });

    const teamSize = userData.length;
    console.log(`Team size for ${address}: ${teamSize}`);

    let incomeToAdd = 0;
    if (teamSize >= 100) {
      incomeToAdd = 100;
    } else if (teamSize >= 50) {
      incomeToAdd = 50;
    } else if (teamSize >= 20) {
      incomeToAdd = 20;
    } else if (teamSize >= 10) {
      incomeToAdd = 10;
    } else if (teamSize >= 5) {
      incomeToAdd = 5;
    }

    if (incomeToAdd > 0) {
      let user = await registration.findOne({ user: address });
      if (user) {
        user.memberIncome = (user.memberIncome || 0) + incomeToAdd;
        await user.save();
        console.log(`Updated member income for ${address}: +${incomeToAdd}`);
      } else {
        console.warn(`User not found: ${address}`);
      }
    }
  } catch (error) {
    console.error(`Error fetching team size for ${address}:`, error);
  }
}

async function getUsers() {
  try {
    const users = await registration.find().sort({ createdAt: -1 });
    return users.map((user) => user.user); // Returns an array of user addresses
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

async function cronCall() {
  try {
    const addresses = await getUsers();
    for (const address of addresses) {
      try {
        await getTeamSize(address);
      } catch (err) {
        console.error(`Error processing ${address}:`, err);
      }
    }
  } catch (error) {
    console.error("Cron job failed:", error);
  }
}

cron.schedule(
  "30 17 * * 0", 
  async () => {
    cronCall()
 },
  {
   scheduled: true,
    timezone: "Asia/Kolkata", // Set the timezone to Asia/Kolkata for IST
  }
 );
router.get("/withdrawMemberIncome", async (req, res) => {
  const { address } = req.query;

  if (!address) {
    return res.status(400).json({ success: false, message: "Invalid input" });
  }

  try {
    // Locking the walletAddress to prevent concurrent modifications
    await lock.acquire(address, async () => {
      const fData = await registration.findOne({ user: address });
      console.log(fData, "fData:::");
      if (!fData) {
        res.status(200).json({
          status: 200,
          message: "User Not Found",
        });
      }

      const amount = fData.memberIncome;
      console.log(amount, "amount");

      if (amount < 1) {
        res.status(200).json({
          status: 200,
          message: "Insufficient Member Income minimum is $1",
        });
      }

      const currentTime = new Date();

      // Add 3 minutes (3 * 60 * 1000 milliseconds)
      const threeMinutesLater = new Date(currentTime.getTime() + 3 * 60 * 1000);

      // Convert to timestamp in milliseconds
      const timestampInMilliseconds = threeMinutesLater.getTime();

      // Generate hash and process withdrawal

      const amountBN = web3.utils.toWei(amount.toString(), "ether");

      console.log("amountBN ", amountBN);

      const randomHash = await contract.methods
        .getWithdrawHash(address, amountBN, timestampInMilliseconds)
        .call();

      // console.log(randomHash,"xx")
      if (randomHash) {
        const data = await registration.findOne({ user: address });
        data.memberIncome = 0;
        data.save();
      }
      const vrsSign = await processWithdrawal(address, randomHash, amount);

      return res.status(200).json({
        success: true,
        message: "Member Income Withdrawal Request Processed Successfully",
        vrsSign,
        deadline: timestampInMilliseconds,
      });
    });
  } catch (error) {
    if (error.status) {
      return res
        .status(error.status)
        .json({ success: false, message: error.message });
    }
    console.error("Withdrawal error:", error.stack || error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
});


module.exports = router;