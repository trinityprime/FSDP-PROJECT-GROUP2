const bcrypt = require('bcrypt');
const { User } = require('./models');

const initializeAdminAccount = async () => {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminPhoneNumber = process.env.ADMIN_PHONE_NUMBER;
    const adminDOB = process.env.ADMIN_DOB;

    if (!adminEmail || !adminPassword || !adminPhoneNumber || !adminDOB) {
        console.error('Admin email, password, phone number, or date of birth is not set in environment variables.');
        return;
    }

    try {
        // Check if admin user already exists
        let adminUser = await User.findOne({
            where: { email: adminEmail, role: 'admin' }
        });

        if (!adminUser) {
            // Create admin user
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            adminUser = await User.create({
                name: 'Admin',
                email: adminEmail,
                password: hashedPassword,
                phoneNumber: adminPhoneNumber,
                dob: new Date(adminDOB),
                role: 'admin'
            });
            console.log(`Admin user created: ${adminEmail}`);
        } else {
            console.log(`Admin user already exists: ${adminEmail}`);
        }
    } catch (err) {
        console.error('Error initializing admin account:', err);
    }
};

module.exports = initializeAdminAccount;
