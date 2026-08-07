/*
    MIT License
    
    Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
    Mindoro State University - Philippines
*/

import { User } from '../models/userModel.js';

// Page rendering functions
export const loginPage = (req, res) => {
    res.render('login');
};

export const registerPage = (req, res) => {
    res.render('register');
};

export const forgotPasswordPage = (req, res) => {
    res.render('forgot-password');
};

/*  
=====================================
 FIXED DASHBOARD REDIRECT FUNCTION
=====================================
*/
export const dashboardPage = (req, res) => {
    const user = req.session.user;

    if (!user || !user.id) {
        return res.redirect("/login");
    }

    switch (user.role) {
        case "secretary":
            return res.redirect("/dashboard/secretary");
        case "bhw":
            return res.redirect("/dashboard/bhw");
        case "resident":
            return res.redirect("/dashboard/resident");
        default:
            return res.redirect("/login");
    }
};

// Register function
export const registerUser = async (req, res) => {
    const { fullname, email, password, confirmPassword, role, bhwId } = req.body;
    
    console.log("Registration attempt:", { fullname, email, role, bhwId });
    
    try {
        if (password !== confirmPassword) {
            return res.redirect("/register?error=Passwords do not match");
        }
        
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.redirect("/register?error=Email already registered");
        }
        
        if (role === 'bhw' && !bhwId) {
            return res.redirect("/register?error=BHW ID is required for BHW role");
        }
        
        const user = await User.create({
            fullname: fullname,
            email,
            password: password,
            role,
            bhwId: role === 'bhw' ? bhwId : null
        });
        
        res.redirect("/login?success=Registration successful! Please login.");
        
    } catch (error) {
        console.error('Registration error:', error);
        res.redirect("/register?error=Server error during registration: " + error.message);
    }
};

// Login function with role-specific redirect
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    console.log("🔍 Login attempt:", { email, password });

    try {
        const user = await User.findOne({ where: { email } });

        console.log("📋 User found in DB:", user ? {
            id: user.id,
            email: user.email,
            storedPassword: user.password,
            role: user.role
        } : "No user found");

        if (!user) {
            console.log("❌ Login failed: User not found");
            return res.redirect("/login?error=Invalid email or password");
        }

        console.log("🔐 Password comparison:", {
            provided: password,
            stored: user.password,
            match: user.password === password
        });

        if (user.password !== password) {
            console.log("❌ Login failed: Password mismatch");
            return res.redirect("/login?error=Invalid email or password");
        }

        // Store full user object in session
        req.session.user = {
            id: user.id,
            fullname: user.fullname,
            email: user.email,
            role: user.role,
            bhwId: user.bhwId || null
        };

        console.log("✅ Login successful! Session user:", req.session.user);
        console.log("📍 Redirecting to:", user.role === "secretary" ? "/dashboard/secretary" : user.role === "bhw" ? "/dashboard/bhw" : "/dashboard/resident");

        // Redirect based on role
        switch (user.role) {
            case "secretary":
                return res.redirect("/dashboard/secretary");
            case "bhw":
                return res.redirect("/dashboard/bhw");
            case "resident":
                return res.redirect("/dashboard/resident");
            default:
                return res.redirect("/login");
        }
    } catch (error) {
        console.error("❌ Login error:", error);
        return res.redirect("/login?error=Server error during login");
    }
};


// Logout
export const logoutUser = (req, res) => {
    req.session.destroy((err) => {
        if (err) console.error('Logout error:', err);
        res.redirect('/login');
    });
};
