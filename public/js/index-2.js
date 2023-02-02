let utente;
let myListFriends = new Array();
let myList = new Array();
let myVisitableRooms = new Array();
let friendRequest = new Array();

const newFriendModal = new bootstrap.Modal('#newFriend', {
    keyboard: false
})

let createPartyModal = new bootstrap.Modal('#staticBackdrop', {
    keyboard: false
})





window.onload = async function () {

    try {
        sendToServer("./user", "", "POST", setUtente);
        sendToServer("./getFriends", "", "POST", setMyListFriends);
        sendToServer("./visitableRooms", "", "POST", setMyVisitableRooms);

    } catch (error) {
        console.error(error);
    }


    setTimeout(async () => {
        await execute(josonFormatter, 2, "", "mostPopular")
        await executeByCategory(josonFormatter, 2, "", 10, "music")
        popOver();
        //setVideoCard();
        setRoomCard();
        joinPartyInvitatioLink();

        autocomplete(document.getElementById("usernameInput"));

        youtubeSearch();
       setConteinerVisible();
    }, 500);
}


function youtubeSearch() {
    var inp = document.getElementById("search-bar");
    inp.addEventListener("input", async function (e) {
        if (this.value.length > 3) var responseString = await search(this.val);
        else return;

        var responseString = JSON.stringify(responseString, '', 2);
        var res = JSON.parse(responseString);
        var res = res.result;
        var item = res.items;
        closeAllLists();

        a = document.createElement("div");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");

        this.parentNode.appendChild(a);
        item.forEach(element => {
            var row = newResultRow(element.snippet.title, element.snippet.description, element.snippet.channelTitle, element.id.videoId, element.snippet.thumbnails.default.url, element.snippet.publishTime);
            a.appendChild(row);
        });
    });


    function newResultRow(title, description, channelTitle, videoId, thumbnails, date) {
        var row = document.createElement("div");
        row.className = "resultsRow";
        var img = document.createElement("img");
        img.src = thumbnails;
        var flex = document.createElement("div");
        flex.className = "flex";
        flex.style.flexFlow = "column wrap";
        flex.style.marginTop = "0px";
        flex.style.paddingLeft = "10px";
        flex.style.paddingRight = "10px";
        var titleDiv = document.createElement("div");
        titleDiv.className = "title";
        titleDiv.textContent = title;
        var descriptionDiv = document.createElement("div");
        descriptionDiv.className = "description";
        descriptionDiv.textContent = "By " + channelTitle;
        var dateDiv = document.createElement("div");
        dateDiv.className = "description";
        const d = new Date(date);
        dateDiv.textContent = "Added " + d.toDateString();
        row.appendChild(img);
        row.appendChild(flex);
        flex.appendChild(titleDiv);
        flex.appendChild(descriptionDiv);
        flex.appendChild(dateDiv);
        row.addEventListener("click", () => {
            createPartyModal = new bootstrap.Modal('#staticBackdrop', {
                keyboard: false
            });

            setTimeout(() => {
                createPartyModal.show();
            }, 2000);
            
            
            loadSelectFriend();
            sendCreatePartyToServer(videoId);
        });
        return row;
    }


    async function search(key) {
        return new Promise(function (resolve) {

            var request = gapi.client.youtube.search.list({
                "part": "snippet",
                "location": "42.734673,13.043632",
                "locationRadius": "100km",
                "maxResults": 4,
                "q": key,
                "type": [
                    "video"
                ],
                "videoType": "videoTypeUnspecified"
            }).then(res => {
                resolve(res);
            });
        });
    }

    function closeAllLists(elmnt) {
        /*close all autocomplete lists in the document,
        except the one passed as an argument:*/
        var x = document.getElementsByClassName("autocomplete-items");
        for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }
    /*execute a function when someone clicks in the document:*/
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
}



