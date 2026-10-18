const pool = require('../db');

// one proof for a delivery (photo / signature), file_url = path of the saved image
async function addProof({ deliveryId, proofType, fileUrl, receivedBy, recordedBy }) {
    const [result] = await pool.query(
        `INSERT INTO proof_of_delivery (delivery_id, proof_type, file_url, received_by, recorded_by)
         VALUES (?, ?, ?, ?, ?)`,
        [deliveryId, proofType, fileUrl, receivedBy, recordedBy]
    );
    return result.insertId;
}

module.exports = { addProof };