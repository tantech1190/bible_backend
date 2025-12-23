const VerseArt = require('../models/VerseArt');

exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const query = { status: 'active' };

    const arts = await VerseArt.find(query).populate('user', 'name avatar').sort({ createdAt: -1 }).limit(limit * 1).skip((page - 1) * limit);
    const count = await VerseArt.countDocuments(query);

    res.json({ success: true, data: { arts, totalPages: Math.ceil(count / limit), currentPage: page, total: count } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.getPublic = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const arts = await VerseArt.find({ isPublic: true, status: 'active' }).populate('user', 'name avatar').sort({ createdAt: -1 }).limit(limit * 1).skip((page - 1) * limit);
    const count = await VerseArt.countDocuments({ isPublic: true, status: 'active' });

    res.json({ success: true, data: { arts, totalPages: Math.ceil(count / limit), currentPage: page, total: count } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const art = await VerseArt.findById(req.params.id).populate('user', 'name avatar').populate('comments.user', 'name avatar');
    if (!art) return res.status(404).json({ success: false, message: 'Verse art not found' });

    res.json({ success: true, data: { art } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.getMyArt = async (req, res) => {
  try {
    const arts = await VerseArt.find({ user: req.user.id, status: 'active' }).sort({ createdAt: -1 });
    res.json({ success: true, data: { arts } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const artData = { ...req.body, user: req.user.id };
    const art = await VerseArt.create(artData);
    res.status(201).json({ success: true, message: 'Verse art created successfully', data: { art } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const art = await VerseArt.findById(req.params.id);
    if (!art) return res.status(404).json({ success: false, message: 'Verse art not found' });

    // Check if user owns the art
    if (art.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You do not have permission to update this art' });
    }

    Object.assign(art, req.body);
    await art.save();

    res.json({ success: true, message: 'Verse art updated successfully', data: { art } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const art = await VerseArt.findById(req.params.id);
    if (!art) return res.status(404).json({ success: false, message: 'Verse art not found' });

    // Check if user owns the art
    if (art.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You do not have permission to delete this art' });
    }

    await art.deleteOne();
    res.json({ success: true, message: 'Verse art deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.likeArt = async (req, res) => {
  try {
    const art = await VerseArt.findById(req.params.id);
    if (!art) return res.status(404).json({ success: false, message: 'Verse art not found' });

    const likeIndex = art.likes.indexOf(req.user.id);
    if (likeIndex > -1) art.likes.splice(likeIndex, 1);
    else art.likes.push(req.user.id);

    await art.save();
    res.json({ success: true, message: likeIndex > -1 ? 'Unliked' : 'Liked', data: { likes: art.likes.length } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.incrementShares = async (req, res) => {
  try {
    const art = await VerseArt.findById(req.params.id);
    if (!art) return res.status(404).json({ success: false, message: 'Verse art not found' });

    await art.incrementShares();
    res.json({ success: true, message: 'Share counted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.incrementDownloads = async (req, res) => {
  try {
    const art = await VerseArt.findById(req.params.id);
    if (!art) return res.status(404).json({ success: false, message: 'Verse art not found' });

    await art.incrementDownloads();
    res.json({ success: true, message: 'Download counted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const art = await VerseArt.findById(req.params.id);
    if (!art) return res.status(404).json({ success: false, message: 'Verse art not found' });

    art.comments.push({ user: req.user.id, text });
    await art.save();

    res.json({ success: true, message: 'Comment added successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.flagArt = async (req, res) => {
  try {
    const art = await VerseArt.findByIdAndUpdate(req.params.id, { status: 'flagged' }, { new: true });
    if (!art) return res.status(404).json({ success: false, message: 'Verse art not found' });
    res.json({ success: true, message: 'Verse art flagged successfully', data: { art } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const art = await VerseArt.findById(req.params.id);
    if (!art) return res.status(404).json({ success: false, message: 'Verse art not found' });

    art.comments = art.comments.filter(c => c._id.toString() !== req.params.commentId);
    await art.save();

    res.json({ success: true, message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
