/*
    MIT License
    Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
    Mindoro State University - Philippines
*/

import { User } from '../models/userModel.js';
import { Resident } from '../models/Resident.js';
import { Sitio } from '../models/Sitio.js';

/* =========================
    Secretary Functions
========================= */

export const secretaryDashboard = async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'secretary') return res.redirect("/login");

    console.log("📊 Secretary dashboard loading...");

    try {
        const residents = await Resident.findAll();
        let sitios = await Sitio.findAll();
        const bhws = await User.findAll({ where: { role: 'bhw' } });

        const defaultSitios = [
            { id: 1, name: 'Sitio Centro', description: 'Default sitio Centro' },
            { id: 2, name: 'Sitio Cupang', description: 'Default sitio Cupang' },
            { id: 3, name: 'Sitio Cuta', description: 'Default sitio Cuta' },
            { id: 4, name: 'Sitio Daet', description: 'Default sitio Daet' },
            { id: 5, name: 'Sitio Lucbanan', description: 'Default sitio Lucbanan' },
            { id: 6, name: 'Sitio Sulbod', description: 'Default sitio Sulbod' }
        ];

        if (!sitios || sitios.length === 0) {
            await Sitio.bulkCreate(defaultSitios, { ignoreDuplicates: true });
            sitios = await Sitio.findAll();
        }

        const sitioMap = {};
        sitios.forEach(sitio => {
            sitioMap[sitio.id] = sitio.name;
        });

        const residentsWithDetails = residents.map(resident => {
            const json = resident.toJSON();
            return {
                ...json,
                fullName: `${json.firstName} ${json.lastName}`,
                sitioName: sitioMap[json.sitioId] || 'Unknown Sitio'
            };
        });

        // Add assigned sitio to each BHW
        const bhwsWithAssignments = bhws.map(bhw => {
            const assignedSitio = sitios.find(sitio => sitio.assignedBHW === bhw.id);
            return {
                ...bhw.toJSON(),
                assignedSitio: assignedSitio ? assignedSitio.name : null,
                assignedSitioId: assignedSitio ? assignedSitio.id : null
            };
        });

        console.log("📋 Data loaded:", { 
            residentsCount: residents.length, 
            sitiosCount: sitios.length, 
            bhwsCount: bhws.length 
        });

        // Calculate stats
        const stats = {
            totalSitios: sitios.length,
            totalBHW: bhws.length,
            totalResidents: residents.length
        };

        // Grab success/error messages from query params
        const successMessage = req.query.success;
        const errorMessage = successMessage ? null : req.query.error;

        res.render("secdashboard", {
            title: "Secretary Dashboard",
            user: req.session.user,
            residents: residentsWithDetails,
            sitios,
            bhws: bhwsWithAssignments,
            stats,
            success: successMessage,
            error: errorMessage
        });
    } catch (error) {
        console.error('❌ Secretary dashboard error:', error);
        res.redirect("/login?error=Dashboard loading failed");
    }
};


export const getSecretaryDashboard = async (req, res) => {
  try {
    const [stats] = await db.query("SELECT ..."); // your stats query

    // Fetch all available BHWs
    const [availableBHWs] = await db.query("SELECT id, fullname FROM bhw_workers");

    res.render("secretaryDashboard", {
      user: req.user,
      stats: stats[0],
      availableBHWs, // <-- this is what your <select> uses
      success: req.query.success,
      error: req.query.error
    });
  } catch (err) {
    console.error(err);
    res.redirect("/error");
  }
};


// Show the register resident page
export const showRegisterResident = (req, res) => {
  res.render('register-resident'); // This points to register-resident.xian
};

export const registerResident = async (req, res) => {
  const { fullname, email, password } = req.body;
  try {
    // Insert the resident into the database
    await db.query(
      'INSERT INTO users (fullname, email, password, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
      [fullname, email, password, 'resident']
    );
    // Redirect back to dashboard after registration
    res.redirect('/secdashboard');
  } catch (err) {
    console.error(err);
    res.send('Error registering resident: ' + err.message);
  }
};


