const { RouterOSAPI } = require('node-routeros');
const prisma = require('../models/prisma.client');

async function getConnection() {
  try {
    const router = await prisma.mikroTikRouter.findFirst({ where: { isActive: true } });
    
    const host = router?.host || process.env.MIKROTIK_HOST;
    const user = router?.username || process.env.MIKROTIK_USER;
    const password = router?.password || process.env.MIKROTIK_PASS;
    const port = router?.port || (process.env.MIKROTIK_PORT ? parseInt(process.env.MIKROTIK_PORT, 10) : 8728);

    if (!host || !user || !password) {
      throw new Error('Router credentials not configured in DB or .env');
    }

    const conn = new RouterOSAPI({ host, user, password, port });
    await conn.connect();
    return conn;
  } catch (error) {
    throw { message: error.message, code: 'MIKROTIK_ERROR' };
  }
}

async function createHotspotUser({ username, password, profile, uptimeLimit }) {
  let conn;
  try {
    conn = await getConnection();
    const params = [
      `=name=${username}`,
      `=password=${password}`,
      `=profile=${profile}`
    ];
    if (uptimeLimit) {
      params.push(`=limit-uptime=${uptimeLimit}`);
    }
    const result = await conn.write('/ip/hotspot/user/add', params);
    return result;
  } catch (error) {
    throw { message: error.message, code: 'MIKROTIK_ERROR' };
  } finally {
    if (conn) conn.close();
  }
}

async function disableHotspotUser(username) {
  let conn;
  try {
    conn = await getConnection();
    // MikroTik accepts name via the 'numbers' property for disable/remove commands
    const result = await conn.write('/ip/hotspot/user/disable', [`=numbers=${username}`]);
    return result;
  } catch (error) {
    throw { message: error.message, code: 'MIKROTIK_ERROR' };
  } finally {
    if (conn) conn.close();
  }
}

async function deleteHotspotUser(username) {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.write('/ip/hotspot/user/remove', [`=numbers=${username}`]);
    return result;
  } catch (error) {
    throw { message: error.message, code: 'MIKROTIK_ERROR' };
  } finally {
    if (conn) conn.close();
  }
}

async function getActiveSessions() {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.write('/ip/hotspot/active/print');
    return result;
  } catch (error) {
    throw { message: error.message, code: 'MIKROTIK_ERROR' };
  } finally {
    if (conn) conn.close();
  }
}

async function getRouterStats() {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.write('/interface/print');
    return result;
  } catch (error) {
    throw { message: error.message, code: 'MIKROTIK_ERROR' };
  } finally {
    if (conn) conn.close();
  }
}

async function getSystemResources() {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.write('/system/resource/print');
    return result;
  } catch (error) {
    throw { message: error.message, code: 'MIKROTIK_ERROR' };
  } finally {
    if (conn) conn.close();
  }
}

module.exports = {
  getConnection,
  createHotspotUser,
  disableHotspotUser,
  deleteHotspotUser,
  getActiveSessions,
  getRouterStats,
  getSystemResources
};
