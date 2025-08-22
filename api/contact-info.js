const express = require('express');
const router = express.Router();
const ContactInfo = require('../cms/models/ContactInfo');

// GET all contact info
router.get('/', async (req, res) => {
    try {
        const contactInfo = await ContactInfo.find({ isActive: true }).sort({ createdAt: -1 });
        res.json(contactInfo);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET single contact info
router.get('/:id', async (req, res) => {
    try {
        const contactInfo = await ContactInfo.findById(req.params.id);
        if (contactInfo) {
            res.json(contactInfo);
        } else {
            res.status(404).json({ message: 'Contact info not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST create new contact info
router.post('/', async (req, res) => {
    const contactInfo = new ContactInfo({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address,
        website: req.body.website,
        socialMedia: req.body.socialMedia,
        businessHours: req.body.businessHours,
        additionalInfo: req.body.additionalInfo
    });

    try {
        const newContactInfo = await contactInfo.save();
        res.status(201).json(newContactInfo);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PATCH update contact info
router.patch('/:id', async (req, res) => {
    try {
        const contactInfo = await ContactInfo.findById(req.params.id);
        if (contactInfo) {
            Object.keys(req.body).forEach(key => {
                contactInfo[key] = req.body[key];
            });
            const updatedContactInfo = await contactInfo.save();
            res.json(updatedContactInfo);
        } else {
            res.status(404).json({ message: 'Contact info not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE contact info
router.delete('/:id', async (req, res) => {
    try {
        const contactInfo = await ContactInfo.findById(req.params.id);
        if (contactInfo) {
            await contactInfo.remove();
            res.json({ message: 'Contact info deleted' });
        } else {
            res.status(404).json({ message: 'Contact info not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET active contact info for public display
router.get('/public/active', async (req, res) => {
    try {
        const contactInfo = await ContactInfo.findOne({ isActive: true }).sort({ updatedAt: -1 });
        if (contactInfo) {
            res.json(contactInfo);
        } else {
            res.status(404).json({ message: 'No active contact info found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
