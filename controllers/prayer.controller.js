const Prayer = require('../models/Prayer');

exports.getAll = async (req, res) => {
  try {
    const { category, page = 1, limit = 20 } = req.query;
    const query = { status: 'active' };
    if (category) query.category = category;

    const prayers = await Prayer.find(query).populate('user', 'name avatar').sort({ createdAt: -1 }).limit(limit * 1).skip((page - 1) * limit);
    const count = await Prayer.countDocuments(query);

    res.json({ success: true, data: { prayers, totalPages: Math.ceil(count / limit), currentPage: page, total: count } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.getMyPrayers = async (req, res) => {
  try {
    const prayers = await Prayer.find({ user: req.user.id, status: 'active' }).sort({ createdAt: -1 });
    res.json({ success: true, data: { prayers } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.getPublicPrayers = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const prayers = await Prayer.find({ isPrivate: false, status: 'active' }).populate('user', 'name avatar').sort({ createdAt: -1 }).limit(limit * 1).skip((page - 1) * limit);
    const count = await Prayer.countDocuments({ isPrivate: false, status: 'active' });

    res.json({ success: true, data: { prayers, totalPages: Math.ceil(count / limit), currentPage: page, total: count } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const prayer = await Prayer.findById(req.params.id).populate('user', 'name avatar').populate('comments.user', 'name avatar').populate('childNodes');
    if (!prayer) return res.status(404).json({ success: false, message: 'Prayer not found' });

    // Check if user has permission to view private prayer
    if (prayer.isPrivate && prayer.user._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You do not have permission to view this prayer' });
    }

    res.json({ success: true, data: { prayer } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const prayerData = { ...req.body, user: req.user.id };
    const prayer = await Prayer.create(prayerData);
    res.status(201).json({ success: true, message: 'Prayer created successfully', data: { prayer } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const prayer = await Prayer.findById(req.params.id);
    if (!prayer) return res.status(404).json({ success: false, message: 'Prayer not found' });

    // Check if user owns the prayer
    if (prayer.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You do not have permission to update this prayer' });
    }

    Object.assign(prayer, req.body);
    await prayer.save();

    res.json({ success: true, message: 'Prayer updated successfully', data: { prayer } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const prayer = await Prayer.findById(req.params.id);
    if (!prayer) return res.status(404).json({ success: false, message: 'Prayer not found' });

    // Check if user owns the prayer
    if (prayer.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You do not have permission to delete this prayer' });
    }

    await prayer.deleteOne();
    res.json({ success: true, message: 'Prayer deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.prayFor = async (req, res) => {
  try {
    const prayer = await Prayer.findById(req.params.id);
    if (!prayer) return res.status(404).json({ success: false, message: 'Prayer not found' });

    const alreadyPrayed = prayer.prayedBy.find(p => p.user.toString() === req.user.id);
    if (!alreadyPrayed) {
      prayer.prayedBy.push({ user: req.user.id });
      await prayer.incrementPrayerCount();
    }

    res.json({ success: true, message: 'Prayer recorded', data: { prayerCount: prayer.prayerCount } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const prayer = await Prayer.findById(req.params.id);
    if (!prayer) return res.status(404).json({ success: false, message: 'Prayer not found' });

    prayer.comments.push({ user: req.user.id, text });
    await prayer.save();

    res.json({ success: true, message: 'Comment added successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.markAsAnswered = async (req, res) => {
  try {
    const { note } = req.body;
    const prayer = await Prayer.findById(req.params.id);
    if (!prayer) return res.status(404).json({ success: false, message: 'Prayer not found' });

    // Check if user owns the prayer
    if (prayer.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You do not have permission to update this prayer' });
    }

    await prayer.markAsAnswered(note);
    res.json({ success: true, message: 'Prayer marked as answered', data: { prayer } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.addChildPrayer = async (req, res) => {
  try {
    const parentPrayer = await Prayer.findById(req.params.id);
    if (!parentPrayer) return res.status(404).json({ success: false, message: 'Parent prayer not found' });

    const childPrayerData = { ...req.body, user: req.user.id, parentNode: req.params.id };
    const childPrayer = await Prayer.create(childPrayerData);

    parentPrayer.childNodes.push(childPrayer._id);
    await parentPrayer.save();

    res.status(201).json({ success: true, message: 'Child prayer added successfully', data: { prayer: childPrayer } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.getPrayerTree = async (req, res) => {
  try {
    const prayer = await Prayer.findById(req.params.id).populate('childNodes').populate('user', 'name avatar');
    if (!prayer) return res.status(404).json({ success: false, message: 'Prayer not found' });

    res.json({ success: true, data: { prayer } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.flagPrayer = async (req, res) => {
  try {
    const prayer = await Prayer.findByIdAndUpdate(req.params.id, { status: 'flagged' }, { new: true });
    if (!prayer) return res.status(404).json({ success: false, message: 'Prayer not found' });
    res.json({ success: true, message: 'Prayer flagged successfully', data: { prayer } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const prayer = await Prayer.findById(req.params.id);
    if (!prayer) return res.status(404).json({ success: false, message: 'Prayer not found' });

    prayer.comments = prayer.comments.filter(c => c._id.toString() !== req.params.commentId);
    await prayer.save();

    res.json({ success: true, message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
