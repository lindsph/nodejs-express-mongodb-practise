const express = require('express');
const router = new express.Router();
const Task = require('../models/task');
const authMiddleware = require('../middleware/authentication');

router.post('/tasks', authMiddleware, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    });

    try {
        await task.save();
        res.status(201).send(task);
    } catch (error) {
        res.status(400).send(error);
    }
});

// GET /tasks?completed=false
// GET /tasks?limit=10&skip=0
// GET /tasks?sortBy=createdAt_asc
router.get('/tasks', authMiddleware, async (req, res) => {
    const match = {};
    const sort = {};
    if (req.query.completed) {
        match.completed = req.query.completed === 'true' ? true : false
    }
    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'asc' ? 1 : -1
    }
    try {
        // const tasks = await Task.find({
        //     owner: req.user._id
        // });
        // works the same as above, alternate option
        // await req.user.populate('tasks').execPopulate();
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate();
        res.send(req.user.tasks);
    } catch (error) {
        res.status(404).send(error);
    }
});

router.get('/tasks/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
        const task = await Task.findOne({
            _id: id,
            owner: req.user._id
        })

        if (!task) {
            return res.status(404).send();
        }

        res.send(task);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.patch('/tasks/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const allowedUpdates = ['description', 'completed'];
    const requestedUpdates = Object.keys(req.body);
    const filteredUpdates = requestedUpdates.filter(updateProperty => allowedUpdates.includes(updateProperty));

    if (filteredUpdates.length !== requestedUpdates.length) {
        return res.status(400).send({
            error: 'Invalid updates!'
        })
    }

    try {
        const task = await Task.findOne({
            _id: id,
            owner: req.user._id
        });

        if (!task) {
            return res.status(404).send();
        }

        requestedUpdates.forEach(update => task[update] = req.body[update]);
        await task.save();
        res.send(task);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.delete('/tasks/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
        const task = await Task.findOneAndDelete({
            _id: id,
            owner: req.user._id
        });

        if (!task) {
            res.status(404).send();
        }

        res.send(task);
    } catch (error) {
        res.status(500).send();
    }
});

module.exports = router;