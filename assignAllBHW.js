import { User } from './models/userModel.js';
import { Sitio } from './models/Sitio.js';
import { sequelize } from './models/db.js';

async function assignBHWs() {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected\n');

        // Get all sitios
        const sitios = await Sitio.findAll();
        console.log(`📍 Found ${sitios.length} sitios\n`);

        // Get all BHW users
        const bhws = await User.findAll({ where: { role: 'bhw' } });
        console.log(`👨‍⚕️ Found ${bhws.length} BHWs:`);
        bhws.forEach(bhw => {
            console.log(`  - ${bhw.fullname} (ID: ${bhw.id})`);
        });
        console.log('');

        if (bhws.length === 0) {
            console.log('❌ No BHWs found. Please create BHW users first.');
            process.exit(1);
        }

        // Assign BHWs to sitios (cycling through BHWs if more sitios than BHWs)
        let bhwIndex = 0;
        for (const sitio of sitios) {
            const bhw = bhws[bhwIndex % bhws.length];
            
            await sitio.update({ assignedBHW: bhw.id });
            console.log(`✅ Assigned ${bhw.fullname} to ${sitio.name}`);
            
            bhwIndex++;
        }

        console.log('\n🎉 All sitios have been assigned BHWs!');
        
        // Show final assignment
        console.log('\n📋 Final Assignments:');
        const updatedSitios = await Sitio.findAll();
        for (const sitio of updatedSitios) {
            if (sitio.assignedBHW) {
                const bhw = await User.findByPk(sitio.assignedBHW);
                console.log(`  ${sitio.name} → ${bhw.fullname}`);
            } else {
                console.log(`  ${sitio.name} → Not assigned`);
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

assignBHWs();