function closeBuble(buble) {
    friendRequest = friendRequest.filter(element => element != buble.value);
    console.log(buble);
    buble.classList.add("removed");
    //buble.remove();
}
function newBubleFriend(name) {
    if (friendRequest.indexOf(name) != -1) return;
    friendRequest.push(name);

    var div = document.getElementById("listRequestFriend");
    var close = document.createElement("img");
    var buble = document.createElement("div");
    close.src = "./img/images/close.png";
    buble.className = "bubleFriend";
    buble.textContent = name;
    buble.value = name;
    buble.appendChild(close);
    div.appendChild(buble);
    close.removeEventListener("click", () => { }, true);
    close.addEventListener("click", () => {
        closeBuble(buble);
    });
}

function setConteinerVisible() {
    var container = document.getElementsByClassName("container")[8];
    console.log(container);

    if (utente) {
        //container.style.display = "block";
        container.style.visibility = "visible";
    }
    else
        //container.style.display = "none";
        container.style.visibility = "hidden";

}

function popOver() {
    var selectlFriendList = document.getElementById("selectlFriendList");
    var popoverFriend = $('#popoverFriend').on('click', function () {
        var popover_instance = bootstrap.Popover.getInstance(document.querySelector('[data-bs-toggle]'));
        $('#popoverFriend').popover({
            trigger: 'click',
            placement: 'right',
            html: true,
            content: getContentPopover(selectlFriendList.options[selectlFriendList.selectedIndex].text),
        });
        popover_instance._config.content = getContentPopover(selectlFriendList.options[selectlFriendList.selectedIndex].text);
        popover_instance.setContent()
    });

    function getContentPopover(nomeSelectedLista) {
        if (!myListFriends[nomeSelectedLista] || !myListFriends[nomeSelectedLista][0].nome) return "Nessun Amico in questa Lista";
        var content = "<ul>";
        myListFriends[nomeSelectedLista].forEach(element => {
            content += "<li>" + element.nome + " " + element.cognome + '</li>';
        });
        content += "</ul>"
        return content;

    }
}




function setUtente(res) {
    if (res == "0") return;
    utente = JSON.stringify(res);
    utente = JSON.parse(utente);
    setNomeUtente(utente[0].nome);

    $("#singIn").hover(function () {
        setNomeUtente(" LOGOUT ");
    }, function () {
        setNomeUtente(utente[0].nome);
    });

    $("#singIn").click(function () {
        sendToServer("./logOut", "", "POST", "");
        window.location = "/";
    });
}


function setNomeUtente(nome) {
    var btnsingIn = document.getElementById("singIn");
    btnsingIn.textContent = nome;
}

function setMyListFriends(friends) {
    var listaFriendTmp = new Array();

    if (friends.length > 0) {
        var nomeLista = friends[0].nomeLista;
        listaFriendTmp = [];

        const uniqueIds = [];
        friends.forEach(friend => {
            const isDuplicate = uniqueIds.includes(friend.nomeLista);

            if (!isDuplicate) {
                uniqueIds.push(friend.nomeLista, friend.id_lista);
                myList.push([friend.nomeLista, friend.id_lista]);
                return true;
            }
            return false;
        });

        myList.forEach(list => {
            listaFriendTmp = [];
            friends.forEach(friend => {
                if (friend.nomeLista == list[0]) {
                    listaFriendTmp.push(friend);
                }
            })
            myListFriends[list[0]] = listaFriendTmp;
        });
    }
    setFriendCard(myListFriends);
}


function setMyVisitableRooms(rooms) {
    rooms.forEach(room => {
        myVisitableRooms.push(room);
    });
}




function joinPartyInvitatioLink() {
    const joinBtn = document.getElementById("join");
    const invitatioLinkInput = document.getElementById("invitatioLink");
    joinBtn.addEventListener("click", () => {
        if (!invitatioLinkInput) return;
        var json = {
            invitationLink: invitatioLinkInput.value
        }
        sendToServer("./invitatioLink", json, "POST", joinParty);
    });
}

function joinParty(room) {
    if (typeof room == "number") window.location = "./view?idRoom=" + room;
    if (typeof room == "object") {
        if (room.length == "0") window.location = "./view?idRoom=" + undefined;
        else window.location = "./view?idRoom=" + room[0].id_room;
    }
}

