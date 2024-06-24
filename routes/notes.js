const express = require('express');
const router = express.Router()
const Note = require('../models/Note');
var fetchuser = require('../middleware/fetchuser');

const { body, validationResult } = require('express-validator');

//ROUTE:1 Get all the notes using: GET "api/auth/fetchnotes "
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id });
        res.json(notes);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some error occurs");
    }

});
//ROUTE:2 Add a new notes using: Post "api/auth/addnote"
router.post('/addnotes', fetchuser, [
    body('title', 'Enter a valid title').isLength({ min: 3 }),
    body('description', 'Description must be atleast 5 character').isLength({ min: 5 }),

], async (req, res) => {
    try {


        const { title, description, tag } = req.body;

        // if there are errors return bad request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {

            return res.status(400).json({ errors: errors.array() });
        }
        const note = new Note({
            title, description, tag, user: req.user.id

        })
        const saveNotes = await note.save()
        res.json(saveNotes);

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some error occurs");
    }
});
//ROUTE:3 update an existing notes using: put "api/notes/updatenote"
router.put('/updatenote/:id', fetchuser, async (req, res) => {
    try {
        const { title, description, tag } = req.body;
        //Create a  new note object
        const newNote = {};

        const errors = validationResult(req);
        if (title) {
            //title araha ha tou update krdo
            newNote.title = title;
        };
        if (description) {
            newNote.description = description;
        };
        if (tag) {

            newNote.tag = tag;
        };

        //Find the note to be updated 
        let note = await Note.findById(req.params.id);
        if (!note) { res.status(404).send("Not Found") }
        //agr user loggedin nh ha phir koi or usk note update krrha ha
        if (note.user.toString() !== req.user.id) {
            res.status(401).send("Not Allowed");
        }
        note = await Note.findByIdAndUpdate(
            req.params.id, { $set: newNote }, { new: true }
        );
        res.json({ note });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some error occurs");
    }
});

//ROUTE:4 delete an existing notes using: delete "api/notes/deletenote/:id".login required

router.delete('/deletenote/:id', fetchuser, async (req, res) => {
    try {
        const { title, description, tag } = req.body;

        //Find the note to be deleted
        let note = await Note.findById(req.params.id);
        if (!note) { res.status(404).send("Not Found") }
        //allow deletion only if user owns this note
        if (note.user.toString() !== req.user.id) {
            res.status(401).send("Not Allowed");
        }
        note = await Note.findByIdAndDelete(
            req.params.id
        );
        res.json({ "Success": "Note has been deleted", note: note });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some error occurs");
    }
});


module.exports = router;
