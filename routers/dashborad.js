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

// router.get("/dashborad", async (req, res) => {
//   try {
//     const startOfToday = moment.tz("Asia/Kolkata").startOf("day").toDate();
//     const endOfToday = moment.tz("Asia/Kolkata").endOf("day").toDate();

//     console.log(startOfToday, ":::", endOfToday);

//     const totaluser = await registration.find({}).countDocuments();
//     const activeUser = await registration.find({ stake_amount: { $gt: 0 } }).countDocuments();
//     const inactiveUser = await registration.find({ stake_amount: 0 }).countDocuments();

//     const allTimeTotals = await stake2.aggregate([
//       {
//         $group: {
//           _id: "$plan",
//           totalAmount: { $sum: "$amount" },
//           totalToken: { $sum: "$token" },
//         }
//       }
//     ]);

//     const todayTotals = await stake2.aggregate([
//       {
//         $match: {
//           createdAt: {
//             $gte: startOfToday,
//             $lt: endOfToday,
//           },
//         },
//       },
//       {
//         $group: {
//           _id: "$plan",
//           totalAmount: { $sum: "$amount" },
//           totalToken: { $sum: "$token" },
//         },
//       },
//     ]);

//     const formatTotals = (totals) => {
//       const result = {
//         DSC: { totalAmount: 0, totalToken: 0 },
//         USDT: { totalAmount: 0, totalToken: 0 },
//         stDSC: { totalAmount: 0, totalToken: 0 },
//       };

//       totals.forEach(({ _id: plan, totalAmount, totalToken }) => {
//         if (result[plan]) {
//           result[plan].totalAmount = totalAmount;
//           result[plan].totalToken = totalToken;
//         }
//       });

//       return result;
//     };

//     const allTimeFormatted = formatTotals(allTimeTotals);
//     const todayFormatted = formatTotals(todayTotals);

//     const allTimeTotalStake = await stake2.aggregate([
//       {
//         $group: {
//           _id: null,
//           totalAmount: { $sum: "$amount" }
//         }
//       }
//     ]);

//     const todayTotalStake = await stake2.aggregate([
//       {
//         $match: {
//           createdAt: {
//             $gte: startOfToday,
//             $lt: endOfToday
//           }
//         }
//       },
//       {
//         $group: {
//           _id: null,
//           totalAmount: { $sum: "$amount" }
//         }
//       }
//     ]);

//     const allTimeAmount = allTimeTotalStake.length > 0 ? allTimeTotalStake[0].totalAmount : 0;
//     const todayAmount = todayTotalStake.length > 0 ? todayTotalStake[0].totalAmount : 0;

//     // New: Aggregate total withdrawal amount and token where isapprove is true
//     const totalWithdrawal = await WithdrawalModel.aggregate([
//       {
//         $match: { isapprove: true }
//       },
//       {
//         $group: {
//           _id: null,
//           totalWithdrawalAmount: { $sum: "$withdrawAmount" },
//           totalWithdrawalToken: { $sum: "$withdrawToken" }
//         }
//       }
//     ]);

//     const totalWithdrawalAmount = totalWithdrawal.length > 0 ? totalWithdrawal[0].totalWithdrawalAmount : 0;
//     const totalWithdrawalToken = totalWithdrawal.length > 0 ? totalWithdrawal[0].totalWithdrawalToken : 0;

//     // Respond with all data, including the new withdrawal totals
//     return res.json({
//       totaluser,
//       activeUser,
//       inactiveUser,
//       allTimeTotals: allTimeFormatted,
//       todayTotals: todayFormatted,
//       allTimeAmount,
//       todayAmount,
//       totalWithdrawalAmount,   // New field
//       totalWithdrawalToken     // New field
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

router.get("/dashboard/:walletAddress", async (req, res) => {
  let userAddress = req.params.walletAddress;
  try {

    const user = await registration.findOne({ user: userAddress });
    if (!user) {
      return res.json({ msg: 'User not found', success: false });
    }

    let checkSlot = await SlotPurchased.find({ user: userAddress }).sort({ slotId: -1 });

    if (checkSlot.length > 0) {

      var slot = checkSlot.map(slot => slot.slotId);
    }

    user.slotPurchased = slot
    await user.save()

    res.json({ msg: 'Login Successful', success: true, user });
  } catch (error) {

    res.json({ msg: 'Error in login', success: false, error: error.message });
  }
});