function sendCreatePartyToServer(idVideo) {
    const submitBtn = document.getElementById("save");
    var partyname = document.getElementById("partyname");
    var selectlFriendList = document.getElementById("selectlFriendList");
    var invitationLink = document.getElementById("invitationLink");
    var info;

    console.log(idVideo);
    if (idVideo.length < 14) idVideo = "https://www.youtube.com/embed/watch?v=" + idVideo;
    console.log(idVideo);

    invitationLink.value = "" + generateLink();
    submitBtn.addEventListener('click', async () => {

        if (partyname.value[0] == " " || partyname.value.length < 3) {
            info = document.getElementById("nameInfoIcon");
            info.style.display = "inline";
            console.log(partyname.value);
            return;
        }

        if (selectlFriendList.value == "Friend List") {
            info = document.getElementById("shareInfoIcon");
            info.style.display = "inline";
            return;
        }

        var json = {
            nomeParty: partyname.value,
            id_lista: selectlFriendList.value,
            codice_invito: invitationLink.value,
            urlVideo: idVideo
        };
        var newRoom = await sendToServerPromise("./createParty", json, "POST");
        console.log(newRoom);
        joinParty(newRoom);

        json = "";
    })
}


function sendToServerPromise(indirizzo, json, method) {
    return new Promise(function (resolve, reject) {
        if (json == "" || json == undefined) {
            json = {};
        }

        fetch(indirizzo, {
            headers: {
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
                resolve(data);
            })
            .catch(err => {
                if (err === "server") return console.log(err)
            })
    });
}

function sendToServer(indirizzo, json, method, callback) {
    if (json == "" || json == undefined || json == null) {
        json = {};
    }
    fetch(indirizzo, {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: method,
        body: JSON.stringify(json)
    })
        .then((response) => {
            if (response.status === 200) {
                return response.json();
            }
        })
        .then((data) => {
            callback(data);
            return data;
        })
        .catch(err => {
            if (err === "server") return console.log(err)
        })
}

//TabPane: MostPopular, Music
function josonFormatter(json, tabPane) {
    var data = json.result;
    var items = data.items;
    loadVideo(items, tabPane);
}


function loadVideo(videos, tabPane) {
    var divMostPopular = document.getElementById(tabPane);
    var videoId;
    videos.forEach(vid => {
        if (tabPane == "mostPopular") videoId = vid.id;
        else videoId = vid.id.videoId;
        var video = vid.snippet;
        var contView = "";
        if (vid.statistics) {
            contView = vid.statistics.viewCount;
        }

        var videoCard = newVideoCard(video.title, video.channelTitle, video.thumbnails.medium.url, video.thumbnails.default.url, videoId, contView, video.publishedAt);
        divMostPopular.appendChild(videoCard);
    });
}

function abbreviateNumber(value) {
    var newValue = value;
    if (value >= 1000) {
        var suffixes = ["", "K", "M", "B", "T"];
        var suffixNum = Math.floor(("" + value).length / 3);
        var shortValue = '';
        for (var precision = 2; precision >= 1; precision--) {
            shortValue = parseFloat((suffixNum != 0 ? (value / Math.pow(1000, suffixNum)) : value).toPrecision(precision));
            var dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g, '');
            if (dotLessShortValue.length <= 2) { break; }
        }
        if (shortValue % 1 != 0) shortValue = shortValue.toFixed(1);
        newValue = shortValue + suffixes[suffixNum];
    }
    return newValue;
}

function newVideoCard(title, channelTitle, thumbnails, imgauthor, videoId, viewCount, publishedAt) {
    var video = document.createElement("div");
    video.className = "video";

    var thumbnail = document.createElement("div");
    thumbnail.className = "thumbnail";

    var imgthumbnail = document.createElement("img");
    imgthumbnail.alt = "https://www.youtube.com/embed/watch?v=" + videoId;
    imgthumbnail.src = thumbnails;

    var details = document.createElement("div");
    details.className = "details";

    var author = document.createElement("div");
    author.className = "author";

    var imgauthorDiv = document.createElement("img");
    imgauthorDiv.src = imgauthor;

    var titleDiv = document.createElement("div");
    titleDiv.className = "title";

    var h3 = document.createElement("h3");
    h3.textContent = title;

    var channeltitle = document.createElement("div");
    channeltitle.className = "channeltitle";
    channeltitle.textContent = channelTitle;

    var info = document.createElement("div");
    info.className = "info";

    if (viewCount != undefined && publishedAt != undefined) {
        var view = document.createElement("div");
        view.className = "view";
        var viewC = abbreviateNumber(viewCount);
        var d = new Date(publishedAt);
        view.textContent = "" + viewC + "views • " + d.toDateString().replace(/^\S+\s/, '');
        info.appendChild(view);
    }

    video.addEventListener('click', function (event) {
        createPartyModal.show();
        loadSelectFriend();
        sendCreatePartyToServer(videoId);
    });

    video.appendChild(thumbnail);
    thumbnail.appendChild(imgthumbnail);
    video.appendChild(details);
    details.appendChild(author);
    author.appendChild(imgauthorDiv);
    details.appendChild(info);
    info.appendChild(titleDiv);
    titleDiv.appendChild(h3);
    info.appendChild(channeltitle);
    return video;
}

