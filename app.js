const express = require('express');
const cors = require('cors');
const path = require('path');
const { urlencoded, json } = require('body-parser');
const cookieParser = require('cookie-parser');
const connectDB = require('./src/db/connection');
const mongoose = require('mongoose');
const axios = require('axios');
const WebSocket = require('ws');
const https = require('https');
const http = require('http');
const fs = require('fs');

const key = fs.readFileSync(path.join(__dirname, '/certs/selfsigned.key'));
const cert = fs.readFileSync(path.join(__dirname, '/certs/selfsigned.crt'));
const options = {
    key: key,
    cert: cert
};

const User = require('./src/db/user');
const Files = require('./src/db/files');

require('dotenv').config();
const app = express();
const port = process.env.PORT || 3000;

app.use(urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'src')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(json());
app.use(cookieParser());

// connection with Database
connectDB();

const { auth } = require('./src/middleware/auth')
const { RegisterUser, LoginUser, LogoutUser, getUserDetails } = require('./src/controller/auth_controller');

app.post('/api/users/register', RegisterUser);
app.post('/api/users/login', LoginUser);
app.get('/api/users/auth', auth, getUserDetails);
app.get('/api/users/logout', auth, LogoutUser);
app.get('/api/users/data', auth, async(req, res) => {
    try {
        const user = await User.findOne({ username: req.user.username });
        res.json(user);
    } catch (error) {
        console.log(error);
    }
});

app.post('/api/folders/new', auth, async(req, res) => {
    if (!req.isAuth) {
        res.redirect('/login');
        return;
    }
    console.log(req.body);
    const folder_address = req.body.folder_address;
    const owner = req.body.owner;
    const f = {
        folder_address: folder_address,
        owner: owner
    }
    try {
        let setFolder = {};
        let folder_addr = 'structure.' + req.user.username + folder_address;
        let folder_path = folder_addr.replace(/\//g, '.'); // structure.roton91.images.cid
        setFolder[folder_path] = {};
        console.log(setFolder);
        console.log(`folder_path: ${folder_path}`);
        // let userModel = await User.findOneAndUpdate({ username: req.user.username }, { $push: { structure: setFile } });
        let userModel = await User.findOneAndUpdate({ username: req.user.username }, { $set: setFolder });
        // console.log(userModel);
        console.log(`folder_path: ${folder_path}`);
        return 'true';
    } catch (error) {
        console.log('Folder creation failed');
        return 'false';
    }
});

app.post('/api/files/new', auth, async(req, res) => {
    if (!req.isAuth) {
        res.redirect('/login');
        return;
    }
    console.log(req.body);
    const file_address = req.body.file_address;
    const file_cid = req.body.file_cid;
    const owner = req.body.owner;
    const file_name = req.body.file_name;
    const file_type = req.body.file_type;
    const f = {
        file_address: file_address,
        file_cid: file_cid,
        owner: owner,
        file_name: file_name,
        file_type: file_type,
        versions: [file_cid]
    }
    let fileModel = new Files(f);
    let model;
    try {
        model = await fileModel.save();
        console.log('Model saved: ' + model);
        let setFile = {};
        // let new_file_name = file_name.replace('.', '_dot_');
        // let file_addr = 'structure.' + file_address + '/'+ file_type + '.' + file_cid;
        let file_addr = 'structure.' + file_address + '.' + file_cid;
        let file_path = file_addr.replace(/\//g, '.'); // structure.roton91.images.cid
        setFile[file_path] = { name: file_name, '__type__': file_type, cid: file_cid };
        console.log(`file_path: ${file_path}`);
        // let userModel = await User.findOneAndUpdate({ username: req.user.username }, { $push: { structure: setFile } });
        let userModel = await User.findOneAndUpdate({ username: req.user.username }, { $set: setFile });
        console.log(userModel);
        // let folders = file_path.split('.');
        // for (let i = 1; i < folders.length - 1; i++) {
        //     const folder = folders[i];

        // }
        return model;
    } catch (error) {
        return 'Duplicate file uploaded! Upload failed!';
    }
});

app.get('/api/files/all', auth, async(req, res) => {
    if (!req.isAuth) {
        res.redirect('/login');
        return;
    }
    let userModel = await User.findOne({ username: req.user.username });

});

app.post('/api/share', auth, async(req, res) => {
    if (!req.isAuth) {
        res.redirect('/login');
        return;
    }
    console.log(req.body);
    const file_cid = req.body.file_id;
    const owner = req.body.owner;
    const shared_with = req.body.share;
    let fileModel = await Files.findOneAndUpdate({ file_cid: file_cid }, { $push: { shared: shared_with } });
    // console.log(fileModel);
    let setFile = {};
    let file_addr = 'structure.'+ shared_with +'.shared-with-me.' + owner + '.' + fileModel.file_cid;
    // console.log(file_addr);
    // let file_path = file_addr.replace(/\//g, '.'); // structure.roton91.images.cid
    setFile[file_addr] = { name: fileModel.file_name, '__type__': fileModel.file_type, cid: file_cid };
    // console.log(`file_path: ${file_path}`);
    let userModel = await User.findOneAndUpdate({ username: shared_with }, { $set: setFile });
    // console.log(userModel);
    // return model;
})



app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/views/login.html');
});

