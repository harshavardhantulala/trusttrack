const express = require('express');
const router = express.Router();
const Debt = require('../models/Debt');

// ➕ Add a new debt
router.post('/add', async (req, res) => {
  const { lender, borrower, amount, reason } = req.body;

  try {
    const newDebt = new Debt({ lender, borrower, amount, reason });
    await newDebt.save();
    res.json({ msg: 'Debt added successfully' });
  } catch (err) {
    console.error('Error adding debt:', err);
    res.status(500).json({ msg: 'Error adding debt' });
  }
});

// 📄 Get all debts for a user
router.get('/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const debts = await Debt.find({
      $or: [{ lender: username }, { borrower: username }]
    }).sort({ time: -1 });

    res.json(debts);
  } catch (err) {
    console.error('Error fetching debts:', err);
    res.status(500).json({ msg: 'Error fetching debts' });
  }
});

// 🔔 Mark as paid (borrower)
router.put('/mark-paid/:id', async (req, res) => {
  try {
    await Debt.findByIdAndUpdate(req.params.id, { paidRequest: true });
    res.json({ msg: 'Marked as paid (pending confirmation)' });
  } catch (err) {
    console.error('Error marking as paid:', err);
    res.status(500).json({ msg: 'Error updating debt' });
  }
});

// ✅ Confirm payment (lender)
router.put('/confirm/:id', async (req, res) => {
  try {
    await Debt.findByIdAndUpdate(req.params.id, {
      confirmed: true,
      paidRequest: false
    });
    res.json({ msg: 'Payment confirmed and debt cleared' });
  } catch (err) {
    console.error('Error confirming payment:', err);
    res.status(500).json({ msg: 'Error confirming debt' });
  }
});

module.exports = router;