function loadSelectFriend() {
    var listaAmici = document.getElementById("selectlFriendList");
    myList.forEach(lista => {
        var option = document.createElement("option");
        option.text = lista[0];
        option.value = lista[1];
        listaAmici.add(option);
    });
}


async function execute(callback, nPage, nextPageToken, tabPane) {
    return new Promise(function (resolve) {
        gapi.client.youtube.videos.list({
            "part": [
                "contentDetails",
                "player",
                "snippet",
                "statistics"
            ],
            "chart": "mostPopular",
            "pageToken": nextPageToken
        })
            .then(async function (response) {
                // Handle the results here (response.result has the parsed body).
                //console.log("Response", response);
                callback(response, tabPane);
                nPage--;

                if (nPage > 0) {
                    await execute(callback, --nPage, response.result.nextPageToken, tabPane);
                }
                resolve();
            },
                function (err) { console.error("Execute error", err); });
    });
}

function executeByCategory(callback, nPage, nextPageToken, category, tabPane) {

    return new Promise(function (resolve) {
        gapi.client.youtube.search.list({
            "part": [
                "snippet",
            ],
            "location": "21.5922529,-158.1147114",
            "locationRadius": "10mi",
            "type": [
                "video"
            ],
            "videoCategoryId": category,
            "pageToken": nextPageToken
        })
            .then(async function (response) {
                callback(response, tabPane);
                nPage--;
                if (nPage > 0) {
                    await executeByCategory(callback, --nPage, response.result.nextPageToken, category, tabPane);
                }
                resolve();
            },
                function (err) { console.error("Execute error", err); });
    });
}





/*

function setVideoCard() {
    var videos = document.querySelectorAll('.video');
    const myModal = new bootstrap.Modal('#staticBackdrop', {
        keyboard: false
    })

    videos.forEach(video => {
        video.addEventListener('click', function (event) {
            myModal.show();

            var img = video.querySelector('img');
            sendCreatePartyToServer(img.alt);

        });
    });
    loadSelectFriend()
}
*/

function addListButton() {
    var frien = document.createElement("div");
    frien.className = "friend";

    var addList = document.createElement("div");
    var h3 = document.createElement("h3");
    var imgthumbnail = document.createElement("img");
    addList.className = "addList";

    h3.textContent = "Aggiungi Lista";
    imgthumbnail.src = " /img/images/plus.png";

    frien.appendChild(addList);
    addList.appendChild(imgthumbnail);
    addList.appendChild(h3);
    return frien;
}




//setListFriendCardTEMP();
function setListFriendCardTEMP() {
    var divListFriendTab = document.getElementById("list");
    listFriend = newIntestazioneListFriend("Nuova", 0);
    divListFriendTab.appendChild(listFriend);
    flex = listFriend.lastChild;

    frienCard = newFriendCard("pippo", "baudo", "pippobaud887");
    //flex.appendChild(frienCard);
    flex.insertBefore(frienCard, flex.firstElementChild);
}

