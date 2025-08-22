const mongoose = require('mongoose');

const contactInfoSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    website: {
        type: String,
        trim: true
    },
    socialMedia: {
        facebook: { type: String, trim: true },
        twitter: { type: String, trim: true },
        instagram: { type: String, trim: true },
        linkedin: { type: String, trim: true }
    },
    businessHours: {
        type: String,
        trim: true
    },
    additionalInfo: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for better query performance
contactInfoSchema.index({ isActive: 1 });

// Virtual for formatted display
contactInfoSchema.virtual('displayName').get(function() {
    return this.name;
});

// Ensure virtual fields are serialized
contactInfoSchema.set('toJSON', {
    virtuals: true,
    transform: function(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('ContactInfo', contactInfoSchema);