export const secretaryRegisterResident = async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'secretary') return res.redirect("/login");

    try {
        const sitios = await Sitio.findAll();
        res.render("secretary/register-resident", {
            title: "Register Resident",
            user: req.session.user,
            sitios
        });
    } catch (error) {
        console.error('Register resident page error:', error);
        res.redirect("/dashboard/secretary?error=Failed to load form");
    }
};

export const secretaryAddResident = async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'secretary') return res.redirect("/login");

    console.log("📝 Secretary adding resident:", req.body);

    try {
        const { 
            firstName, 
            lastName, 
            middleName,
            birthdate, 
            gender, 
            address, 
            sitioId, 
            contactNumber, 
            occupancy, 
            monthlyIncome, 
            maritalStatus, 
            educationLevel, 
            numChildren 
        } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !birthdate || !gender || !address || !sitioId || !contactNumber || !occupancy || !monthlyIncome || !maritalStatus || !educationLevel) {
            console.log("❌ Missing required fields");
            return res.redirect("/dashboard/secretary?error=Please fill in all required fields");
        }

        // Get sitio to find assigned BHW
        const sitio = await Sitio.findByPk(sitioId);
        const assignedBHW = sitio ? sitio.assignedBHW : null;

        console.log("🏘️ Sitio info:", { sitioId, sitioName: sitio?.name, assignedBHW });

        // Create User account for resident login (if contactNumber/email provided)
        let residentUserId = null;
        if (contactNumber) {
            // Create email from name and contact number
            const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@resident.local`;
            const defaultPassword = contactNumber.slice(-4) || "1234"; // Last 4 digits of contact or 1234

            // Check if email already exists
            const existingUser = await User.findOne({ where: { email } });
            
            if (!existingUser) {
                const user = await User.create({
                    fullname: `${firstName} ${lastName}`,
                    email: email,
                    password: defaultPassword,
                    role: 'resident'
                });
                residentUserId = user.id;
                console.log("✅ User account created:", { email, password: defaultPassword, userId: user.id });
            } else {
                residentUserId = existingUser.id;
                console.log("⚠️ User account already exists:", { email, userId: existingUser.id });
            }
        }

        // Create resident record
        const resident = await Resident.create({
            firstName,
            lastName,
            middleName: middleName || null,
            birthdate,
            gender,
            address,
            sitioId: parseInt(sitioId),
            contactNumber,
            occupancy,
            monthlyIncome,
            maritalStatus,
            educationLevel,
            numChildren: parseInt(numChildren) || 0,
            assignedBHW: assignedBHW,
            status: 'pending' // Default status is pending for BHW verification
        });

        console.log("✅ Resident created successfully:", { 
            id: resident.id, 
            name: `${firstName} ${lastName}`, 
            assignedBHW,
            userId: residentUserId 
        });

        let successMsg = "Resident registered successfully!";
        if (residentUserId) {
            const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@resident.local`;
            const password = contactNumber.slice(-4) || "1234";
            successMsg += ` Login: ${email} / Password: ${password}`;
        }

        res.redirect(`/dashboard/secretary?success=${encodeURIComponent(successMsg)}`);
    } catch (error) {
        console.error('❌ Add resident error:', error);
        res.redirect("/dashboard/secretary?error=Failed to register resident: " + error.message);
    }
};

export const secretaryManageSitios = async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'secretary') 
      return res.redirect("/login");

  try {
      const sitios = await Sitio.findAll();

      // Fetch all BHW users
      const availableBHWs = await User.findAll({
  where: { role: 'bhw' },
  attributes: ['id', 'fullname']  // Make sure id & fullname are selected
});

console.log(availableBHWs); // should print the array with the 3 BHWs

res.render("secretary/manage-sitios", {
  title: "Manage Sitios",
  user: req.session.user,
  sitios,
  availableBHWs
});
  } catch (error) {
      console.error('Manage sitios error:', error);
      res.redirect("/dashboard/secretary?error=Failed to load sitios");
  }
};