function setListFriendCard() {
    var divListFriendTab;
    var listFriend;
    var flex;
    var frienCard;
    var option;
    const createListModal = new bootstrap.Modal('#createList', {
        keyboard: false
    })

    divListFriendTab = document.getElementById("list");

    myList.forEach(lista => {
        // -------Intestazione -------------

        listFriend = newIntestazioneListFriend(lista[0], lista[1]);
        divListFriendTab.appendChild(listFriend);
        flex = listFriend.lastChild;

        //-----------------------------------------//

        console.log(myListFriends[lista[0]]);
        myListFriends[lista[0]].forEach(friend => {

            if (friend.nome != undefined) {
                frienCard = newFriendCard(friend.nome, friend.cognome, friend.utente, lista[1]);



                //flex.appendChild(frienCard);
                flex.insertBefore(frienCard, flex.firstElementChild);
            }
        });
    });


    var plus = addListButton();

    plus.addEventListener("click", () => {
        createListModal.show();

        const submitBtn = document.getElementById("addListBtn");

        submitBtn.addEventListener("click", () => {
            var listNameInput = document.getElementById("listNameInput");

            var json = {
                listName: listNameInput.value
            }
            sendToServer("./newList", json, "POST", "");
            createListModal.hide();
            window.location.href = "./";
        });

    });
    divListFriendTab.appendChild(plus);
}



function newFriendCard(nome, cognome, username, idList) {
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

    var remove = document.createElement("img");
    remove.src = "./img/images/close.png";
    remove.className = "remove";
    // remove.style.visibility="hidden";

    var user = document.createElement("input");
    user.type = "hidden";
    user.name = "username";
    user.value = username;

    var thumbnail = document.createElement("div");
    thumbnail.className = "thumbnail";
    var imgthumbnail = document.createElement("img");
    imgthumbnail.src = "/img/images/user.png";
    var title = document.createElement("div");
    title.className = "title";
    var h3 = document.createElement("h3");
    h3.textContent = nome + " " + cognome;
    var channeltitle = document.createElement("div");
    channeltitle.className = "channeltitle text-center";
    channeltitle.textContent = username;
    var info = document.createElement("div");
    info.className = "info";

    frien.appendChild(thumbnail);
    frien.appendChild(user);
    frien.appendChild(remove);
    thumbnail.appendChild(imgthumbnail);
    frien.appendChild(info);
    info.appendChild(title);
    info.appendChild(channeltitle);
    title.appendChild(h3);

    var option = document.createElement("div");
    option.className = "option";
    frien.appendChild(option)
    frien.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        remove.style.visibility = "visible";
        remove.classList.add("visibled");
    });

    remove.addEventListener("click", () => {
        option.classList.toggle("opened");
        option.textContent = "Remove";
    });
    if (idList) {
        option.addEventListener("click", () => {
            if (removeFriend(username, idList)) removeCardFriend(username, idList);
        });
    }
    return frien;
}

function removeCardFriend(username, idList) {
    var intestazione = document.getElementById(idList);
    var cardFriend = intestazione.querySelector('input[name=username][value=' + username + ']').parentNode;
    cardFriend.classList.add("deleted");
    cardFriend.remove();
}


async function removeFriend(username, idList) {
    var json = {
        username: username,
        idList: idList
    }
    var res = await sendToServerPromise("./removeFriend", json, "POST",);

    res.then((msg) => {
        if (msg.msg == "true")
            return true;
        else return false;
    });

}

async function addFriend(idLista, nomeUtente) {
    var json = {
        idLista: idLista,
        nomeUtente: nomeUtente
    }
    return await sendToServerPromise("./addFriend", json, "POST", "");
}


async function addFriendCard(idList, cardFriend) {
    var intestazione = document.getElementById(idList);
    var flex = intestazione.querySelector(".flex");
    flex.insertBefore(cardFriend, flex.firstElementChild);
}







function newIntestazioneListFriend(nomeLista, idLista) {
    var listFriend = document.createElement("div");
    listFriend.id = idLista;
    listFriend.className = "listFriend";
    var list = document.createElement("input");
    list.type = "hidden";
    list.name = "idList";
    list.value = idLista;
    var title = document.createElement("div");
    title.className = "title";
    var h2 = document.createElement("h2");
    h2.textContent = nomeLista;
    var flex = document.createElement("div");
    flex.className = "flex";
    var plus = newFriendCard("plus");

    plus.addEventListener("click", () => {
        console.log("aggiungo intestazione id " + idLista);
        $('#idList').val(idLista);
        newFriendModal.show();
    });

    flex.appendChild(plus);
    listFriend.appendChild(title);
    listFriend.appendChild(list);
    listFriend.appendChild(flex);
    title.appendChild(h2);
    return listFriend;
}




