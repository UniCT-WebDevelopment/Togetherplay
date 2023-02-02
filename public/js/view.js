
//var socket = io.connect('http://127.0.0.1:5001');
const socket = io("/", {
    transports: ["polling"],
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }

});

let myCurrentRoom;
let myParticipants = new Array();
let myUtente;
let iFrameVideo;
let idVideo;
let recived;
let idRoom;
let myVideoStream;
let myPeerId;
let isPlayerReady;
let myList2=new Array();

const createPartyModal2= new bootstrap.Modal('#staticBackdrop', {
    keyboard: false
})



window.onload = async function () {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    idRoom = urlParams.get('idRoom');
    console.log("idRoom " + idRoom);

    if (!idRoom || idRoom == "undefined") {
        roomNotFound();
    }

    try {
        let res = await sendToServer("./user", "", "POST", setUtente);
        if (res == '0') window.location.href = "./login";


        let results = await sendToServer("./getRoom/" + idRoom, "", "POST", "");
        let partecipans = await sendToServer("./getRoom/" + idRoom + "/partecipans", "", "POST", "");
        sendToServer("./getFriends", "", "POST", setMyListFriends);


        setMyCurrentRoom(results);
        setMyParticipants(partecipans);

        setTimeout(() => {
            autocomplete(document.getElementById("usernameInput"));

            popOver();
            youtubeSearch();
            loadSelectFriend2();


            setFriend(myParticipants, myCurrentRoom);
            console.log("--");
            idVideo = getIdFromUrl(myCurrentRoom.urlVideo);
            onYouTubeIframe(idVideo);
            initialize();
            sock();

            //audioService();
            setOnline(getPartecipantById(myUtente[0].id_utente));
        }, 800);


    } catch (error) {
        console.error(error);
    }
}


function loadSelectFriend2() {
    var listaAmici = document.getElementById("selectlFriendList");
    myList2.forEach(lista => {
        var option = document.createElement("option");
        option.text = lista[0];
        option.value = lista[1];
        listaAmici.add(option);
    });
}





function setMyListFriends(friends) {
    var listaFriendTmp = new Array();

    if (friends.length > 0) {
        listaFriendTmp = [];
        const uniqueIds = [];
        friends.forEach(friend => {
            const isDuplicate = uniqueIds.includes(friend.nomeLista);

            if (!isDuplicate) {
                uniqueIds.push(friend.nomeLista, friend.id_lista);
                myList2.push([friend.nomeLista, friend.id_lista]);
                return true;
            }
            return false;
        });
}
console.log("MYLIST");
console.log(myList2);
}

function audioService() {
    navigator.mediaDevices
        .getUserMedia({
            audio: true,
            video: true,
        })
        .then((stream) => {
            myVideoStream = stream;
            addVideoStream(myVideo, stream);

            peer.on("call", (call) => {
                call.answer(stream);
                const video = document.createElement("video");
                call.on("stream", (userVideoStream) => {
                    addVideoStream(video, userVideoStream);
                });
            });

            socket.on("user-connected", (userId) => {
                console.log(userId + " Vuole connettersi ");
                connectToNewUser(userId, stream);
            });
        });
}

const connectToNewUser = (userId, stream) => {
    console.log("conneting new Useeer" + userId);
    const call = peer.call(userId, stream);
    const video = document.createElement("video");
    call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
    });
};

const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
        video.play();
        videoGrid.append(video);
    });
};


function addPartecipant(partecipant) {
    if (!existsPartecipant(partecipant)) {
        myParticipants.push(partecipant);
    }
}

function existsPartecipant(partecipant) {
    if (!partecipant) return true;
    for (var i = 0; i < myParticipants.length; i++) {
        if (myParticipants[i].id_utente == partecipant.id_utente) {
            return true;
        }
        return false;
    }
}

function getPartecipantById(userdId) {
    for (var i = 0; i < myParticipants.length; i++) {
        if (myParticipants[i].id_utente == userdId) return myParticipants[i];
    }

}

function getMyUsername() {
    return myUtente[0].utente;
}

