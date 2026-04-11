const Service = require('../models/Service');

// @desc    Create a service
// @route   POST /api/services
// @access  Private (Provider only)
exports.createService = async (req, res) => {
  try {
    req.body.provider = req.user.id;
    const service = await Service.create(req.body);
    res.status(201).json({ success: true, data: service });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all services with filtering and search
// @route   GET /api/services
// @access  Public
exports.getServices = async (req, res) => {
  try {
    const { 
      category, 
      minPrice, 
      maxPrice, 
      search, 
      city, 
      sort, 
      page = 1, 
      limit = 10 
    } = req.query;

    const query = { isActive: true };

    // category filtering
    if (category) {
      query.category = category;
    }

    // price range filtering
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // location filtering
    if (city) {
      query['location.city'] = { $regex: city, $options: 'i' };
    }

    // search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // sort logic
    let sortBy = '-createdAt';
    if (sort) {
      if (sort === 'price-low') sortBy = 'price';
      if (sort === 'price-high') sortBy = '-price';
      if (sort === 'rating') sortBy = '-averageRating';
    }

    // pagination logic
    const skip = (page - 1) * limit;

    const services = await Service.find(query)
      .populate('provider', 'firstName lastName avatar averageRating')
      .sort(sortBy)
      .skip(skip)
      .limit(Number(limit));

    const total = await Service.countDocuments(query);

    res.status(200).json({ 
      success: true, 
      count: services.length, 
      total,
      pages: Math.ceil(total / limit),
      currentPage: Number(page),
      data: services 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single service
// @route   GET /api/services/:slug
// @access  Public
exports.getService = async (req, res) => {
  try {
    const service = await Service.findOne({ slug: req.params.slug }).populate('provider', 'firstName lastName avatar averageRating bio');
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    res.status(200).json({ success: true, data: service });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a service
// @route   PUT /api/services/:id
// @access  Private (Owner only)
exports.updateService = async (req, res) => {
  try {
    let service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    // Make sure user is service owner
    if (service.provider.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to update this service' });
    }

    service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: service });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a service
// @route   DELETE /api/services/:id
// @access  Private (Owner only)
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    // Make sure user is service owner
    if (service.provider.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this service' });
    }

    await service.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
