import { sequelize } from './models/db.js';
import { User } from './models/userModel.js';

async function addJeany() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');

    // Check if Jeany already exists
    const existing = await User.findOne({ where: { email: 'jeany@gmail.com' } });
    
    if (existing) {
      console.log('Jeany Saragoza already exists:', {
        id: existing.id,
        name: existing.fullname,
        email: existing.email,
        role: existing.role
      });
    } else {
      // Create Jeany Saragoza as BHW
      const jeany = await User.create({
        fullname: 'Jeany Saragoza',
        email: 'jeany@gmail.com',
        password: '123456',
        role: 'bhw'
      });
      
      console.log('✅ Jeany Saragoza added successfully:', {
        id: jeany.id,
        name: jeany.fullname,
        email: jeany.email,
        role: jeany.role
      });
    }

    // Show all BHWs
    const bhws = await User.findAll({ where: { role: 'bhw' } });
    console.log('\n📋 All BHWs:');
    bhws.forEach(bhw => {
      console.log(`  - ${bhw.fullname} (${bhw.email}) [ID: ${bhw.id}]`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addJeany();
