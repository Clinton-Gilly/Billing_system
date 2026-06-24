require('dotenv').config();
const mikrotikService = require('../src/services/mikrotik.service');

async function runTest() {
  console.log('--- Starting MikroTik Integration Test ---');
  try {
    console.log('1. Connecting to router...');
    const conn = await mikrotikService.getConnection();
    console.log('   Connected successfully!');
    conn.close();

    console.log('\n2. Creating test user: test_xuremi');
    await mikrotikService.createHotspotUser({
      username: 'test_xuremi',
      password: 'password123',
      profile: 'default'
    });
    console.log('   User created successfully!');

    console.log('\n3. Listing active sessions...');
    const sessions = await mikrotikService.getActiveSessions();
    console.log(`   Found ${sessions.length} active sessions.`);
    
    console.log('\n4. Deleting test user: test_xuremi');
    await mikrotikService.deleteHotspotUser('test_xuremi');
    console.log('   User deleted successfully!');

    console.log('\n--- Test Completed Successfully ---');
  } catch (error) {
    console.error('\n!!! Test Failed !!!');
    console.error(error);
  }
}

runTest();