export const secretaryUpdateResidentStatus = async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'secretary') return res.redirect("/login");

  const { status } = req.body;
  const residentId = req.params.residentId;

  if (!residentId || !status || !['approved', 'rejected', 'pending'].includes(status)) {
    return res.redirect("/dashboard/secretary?error=Invalid resident status update");
  }

  try {
    const resident = await Resident.findByPk(residentId);
    if (!resident) {
      return res.redirect("/dashboard/secretary?error=Resident not found");
    }

    await Resident.update({ status }, { where: { id: residentId } });
    const message = status === 'approved' ? 'Resident approved successfully' : status === 'rejected' ? 'Resident rejected successfully' : 'Resident set to pending';
    res.redirect(`/dashboard/secretary?success=${encodeURIComponent(message)}`);
  } catch (error) {
    console.error('❌ Secretary resident status update error:', error);
    res.redirect("/dashboard/secretary?error=Failed to update resident status");
  }
};


export const secretaryAssignBHW = async (req, res) => {
  const sitioId = parseInt(req.body.sitioId, 10);
  const bhwId = parseInt(req.body.bhwId, 10);

  console.log("🔧 Assigning BHW:", { sitioId, bhwId });

  if (!sitioId || !bhwId) {
    console.log("❌ Missing sitioId or bhwId");
    return res.redirect("/dashboard/secretary?error=Please select a BHW and a sitio");
  }

  try {
    const sitio = await Sitio.findByPk(sitioId);
    const bhw = await User.findByPk(bhwId);

    if (!sitio) {
      console.log("❌ Sitio not found:", sitioId);
      return res.redirect("/dashboard/secretary?error=Sitio not found");
    }

    if (!bhw || bhw.role !== 'bhw') {
      console.log("❌ BHW not found or invalid role:", { bhwId, role: bhw?.role });
      return res.redirect("/dashboard/secretary?error=BHW not found");
    }

    // Clear any existing assignment for this BHW
    await Sitio.update({ assignedBHW: null }, { where: { assignedBHW: bhwId } });

    // Clear any existing assignment for this sitio
    await Sitio.update({ assignedBHW: null }, { where: { id: sitioId } });

    // Assign the BHW to the sitio
    await sitio.update({ assignedBHW: bhwId });

    // Also update all residents in this sitio with the assigned BHW
    await Resident.update({ assignedBHW: bhwId }, { where: { sitioId: sitioId } });

    console.log("✅ BHW assigned successfully:", { sitio: sitio.name, bhw: bhw.fullname });
    
    res.redirect("/dashboard/secretary?success=BHW assigned successfully to " + sitio.name);
  } catch (err) {
    console.error("❌ Assign BHW error:", err);
    res.redirect("/dashboard/secretary?error=Failed to assign BHW");
  }
};



// Detailed Census
export const secretaryDetailedCensus = async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'secretary') return res.redirect("/login");

    try {
        const sitios = await Sitio.findAll({
            include: [{ model: Resident }],
            order: [['name', 'ASC']]
        });

        res.render("secretary/detailed-census", {
            title: "Detailed Census",
            user: req.session.user,
            sitios
        });
    } catch (error) {
        console.error('Detailed census error:', error);
        res.redirect("/dashboard/secretary?error=Failed to load census data");
    }
};
// View all residents (Secretary)
export const secretaryViewResidents = async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'secretary') return res.redirect("/login");

    try {
        const residents = await Resident.findAll({
            include: [{ model: Sitio }],
            order: [['createdAt', 'DESC']]
        });

        res.render("secretary/all-residents", {
            title: "All Residents",
            user: req.session.user,
            residents
        });
    } catch (error) {
        console.error('View residents error:', error);
        res.redirect("/secretary/dashboard?error=Failed to load residents");
    }
};


/* =========================
    BHW Functions
========================= */

