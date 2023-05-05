const express= require("express");
const app = express();
const fs= require("fs");
const mongoose= require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
app.use(express.json());



// module.exports = function (app);
// Connection to MongoDB
// const uri = fs.readFileSync("./private/mongoDB.txt", "utf8");
// const client = new MongoClient(uri);

app.use("/js", express.static("./public/js"));
app.use("/css", express.static("./public/css"));
app.use("/img", express.static("./public/img"));

app.set('view engine', 'ejs');


app.get('/', (req, res) => {
    res.render("landing");
})

app.get('/signUp', (req, res) => {
    res.render("signup");
})

app.get('/main', (req, res) => {
    res.render("main");
});

app.post('/register', async (req, res) => {
    try {
        await createUser(req.body.username, req.body.password);
        res.status(201).send({ message: 'User registered successfully' });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});


app.post('/login', async (req, res) => {
    try {
        const token = await authenticateUser(req.body.username, req.body.password);
        res.send({ token });
    } catch (error) {
        res.status(401).send({ error: error.message });
    }
});

app.post('/set-data', async (req, res) => {
    try {
        const data = await setUserData(req.headers.authorization, req.body.data);
        res.send({ data });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

app.get('/get-data', async (req, res) => {
    try {
        const data = await getUserData(req.headers.authorization);
        res.send({ data });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});



// mongoose.connect('<mongodb_connection_string>', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//     useFindAndModify: false,
//     useCreateIndex: true,
// })
//     .then(() => console.log('MongoDB connected'))
//     .catch((err) => console.log('Error connecting to MongoDB:', err));
//
//
// const userSchema = new mongoose.Schema({
//     username: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     data: { type: Object, default: {} },
// });
//
// userSchema.pre('save', async function (next) {
//     const user = this;
//     if (user.isModified('password')) {
//         user.password = await bcrypt.hash(user.password, 10);
//     }
//     next();
// });
//
// const User = mongoose.model('User', userSchema);


async function createUser(username, password) {
    const newUser = new User({ username, password });
    return await newUser.save();
}

async function authenticateUser(username, password) {
    const user = await User.findOne({ username });
    if (!user) {
        throw new Error('User not found');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Invalid password');
    }
    const token = jwt.sign({ _id: user._id }, 'secret-key', { expiresIn: '1h' });
    return token;
}

async function setUserData(token, data) {
    const decoded = jwt.verify(token, 'secret-key');
    const user = await User.findByIdAndUpdate(decoded._id, { data }, { new: true });
    return user.data;
}

async function getUserData(token) {
    const decoded = jwt.verify(token, 'secret-key');
    const user = await User.findById(decoded._id);
    return user.data;
}


