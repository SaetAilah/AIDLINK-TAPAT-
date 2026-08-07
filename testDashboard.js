import { sequelize } from './models/db.js';
import { User } from './models/userModel.js';
import { Resident } from './models/Resident.js';
import { Sitio } from './models/Sitio.js';

async function testDashboard() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database\n');

    // Get ALL verified residents (what the dashboard will show)
    const verifiedResidents = await Resident.findAll({
      where: { status: 'approved' },
      order: [['lastName', 'ASC'], ['firstName', 'ASC']]
    });

    console.log(`📊 Verified Residents: ${verifiedResidents.length}\n`);

    // Get sitios and BHWs for mapping
    const sitios = await Sitio.findAll();
    const bhws = await User.findAll({ where: { role: 'bhw' } });

    const sitioMap = {};
    sitios.forEach(s => { sitioMap[s.id] = s.name; });

    const bhwMap = {};
    bhws.forEach(b => { bhwMap[b.id] = b.fullname; });

    // Display what resident dashboard will show
    console.log('📋 Resident Dashboard View:');
    console.log('═══════════════════════════════════════════════════════════');
    
    if (verifiedResidents.length === 0) {
      console.log('   No verified residents to display');
    } else {
      verifiedResidents.forEach((r, i) => {
        console.log(`${i + 1}. ${r.firstName} ${r.lastName}`);
        console.log(`   📍 Sitio: ${sitioMap[r.sitioId] || 'Unknown'}`);
        console.log(`   👤 BHW: ${bhwMap[r.assignedBHW] || 'Not Assigned'}`);
        console.log(`   📧 Address: ${r.address}`);
        console.log('');
      });
    }

    console.log('═══════════════════════════════════════════════════════════');
    console.log(`\n✅ Total: ${verifiedResidents.length} verified resident(s)`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testDashboard();
