import mongoose from "mongoose";


const deviceDetailsSchema = new mongoose.Schema({
    deviceToken:{
        type:String,
        required: function() {
            return this.deviceType !== 'web';
        },
    },
    deviceType: {
        type: String,
        enum: ['android', 'iOS','web'],
        required: true,
    },
    deviceName: {
        type: String,
        required: true,
    },
    deviceModel: {
        type: String,
        required: function() {
            return this.deviceType !== 'web';
        },
    },
    isLoggedIn:{
        type: Boolean,
        default: true,
    },
    userId:{
        type:String,
        required: true,
        ref: 'User', 
    }
},{
    timestamps: true,
    versionKey: false,
});


const DeviceDetails = mongoose.model('DeviceDetails', deviceDetailsSchema);
export { DeviceDetails };