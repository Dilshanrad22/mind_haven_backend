const express = require('express');
const router = express.Router();

// GET /api/users
router.get('/', (req, res) => {
    res.json({
        message: 'Get all users',
        data: [],
        timestamp: new Date().toISOString()
    });
});

// GET /api/users/:id
router.get('/:id', (req, res) => {
    const { id } = req.params;
    res.json({
        message: `Get user with ID: ${id}`,
        data: { id, name: 'Sample User' },
        timestamp: new Date().toISOString()
    });
});

// POST /api/users
router.post('/', (req, res) => {
    const userData = req.body;
    res.status(201).json({
        message: 'User created successfully',
        data: { id: Date.now(), ...userData },
        timestamp: new Date().toISOString()
    });
});

// PUT /api/users/:id
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const userData = req.body;
    res.json({
        message: `User with ID ${id} updated successfully`,
        data: { id, ...userData },
        timestamp: new Date().toISOString()
    });
});

// DELETE /api/users/:id
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    res.json({
        message: `User with ID ${id} deleted successfully`,
        timestamp: new Date().toISOString()
    });
});

module.exports = router;