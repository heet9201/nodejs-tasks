const express = require('express');
const https = require('https');
const mongoose = require('mongoose');

const app = express();
const port = 3000;
const cache = {}

// task-01
app.get('/task-1', (req, res) => {
    const { number } = req.query;
    if (cache[number]) {
        res.send(cache[number]);
        return;
    }
    const result = [];
    for (let i = 1; i <= number; i++) {
        if (i % 3 === 0 && i % 5 === 0) {
            result.push('FizBuz');
        } else if (i % 3 === 0) {
            result.push('Fiz');
        } else if (i % 5 === 0) {
            result.push('Buz');
        } else {
            result.push(i);
        }
    }
    res.send(result.join(' '));
});

// task-02
const axios = require('axios');

async function getUsers() {
    try {
        const response = await axios.get('https://reqres.in/api/users');
        return response.data.data;
    } catch (error) {
        console.error(error);
    }
}

async function findAndUpdateUser() {
    const users = await getUsers();
    const userToUpdate = users.find(user => user.first_name.toLowerCase().startsWith('a'));
    if (userToUpdate) {
        try {
            const response = await axios.put(`https://reqres.in/api/users/${userToUpdate.id}`, {
                job: 'boss'
            });
            console.log(`Updated user with id ${userToUpdate.id} to have job title as "boss":`, response.data);
        } catch (error) {
            console.error(error);
        }
    } else {
        console.log('No user found with name starting with "a".');
    }
}

async function deleteUsers() {
    const users = await getUsers();
    const deleteRequests = users.map(user => axios.delete(`https://reqres.in/api/users/${user.id}`));
    try {
        await Promise.all(deleteRequests);
        console.log('All users except the first user whose name starts with "a" have been deleted.');
    } catch (error) {
        console.error(error);
    }
}

(async () => {
    await findAndUpdateUser();
    await deleteUsers();
})();


//task-03
const { Schema } = mongoose;

// connect to MongoDB
mongoose.connect('mongodb+srv://testuser:testuser@test.o9b0jvr.mongodb.net/test', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('Error connecting to MongoDB:', error));

// define user schema
const userSchema = new Schema({
    name: String,
    email: String,
    age: Number
});

// creating user model
const User = mongoose.model('User', userSchema);

// middleware to parse request body
app.use(express.json());

// creating a new user
app.post('/users', async (req, res) => {
    try {
        const { name, email, age } = req.body;
        const user = new User({ name, email, age });
        // const user = new User({ name: "test", email: "test@test.com", age: 21 });
        await user.save();
        res.status(201).json({ message: 'User created successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error });
    }
});

// get all users
app.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error getting users', error });
    }
});

// get a user by id
app.get('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error getting user', error });
    }
});

// update a user by id
app.put('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, age } = req.body;
        const user = await User.findByIdAndUpdate(id, { name, email, age }, { new: true });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User updated successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user', error });
    }
});

// delete a user by id
app.delete('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error });
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});