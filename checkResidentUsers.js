import { sequelize } from "./models/db.js";
import { User } from "./models/userModel.js";
import { Resident } from "./models/Resident.js";

try {
  await sequelize.authenticate();
  console.log("✅ Connected to database\n");

  // Check all users
  const users = await User.findAll();
  console.log("👤 All Users in database:");
  users.forEach(user => {
    console.log(`  ID: ${user.id}, Name: ${user.fullname}, Email: ${user.email}, Role: ${user.role}, Password: ${user.password}`);
  });

  // Check all residents
  const residents = await Resident.findAll();
  console.log("\n🏠 All Residents in database:");
  residents.forEach(r => {
    console.log(`  ID: ${r.id}, Name: ${r.firstName} ${r.lastName}, Contact: ${r.contactNumber}, SitioID: ${r.sitioId}`);
  });

  // Check if there are residents without user accounts
  console.log("\n🔍 Checking for residents without user accounts...");
  for (const resident of residents) {
    const email = `${resident.firstName.toLowerCase()}.${resident.lastName.toLowerCase()}@resident.local`;
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      console.log(`  ❌ No user account for: ${resident.firstName} ${resident.lastName} (expected email: ${email})`);
    } else {
      console.log(`  ✅ User account exists for: ${resident.firstName} ${resident.lastName} (${email})`);
    }
  }

} catch (error) {
  console.error("❌ Error:", error);
} finally {
  process.exit();
}
