const mongoose = require("mongoose");

// const MONOG_URI =
//   "mongodb+srv://adildvlpr:qVfuH05eKtYX3wqQ@cluster0.cg28ut2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// mongoose.connect(MONOG_URI, { dbName: "staking" }).then(() => {
//   console.log("DB connected");
// });

async function calculateTeam(user) {
  const Registration = require("./model/registration");
  let total_team = await Registration.aggregate([
    { $match: { user: user } },
    {
      $graphLookup: {
        from: "registration",
        startWith: "$referrer",
        connectFromField: "referrer", // user for fetching
        connectToField: "user", // sponcer id for fetching
        maxDepth: 200000,
        depthField: "level",
        as: "children",
      },
    },
    { $unwind: "$children" },
    {
      $group: {
        _id: "$children._id",
        userId: { $first: "$children.userId" },
        username: { $first: "$children.user" },
        position: { $first: "$children.teamBusinessnew" },
        level: { $first: { $add: ["$children.level", 1] } },
      },
    },
    { $sort: { level: 1 } },
  ]);
  console.log(total_team, "toalteam");
    return total_team;

}

const getAllUsers = async (stakeamount, user) => {
  try {
    const Stake = require("./model/stake");
      console.log("dgsdgs")
    const total_team = await calculateTeam("0x6cA14a3eCb655a66d0ddfb9c119AE3B846C92c24");
    return total_team;
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
};

module.exports = {
    getAllUsers
}
