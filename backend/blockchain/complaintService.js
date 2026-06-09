const { getContract } = require('./fabricNetwork');

async function addComplaintToBlockchain(complaint) {
    const { gateway, contract } = await getContract();

    const resultBuffer = await contract.submitTransaction(
        'addComplaint',
        complaint._id.toString(),
        complaint.severity,
        complaint.description
    );

    await gateway.disconnect();

    return JSON.parse(resultBuffer.toString());
}

module.exports = { addComplaintToBlockchain };
