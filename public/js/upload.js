// File Upload

function ekUpload() {
    function Init() {

        console.log("Upload Initialised");

        var fileSelect = document.getElementById('file-upload'),
            fileDrag = document.getElementById('file-drag'),
            submitButton = document.getElementById('submit-button');

        fileSelect.addEventListener('change', fileSelectHandler, false);

        // Is XHR2 available?
        var xhr = new XMLHttpRequest();
        if (xhr.upload) {
            // File Drop
            fileDrag.addEventListener('dragover', fileDragHover, false);
            fileDrag.addEventListener('dragleave', fileDragHover, false);
            fileDrag.addEventListener('drop', fileSelectHandler, false);
        }
    }

    function fileDragHover(e) {
        var fileDrag = document.getElementById('file-drag');

        e.stopPropagation();
        e.preventDefault();

        fileDrag.className = (e.type === 'dragover' ? 'hover' : 'modal-body file-upload');
    }

    function fileSelectHandler(e) {
        // Fetch FileList object
        var files = e.target.files || e.dataTransfer.files;

        // Cancel event and hover styling
        fileDragHover(e);

        // Process all File objects
        for (var i = 0, f; f = files[i]; i++) {
            parseFile(f);
            let ftype = getFileType(f);
            uploadFile(f).then((data) => {
                console.log(data);
                // var pBar = document.getElementById('file-progress');
                // pBar.value = 100;
                let cid = data.cid.string;
                let fname = data.path;
                let childAdd = $('.show-up[data-file-icon]').attr('data-path');
                let faddress = username + '/' + childAdd;
                serverConn.send(JSON.stringify({ context: 'PIN', id: _id, cid: cid }));
                let formData = { 'file_address': faddress, 'file_cid': cid, 'owner': username, 'file_name': fname, 'file_type': ftype }
                axios({
                    method: 'post',
                    url: location.protocol + "//" + location.host + "/api/files/new",
                    data: formData
                }).then((res) => {
                    console.log('Upload api called: ' + res);
                })
            });
        }
    }

    $(document).on('click', '[id="new-folder-trigger"]', function() {
        var fold_name = window.prompt("Folder Name");
        let rel_path = $('.show-up[data-file-icon]').attr('data-path') ? '/' + $('.show-up[data-file-icon]').attr('data-path') : '';
        console.log(rel_path + '/' + fold_name);
        createFolder(rel_path, fold_name).then((data) => {
            if (data) {
                $('.no-item-inside-folder.active-folder-wrapper').empty().removeClass('no-item-inside-folder').addClass('active-folder-wrapper');
                $('.active-folder-wrapper').append('<li data-file-icon="folder" data-new="new" data-cloud="load"><b>' + fold_name + '</b></li>');
                filesAndFolderIcons('newData');
                allStructure();
                createFileAndFolderDataBase();
                $('[data-new="new"]').removeAttr('data-new');
                removeUnwanted();
            }
        });
    });

    async function createFolder(folderPath, folderName) {
        let formData = { 'folder_address': folderPath + '/' + folderName, 'owner': username }
        console.log('createFolder called' + formData);
        axios({
            method: 'post',
            url: location.protocol + "//" + location.host + "/api/folders/new",
            data: formData
        }).then((res) => {
            console.log('folder created: ' + res);
        })
        return true;
    }

    // Output
    function output(msg) {
        // Response
        var m = document.getElementById('messages');
        m.innerHTML = msg;
    }

    function getFileType(file) {
        // var extension = (/[.]/.exec(file.name)) ? /[^.]+$/.exec(file.name) : undefined;
        var isImage = (/\.(?=gif|jpg|png|jpeg)/gi).test(file.name);
        if (isImage)
            return 'images';
        var isText = (/\.(?=txt)/gi).test(file.name);
        if (isText)
            return 'texts';
        var isCode = (/\.(?=py|html|css|js|c|cpp|php)/gi).test(file.name);
        if (isCode)
            return 'codes';
        var isDoc = (/\.(?=pdf|doc|docx)/gi).test(file.name);
        if (isDoc)
            return 'documents';
        // var isOther = !(isImage | isText | isDoc);
        return 'others';
    }

    function parseFile(file) {

        console.log(file.name);
        output(
            '<strong>' + encodeURI(file.name) + 'Uploaded! </strong>'
        );

        // var fileType = file.type;
        // console.log(fileType);
        var imageName = file.name;
        // var isGood = (/\.(?=gif|jpg|png|jpeg)/gi).test(imageName);
        // if (isGood) {
        // document.getElementById('start').classList.add("hidden");
        // document.getElementById('response').classList.remove("hidden");
        // document.getElementById('notimage').classList.add("hidden");
        // Thumbnail Preview
        // document.getElementById('file-image').classList.remove("hidden");
        // document.getElementById('file-image').src = URL.createObjectURL(file);
        // } else {
        //     document.getElementById('file-image').classList.add("hidden");
        //     document.getElementById('notimage').classList.remove("hidden");
        //     document.getElementById('start').classList.remove("hidden");
        //     document.getElementById('response').classList.add("hidden");
        //     document.getElementById("file-upload-form").reset();
        // }
    }

    function setProgressMaxValue(e) {
        var pBar = document.getElementById('file-progress');

        if (e.lengthComputable) {
            pBar.max = e.total;
        }
    }

    function updateFileProgress(e) {
        var pBar = document.getElementById('file-progress');

        if (e.lengthComputable) {
            pBar.value = e.loaded;
        }
    }

    async function uploadFile(file) {

        // var xhr = new XMLHttpRequest(),
        //     fileInput = document.getElementById('class-roster-file'),
        //     pBar = document.getElementById('file-progress'),
        //     fileSizeLimit = 1024; // In MB
        // if (xhr.upload) {
        //     // Check if file is less than x MB
        //     if (file.size <= fileSizeLimit * 1024 * 1024) {
        //         // Progress bar
        //         pBar.style.display = 'inline';
        //         xhr.upload.addEventListener('loadstart', setProgressMaxValue, false);
        //         xhr.upload.addEventListener('progress', updateFileProgress, false);

        //         // File received / failed
        //         xhr.onreadystatechange = function(e) {
        //             if (xhr.readyState == 4) {
        //                 // Everything is good!

        //                 // progress.className = (xhr.status == 200 ? "success" : "failure");
        //                 // document.location.reload(true);
        //             }
        //         };

        //         // Start upload
        //         xhr.open('POST', document.getElementById('file-upload-form').action, true);
        //         xhr.setRequestHeader('X-File-Name', file.name);
        //         xhr.setRequestHeader('X-File-Size', file.size);
        //         xhr.setRequestHeader('Content-Type', 'multipart/form-data');
        //         xhr.send(file);
        //     } else {
        //         output('Please upload a smaller file (< ' + fileSizeLimit + ' MB).');
        //     }
        // }
        var file_send = [{
            path: file.name,
            content: file
        }];
        return await node.add(file_send);
    }

    // Check for the various File API support.
    if (window.File && window.FileList && window.FileReader) {
        Init();
    } else {
        document.getElementById('file-drag').style.display = 'none';
    }
}
ekUpload();