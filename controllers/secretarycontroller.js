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

import { User } from "../models/userModel.js";
import { Sitio } from "../models/Sitio.js";
import { Resident } from "../models/Resident.js";
import { BHWSitio } from "../models/Bhwsitio.js";

// PAGE: Register Resident
export const residentRegisterPage = async (req, res) => {
  const sitios = await Sitio.findAll();
  res.render("secretary/register-resident", { title: "Register Resident", sitios });
};

// PROCESS: Register Resident
export const registerResident = async (req, res) => {
  const { fullname, email, household_no, sitio_id } = req.body;

  const existing = await User.findOne({ where: { email } });
  if (existing) return res.send("Resident already exists");

  const password = "default123"; // plain text password (insecure)

  // create user account
  const user = await User.create({
    fullname,
    email,
    password,
    role: "resident"
  });

  // create resident record
  await Resident.create({
    user_id: user.id,
    sitio_id,
    household_no
  });

  res.send("Resident successfully registered");
};

// PAGE: Register BHW
export const bhwRegisterPage = (req, res) => {
  res.render("secretary/register-bhw", { title: "Register BHW" });
};

// PROCESS: Register BHW
export const registerBHW = async (req, res) => {
  const { fullname, email } = req.body;

  const existing = await User.findOne({ where: { email } });
  if (existing) return res.send("BHW already exists");

  const password = "bhw12345"; // plain text password (insecure)

  await User.create({
    fullname,
    email,
    password,
    role: "bhw"
  });

  res.send("BHW account created");
};

// PROCESS: Assign BHW to Sitio
export const assignBHW = async (req, res) => {
  const { bhw_id, sitio_id } = req.body;

  await BHWSitio.create({
    bhw_id,
    sitio_id
  });

  res.send("BHW successfully assigned to sitio");
};