function setFriendCard(friends) {
    var divFriend = document.getElementById("friends");
    myList.forEach(lista => {
        friends[lista[0]].forEach(frien => {

            if (frien.id_amici != null) {
                var friend = document.createElement("div");
                friend.className = "friend";
                var thumbnail = document.createElement("div");
                thumbnail.className = "thumbnail";
                var imgthumbnail = document.createElement("img");
                imgthumbnail.src = "/img/images/user.png";
                var title = document.createElement("div");
                title.className = "title";
                var h3 = document.createElement("h3");
                h3.textContent = frien.nome + " " + frien.cognome;
                var channeltitle = document.createElement("div");
                channeltitle.className = "channeltitle text-center";
                channeltitle.textContent = frien.utente;
                var info = document.createElement("div");
                info.className = "info";
                divFriend.appendChild(friend);
                friend.appendChild(thumbnail);
                thumbnail.appendChild(imgthumbnail);
                friend.appendChild(info);
                info.appendChild(title);
                info.appendChild(channeltitle);
                title.appendChild(h3);
            }
        });
    });
    setListFriendCard();
}


function setRoomCard() {
    const myModal = new bootstrap.Modal('#joinRoom', {
        keyboard: false
    })

    var divRoom = document.getElementById("room");;

    myVisitableRooms.forEach(room => {
        var room = newRoomCard(room.nomeRoom, room.nomeLista, room.id_room, room.urlVideo);
        divRoom.appendChild(room);
    });

    var plusRoom = newRoomCard("plus", "", "");
    divRoom.appendChild(plusRoom);

    plusRoom.addEventListener("click", () => {
        myModal.show();
    });
}


function newRoomCard(title, friendList, idRoom, imgUrl) {
    var room = document.createElement("div");
    room.className = "room";
    if (title == "plus") {
        var imgthumbnail = document.createElement("img");
        room.style = "display:block";
        room.id = "plusRoom";
        imgthumbnail.className = "center";
        imgthumbnail.src = " /img/images/plus.png";
        room.appendChild(imgthumbnail);
        return room;
    }
    if (!title || !friendList || !idRoom) return;

    var thumbnail = document.createElement("div");
    thumbnail.className = "thumbnail";
    var thumb = Youtube.thumb(imgUrl, 'big');
    var imgthumbnail = document.createElement("img");
    imgthumbnail.src = thumb;
    var details = document.createElement("div");
    details.className = "details";
    var titlediv = document.createElement("div");
    titlediv.className = "title";
    var h2 = document.createElement("h2");
    h2.textContent = title;
    var channeltitle = document.createElement("div");
    channeltitle.className = "channeltitle";
    channeltitle.textContent = "Friend List: " + friendList;
    var info = document.createElement("div");
    info.className = "info";
    var idRoomInput = document.createElement("input");
    idRoomInput.type = "hidden";
    idRoomInput.name = "idRoom";
    idRoomInput.value = idRoom;
    room.appendChild(thumbnail);
    room.appendChild(idRoomInput);
    thumbnail.appendChild(imgthumbnail);
    room.appendChild(details);
    details.appendChild(info);
    info.appendChild(titlediv);
    titlediv.appendChild(h2);
    info.appendChild(channeltitle);
    
    room.addEventListener("click", () => {
        var idRoom = room.getElementsByTagName('input')[0].value;
        if (!idRoom) return;
        window.location = "./view?idRoom=" + idRoom;
    });

    /*
        var remove = document.createElement("img");
        remove.src = "./img/images/close.png";
        remove.className = "remove";
        var option = document.createElement("div");
        option.className = "option";
        room.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            remove.style.visibility = "visible";
            remove.classList.add("visibled");
        });
        remove.addEventListener("click", () => {
            option.classList.toggle("opened");
            option.textContent = "Remove";
        });
        option.addEventListener("click", (context) => {
            if (idRoom) {
                if (removeFriend(username, idList)) 
                removeCardRoom(idRoom);
            }
        });
        room.appendChild(remove);
        room.appendChild(option);
    */
    return room;
}

