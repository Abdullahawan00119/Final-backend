const Job = require('../models/Job');
const User = require('../models/User');
const Order = require('../models/Order');
const { sendNotification } = require('../utils/notificationHelper');

// @desc    Create a job
// @route   POST /api/jobs
// @access  Private (Customer only)
exports.createJob = async (req, res) => {
  try {
    req.body.postedBy = req.user.id;
    const job = await Job.create(req.body);
    res.status(201).json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all jobs with filtering and search
// @route   GET /api/jobs
// @access  Public
exports.getJobs = async (req, res) => {
  try {
    const { 
      category, 
      minBudget, 
      maxBudget, 
      search, 
      city, 
      area,
      sort, 
      page = 1, 
      limit = 10 
    } = req.query;

    const query = { status: 'open' };

    // category filtering
    if (category) {
      query.category = category;
    }

    // budget range filtering
    if (minBudget || maxBudget) {
      query.budget = {};
      if (minBudget) query.budget.$gte = Number(minBudget);
      if (maxBudget) query.budget.$lte = Number(maxBudget);
    }

    // location filtering
    if (city) {
      query['location.city'] = { $regex: city, $options: 'i' };
    }
    if (area) {
      query['location.area'] = { $regex: area, $options: 'i' };
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
      if (sort === 'budget-low') sortBy = 'budget';
      if (sort === 'budget-high') sortBy = '-budget';
    }

    // pagination logic
    const skip = (page - 1) * limit;

    const jobs = await Job.find(query)
      .populate('postedBy', 'firstName lastName avatar averageRating')
      .sort(sortBy)
      .skip(skip)
      .limit(Number(limit));

    const total = await Job.countDocuments(query);

    res.status(200).json({ 
      success: true, 
      count: jobs.length, 
      total,
      pages: Math.ceil(total / limit),
      currentPage: Number(page),
      data: jobs 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Public
exports.getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'firstName lastName avatar averageRating bio')
      .populate('applicants.provider', 'firstName lastName avatar averageRating email phone');
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    res.status(200).json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Apply to a job
// @route   POST /api/jobs/:id/apply
// @access  Private (Provider only)
exports.applyToJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.status !== 'open') {
      return res.status(400).json({ success: false, message: 'Job is no longer accepting applications' });
    }

    // Check if already applied
    const alreadyApplied = job.applicants.find(app => app.provider.toString() === req.user.id);
    if (alreadyApplied) {
      return res.status(400).json({ success: false, message: 'You have already applied to this job' });
    }

    const application = {
      provider: req.user.id,
      proposedPrice: req.body.proposedPrice,
      coverLetter: req.body.coverLetter,
      estimatedDuration: req.body.estimatedDuration
    };

    job.applicants.push(application);
    await job.save();

    // Send notification to job owner
    const io = req.app.get('io');
    await sendNotification(io, {
      recipient: job.postedBy,
      type: 'job_applied',
      title: 'New Applicant',
      message: `Someone has applied to your job: ${job.title}`,
      data: { jobId: job._id }
    });

    res.status(200).json({ success: true, message: 'Applied successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a job
// @route   PUT /api/jobs/:id
// @access  Private (Owner only)
exports.updateJob = async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Make sure user is job owner
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to update this job' });
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private (Owner only)
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Make sure user is job owner
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this job' });
    }

    await job.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Hire a provider for a job
// @route   POST /api/jobs/:id/hire/:providerId
// @access  Private (Owner only)
exports.hireProvider = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.postedBy.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    if (job.status !== 'open') {
      return res.status(400).json({ success: false, message: 'Job is not open for hiring' });
    }

    const { providerId } = req.params;
    const applicant = job.applicants.find(app => app.provider.toString() === providerId);

    if (!applicant) {
      return res.status(400).json({ success: false, message: 'Provider has not applied to this job' });
    }

    job.hiredProvider = providerId;
    job.hiredAt = Date.now();
    job.status = 'in-progress';
    job.startedAt = Date.now();
    
    applicant.status = 'accepted';
    
    job.applicants.forEach(app => {
      if (app.provider.toString() !== providerId) {
        app.status = 'rejected';
      }
    });

    await job.save();

    // Create an order for this job
    const order = await Order.create({
      customer: job.postedBy,
      provider: providerId,
      job: job._id,
      orderType: 'job',
      amount: applicant.proposedPrice || job.budgetAmount,
      totalAmount: applicant.proposedPrice || job.budgetAmount,
      status: 'in-progress'
    });

    // Send notification to the hired provider
    const io = req.app.get('io');
    await sendNotification(io, {
      recipient: providerId,
      type: 'job_hired',
      title: 'You were Hired!',
      message: `Congratulations! You have been hired for the job: ${job.title}`,
      data: { jobId: job._id, orderId: order._id }
    });

    res.status(200).json({ success: true, message: 'Provider hired successfully', data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update job status
// @route   PATCH /api/jobs/:id/status
// @access  Private (Owner or Hired Provider)
exports.updateJobStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const isOwner = job.postedBy.toString() === req.user.id;
    const isHiredProvider = job.hiredProvider && job.hiredProvider.toString() === req.user.id;

    if (!isOwner && !isHiredProvider) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    job.status = status;
    if (status === 'completed') {
      job.completedAt = Date.now();
      
      await Order.findOneAndUpdate(
        { job: job._id, status: 'in-progress' },
        { status: 'completed', completedAt: Date.now() }
      );
    }

    await job.save();
    res.status(200).json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
