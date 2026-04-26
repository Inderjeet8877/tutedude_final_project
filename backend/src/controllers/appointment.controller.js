const Appointment = require('../models/Appointment.model');

// Get appointments
exports.getAppointments = async (req, res, next) => {
  try {
    console.log("Getting appointments for user role:", req.user.role);
    
    // Basic query object
    let queryArgs = {};

    // If the user is an employee, they should only see their own appointments
    if (req.user.role === 'Employee') {
      queryArgs.employee = req.user.id;
    }

    // Admins and Security can see all appointments
    // We can also filter by status if it's provided in the URL query string
    if (req.query.status) {
      queryArgs.status = req.query.status;
    }

    // Step 1: Find appointments using the basic query
    // Populate simple fields
    const appointments = await Appointment.find(queryArgs)
      .populate('visitor')
      .populate('employee', 'name email');

    // Step 2: Send response
    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    console.log("Error in getAppointments:", error);
    next(error);
  }
};

// Get single appointment
exports.getAppointment = async (req, res, next) => {
  try {
    const id = req.params.id;
    
    // Step 1: Find the appointment by ID
    const appointment = await Appointment.findById(id)
      .populate('visitor')
      .populate('employee', 'name email');

    // Step 2: Check if it exists
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Step 3: Check authorization - Employees can only see their own appointments
    if (req.user.role === 'Employee') {
      if (appointment.employee._id.toString() !== req.user.id.toString()) {
        return res.status(403).json({ success: false, message: 'You are not authorized to view this appointment' });
      }
    }

    // Step 4: Send success response
    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.log("Error in getAppointment:", error);
    next(error);
  }
};

// Create new appointment
exports.createAppointment = async (req, res, next) => {
  try {
    console.log("Creating new appointment");
    // Step 1: Get data from the request body
    const appointmentData = req.body;
    
    // Step 2: If the frontend didn't send an employee ID, use the logged-in user's ID
    if (!appointmentData.employee) {
      appointmentData.employee = req.user.id;
    }

    // Step 3: Create the appointment in the database
    const newAppointment = await Appointment.create(appointmentData);

    // Step 4: Send success response
    res.status(201).json({
      success: true,
      data: newAppointment
    });
  } catch (error) {
    console.log("Error in createAppointment:", error);
    next(error);
  }
};

// Update appointment
exports.updateAppointment = async (req, res, next) => {
  try {
    const id = req.params.id;
    console.log(`Updating appointment ${id}`);
    
    // Step 1: Find the existing appointment
    let appointment = await Appointment.findById(id);

    // Step 2: Check if it exists
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Step 3: Check authorization - Employees can only update their own appointments
    if (req.user.role === 'Employee') {
      if (appointment.employee.toString() !== req.user.id.toString()) {
        return res.status(403).json({ success: false, message: 'You are not authorized to update this appointment' });
      }
    }

    // Step 4: Update the appointment with the new data from request body
    appointment = await Appointment.findByIdAndUpdate(id, req.body, {
      new: true, // This returns the updated document instead of the old one
      runValidators: true // This makes sure the update follows our Mongoose schema rules
    });

    // Step 5: Send success response
    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.log("Error in updateAppointment:", error);
    next(error);
  }
};

// Delete appointment
exports.deleteAppointment = async (req, res, next) => {
  try {
    const id = req.params.id;
    console.log(`Deleting appointment ${id}`);
    
    // Step 1: Find the appointment
    const appointment = await Appointment.findById(id);

    // Step 2: Check if it exists
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    
    // Step 3: Only Admin can delete appointments in this system
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Only Admins can delete appointments' });
    }

    // Step 4: Delete it
    await Appointment.findByIdAndDelete(id);

    // Step 5: Send success response
    res.status(200).json({
      success: true,
      message: 'Appointment deleted successfully',
      data: {}
    });
  } catch (error) {
    console.log("Error in deleteAppointment:", error);
    next(error);
  }
};
