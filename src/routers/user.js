const express = require('express');
const router = new express.Router();
const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/user');
const authMiddleware = require('../middleware/authentication');
const { sendWelcomeEmail, sendCancellationEmail } = require('../emails/account');

router.post('/users', async (req, res) => {
    const user = new User(req.body);

    try {
        await user.save();
        // this only runs if successful
        sendWelcomeEmail(user.email, user.name);
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token });
    } catch (error) {
        res.status(400).send(error)
    }
});

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({ user, token });
    } catch (error) {
        res.status(400).send();
    }
});

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('File must be an image.'))
        }

        return cb(undefined, true);
    }
});

// make sure they're authenticated BEFORE we accept their upload
router.post('/users/me/avatar', authMiddleware, upload.single('avatar'), async (req, res, next) => {
    // req.file is the `avatar` file as long as dest isn't set up above 
    // req.body will hold the text fields, if there were any
    const img = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
    req.user.avatar = img;
    await req.user.save();
    res.send();
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
});

router.delete('/users/me/avatar', authMiddleware, async (req, res, next) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
});

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user || !user.avatar) {
            throw new Error();
        }

        res.set({'Content-Type': 'image/png'});
        res.send(user.avatar);
    } catch (error) {
        res.status(404).send();
    }
});

router.post('/users/logout', authMiddleware, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            // each token here is an object with the _id property, and the token property
            return token.token !== req.token;
        });
        await req.user.save();
        res.send();
    } catch (error) {
        res.status(500).send();
    }
});

router.post('/users/logoutAll', authMiddleware, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send();
    } catch (error) {
        res.status(500).send();
    }
})

// retrieve your own profile
router.get('/users/me', authMiddleware, async (req, res) => {
    res.send(req.user);
});

router.patch('/users/me', authMiddleware, async (req, res) => {
    // properties someone can change
    const allowedUpdates = ['name', 'email', 'password', 'age'];
    const requestedUpdates = Object.keys(req.body);
    // verifying that all values in requestedUpdates are in the allowedUpdates
    // could also filter out to find the ones not included and provide those to user
    const filteredUpdates = requestedUpdates.filter(updateProperty => allowedUpdates.includes(updateProperty));

    if (filteredUpdates.length !== requestedUpdates.length) {
        return res.status(400).send({
            error: 'Invalid updates!'
        })
    }

    try {
        requestedUpdates.forEach(update => req.user[update] = req.body[update]);
        await req.user.save();

        // below bypasses middleware
        // const user = await User.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

        res.send(req.user);
    } catch (error) {
        // could be a server related issue, or a validation related issue
        res.status(400).send(error);
    }
});

// delete your own user profile
router.delete('/users/me', authMiddleware, async (req, res) => {
    try {
        await req.user.remove();
        sendCancellationEmail(req.user.email, req.user.name);
        res.send(req.user);
    } catch (error) {
        res.status(500).send();
    }
});

module.exports = router;