function removeCardRoom(idRoom) {
    var intestazione = document.getElementById("room");
    console.log(intestazione);
    var cardRoom = intestazione.querySelector('input[name="idRoom"][value="' + idRoom + '"]').parentNode;
    console.log(cardRoom);
    cardRoom.classList.add("deleted");
    cardRoom.remove;
}



var Youtube = (function () {
    'use strict';

    var video, results;

    var getThumb = function (url, size) {
        if (url === null) {
            return '';
        }
        size = (size === null) ? 'big' : size;
        results = url.match('[\\?&]v=([^&#]*)');
        video = (results === null) ? url : results[1];

        if (size === 'small') {
            return 'http://img.youtube.com/vi/' + video + '/2.jpg';
        }
        return 'http://img.youtube.com/vi/' + video + '/0.jpg';
    };

    return {
        thumb: getThumb
    };
}());





async function autocomplete(inp) {
    inp.addEventListener("input", async function (e) {
        var currentFocus;
        var a, b, i, val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) { return false; }
        currentFocus = -1;

        a = document.createElement("div");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");

        this.parentNode.appendChild(a);


        var json = {
            utente: val
        }

        var arr = await sendToServerPromise("/getUsers", json, "POST");
        var data = JSON.stringify(arr);
        var data = JSON.parse(data);


        data.forEach(element => {
            b = document.createElement("DIV");
            var add = document.createElement("button");
            add.textContent = "ADD";
            b.innerHTML = element.utente;
            b.innerHTML += "<input type='hidden' value='" + element.id_utente + "'>";
            b.append(add);
            add.addEventListener("click", function (e) {
                inp.value = element.utente;
                inp.name = element.id_utente;
                newBubleFriend(inp.value);

                add.disabled = true;
                add.style.color = "grey";
                //closeAllLists();
            });
            a.appendChild(b);
        });
    });

    function closeAllLists(elmnt) {
        /*close all autocomplete lists in the document,
        except the one passed as an argument:*/
        var x = document.getElementsByClassName("autocomplete-items");
        for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }
    /*execute a function when someone clicks in the document:*/
    document.addEventListener("click", function (e) {
        //closeAllLists(e.target);
    });

    function closeNewFriendModal() {
        var listRequestFriend = document.getElementById("listRequestFriend");
        listRequestFriend.replaceWith(listRequestFriend.cloneNode());
        friendRequest = [];
        var friendMSG = document.getElementById("friendMSG");
        friendMSG.style.display = "none";
        closeAllLists();
    }

    $('#newFriend').on('hidden.bs.modal', function () {
        $(this).find('form').trigger('reset');
        closeNewFriendModal();
    })

    //saveButton
    var addFriendBtn = document.getElementById("addFriendBtn");
    var friendMSG = document.getElementById("friendMSG");
    friendMSG.style.display = "none";

    addFriendBtn.addEventListener("click", () => {
        var friendMSG = document.getElementById("friendMSG");
        friendMSG.style.display = "block";

        var listError = "";
        var listAll = "";
        var message = "Added";

        friendRequest.forEach(friend => {
            var res = addFriend($("#idList").val(), friend);


            res.then((msg) => {
                listAll += msg.username + " ";
                console.log(msg);
                if (msg.msg == "-1") {
                    message = "Impossibile aggiungere";
                    listError += " " + msg.username;
                }
                else {
                    var card = newFriendCard(msg.nome, msg.cognome, msg.username, msg.idList);
                    addFriendCard(msg.idList, card);
                }
            }).then(() => {
                var list;
                if (listError.length > 0) list = listError;
                else list = listAll;
                friendMSG.textContent = " " + message + " " + list;
            });
        });
    });
}



function generateLink() {
    const result = Math.random().toString(36).substring(2, 17);
    return result;
}


gapi.load('client', () => {
    console.log('loaded client')

    gapi.client.init({
        apiKey: "AIzaSyANBYhPNeXu_FBiOiL1YNiF0SjpRH4ym8Q",
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest'],
    })
});
