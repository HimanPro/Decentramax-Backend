// Import necessary modules
const express = require('express');
const router = express.Router();
const StakingPlan = require('./model/staking_plan');

// Route to get all staking plans
router.get('/staking-plans', async (req, res) => {
  try {
    const stakingPlans = await StakingPlan.find();
    res.json(stakingPlans);
  } catch (error) {
    console.error('Error getting staking plans:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;