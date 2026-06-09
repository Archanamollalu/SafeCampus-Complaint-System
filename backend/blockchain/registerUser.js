'use strict';

const { Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const fs = require('fs');

async function main() {
  const ccpPath = path.resolve(__dirname, 'connection.json');
  const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

  const caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
  const ca = new FabricCAServices(caInfo.url);

  const walletPath = path.join(__dirname, 'wallet');
  const wallet = await Wallets.newFileSystemWallet(walletPath);

  // Enroll admin
  if (!(await wallet.get('admin'))) {
    const enrollment = await ca.enroll({
      enrollmentID: 'admin',
      enrollmentSecret: 'adminpw',
    });

    await wallet.put('admin', {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes(),
      },
      mspId: 'Org1MSP',
      type: 'X.509',
    });

    console.log('✅ Admin enrolled');
  }

  // Register & enroll appUser
  if (!(await wallet.get('appUser'))) {
    const adminIdentity = await wallet.get('admin');
    const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
    const adminUser = await provider.getUserContext(adminIdentity, 'admin');

    const secret = await ca.register(
      {
        affiliation: 'org1.department1',
        enrollmentID: 'appUser',
        role: 'client',
      },
      adminUser
    );

    const enrollment = await ca.enroll({
      enrollmentID: 'appUser',
      enrollmentSecret: secret,
    });

    await wallet.put('appUser', {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes(),
      },
      mspId: 'Org1MSP',
      type: 'X.509',
    });

    console.log('✅ appUser enrolled');
  }
}

main().catch(console.error);
