import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
    projectName: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: false,
        maxlength: 500,
        default:null
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: false,
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'on hold', 'cancelled'],
        default: 'active',
    },
    invoiceUrl: {
        type: String,
        required: false,
    },
}, {
    timestamps: true,
    versionKey: false,
});

const Project = mongoose.model('Project', projectSchema);
export default Project;
