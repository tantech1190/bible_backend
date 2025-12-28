const Devotional = require('../models/Devotional');

// @desc    Get all devotionals
// @route   GET /api/devotionals
// @access  Public
exports.getAll = async (req, res) => {
  try {
    const { status, category, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;

    const devotionals = await Devotional.find(query)
      .populate('author', 'name avatar')
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Devotional.countDocuments(query);

    res.json({
      success: true,
      data: {
        devotionals,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get published devotionals
// @route   GET /api/devotionals/published
// @access  Public
exports.getPublished = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const devotionals = await Devotional.find({ status: 'published' })
      .populate('author', 'name avatar')
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Devotional.countDocuments({ status: 'published' });

    res.json({
      success: true,
      data: {
        devotionals,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get today's devotional
// @route   GET /api/devotionals/today
// @access  Public
exports.getToday = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Also check for yesterday and tomorrow to account for timezone differences
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const devotional = await Devotional.findOne({
      date: {
        $gte: yesterday,
        $lt: tomorrow
      },
      status: 'published'
    })
    .sort({ date: -1 })
    .populate('author', 'name avatar');

    if (!devotional) {
      return res.status(404).json({
        success: false,
        message: 'No devotional found for today'
      });
    }

    res.json({
      success: true,
      data: { devotional }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get devotional by ID
// @route   GET /api/devotionals/:id
// @access  Public
exports.getById = async (req, res) => {
  try {
    const devotional = await Devotional.findById(req.params.id)
      .populate('author', 'name avatar')
      .populate('reflections.user', 'name avatar');

    if (!devotional) {
      return res.status(404).json({
        success: false,
        message: 'Devotional not found'
      });
    }

    res.json({
      success: true,
      data: { devotional }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create devotional
// @route   POST /api/devotionals
// @access  Admin/Moderator
exports.create = async (req, res) => {
  try {
    const devotionalData = {
      ...req.body,
      author: req.user.id
    };

    const devotional = await Devotional.create(devotionalData);

    res.status(201).json({
      success: true,
      message: 'Devotional created successfully',
      data: { devotional }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update devotional
// @route   PUT /api/devotionals/:id
// @access  Admin/Moderator
exports.update = async (req, res) => {
  try {
    const devotional = await Devotional.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!devotional) {
      return res.status(404).json({
        success: false,
        message: 'Devotional not found'
      });
    }

    res.json({
      success: true,
      message: 'Devotional updated successfully',
      data: { devotional }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete devotional
// @route   DELETE /api/devotionals/:id
// @access  Admin
exports.delete = async (req, res) => {
  try {
    const devotional = await Devotional.findByIdAndDelete(req.params.id);

    if (!devotional) {
      return res.status(404).json({
        success: false,
        message: 'Devotional not found'
      });
    }

    res.json({
      success: true,
      message: 'Devotional deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update devotional status
// @route   PATCH /api/devotionals/:id/status
// @access  Admin/Moderator
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const devotional = await Devotional.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!devotional) {
      return res.status(404).json({
        success: false,
        message: 'Devotional not found'
      });
    }

    res.json({
      success: true,
      message: 'Status updated successfully',
      data: { devotional }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Like devotional
// @route   POST /api/devotionals/:id/like
// @access  Private
exports.likeDevotional = async (req, res) => {
  try {
    const devotional = await Devotional.findById(req.params.id);

    if (!devotional) {
      return res.status(404).json({
        success: false,
        message: 'Devotional not found'
      });
    }

    const likeIndex = devotional.likes.indexOf(req.user.id);

    if (likeIndex > -1) {
      // Unlike
      devotional.likes.splice(likeIndex, 1);
    } else {
      // Like
      devotional.likes.push(req.user.id);
    }

    await devotional.save();

    res.json({
      success: true,
      message: likeIndex > -1 ? 'Devotional unliked' : 'Devotional liked',
      data: { likes: devotional.likes.length }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Add reflection
// @route   POST /api/devotionals/:id/reflect
// @access  Private
exports.addReflection = async (req, res) => {
  try {
    const { text, isPrivate } = req.body;

    const devotional = await Devotional.findById(req.params.id);

    if (!devotional) {
      return res.status(404).json({
        success: false,
        message: 'Devotional not found'
      });
    }

    devotional.reflections.push({
      user: req.user.id,
      text,
      isPrivate: isPrivate !== undefined ? isPrivate : true
    });

    await devotional.save();

    res.json({
      success: true,
      message: 'Reflection added successfully',
      data: { devotional }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update reflection
// @route   PUT /api/devotionals/:id/reflections/:reflectionId
// @access  Private
exports.updateReflection = async (req, res) => {
  try {
    const { text, isPrivate } = req.body;
    const { id, reflectionId } = req.params;

    const devotional = await Devotional.findById(id);

    if (!devotional) {
      return res.status(404).json({
        success: false,
        message: 'Devotional not found'
      });
    }

    // Find the reflection
    const reflection = devotional.reflections.id(reflectionId);

    if (!reflection) {
      return res.status(404).json({
        success: false,
        message: 'Reflection not found'
      });
    }

    // Check if user owns the reflection
    if (reflection.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this reflection'
      });
    }

    // Update the reflection
    reflection.text = text;
    reflection.isPrivate = isPrivate !== undefined ? isPrivate : reflection.isPrivate;

    await devotional.save();

    res.json({
      success: true,
      message: 'Reflection updated successfully',
      data: { devotional }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Mark as read
// @route   POST /api/devotionals/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const devotional = await Devotional.findById(req.params.id);

    if (!devotional) {
      return res.status(404).json({
        success: false,
        message: 'Devotional not found'
      });
    }

    await devotional.incrementReadCount();

    res.json({
      success: true,
      message: 'Marked as read'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};