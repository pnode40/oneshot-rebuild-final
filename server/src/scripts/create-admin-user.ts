// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Database and schema imports
import { db } from '../db/client';
import { users, userRoleEnum } from '../db/schema';
import { eq } from 'drizzle-orm';

// Auth-related imports
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Constants for the admin user
const ADMIN_EMAIL = 'admin@test.com';
const ADMIN_PASSWORD = 'admin123';
const ADMIN_FIRST_NAME = 'Admin';
const ADMIN_LAST_NAME = 'Test';
const SALT_ROUNDS = 10;

// JWT Secret should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'oneshot_dev_secret_key';

/**
 * Creates or updates an admin test user and generates a JWT token
 */
async function createAdminUser() {
  try {
    console.log('🔑 Creating/Updating Admin Test User');
    console.log('---------------------------------');

    // Check if the admin user already exists
    console.log(`Checking if user with email ${ADMIN_EMAIL} exists...`);
    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, ADMIN_EMAIL)
    });

    let adminUser;

    if (existingUser) {
      console.log(`✅ User with email ${ADMIN_EMAIL} already exists (ID: ${existingUser.id})`);
      
      // If user exists but is not an admin, update their role
      if (existingUser.role !== 'admin') {
        console.log('Updating user role to admin...');
        const result = await db.update(users)
          .set({ role: 'admin' })
          .where(eq(users.id, existingUser.id))
          .returning();
        
        adminUser = result[0];
        console.log(`✅ User role updated to admin`);
      } else {
        console.log('User already has admin role');
        adminUser = existingUser;
      }
    } else {
      // Hash the password
      console.log('Hashing password...');
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, SALT_ROUNDS);
      
      // Create a new admin user
      console.log('Creating new admin user...');
      const result = await db.insert(users)
        .values({
          email: ADMIN_EMAIL,
          hashedPassword: hashedPassword,
          firstName: ADMIN_FIRST_NAME,
          lastName: ADMIN_LAST_NAME,
          role: 'admin',
          isVerified: true // Set to verified so it can be used immediately
        })
        .returning();
      
      adminUser = result[0];
      console.log(`✅ Admin user created with ID: ${adminUser.id}`);
    }

    // Generate JWT token for testing
    console.log('Generating JWT token for admin user...');
    const token = jwt.sign(
      { 
        userId: adminUser.id, 
        email: adminUser.email,
        role: adminUser.role
      }, 
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Display admin user info and token
    console.log('\n🧑‍💼 Admin User Information');
    console.log('---------------------------------');
    console.log(`ID: ${adminUser.id}`);
    console.log(`Email: ${adminUser.email}`);
    console.log(`Role: ${adminUser.role}`);
    console.log(`First Name: ${adminUser.firstName}`);
    console.log(`Last Name: ${adminUser.lastName}`);
    console.log(`Verified: ${adminUser.isVerified}`);
    
    console.log('\n🔒 JWT Token for Testing');
    console.log('---------------------------------');
    console.log(token);
    
    console.log('\n✅ Admin user setup completed successfully');
    
    // Exit the process
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
}

// Run the function
createAdminUser(); 