import { sequelize } from './models/db.js';
import { User } from './models/userModel.js';
import { Sitio } from './models/Sitio.js';

async function removeBHWTest() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database\n');

    // Find BHW Test
    const bhwTest = await User.findOne({ where: { email: 'bhw@test.com' } });
    
    if (!bhwTest) {
      console.log('❌ BHW Test not found');
      process.exit(0);
    }

    console.log('Found BHW Test:', { id: bhwTest.id, name: bhwTest.fullname });

    // Check if any sitio is assigned to BHW Test
    const assignedSitios = await Sitio.findAll({ where: { assignedBHW: bhwTest.id } });
    
    if (assignedSitios.length > 0) {
      console.log(`\n⚠️  BHW Test is assigned to ${assignedSitios.length} sitio(s):`);
      assignedSitios.forEach(s => console.log(`   - ${s.name}`));
      console.log('\n🔄 Reassigning to Ren Diaz (ID: 4)...');
      
      // Reassign to Ren Diaz
      for (const sitio of assignedSitios) {
        sitio.assignedBHW = 4; // Ren Diaz
        await sitio.save();
        console.log(`   ✅ ${sitio.name} reassigned to Ren Diaz`);
      }
    }

    // Delete BHW Test
    await bhwTest.destroy();
    console.log('\n✅ BHW Test deleted successfully');

    // Show remaining BHWs
    const bhws = await User.findAll({ where: { role: 'bhw' } });
    console.log('\n📋 Remaining BHWs:');
    bhws.forEach(bhw => {
      console.log(`  - ${bhw.fullname} (${bhw.email}) [ID: ${bhw.id}]`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

removeBHWTest();
