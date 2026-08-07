import { sequelize } from "./models/db.js";
import { Resident } from "./models/Resident.js";
import { Sitio } from "./models/Sitio.js";

try {
  await sequelize.authenticate();
  console.log("✅ Connected to database\n");

  // Add a test resident to Sitio Centro (ID=1) which is assigned to Ren Diaz (ID=4)
  console.log("📝 Adding test resident to Sitio Centro...");
  
  const resident = await Resident.create({
    firstName: "Juan",
    lastName: "Dela Cruz",
    middleName: "Santos",
    birthdate: "1990-01-15",
    gender: "male",
    address: "123 Main St, Sitio Centro",
    sitioId: 1, // Sitio Centro
    contactNumber: "09123456789",
    occupancy: "Owner",
    monthlyIncome: "15000",
    maritalStatus: "married",
    educationLevel: "college",
    numChildren: 2,
    assignedBHW: 4, // Ren Diaz
    status: "active"
  });

  console.log("✅ Resident created:");
  console.log(`  ID: ${resident.id}`);
  console.log(`  Name: ${resident.firstName} ${resident.lastName}`);
  console.log(`  Sitio ID: ${resident.sitioId}`);
  console.log(`  Assigned BHW: ${resident.assignedBHW}`);

  // Verify residents in Sitio Centro
  const residents = await Resident.findAll({ where: { sitioId: 1 } });
  console.log(`\n👥 Total residents in Sitio Centro: ${residents.length}`);
  residents.forEach(r => {
    console.log(`  - ${r.firstName} ${r.lastName} (Assigned BHW: ${r.assignedBHW})`);
  });

} catch (error) {
  console.error("❌ Error:", error);
} finally {
  process.exit();
}
