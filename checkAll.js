import { sequelize } from './models/db.js';
import { User } from './models/userModel.js';
import { Resident } from './models/Resident.js';
import { Sitio } from './models/Sitio.js';

async function checkEverything() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database\n');

    // Check BHWs
    const bhws = await User.findAll({ where: { role: 'bhw' } });
    console.log('📋 BHWs in database:', bhws.length);
    bhws.forEach(bhw => {
      console.log(`  - ${bhw.fullname} (${bhw.email}) [ID: ${bhw.id}]`);
    });

    // Check Sitios and their assigned BHWs
    console.log('\n📍 Sitios and their assigned BHWs:');
    const sitios = await Sitio.findAll();
    for (const sitio of sitios) {
      if (sitio.assignedBHW) {
        const bhw = await User.findByPk(sitio.assignedBHW);
        console.log(`  - ${sitio.name}: ${bhw ? bhw.fullname : 'None'} [BHW ID: ${sitio.assignedBHW}]`);
      } else {
        console.log(`  - ${sitio.name}: Not assigned`);
      }
    }

    // Check residents
    console.log('\n👥 Residents in database:', await Resident.count());
    const residents = await Resident.findAll();
    residents.forEach(r => {
      console.log(`  - ${r.firstName} ${r.lastName} [Sitio: ${r.sitioId}, BHW: ${r.assignedBHW}, Status: ${r.status}]`);
    });

    // Show approved residents count
    const approvedCount = await Resident.count({ where: { status: 'approved' } });
    console.log(`\n✅ Verified Residents: ${approvedCount}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkEverything();
