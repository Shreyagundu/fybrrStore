document.addEventListener('DOMContentLoaded', async() => {
    const serverConn = new WebSocket('wss://' + location.host);

    window.serverConn = serverConn;

    serverConn.onopen = ws => {
        // heartbeat
        // setInterval(() => {
        //     serverConn.send('heartbeat');
        // }, 10000);

        axios({
                method: 'get',
                url: location.protocol + "//" + location.host + "/" + "api/users/data",
            }).then(async(res) => {
                console.log(res);
                window._id = res.data._id;
                window.username = res.data.username;
                window.structure = res.data.structure;
                serverConn.send(JSON.stringify({ context: 'JOIN', id: _id }));
                let structure = res.data.structure;
                if (structure) {
                    let struct = document.querySelector('.big-file-manager');
                    let ul = document.createElement('ul');
                    let li_name = document.createElement('li');
                    let boldname = document.createElement('b');
                    boldname.innerText = username + '\'s fybrrStore';
                    li_name.appendChild(boldname);
                    li_name.classList.add('file-sub-active');
                    li_name.classList.add('show-up');
                    ul.appendChild(li_name);
                    // let root_folder;
                    for (const [key, value] of Object.entries(structure[username])) {
                        // root_folder = document.createElement("ul");
                        let child;
                        if (structure[username][key].__type__) {
                            // file
                            child = document.createElement('li');
                            let boldname = document.createElement('b');
                            boldname.innerText = structure[username][key].name;
                            child.appendChild(boldname);
                            child.dataset.fileId = key;
                            child.dataset.fileIcon = structure[username][key].__type__;
                            child.dataset.openFile = "preview";

                        } else {
                            // folder
                            child = parseFolder(structure[username][key], key);
                        }
                        ul.appendChild(child);
                    }
                    // let fldr = parseFolder(structure[username], username);
                    // ul.appendChild(fldr);
                    struct.appendChild(ul);
                    console.log(location.href.substring((location.protocol + '//' + location.host + '/' + username + '/').length));
                    initUI();
                }
            })
            // .catch((err) => {
            //     console.log(err + ' : 2');
            // });
    }

    serverConn.onmessage = msg => {
        console.log(msg.data);
        let data = JSON.parse(msg.data);
        if (data.context == 'ALPHA') {
            console.log('Alpha (will pin your files): ' + data.data.id);
        } else if (data.context == 'BETA') {
            console.log('Beta (you will pin files): ' + data.data.id);
        } else if (data.context == 'PIN') {
            console.log('Pinning CID: ' + data.data.cid);
            pinCID(data.data.cid);
        }
        // serverConn.send(JSON.stringify({ context: 'PIN', id: _id, cid: 1234 }));
    }
});

async function pinCID(cid) {
    let p = await node.pin.add(cid);
    console.log(p);
}

function parseFolder(folder, foldername) {
    // console.log(folder, foldername);
    var li = document.createElement('li');
    li.dataset.fileIcon = 'folder';
    let fldrname = document.createElement('b');
    fldrname.innerText = foldername;
    li.appendChild(fldrname);
    var ul = document.createElement("ul");
    for (const [key, value] of Object.entries(folder)) {
        // console.log(key, value);
        let child;
        if (folder[key].__type__) {
            // file
            child = document.createElement('li');
            let boldname = document.createElement('b');
            boldname.innerText = folder[key].name;
            child.appendChild(boldname);
            child.dataset.fileId = key;
            child.dataset.fileIcon = folder[key].__type__;
            child.dataset.openFile = "preview";
        } else {
            // folder
            // console.log(folder[key]);
            child = parseFolder(folder[key], key);
        }
        ul.appendChild(child);
    }
    li.appendChild(ul);
    return li;
}