app.get('/home', auth, (req, res) => {
    if (!req.isAuth) {
        res.redirect('/login');
        return;
    }
    res.sendFile(__dirname + '/public/views/home.html');
});

app.get('/404', (req, res) => {
    res.sendFile(__dirname + '/public/views/404.html');
})

app.get('/', auth, (req, res) => {
    if (!req.isAuth) {
        res.redirect('/login');
        return;
    } else {
        res.redirect('/' + req.user.username);
        return;
    }
});


app.get('/:username', auth, (req, res) => {
    console.log(req.params.username);
    if (!req.isAuth) {
        res.redirect('/login');
        return;
    }
    if (!(req.params.username == req.user.username)) {
        res.redirect('/404');
        return;
    }
    // console.log(req.params[0]);
    res.sendFile(__dirname + '/public/views/explorer.html');
});

const server = http.createServer(options, app);

server.listen(port, () => {
    console.log(`fybrrChat express app listening on PORT ${port}`);
});

const wss = new WebSocket.Server({ server: server });

let clients = {};

wss.on('connection', ws => {
    ws.on('message', (DATA, isBinary) => {
        let msg = isBinary ? DATA : DATA.toString();
        console.log(msg);
        let data = JSON.parse(msg);
        if (data.context == 'JOIN') {
            // incoming peer, initially with no peers and 5 available slots
            clients[data.id] = { id: data.id, ws: ws, alpha: {}, beta: {} };

            // find peers (max 5)
            for (const [key, value] of Object.entries(clients)) {
                if (key == data.id) {
                    console.log(key + ' a');
                    continue;
                }
                if (Object.keys(clients[data.id].alpha).length >= 5) {
                    console.log(key + ' b');
                    break;
                }
                if (Object.keys(value.beta).length < 5) {
                    clients[value.id].beta[key] = clients[data.id];
                    clients[data.id].alpha[key] = clients[key];
                    sendMessage(ws, 'ALPHA', { id: value.id });
                    sendMessage(value.ws, 'BETA', { id: data.id });
                }
                if (Object.keys(value.alpha).length < 5) {
                    clients[value.id].alpha[key] = clients[data.id];
                    clients[data.id].beta[key] = clients[key];
                    sendMessage(ws, 'BETA', { id: value.id });
                    sendMessage(value.ws, 'ALPHA', { id: data.id });
                }
            }
        } else if (data.context == 'PIN') {
            console.log(clients[data.id].alpha);
            // console.log(data.id);
            for (const [key, value] of Object.entries(clients[data.id].alpha)) {
                sendMessage(value.ws, 'PIN', { cid: data.cid });
            }
        }
    });
});

function sendMessage(ws, context, data) {
    console.log(context, data);
    if (ws.readyState == WebSocket.OPEN) {
        ws.send(JSON.stringify({ context: context, data: data }));
    }
}