export const bhwDashboard = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) return res.redirect("/login");

    console.log("👨‍⚕️ BHW Dashboard loading for:", { id: user.id, name: user.fullname });
    
    // 1. Get sitios assigned to this BHW
    const assignedSitios = await Sitio.findAll({
      where: { assignedBHW: user.id }
    });

    console.log("🏘️ Assigned sitios:", assignedSitios.map(s => ({ id: s.id, name: s.name })));

    // 2. If no assigned sitio, return empty dashboard
    if (assignedSitios.length === 0) {
      console.log("⚠️ No sitio assigned to this BHW");
      return res.render("bhwdashboard", {
        user,
        assignedSitio: { name: "No Sitio Assigned" },
        residents: [],
        verifiedCount: 0,
        pendingCount: 0,
        rejectedCount: 0
      });
    }

    // 3. Extract sitio IDs
    const sitioIds = assignedSitios.map(s => s.id);

    // 4. Get residents in assigned sitio(s) - match by sitioId
    const residents = await Resident.findAll({
      where: { 
        sitioId: sitioIds
      }
    });

    console.log("👥 Residents found:", residents.length);
    console.log("📋 Resident details:", residents.map(r => ({ 
      id: r.id, 
      name: `${r.firstName} ${r.lastName}`, 
      sitioId: r.sitioId,
      assignedBHW: r.assignedBHW,
      status: r.status 
    })));

    // 5. Count verification status (use 'status' field, not 'verificationStatus')
    const verifiedCount = residents.filter(r => r.status === "approved").length;
    const pendingCount = residents.filter(r => r.status === "pending").length;
    const rejectedCount = residents.filter(r => r.status === "rejected").length;

    console.log("📊 Status counts:", { verifiedCount, pendingCount, rejectedCount });

    // 6. Render dashboard
    return res.render("bhwdashboard", {
      user,
      assignedSitio: assignedSitios[0], // show the first assigned sitio
      residents,
      verifiedCount,
      pendingCount,
      rejectedCount
    });

  } catch (error) {
    console.error("❌ BHW DASHBOARD ERROR:", error);
    return res.redirect("/login?error=Dashboard loading failed");
  }
};






// View assigned residents
export const bhwViewResidents = async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'bhw') return res.redirect("/login");

    try {
        const assignedSitio = await Sitio.findOne({ where: { assignedBHW: req.session.user.id } });
        let residents = [];

        if (assignedSitio) {
            residents = await Resident.findAll({ where: { sitio: assignedSitio.name } });
        }

        res.render("bhw/residents", {
            title: "Assigned Residents",
            user: req.session.user,
            residents,
            assignedSitio
        });
    } catch (error) {
        console.error('View residents error:', error);
        res.redirect("/dashboard/bhw?error=Failed to load residents");
    }
};

// Verify a resident
export const bhwVerifyResident = async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'bhw') return res.redirect("/login");

    try {
        const resident = await Resident.findByPk(req.params.residentId);
        if (!resident) return res.redirect("/bhw/residents?error=Resident not found");

        res.render("bhw/verify-resident", {
            title: "Verify Resident",
            user: req.session.user,
            resident
        });
    } catch (error) {
        console.error('Verify resident error:', error);
        res.redirect("/bhw/residents?error=Failed to load verification form");
    }
};

// Update verification
export const bhwUpdateVerification = async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'bhw') return res.redirect("/login");

    console.log("🔍 BHW verifying resident:", { residentId: req.params.residentId, body: req.body });

    try {
        const { status } = req.body;
        
        if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
            console.log("❌ Invalid status:", status);
            return res.redirect("/dashboard/bhw?error=Invalid verification status");
        }

        // Update resident verification status
        await Resident.update(
            {
                status: status // Update the status field
            },
            { where: { id: req.params.residentId } }
        );

        console.log(`✅ Resident ${req.params.residentId} verification updated to: ${status}`);

        const successMsg = status === 'approved' ? 'Resident verified successfully!' : 'Resident rejected';
        res.redirect(`/dashboard/bhw?success=${encodeURIComponent(successMsg)}`);
    } catch (error) {
        console.error('❌ Update verification error:', error);
        res.redirect(`/dashboard/bhw?error=Failed to update verification`);
    }
};

