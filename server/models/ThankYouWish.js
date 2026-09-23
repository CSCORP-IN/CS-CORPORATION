import mongoose from 'mongoose';

const thankYouWishSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        default: 'Dost'
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    avatar: {
        type: String,
        default: '🎉'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

thankYouWishSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    }
});

export default mongoose.model('ThankYouWish', thankYouWishSchema);
