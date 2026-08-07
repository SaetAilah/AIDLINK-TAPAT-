import { Resident } from './models/Resident.js';
import { sequelize } from './models/db.js';

async function updateStatus() {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected');

        // Update all residents with 'active' status to 'pending'
        const result = await Resident.update(
            { status: 'pending' },
            { where: { status: 'active' } }
        );

        console.log(`\n✅ Updated ${result[0]} residents from 'active' to 'pending'`);

        // Show all residents
        const residents = await Resident.findAll();
        
        console.log('\n📋 All Residents Status:');
        residents.forEach(r => {
            console.log(`- ${r.firstName} ${r.lastName}`);
            console.log(`  Status: ${r.status || 'NULL'}`);
            console.log(`  Sitio ID: ${r.sitioId}`);
            console.log(`  Assigned BHW: ${r.assignedBHW}`);
            console.log('');
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

updateStatus();
