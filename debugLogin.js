import { sequelize } from "./models/db.js";
import { User } from "./models/userModel.js";

try {
  await sequelize.authenticate();
  console.log("✅ Connected to database");

  // Check all users
  const users = await User.findAll();
  console.log("\n📋 All users in database:");
  users.forEach(user => {
    console.log(`\nID: ${user.id}`);
    console.log(`Name: ${user.fullname}`);
    console.log(`Email: ${user.email}`);
    console.log(`Password: ${user.password}`);
    console.log(`Role: ${user.role}`);
  });

  // Test login with secretary credentials
  console.log("\n🔍 Testing secretary login...");
  const testEmail = "secretary@test.com";
  const testPassword = "123456";
  
  const user = await User.findOne({ where: { email: testEmail } });
  
  if (!user) {
    console.log("❌ User not found with email:", testEmail);
  } else {
    console.log("✅ User found:", user.email);
    console.log("   Stored password:", user.password);
    console.log("   Test password:", testPassword);
    console.log("   Passwords match:", user.password === testPassword);
    console.log("   Role:", user.role);
  }
  
} catch (error) {
  console.error("❌ Error:", error);
} finally {
  process.exit();
}
