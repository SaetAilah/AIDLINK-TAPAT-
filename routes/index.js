/*
    MIT License
    
    Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
    Mindoro State University - Philippines

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
*/

import express from "express";
import { homePage } from "../controllers/homeController.js";
const router = express.Router();


 // handle submission

// Import auth controllers
import { 
    loginPage, 
    registerPage, 
    forgotPasswordPage, 
    dashboardPage, 
    loginUser, 
    registerUser, 
    logoutUser 
} from "../controllers/authController.js";

// Import dashboard controllers - FIXED IMPORT PATH
import {
    assignBHW , 
    showRegisterResident,
    secretaryDashboard,
    bhwDashboard,
    residentDashboard,
    registerResident,
    secretaryRegisterResident,
    secretaryAddResident,
    secretaryManageSitios,
    secretaryAssignBHW,
    secretaryUpdateResidentStatus,
    bhwViewResidents,
    bhwVerifyResident,
    bhwUpdateVerification,
    residentViewAidStatus,
    secretaryViewResidents,
    secretaryDetailedCensus
} from "../controllers/dashboardcontroller.js"; // lowercase 'c'

// Home route
router.get("/", homePage);

// Authentication routes
router.get("/login", loginPage);
router.post("/login", loginUser);
router.get("/register", registerPage);
router.post("/register", registerUser);
router.get("/forgot-password", forgotPasswordPage);
router.get("/dashboard", dashboardPage);
router.get("/logout", logoutUser);

// Role-specific dashboard routes
router.get("/dashboard/secretary", secretaryDashboard);
router.get("/dashboard/bhw", bhwDashboard);
router.get("/dashboard/resident", residentDashboard);

// Secretary management routes
router.get("/secretary", secretaryDashboard); 
router.get("/secretary/register-resident", secretaryRegisterResident);
router.post("/secretary/add-resident", secretaryAddResident);
router.get("/secretary/manage-sitios", secretaryManageSitios);
router.post("/secretary/assign-bhw", secretaryAssignBHW);
router.post('/secretary/resident-status/:residentId', secretaryUpdateResidentStatus);
router.get('/secretary/all-residents', secretaryViewResidents);
router.get('/secretary/detailed-census', secretaryDetailedCensus);
router.get('/secretary/register-resident', showRegisterResident); // display form
router.post('/secretary/register-resident', registerResident);   
// BHW routes
router.get("/bhw/residents", bhwViewResidents);
router.get("/bhw/verify/:residentId", bhwVerifyResident);
router.post("/bhw/verify/:residentId", bhwUpdateVerification);

// Resident routes
router.get("/resident/aid-status", residentViewAidStatus);

export default router;