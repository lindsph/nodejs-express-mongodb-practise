const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        default: 0,
        validate: (value) => {
            if (value < 0) {
                throw new Error('Thats a negative number, no go!')
            }
        }
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        validate: (value) => {
            const isEmail = validator.isEmail(value);

            if (!isEmail) {
                throw new Error('Thats not a valid email.')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minLength: 7,
        validate: (value) => {
            if (value.toLowerCase().includes('password')) {
                throw new Error(`your password cannot contain the word 'password'`)
            }
        }
    },
    tokens: [
        {
            token: {
                type: String,
                required: true
            }
        }
    ],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
});

// virtual property - relationship between two entities
// NOT stored in the database
UserSchema.virtual('tasks',{
    ref: 'Task',
    localField: '_id',
    // name of the field on the Task
    foreignField: 'owner'
})

// methods on instance 
UserSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
    user.tokens = user.tokens.concat({ token });
    await user.save();
    return token;
};

UserSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;
    return userObject;
};

// methods on User model
UserSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error('Unable to login!');
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
        throw new Error('Login failed.');
    }

    return user;
};

UserSchema.pre('save', async function(next) {
    // this is the document being saved
    const user = this;

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    next();
});

// delete user tasks when user is deleted
UserSchema.pre('remove', async function(next) {
    const user = this;
    await Task.deleteMany({ owner: user._id });
    next();
});

const User = mongoose.model('User', UserSchema);

module.exports = User;