// POST: /secretary/assign-bhw
// POST: /secretary/assign-bhw
export const assignBHW = async (req, res) => {
  const { sitioId, bhwId } = req.body;

  try {
    await Sitio.update(
      { assignedBHW: bhwId },
      { where: { id: sitioId } }
    );

    return res.redirect("/secretary?success=BHW successfully assigned!");
  } catch (err) {
    console.error(err);
    return res.redirect("/secretary?error=Failed to assign BHW.");
  }
};



/* =========================
    Resident Functions
========================= */

export const residentDashboard = async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'resident') return res.redirect("/login");

    try {
        // Get ALL verified residents from ALL sitios (status = 'approved')
        const verifiedResidents = await Resident.findAll({
            where: {
                status: 'approved'
            },
            order: [['lastName', 'ASC'], ['firstName', 'ASC']]
        });

        console.log("📊 Loading resident dashboard, verified residents:", verifiedResidents.length);

        // Get all sitios to map sitio names
        const allSitios = await Sitio.findAll();
        const sitioMap = {};
        allSitios.forEach(s => {
            sitioMap[s.id] = s.name;
        });

        // Get all BHWs to map BHW names
        const allBHWs = await User.findAll({ where: { role: 'bhw' } });
        const bhwMap = {};
        allBHWs.forEach(b => {
            bhwMap[b.id] = b.fullname;
        });

        // Add sitio name and BHW name to each resident
        const residentsWithDetails = verifiedResidents.map(r => ({
            ...r.toJSON(),
            sitioName: sitioMap[r.sitioId] || 'Unknown',
            bhwName: bhwMap[r.assignedBHW] || 'Not Assigned'
        }));

        const userFullName = req.session.user.fullname || '';
        const [firstName, ...rest] = userFullName.split(' ');
        const lastName = rest.length ? rest[rest.length - 1] : '';

        const currentResident = await Resident.findOne({
            where: {
                firstName,
                lastName
            }
        });

        const residentDetails = currentResident ? {
            ...currentResident.toJSON(),
            fullName: `${currentResident.firstName} ${currentResident.lastName}`,
            sitioName: sitioMap[currentResident.sitioId] || 'Unknown',
            bhwName: bhwMap[currentResident.assignedBHW] || 'Not Assigned'
        } : null;

        console.log("✅ Dashboard data prepared:", { 
            verifiedCount: residentsWithDetails.length,
            currentResident: residentDetails ? residentDetails.fullName : 'none'
        });

        res.render("resdashboard", {
            title: "Resident Dashboard",
            user: req.session.user,
            verifiedResidents: residentsWithDetails,
            currentResident: residentDetails
        });
    } catch (error) {
        console.error('❌ Resident dashboard error:', error);
        res.redirect("/login");
    }
};

// View aid status
export const residentViewAidStatus = async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'resident') return res.redirect("/login");

    try {
        const resident = await Resident.findOne({ where: { email: req.session.user.email } });

        res.render("resident/aid-status", {
            title: "Aid Qualification Status",
            user: req.session.user,
            resident
        });
    } catch (error) {
        console.error('Aid status error:', error);
        res.redirect("/dashboard/resident?error=Failed to load aid status");
    }
};

// POST: /secretary/add-resident
export const addResident = async (req, res) => {
  const {
    firstName,
    lastName,
    birthdate,
    gender,
    address,
    sitioId,
    contactNumber,
    occupancy,
    monthlyIncome,
    maritalStatus,
    educationLevel,
    numChildren,
  } = req.body;

  try {
    // Find the assigned BHW for this sitio
    const sitio = await Sitio.findByPk(sitioId);
    const bhwId = sitio.assignedBHW || null;

    // Insert resident with the bhwId
    await Resident.create({
      firstName,
      lastName,
      birthdate,
      gender,
      address,
      sitioId,
      contactNumber,
      occupancy,
      monthlyIncome,
      maritalStatus,
      educationLevel,
      numChildren,
      bhwId
    });

    res.redirect("/secretary?success=Resident registered successfully!");
  } catch (err) {
    console.error(err);
    res.redirect("/secretary?error=Failed to register resident.");
  }
};

