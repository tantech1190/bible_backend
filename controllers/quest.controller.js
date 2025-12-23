const Quest = require('../models/Quest');

exports.getAll = async (req, res) => {
  try {
    const { status, difficulty, page = 1, limit = 10 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (difficulty) query.difficulty = difficulty;

    const quests = await Quest.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Quest.countDocuments(query);

    res.json({
      success: true,
      data: {
        quests,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.getActive = async (req, res) => {
  try {
    const quests = await Quest.find({ status: 'active' }).sort({ createdAt: -1 });
    res.json({ success: true, data: { quests } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const quest = await Quest.findById(req.params.id).populate('participants.user', 'name avatar');
    if (!quest) return res.status(404).json({ success: false, message: 'Quest not found' });
    res.json({ success: true, data: { quest } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const questData = { ...req.body, createdBy: req.user.id };
    const quest = await Quest.create(questData);
    res.status(201).json({ success: true, message: 'Quest created successfully', data: { quest } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const quest = await Quest.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!quest) return res.status(404).json({ success: false, message: 'Quest not found' });
    res.json({ success: true, message: 'Quest updated successfully', data: { quest } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const quest = await Quest.findByIdAndDelete(req.params.id);
    if (!quest) return res.status(404).json({ success: false, message: 'Quest not found' });
    res.json({ success: true, message: 'Quest deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const quest = await Quest.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!quest) return res.status(404).json({ success: false, message: 'Quest not found' });
    res.json({ success: true, message: 'Status updated successfully', data: { quest } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.joinQuest = async (req, res) => {
  try {
    const quest = await Quest.findById(req.params.id);
    if (!quest) return res.status(404).json({ success: false, message: 'Quest not found' });

    const alreadyJoined = quest.participants.find(p => p.user.toString() === req.user.id);
    if (alreadyJoined) return res.status(400).json({ success: false, message: 'Already joined this quest' });

    quest.participants.push({ user: req.user.id });
    await quest.save();

    res.json({ success: true, message: 'Joined quest successfully', data: { quest } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.updateProgress = async (req, res) => {
  try {
    const { chaptersCompleted, percentage, pointsEarned } = req.body;
    const quest = await Quest.findById(req.params.id);
    if (!quest) return res.status(404).json({ success: false, message: 'Quest not found' });

    const participant = quest.participants.find(p => p.user.toString() === req.user.id);
    if (!participant) return res.status(400).json({ success: false, message: 'You have not joined this quest' });

    participant.progress = { chaptersCompleted, percentage, pointsEarned };
    await quest.save();

    res.json({ success: true, message: 'Progress updated successfully', data: { progress: participant.progress } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.completeQuest = async (req, res) => {
  try {
    const quest = await Quest.findById(req.params.id);
    if (!quest) return res.status(404).json({ success: false, message: 'Quest not found' });

    const participant = quest.participants.find(p => p.user.toString() === req.user.id);
    if (!participant) return res.status(400).json({ success: false, message: 'You have not joined this quest' });

    participant.isCompleted = true;
    participant.completedAt = Date.now();
    quest.totalCompletions += 1;
    await quest.save();

    res.json({ success: true, message: 'Quest completed!', data: { quest } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.getMyProgress = async (req, res) => {
  try {
    const quest = await Quest.findById(req.params.id);
    if (!quest) return res.status(404).json({ success: false, message: 'Quest not found' });

    const participant = quest.participants.find(p => p.user.toString() === req.user.id);
    if (!participant) return res.status(404).json({ success: false, message: 'You have not joined this quest' });

    res.json({ success: true, data: { progress: participant } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