router.get("/getDownline/:walletAddress", async (req, res) => {
  let userAddress = req.params.walletAddress;
  try {
    // Find the user
    const user = await registration.findOne({ user: userAddress });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // Function to calculate income recursively for the downline
    async function calculateDownlineIncome(wallet) {
      let totalIncome = 0;

      // Fetch the direct income of the user
      let selfIncome = await UserIncome.findOne({ user: wallet });
      if (selfIncome) {
        totalIncome += selfIncome.amount;
      }

      // Find the direct downline
      let downlineUsers = await UserIncome.find({ referrer: wallet });

      // Recursively fetch downline incomes
      for (let downline of downlineUsers) {
        totalIncome +=  downline.amount;
      }

      return totalIncome;
    }

    // Calculate total income recursively
    let totalIncome = await calculateDownlineIncome(userAddress);

    // Get total team size
    async function getTotalTeamSize(wallet, visitedUsers = new Set()) {
      // Check if the user is already counted
      if (visitedUsers.has(wallet)) return 0; // Avoid duplicate counting
      visitedUsers.add(wallet); // Mark this user as visited

      // Find direct downline users
      let downlineUsers = await UserIncome.find({ referrer: wallet });

      // Use a Set to ensure unique users are counted only once
      let uniqueUsers = new Set();
      for (let downline of downlineUsers) {
        uniqueUsers.add(downline.user);
      }

      let count = uniqueUsers.size; // Count only unique users

      return count;
    }

    let totalTeamSize = await getTotalTeamSize(userAddress);

    return res.json({
      success: true,
      totalIncome,
      teamSize: totalTeamSize,
    });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});



router.get("/graph-data", verifyToken, async (req, res) => {
  try {
    const todayKolkata = moment.tz("Asia/Kolkata").startOf("day");
    const sevenDaysAgoKolkata = todayKolkata.clone().subtract(6, "days");

    async function fetchDataForDay(dayIndex) {
      const startOfDayKolkata = sevenDaysAgoKolkata
        .clone()
        .add(dayIndex, "days");
      const endOfDayKolkata = startOfDayKolkata
        .clone()
        .add(1, "days")
        .subtract(1, "milliseconds");

      const [stakes, withdraw, topups] = await Promise.all([
        stake2.find({
          createdAt: {
            $gte: startOfDayKolkata.toDate(),
            $lt: endOfDayKolkata.toDate(),
          },
        }),
        WithdrawalModel.find({
          timestamp: {
            $gte: startOfDayKolkata.toDate(),
            $lt: endOfDayKolkata.toDate(),
          },
        }),
        topup2.find({
          createdAt: {
            $gte: startOfDayKolkata.toDate(),
            $lt: endOfDayKolkata.toDate(),
          },
        }),
      ]);

      const filteredStakes = stakes.filter((stake) => {
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

      const total = filteredStakes.reduce(
        (acc, stake) => acc + stake.amount,
        0
      );

      const wyz = filteredStakes.reduce((acc, stake) => {
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
      const transformedAmount = filteredStakes.reduce((acc, stake) => {
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

      const stakeusdt = stakes.filter((stake) => {
        const usdt1 = stake.ratio == "15" && stake.token == "sUSDT-stUSDT";
        const usdt2 = stake.ratio == "20" && stake.token == "sUSDT-stUSDT";
        const usdt3 = stake.ratio == "25" && stake.token == "sUSDT-stUSDT";

        return usdt1 || usdt2 || usdt3;
      });

      const totalusdt = stakeusdt.reduce((acc, stake) => {
        if (stake.ratio == "15" && stake.token == "sUSDT-stUSDT")
          return acc + stake.amount * 0.85;
        if (stake.ratio == "20" && stake.token == "sUSDT-stUSDT")
          return acc + stake.amount * 0.8;
        if (stake.ratio == "25" && stake.token == "sUSDT-stUSDT")
          return acc + stake.amount * 0.75;
        return acc;
      }, 0);

      const roiWithdraw = withdraw
        .filter(
          (withdrawroi) =>
            withdrawroi.wallet_type == "roi" && withdrawroi.isapprove == true
        )
        .reduce((acc, withdrawroi) => acc + withdrawroi.withdrawAmount, 0);

      const referralWithdraw = withdraw
        .filter(
          (withdrawreferral) =>
            withdrawreferral.wallet_type == "referral" &&
            withdrawreferral.isapprove == true
        )
        .reduce(
          (acc, withdrawreferral) => acc + withdrawreferral.withdrawAmount,
          0
        );

      const topupdata = topups.reduce((acc, data) => {
        const amount = parseFloat(data.amount);
        return acc + amount;
      }, 0);

      return {
        day: startOfDayKolkata.format("dddd"),
        stakewyz: parseFloat(wyz),
        stakestusdt: parseFloat(transformedAmount),
        total: parseFloat(total),
        topus: parseFloat(topupdata),
        stakeusdt: parseFloat(totalusdt),
        roi: parseFloat(roiWithdraw),
        referral: parseFloat(referralWithdraw),
      };
    }

    const results = await Promise.all(
      Array.from({ length: 7 }).map((_, index) => fetchDataForDay(index))
    );

    const Stakeswyz = {};
    const Stakestusdt = {};
    const Stakeusdt = {};
    const Totalamount = {};
    const Topusdata = {};
    const withdrawRoi = {};
    const refrealWithdraw = {};

    results.forEach(
      ({
        day,
        stakewyz,
        stakestusdt,
        stakeusdt,
        roi,
        referral,
        topus,
        total,
      }) => {
        Stakeswyz[day] = stakewyz;
        Stakestusdt[day] = stakestusdt;
        Stakeusdt[day] = stakeusdt;
        Totalamount[day] = total;
        Topusdata[day] = topus;
        withdrawRoi[day] = roi;
        refrealWithdraw[day] = referral;
      }
    );

    return res.json({
      status: 200,
      error: false,
      Stakeswyz,
      Stakestusdt,
      Stakeusdt,
      Totalamount,
      Topusdata,
      withdrawRoi,
      refrealWithdraw,
    });
  } catch (error) {
    console.error("Error calculating data:", error);
    return res.status(500).json({
      status: 500,
      error: true,
      message: "Internal Server Error",
    });
  }
});

module.exports = router;
