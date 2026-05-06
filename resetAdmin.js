require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');
const User = require('./backend/models/User');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('Connected to MongoDB');
  const superadmin = await User.findOne({ role: 'superadmin' });
  
  if (!superadmin) {
    console.log('No superadmin found!');
  } else {
    console.log(`Found superadmin: ${superadmin.email}`);
    superadmin.password = 'Superadmin@123';
    await superadmin.save();
    console.log('Password successfully reset to: Superadmin@123');
  }
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
