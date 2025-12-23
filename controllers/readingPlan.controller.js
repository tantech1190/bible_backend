const ReadingPlan = require('../models/ReadingPlan');

exports.getAll = async (req, res) => {
  try {
    const { status, category, page = 1, limit = 10 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;

    const plans = await ReadingPlan.find(query).sort({ createdAt: -1 }).limit(limit * 1).skip((page - 1) * limit);
    const count = await ReadingPlan.countDocuments(query);
    res.json({ success: true, data: { plans, totalPages: Math.ceil(count / limit), currentPage: page, total: count } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.getActive = async (req, res) => {
  try {
    const plans = await ReadingPlan.find({ status: 'active' }).sort({ createdAt: -1 });
    res.json({ success: true, data: { plans } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const plan = await ReadingPlan.findById(req.params.id).populate('enrolledUsers.user', 'name avatar');
    if (!plan) return res.status(404).json({ success: false, message: 'Reading plan not found' });
    res.json({ success: true, data: { plan } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const planData = { ...req.body, createdBy: req.user.id };
    const plan = await ReadingPlan.create(planData);
    res.status(201).json({ success: true, message: 'Reading plan created successfully', data: { plan } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const plan = await ReadingPlan.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!plan) return res.status(404).json({ success: false, message: 'Reading plan not found' });
    res.json({ success: true, message: 'Reading plan updated successfully', data: { plan } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const plan = await ReadingPlan.findByIdAndDelete(req.params.id);
    if (!plan) return res.status(404).json({ success: false, message: 'Reading plan not found' });
    res.json({ success: true, message: 'Reading plan deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const plan = await ReadingPlan.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!plan) return res.status(404).json({ success: false, message: 'Reading plan not found' });
    res.json({ success: true, message: 'Status updated successfully', data: { plan } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.enrollInPlan = async (req, res) => {
  try {
    const plan = await ReadingPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ success: false, message: 'Reading plan not found' });

    const alreadyEnrolled = plan.enrolledUsers.find(e => e.user.toString() === req.user.id);
    if (alreadyEnrolled) return res.status(400).json({ success: false, message: 'Already enrolled in this plan' });

    plan.enrolledUsers.push({ user: req.user.id });
    await plan.updateEnrollmentCount();

    res.json({ success: true, message: 'Enrolled successfully', data: { plan } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.updateProgress = async (req, res) => {
  try {
    const { currentDay, completedDays, percentage } = req.body;
    const plan = await ReadingPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ success: false, message: 'Reading plan not found' });

    const enrollment = plan.enrolledUsers.find(e => e.user.toString() === req.user.id);
    if (!enrollment) return res.status(400).json({ success: false, message: 'You are not enrolled in this plan' });

    enrollment.progress = { currentDay, completedDays, percentage };
    await plan.save();

    res.json({ success: true, message: 'Progress updated successfully', data: { progress: enrollment.progress } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.completePlan = async (req, res) => {
  try {
    const plan = await ReadingPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ success: false, message: 'Reading plan not found' });

    const enrollment = plan.enrolledUsers.find(e => e.user.toString() === req.user.id);
    if (!enrollment) return res.status(400).json({ success: false, message: 'You are not enrolled in this plan' });

    enrollment.isCompleted = true;
    enrollment.completedAt = Date.now();
    await plan.save();

    res.json({ success: true, message: 'Plan completed!', data: { plan } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.ratePlan = async (req, res) => {
  try {
    const { rating, review } = req.body;
    const plan = await ReadingPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ success: false, message: 'Reading plan not found' });

    plan.ratings.push({ user: req.user.id, rating, review });
    
    // Calculate average rating
    const totalRating = plan.ratings.reduce((sum, r) => sum + r.rating, 0);
    plan.averageRating = totalRating / plan.ratings.length;
    
    await plan.save();

    res.json({ success: true, message: 'Rating submitted successfully', data: { averageRating: plan.averageRating } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.getMyProgress = async (req, res) => {
  try {
    const plan = await ReadingPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ success: false, message: 'Reading plan not found' });

    const enrollment = plan.enrolledUsers.find(e => e.user.toString() === req.user.id);
    if (!enrollment) return res.status(404).json({ success: false, message: 'You are not enrolled in this plan' });

    res.json({ success: true, data: { progress: enrollment } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.getMyEnrolledPlans = async (req, res) => {
  try {
    const plans = await ReadingPlan.find({ 'enrolledUsers.user': req.user.id });
    res.json({ success: true, data: { plans } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
