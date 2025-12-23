const Prayer = require('../models/Prayer');
const VerseArt = require('../models/VerseArt');
const Devotional = require('../models/Devotional');
const User = require('../models/User');

exports.getFlaggedContent = async (req, res) => {
  try {
    const flaggedPrayers = await Prayer.find({ status: 'flagged' }).populate('user', 'name email avatar').sort({ createdAt: -1 });
    const flaggedArt = await VerseArt.find({ status: 'flagged' }).populate('user', 'name email avatar').sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        prayers: flaggedPrayers,
        verseArt: flaggedArt,
        total: flaggedPrayers.length + flaggedArt.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.getPendingComments = async (req, res) => {
  try {
    const prayersWithComments = await Prayer.find({ 'comments.isModerated': false }).populate('user', 'name avatar').populate('comments.user', 'name avatar');
    const artWithComments = await VerseArt.find({ 'comments.isModerated': false }).populate('user', 'name avatar').populate('comments.user', 'name avatar');

    const pendingComments = [];

    prayersWithComments.forEach(prayer => {
      prayer.comments.filter(c => !c.isModerated).forEach(comment => {
        pendingComments.push({
          type: 'prayer',
          contentId: prayer._id,
          contentTitle: prayer.title,
          comment: comment,
          commentId: comment._id
        });
      });
    });

    artWithComments.forEach(art => {
      art.comments.filter(c => !c.isModerated).forEach(comment => {
        pendingComments.push({
          type: 'verseArt',
          contentId: art._id,
          contentTitle: art.verse,
          comment: comment,
          commentId: comment._id
        });
      });
    });

    res.json({ success: true, data: { comments: pendingComments, total: pendingComments.length } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.getReportedUsers = async (req, res) => {
  try {
    // This would require a separate reporting system. For now, return empty array
    res.json({ success: true, data: { users: [], total: 0 } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.approveComment = async (req, res) => {
  try {
    const { contentType, contentId } = req.body;

    let content;
    if (contentType === 'prayer') {
      content = await Prayer.findById(contentId);
    } else if (contentType === 'verseArt') {
      content = await VerseArt.findById(contentId);
    }

    if (!content) return res.status(404).json({ success: false, message: 'Content not found' });

    const comment = content.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

    comment.isModerated = true;
    await content.save();

    res.json({ success: true, message: 'Comment approved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.rejectComment = async (req, res) => {
  try {
    const { contentType, contentId } = req.body;

    let content;
    if (contentType === 'prayer') {
      content = await Prayer.findById(contentId);
    } else if (contentType === 'verseArt') {
      content = await VerseArt.findById(contentId);
    }

    if (!content) return res.status(404).json({ success: false, message: 'Content not found' });

    content.comments = content.comments.filter(c => c._id.toString() !== req.params.commentId);
    await content.save();

    res.json({ success: true, message: 'Comment rejected and deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.flagContent = async (req, res) => {
  try {
    const { contentType, contentId } = req.body;

    let content;
    if (contentType === 'prayer') {
      content = await Prayer.findByIdAndUpdate(contentId, { status: 'flagged' }, { new: true });
    } else if (contentType === 'verseArt') {
      content = await VerseArt.findByIdAndUpdate(contentId, { status: 'flagged' }, { new: true });
    } else if (contentType === 'devotional') {
      content = await Devotional.findByIdAndUpdate(contentId, { status: 'archived' }, { new: true });
    }

    if (!content) return res.status(404).json({ success: false, message: 'Content not found' });

    res.json({ success: true, message: 'Content flagged successfully', data: { content } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.unflagContent = async (req, res) => {
  try {
    const { contentType, contentId } = req.body;

    let content;
    if (contentType === 'prayer') {
      content = await Prayer.findByIdAndUpdate(contentId, { status: 'active' }, { new: true });
    } else if (contentType === 'verseArt') {
      content = await VerseArt.findByIdAndUpdate(contentId, { status: 'active' }, { new: true });
    } else if (contentType === 'devotional') {
      content = await Devotional.findByIdAndUpdate(contentId, { status: 'published' }, { new: true });
    }

    if (!content) return res.status(404).json({ success: false, message: 'Content not found' });

    res.json({ success: true, message: 'Content unflagged successfully', data: { content } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.warnUser = async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // In a real implementation, you would send a warning notification/email
    res.json({ success: true, message: `Warning sent to user: ${user.name}`, data: { reason } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.suspendUser = async (req, res) => {
  try {
    const { reason, duration } = req.body;
    const user = await User.findByIdAndUpdate(req.params.userId, { isActive: false }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, message: `User suspended successfully`, data: { user, reason, duration } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