function setOnline(par) {

    if (par) {
        var cardhtml = par.cardHTML.getElementsByClassName("bi-circle-fill")[0];
        cardhtml.style.color = "green";
    }
}

function setOffline(par) {

    if (par) {
        var cardhtml = par.cardHTML.getElementsByClassName("bi-circle-fill")[0];
        cardhtml.style.color = "grey";
    }
}




async function newUserConnect(userId) {
    var par = await getPartecipantById(userId);
    par.online = true;
    if (par) setOnline(par);
}



function connectedOnlineRoutine(connectedPartecipant) {
    myParticipants.forEach(par => {
        setOffline(getPartecipantById(par.id_utente))
    });
    connectedPartecipant.forEach(par => {
        setOnline(getPartecipantById(par.id_utente));
    })
}


function sockChatMessage() {
    var sendBTN = document.getElementById("sendMessage");
    sendBTN.addEventListener("click", function (e) {
        e.preventDefault();
        console.log("sending " + parseMessage());
        socket.emit('chat_message', parseMessage());
        return false;
    });

    socket.on("chat_message", function (username, msg) {
        /*  var username = getPartecipantById(userId);
          if (username) recivedMessage(msg, username.username);*/
        console.log("recived" + msg);
        recivedMessage(msg, username);
    });
}

function sock() {


    socket.emit('join-room', myCurrentRoom.idRoom, myUtente[0].id_utente, myUtente[0].utente, getPartecipantById(myUtente[0].id_utente));
    sockChatMessage();


    socket.on("connectedPartecipant", function (connectedPartecipant) {
        connectedOnlineRoutine(connectedPartecipant);
    });



    /*
        socket.on("user-connected", function (userId) {
            console.log(userId + " Vuole connettersi ");
            //newUserConnect(userId);
            //connectToNewUser(userId, myVideoStream);
        });*/
    /*

    socket.on("user-disconnected", function (msg) {
        logMessage(msg);
    });
*/


    socket.on('chat_log_message', function (msg) {
        logMessage(msg);
    });



    socket.emit("playFT");


    socket.on("playFT", function (currentTime) {
        console.log("on playFt");
        setInterval(() => {
            if (isPlayerReady) {
                console.log("play current time");
                playVideo(currentTime);
                clearInterval(this);
            }
        }, 500);
    });


    socket.on("getCurrentTime", function () {
        var currentTime = getCurrentTime();
        console.log("current time" + currentTime);
        console.log("emit getCurrentime");
        socket.emit('getCurrentTime', currentTime);
    });




    socket.on('refreshUrl', function (urlVideo) {

        var idVideo = getIdFromUrl(urlVideo);
        onYouTubeIframe(idVideo);
        changeSrcVideo(urlVideo);
    });


    socket.on('play', function (minute) {
        recived = 1;
        console.log("playEvent " + minute);
        playVideo(minute);
    });

    socket.on('pause', function (minute) {
        stopVideo(minute);
    });




}



function getIdFromUrl(url) {
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    var match = url.match(regExp);
    return (match && match[7].length == 11) ? match[7] : false;
}

function getYoutubeUrlEmbed(videoId) {
    return "https://www.youtube.com/embed/" + videoId;
}



socket.on("send", function (data) {
    var audio = new Audio(data);
    audio.play();
});



function onYouTubeIframe(videoId) {
    //creates the player object
    iFrameVideo = new YT.Player('player', {
        height: '390',
        width: '640',
        videoId: videoId,
        autoplay: 1,
        enablejsapi: 1,
        frameborder: "0",
        host: 'https://www.youtube.com',
        origin: 'https://localhost:3001',

        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,

            'onPlaybackQualityChange': onPlayerPlaybackQualityChange,
            'onPlaybackRateChange': onPlayerPlaybackRateChange,
            'onError': onPlayerError,
            'onApiChange': onPlayerApiChange
        }
    });
    // iFrameVideo.h.attributes.sandbox.value = "allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation";

    console.log('Video API is loaded');
    //subscribe to events
    iFrameVideo.addEventListener("onReady", "onYouTubePlayerReady");
    iFrameVideo.addEventListener("onStateChange", "onYouTubePlayerStateChange");
}

