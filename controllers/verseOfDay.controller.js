const VerseOfDay = require('../models/VerseOfDay');

exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const verses = await VerseOfDay.find().sort({ date: -1 }).limit(limit * 1).skip((page - 1) * limit);
    const count = await VerseOfDay.countDocuments();
    res.json({ success: true, data: { verses, totalPages: Math.ceil(count / limit), currentPage: page, total: count } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.getToday = async (req, res) => {
  try {
    const verse = await VerseOfDay.getTodaysVerse();
    if (!verse) return res.status(404).json({ success: false, message: 'No verse found for today' });
    res.json({ success: true, data: { verse } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const verse = await VerseOfDay.findById(req.params.id).populate('reflections.user', 'name avatar');
    if (!verse) return res.status(404).json({ success: false, message: 'Verse not found' });
    res.json({ success: true, data: { verse } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const verseData = { ...req.body, createdBy: req.user.id };
    const verse = await VerseOfDay.create(verseData);
    res.status(201).json({ success: true, message: 'Verse created successfully', data: { verse } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const verse = await VerseOfDay.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!verse) return res.status(404).json({ success: false, message: 'Verse not found' });
    res.json({ success: true, message: 'Verse updated successfully', data: { verse } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const verse = await VerseOfDay.findByIdAndDelete(req.params.id);
    if (!verse) return res.status(404).json({ success: false, message: 'Verse not found' });
    res.json({ success: true, message: 'Verse deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const verse = await VerseOfDay.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!verse) return res.status(404).json({ success: false, message: 'Verse not found' });
    res.json({ success: true, message: 'Status updated successfully', data: { verse } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.likeVerse = async (req, res) => {
  try {
    const verse = await VerseOfDay.findById(req.params.id);
    if (!verse) return res.status(404).json({ success: false, message: 'Verse not found' });

    const likeIndex = verse.likes.indexOf(req.user.id);
    if (likeIndex > -1) verse.likes.splice(likeIndex, 1);
    else verse.likes.push(req.user.id);

    await verse.save();
    res.json({ success: true, message: likeIndex > -1 ? 'Unliked' : 'Liked', data: { likes: verse.likes.length } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.addReflection = async (req, res) => {
  try {
    const { text } = req.body;
    const verse = await VerseOfDay.findById(req.params.id);
    if (!verse) return res.status(404).json({ success: false, message: 'Verse not found' });

    verse.reflections.push({ user: req.user.id, text });
    await verse.save();
    res.json({ success: true, message: 'Reflection added successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.incrementShares = async (req, res) => {
  try {
    const verse = await VerseOfDay.findById(req.params.id);
    if (!verse) return res.status(404).json({ success: false, message: 'Verse not found' });

    verse.shares += 1;
    await verse.save();
    res.json({ success: true, message: 'Share counted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
