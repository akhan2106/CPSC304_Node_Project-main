const express = require('express');
const appService = require('./appService');

const router = express.Router();

// ----------------------------------------------------------
// API endpoints
// Modify or extend these routes based on your project's needs.
router.get('/check-db-connection', async (req, res) => {
    const isConnect = await appService.testOracleConnection();
    if (isConnect) {
        res.send('connected');
    } else {
        res.send('unable to connect');
    }
});

router.get('/demotable', async (req, res) => {
    const tableContent = await appService.fetchDemotableFromDb();
    res.json({data: tableContent});
});

router.post("/initiate-demotable", async (req, res) => {
    const initiateResult = await appService.initiateDemotable();
    if (initiateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/insert-demotable", async (req, res) => {
    const { id, name } = req.body;
    const insertResult = await appService.insertDemotable(id, name);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/update-name-demotable", async (req, res) => {
    const { oldName, newName } = req.body;
    const updateResult = await appService.updateNameDemotable(oldName, newName);
    if (updateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.get('/count-demotable', async (req, res) => {
    const tableCount = await appService.countDemotable();
    if (tableCount >= 0) {
        res.json({ 
            success: true,  
            count: tableCount
        });
    } else {
        res.status(500).json({ 
            success: false, 
            count: tableCount
        });
    }
});

// ---------- INMATES ROUTES (NEW) ----------
router.get('/inmates', async (req, res) => {
    try {
        const data = await appService.getInmates();
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch inmates' });
    }
});

router.post('/add-inmate', async (req, res) => {
    const { inmateId, holdingCell, healthNum, startDate, endDate } = req.body;
    try {
        const result = await appService.addInmate(inmateId, holdingCell, healthNum, startDate, endDate);
        res.json({ success: result });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to add inmate' });
    }
});

router.post('/init-db', async (req, res) => {
    try {
        const result = await appService.initializeDatabase();
        res.json({ success: result });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});

router.get('/inmates-leaving-soon', async (req, res) => {
    try {
        const data = await appService.getInmatesLeavingSoon();
        res.json({ success: true, data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to fetch upcoming releases' });
    }
});


module.exports = router;