function getCurrentTime() {
    console.log("Current time " + iFrameVideo.playerInfo.currentTime);
    if (iFrameVideo.playerInfo.currentTime == undefined) return 0;
    return iFrameVideo.playerInfo.currentTime;
}


function onPlayerReady(event) {
    //console.log('player is ready');
    event.target.playVideo();

}

function onYouTubePlayerReady() {
    console.log('Video is ready to play');
    isPlayerReady = true;
}

function onYouTubePlayerStateChange(event) {
    //console.log('Video state changed');
}

function onPlayerStateChange(event) {
    switch (event.data) {
        case YT.PlayerState.UNSTARTED:
            //    console.log('unstarted');
            break;
        case YT.PlayerState.ENDED:
            //   console.log('ended');
            break;
        case YT.PlayerState.PLAYING:
            //console.log('playing');
            if (recived == 0) socket.emit('play', iFrameVideo.playerInfo.currentTime);
            recived = 0;

            console.log("Emitted play");
            break;
        case YT.PlayerState.PAUSED:
            //  console.log('paused');
            socket.emit('pause');
            break;
        case YT.PlayerState.BUFFERING:
            //console.log('buffering');
            break;
        case YT.PlayerState.CUED:
            //  console.log('video cued');
            break;
    }
}



function stopVideo() {
    iFrameVideo.pauseVideo();
}




function playVideo(minute) {
    iFrameVideo.seekTo(minute);
    iFrameVideo.playVideo();
}




function refreshPage() {
    // window.location.href = "./view?idRoom=" + idRoom;
}

function onPlayerPlaybackQualityChange(playbackQuality) {
    //  console.log('playback quality changed to ' + playbackQuality.data);
}

function onPlayerPlaybackRateChange(playbackRate) {
    // console.log('playback rate changed to ' + playbackRate.data);
}

function onPlayerError(e) {
    console.log('An error occurred: ' + e.data);
}
function onPlayerApiChange() {

}


function setUtente(res) {
    if (res == "0") return;
    myUtente = JSON.stringify(res);
    myUtente = JSON.parse(myUtente);
    setNomeUtente(myUtente[0].nome);

    $("#singIn").hover(function () {
        setNomeUtente(" LOGOUT ");
    }, function () {
        setNomeUtente(myUtente[0].nome);
    });

    $("#singIn").click(function () {
        sendToServer("./logOut", "", "POST", "");
        window.location = "/";
    });


    addPartecipant(new Participant(myUtente[0].id_utente, myUtente[0].nome, myUtente[0].cognome, myUtente[0].utente, false, null))
}

function setNomeUtente(nome) {
    var btnsingIn = document.getElementById("singIn");
    btnsingIn.textContent = nome;
}


function parseMessage() {
    return $('#text-box').html().replace(/\<div\>|\<br.*?\>/ig, '\n').replace(/\<\/div\>/g, '').trim().replace(/\n/g, '<br>');
}

function Room(idRoom, nomeRoom, urlVideo, nomeLista, codice_invito, idLista) {
    this.idRoom = idRoom;
    this.nomeRoom = nomeRoom;
    this.urlVideo = urlVideo;
    this.nomeLista = nomeLista;
    this.codice_invito = codice_invito;
    this.idLista = idLista;
}

function Participant(id_utente, nome, cognome, username, online, cardHTML) {
    this.id_utente = id_utente;
    this.nome = nome;
    this.cognome = cognome;
    this.username = username;
    this.online = online;
    this.cardHTML = cardHTML;
}

function setMyCurrentRoom(res) {
    if (res.length == "0") roomNotFound();
    res.forEach(friend => {
        myCurrentRoom = new Room(friend.id_room, friend.nomeRoom, friend.urlVideo, friend.nomeLista, friend.codice_invito, friend.id_lista);

        return;
    });
}

