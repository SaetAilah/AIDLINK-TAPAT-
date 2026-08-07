import { sequelize } from "./models/db.js";
import { Sitio } from "./models/Sitio.js";
import { User } from "./models/userModel.js";

try {
  await sequelize.authenticate();
  console.log("✅ Connected to database\n");

  // Check BHWs
  const bhws = await User.findAll({ where: { role: 'bhw' } });
  console.log("👨‍⚕️ BHWs in database:");
  bhws.forEach(bhw => {
    console.log(`  ID: ${bhw.id}, Name: ${bhw.fullname}, Email: ${bhw.email}`);
  });

  // Check Sitios
  const sitios = await Sitio.findAll();
  console.log("\n🏘️ Sitios in database:");
  sitios.forEach(sitio => {
    console.log(`  ID: ${sitio.id}, Name: ${sitio.name}, Assigned BHW: ${sitio.assignedBHW || 'None'}`);
  });

  // Assign Ren Diaz (ID=4) to Sitio Centro (ID=1)
  console.log("\n🔄 Assigning Ren Diaz (ID=4) to Sitio Centro (ID=1)...");
  await Sitio.update(
    { assignedBHW: 4 },
    { where: { id: 1 } }
  );

  // Verify assignment
  const updatedSitio = await Sitio.findByPk(1);
  console.log("✅ Sitio Centro updated:");
  console.log(`  Assigned BHW: ${updatedSitio.assignedBHW}`);

  // Check what sitios are assigned to Ren Diaz
  const renSitios = await Sitio.findAll({ where: { assignedBHW: 4 } });
  console.log("\n🏘️ Sitios assigned to Ren Diaz:");
  renSitios.forEach(s => console.log(`  - ${s.name}`));

} catch (error) {
  console.error("❌ Error:", error);
} finally {
  process.exit();
}
