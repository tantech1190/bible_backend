const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, data: { user } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, age, avatar } = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, { name, age, avatar }, { new: true, runValidators: true });
    res.json({ success: true, message: 'Profile updated successfully', data: { user } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Update user preferences
// @route   PUT /api/users/preferences
// @access  Private
exports.updatePreferences = async (req, res) => {
  try {
    const { theme, fontSize, translation, notifications } = req.body;
    const user = await User.findById(req.user.id);
    
    if (theme) user.preferences.theme = theme;
    if (fontSize) user.preferences.fontSize = fontSize;
    if (translation) user.preferences.translation = translation;
    if (notifications) user.preferences.notifications = { ...user.preferences.notifications, ...notifications };
    
    await user.save();
    res.json({ success: true, message: 'Preferences updated successfully', data: { preferences: user.preferences } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Update parental controls
// @route   PUT /api/users/parental-controls
// @access  Private
exports.updateParentalControls = async (req, res) => {
  try {
    const { enabled, parentEmail, restrictions } = req.body;
    const user = await User.findById(req.user.id);
    
    user.parentalControls = { enabled, parentEmail, restrictions };
    await user.save();
    
    res.json({ success: true, message: 'Parental controls updated successfully', data: { parentalControls: user.parentalControls } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Bookmarks
exports.addBookmark = async (req, res) => {
  try {
    const { verse, reference, note } = req.body;
    const user = await User.findById(req.user.id);
    user.bookmarks.push({ verse, reference, note });
    await user.save();
    res.json({ success: true, message: 'Bookmark added successfully', data: { bookmarks: user.bookmarks } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.removeBookmark = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.bookmarks = user.bookmarks.filter(b => b._id.toString() !== req.params.bookmarkId);
    await user.save();
    res.json({ success: true, message: 'Bookmark removed successfully', data: { bookmarks: user.bookmarks } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.getBookmarks = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, data: { bookmarks: user.bookmarks } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Highlights
exports.addHighlight = async (req, res) => {
  try {
    const { verse, reference, color } = req.body;
    const user = await User.findById(req.user.id);
    user.highlights.push({ verse, reference, color });
    await user.save();
    res.json({ success: true, message: 'Highlight added successfully', data: { highlights: user.highlights } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.removeHighlight = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.highlights = user.highlights.filter(h => h._id.toString() !== req.params.highlightId);
    await user.save();
    res.json({ success: true, message: 'Highlight removed successfully', data: { highlights: user.highlights } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.getHighlights = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, data: { highlights: user.highlights } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Stats
exports.getStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, data: { stats: user.stats } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.updateStreak = async (req, res) => {
  try {
    const { streak } = req.body;
    const user = await User.findById(req.user.id);
    user.stats.streak = streak;
    await user.save();
    res.json({ success: true, message: 'Streak updated successfully', data: { stats: user.stats } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.addPoints = async (req, res) => {
  try {
    const { points } = req.body;
    const user = await User.findById(req.user.id);
    user.stats.totalPoints += points;
    await user.save();
    res.json({ success: true, message: 'Points added successfully', data: { stats: user.stats } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Admin routes
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, isActive } = req.query;
    const query = {};
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const users = await User.find(query).sort({ createdAt: -1 }).limit(limit * 1).skip((page - 1) * limit);
    const count = await User.countDocuments(query);

    res.json({ success: true, data: { users, totalPages: Math.ceil(count / limit), currentPage: page, total: count } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: { user } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User status updated successfully', data: { user } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User role updated successfully', data: { user } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