function setMyParticipants(res) {

    console.log(res);
    res.forEach(participant => {

        addPartecipant(new Participant(participant.id_utente, participant.nome, participant.cognome, participant.utente, false, null));

    });

    console.log("-------myParticipants--_-----");
    console.log(myParticipants);
}

function roomNotFound() {
    document.body.innerHTML = "<br><br><br><h3>Room Not Found :( </h3>";
    setTimeout(() => {
        window.location = "./";
    }, 3000);
    return;
}


function isYoutubeLink(link) {
    console.log("\n" + link.toString());
    return link.toString().indexOf("youtube.com") !== -1;
}

function initialize() {
    var urlVideoInput = document.getElementById("urlVideo");
    var urlVideoBtn = document.getElementById("urlVideoBtn");
    var idRoomInput = document.getElementById("idRoom");
    var titleRoom = document.getElementById("titleRoom");
    var url = myCurrentRoom.urlVideo;
    titleRoom.textContent = myCurrentRoom.nomeRoom;
    urlVideoInput.value = url;
    idRoomInput.value = idRoom;


    urlVideoBtn.addEventListener("click", () => {

        if (!isYoutubeLink(urlVideoInput.value)) return;

        var json = {
            idCurrentRoom: idRoom,
            newUrl: urlVideoInput.value
        }

       sendToServer("./newUrl", json, "POST", "");
        var newEmbeddedUrl = fromURLtoEmbeded(urlVideoInput.value);
        changeSrcVideo(newEmbeddedUrl);
        socket.emit('refreshUrl', newEmbeddedUrl);
    });
}

function fromURLtoEmbeded(urlVideo) {
    var idVideo = getIdFromUrl(urlVideo);
    return getYoutubeUrlEmbed(idVideo);
}


function changeSrcVideo(urlVideo) {
    if (!isYoutubeLink(urlVideo)) return;
    player.src = urlVideo;
}

function setFriend(myParticipants, myCurrentRoom) {

    var rightColumn = document.getElementsByClassName("right")[0];

    console.log(myCurrentRoom);
    var intestazione = newIntestazioneListFriend(myCurrentRoom.nomeLista, myCurrentRoom.idLista);
    var flex = intestazione.querySelector(".flex");
    var plus = intestazione.querySelector(".friend");
    rightColumn.appendChild(intestazione);


    myParticipants.forEach(friend => {
        var frienCard = newFriendCard(friend.nome, friend.cognome, friend.username);

        if (frienCard != undefined) {
            flex.insertBefore(frienCard, flex.firstElementChild);
            friend.cardHTML = frienCard;
        }
    });

    const newFriendModal = new bootstrap.Modal('#newFriend', {
        keyboard: false
    })

    plus.addEventListener("click", () => {
        newFriendModal.show();
    });
}


function newFriendCard(nome, cognome, username, online) {

    var frien = document.createElement("div");
    frien.className = "friend";

    if (nome == "plus") {
        var imgthumbnail = document.createElement("img");
        imgthumbnail.className = "center";
        imgthumbnail.src = " /img/images/plus.png";
        frien.appendChild(imgthumbnail);

        return frien;
    }

    if (nome == null || cognome == null || username == null) return;


    var thumbnail = document.createElement("div");
    thumbnail.className = "thumbnail";

    var imgthumbnail = document.createElement("img");

    imgthumbnail.src = "/img/images/user.png";


    var title = document.createElement("div");
    title.className = "title";

    var h3 = document.createElement("h3");
    h3.textContent = nome + " " + cognome;

    var i = document.createElement("i");
    i.className = "bi bi-circle-fill";
    if (online == 1) i.style = "color:green";

    var channeltitle = document.createElement("div");
    channeltitle.className = "channeltitle text-center";
    channeltitle.textContent = username;


    var info = document.createElement("div");
    info.className = "info";


    frien.appendChild(thumbnail);
    thumbnail.appendChild(imgthumbnail);
    frien.appendChild(info);

    info.appendChild(title);
    info.appendChild(channeltitle);
    channeltitle.appendChild(i);
    title.appendChild(h3);

    return frien;
}

