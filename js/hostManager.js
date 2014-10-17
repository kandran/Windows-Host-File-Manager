//App config
var gui = require('nw.gui');
var fs = require('fs');
var readline = require('readline');


//host config
var filename;
var lineNumber =0;
var hostFile = Array()
var oldLine = '';

init();


// App config
    function init(){
        detectPlatform();
        filename = localStorage.getItem('fileName');
        if(filename === null){
            filename = 'C:\\WINDOWS\\system32\\drivers\\etc\\hosts';
            localStorage.setItem('fileName', filename);
        }


    }
    function detectPlatform()
    {
        if (process.platform !== 'win32') {
            alert('Le systeme ne fonctionne que sur windows');
            gui.App.quit();
        }
    }



// Get data from host file and show

    function readHostFile(){

        document.getElementById('viewsHost').innerHTML="";

        lineNumber =0;
        var rd = readline.createInterface({
            input: fs.createReadStream(filename),
            output: process.stdout,
            terminal: false
        });

        rd.on('line', function(line) {
            hostFile.push(line);
            console.log('Read host file');

        }).on('close', function() {
            for(line in hostFile){
                showHostLine(hostFile[line]);
            }
        });


    }

    function showHostLine(line){
        host = document.getElementById('viewsHost');
        Expression = new RegExp("^#","i");

        if(line != "" && line !="#"){
            if(Expression.test(line)){
                state = 'comment';
            }else{
                state = 'uncomment';
            }
            hostLine = '<p id="host-'+ lineNumber +'" class="hostLine ' + state +'">' + '<input type="text" value="'+line + '" onclick="changeVisibilitySave(\'host-'+lineNumber+'\')"'  + '<span class="control">'+ createButton('save', state, lineNumber) +createButton('change_status',state, lineNumber) + createButton('delete', state, lineNumber)+  ' </span><p>';
            host.innerHTML += hostLine.replace(/\r\n/g, '<br class="retour" />').replace(/[\r\n]/g, '<br  class="retour" />');
        }
        lineNumber++;
    }

    function createChangeStatusButton(context) {
        var button;
        if(context == 'comment'){
            button =  '<img src="media/fi-comment.svg" alt="Uncomment" onclick="Uncomment(\'host-'+lineNumber+'\')">';
        }else{
            button =  '<img src="media/fi-comment.svg" alt="Comment" onclick="Comment(\'host-'+lineNumber + '\')">';
        }
        return button;
    }


    function createButton(type, context, lineNumber)
    {
        switch (type){
            case 'change_status' :
                return  createChangeStatusButton(context, lineNumber);
                break;
            case 'delete' :
                return  createDeleteButton(context);
                break;
            case 'save' :
                return createSaveButton(context, lineNumber);
            default :
        }
        return '';
    }

    function createDeleteButton(context){
        return  '<img src="media/fi-x.svg" alt="Delete" onclick="Delete(\'host-'+ lineNumber+'\')">';
    }

    function createSaveButton(context){
        return  '<img src="media/fi-save.svg" alt="Save" id="Save-host-'+ lineNumber +'" onclick="Save(\'host-'+ lineNumber+'\')" class="hidden">';

}

function changeVisibilitySave(lineNumber){
    var idSave= 'Save-'+lineNumber;
    if(document.getElementById(idSave).className === 'hidden'){
        document.getElementById(idSave).className='visible';
        oldLine = document.getElementById(lineNumber).children[0].value;
    }
}

//Modify host file

    function Save(lineNumber){
        lineNumberVal = parseInt(lineNumber.substr(5))
        hostFile[lineNumberVal] = document.getElementById(lineNumber).children[0].value;
        document.getElementById('Save-'+lineNumber).className='hidden';
        writeFile();
    }

    function action(button, lineNumber){
    var fn = window[button.getAttribute('value')];
    if(typeof fn === 'function') {
        fn(lineNumber);
    }
}

function Delete(lineNumber){
    lineNumber = parseInt(lineNumber.substr(5))
    console.log('delete line ' + lineNumber);
    hostFile.splice(lineNumber, 1);
    writeFile();
}

function Comment(lineNumber){
    lineNumber = parseInt(lineNumber.substr(5));
    console.log('comment line ' + lineNumber);
    hostFile[lineNumber] = "#" + hostFile[lineNumber];
    writeFile();
}

function Uncomment(lineNumber){
    lineNumber = parseInt(lineNumber.substr(5));
    console.log('uncomment line ' + lineNumber);
    hostFile[lineNumber] = hostFile[lineNumber].replace('#','');
    writeFile();
}

function addLine() {
    console.log('add line ');
    var ip = document.getElementById('ip_address').value;
    var url = document.getElementById('uri').value;
    var hostLine =  ip + "\t" + url;
   hostFile.push(hostLine)
    writeFile();
}




function writeFile(){
    var data = "";
    for(key in hostFile){
        for(var i=0; i< hostFile.length; i++){
            if(i == 0){
                data =hostFile[i];
            }else{
                data += "\r\n" +hostFile[i]  ;
            }
        }
        hostFile = [];
    }
    fs.writeFile(filename, data, function (err) { // write file
        if (err) {
            console.log(err);
        }
        readHostFile();
    });
}
