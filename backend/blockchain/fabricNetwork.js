const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

const ccpPath = path.join(__dirname, 'connection.json');
const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

async function getContract() {
    const walletPath = path.join(__dirname, 'wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    const gateway = new Gateway();

    await gateway.connect(ccp, {
        wallet,
        identity: 'appUser',
        discovery: { enabled: true, asLocalhost: true }
    });

    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract('complaintcc');

    return { gateway, contract };
}

module.exports = { getContract };