var element = $('.floating-chat');
var myStorage = localStorage;

if (!myStorage.getItem('chatID')) {
    myStorage.setItem('chatID', createUUID());
}

setTimeout(function () {
    element.addClass('enter');
}, 1000);

element.click(openElement);

function openElement() {
    var messages = element.find('.messages');
    var textInput = element.find('.text-box');
    element.find('>i').hide();
    element.addClass('expand');
    element.find('.chat').addClass('enter');
    var strLength = textInput.val().length * 2;
    textInput.keydown(onMetaAndEnter).prop("disabled", false).focus();
    element.off('click', openElement);
    element.find('.header button').click(closeElement);
    element.find('#sendMessage').click(sendNewMessage);
    messages.scrollTop(messages.prop("scrollHeight"));
}

function closeElement() {
    element.find('.chat').removeClass('enter').hide();
    element.find('>i').show();
    element.removeClass('expand');
    element.find('.header button').off('click', closeElement);
    element.find('#sendMessage').off('click', sendNewMessage);
    element.find('.text-box').off('keydown', onMetaAndEnter).prop("disabled", true).blur();
    setTimeout(function () {
        element.find('.chat').removeClass('enter').show()
        element.click(openElement);
    }, 500);
}

function createUUID() {
    // http://www.ietf.org/rfc/rfc4122.txt
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = "-";

    var uuid = s.join("");
    return uuid;
}


function recivedMessage(newMessage, userName) {
    if (!newMessage) return;
    if (!userName) return;

    var messagesContainer = $('.messages');

    messagesContainer.append([
        '<div class="self">',
        '<div class=name>' + userName + "</div>",
        '<div class=msgText>' + newMessage + "</div>",
        '</div>'
    ].join(''));

    messagesContainer.finish().animate({
        scrollTop: messagesContainer.prop("scrollHeight")
    }, 250);
}

function logMessage(newMessage) {
    if (!newMessage) return;

    var messagesContainer = $('.messages');

    messagesContainer.append([
        '<div class="log">',
        '<div class=msgText>' + newMessage + "</div>",
        '</div>'
    ].join(''));

    messagesContainer.finish().animate({
        scrollTop: messagesContainer.prop("scrollHeight")
    }, 250);
}



function sendNewMessage() {
    var userInput = $('.text-box');
    var newMessage = userInput.html().replace(/\<div\>|\<br.*?\>/ig, '\n').replace(/\<\/div\>/g, '').trim().replace(/\n/g, '<br>');

    if (!newMessage) return;

    var messagesContainer = $('.messages');

    messagesContainer.append([
        '<div class="other">',
        '<div class="name"> ' + myUtente[0].utente + '</div>',
        '<div class="msgText"> ' + newMessage + '</div>',
        '</div>'

    ].join(''));

    // clean out old message
    userInput.html('');
    // focus on input
    userInput.focus();

    messagesContainer.finish().animate({
        scrollTop: messagesContainer.prop("scrollHeight")
    }, 250);
}

function onMetaAndEnter(event) {
    if ((event.metaKey || event.ctrlKey) && event.keyCode == 13) {
        sendNewMessage();
    }
}


function sendToServer(indirizzo, json, method, callback) {

    return new Promise(function (resolve, reject) {
        if (json == "" || json == undefined) {
            json = {};
        }

        fetch(indirizzo, {
            headers: {
                'Accept': 'application/json',
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: method,
            body: JSON.stringify(json)
        })
            .then((response) => {
                if (response.status === 200)
                    return response.json()
            })
            .then((data) => {
                // data = JSON.parse(data)
                if (data.length == 0) throw "Error 0 response";
                //console.log('Success:', data);
                resolve(data);
                callback(data);


            })
            .catch(err => {
                if (err === "server") return console.log(err)
            })
    });
}

gapi.load('client', () => {
    console.log('loaded client')

    gapi.client.init({
        apiKey: "AIzaSyANBYhPNeXu_FBiOiL1YNiF0SjpRH4ym8Q",
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest'],
    })
});
