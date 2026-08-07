import { sequelize } from "./models/db.js";
import { User } from "./models/userModel.js";

try {
  await sequelize.authenticate();
  console.log("✅ Connected to database");

  const users = await User.findAll();
  
  if (users.length === 0) {
    console.log("⚠️ No users found in database");
    console.log("\nCreating test users...");
    
    // Create secretary
    await User.create({
      fullname: "Secretary Test",
      email: "secretary@test.com",
      password: "123456",
      role: "secretary"
    });
    console.log("✅ Created secretary user: secretary@test.com / 123456");
    
    // Create BHW
    await User.create({
      fullname: "BHW Test",
      email: "bhw@test.com",
      password: "123456",
      role: "bhw",
      bhwId: 1
    });
    console.log("✅ Created BHW user: bhw@test.com / 123456");
    
    // Create resident
    await User.create({
      fullname: "Resident Test",
      email: "resident@test.com",
      password: "123456",
      role: "resident"
    });
    console.log("✅ Created resident user: resident@test.com / 123456");
    
  } else {
    console.log("\n📋 Existing users:");
    users.forEach(user => {
      console.log(`  - ${user.fullname} (${user.email}) - Role: ${user.role}`);
    });
  }
  
} catch (error) {
  console.error("❌ Error:", error);
} finally {
  process.exit();
}
