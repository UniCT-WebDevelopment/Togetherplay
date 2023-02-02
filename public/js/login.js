
function isValidEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }


window.onload = async function () {
    var submitLogin = document.getElementById("submitLogin");



    submitLogin.addEventListener('click', async () => {
        var email = document.getElementById("emailLogin");
        var pass = document.getElementById("passwordLogin");
        var msg = document.getElementById("msgLogin");

        msg.textContent = "";

    
        if (!isValidEmail(email.value)) {
            msg.textContent = "Email non valida";
            return;
        }

        if (pass.value.length < 3) {
            msg.textContent = "Password troppo corta";
            return;
        }


        var r=await tryToLogIn(email.value, pass.value);
        if (r == "0") {
            msg.textContent = "Email o Password Errati";
            return;
        }

    });


    var submitSignUp = document.getElementById("submitSignUp");
    submitSignUp.addEventListener("click", async () => {
        var name = document.getElementById("nameSign");
        var surnamame = document.getElementById("surnameSign");
        var email = document.getElementById("emailSign");
        var pass = document.getElementById("passwordSign");
        var username = document.getElementById("usernameSign");
        var msg = document.getElementById("msgSign");

        if (name.value.length < 3 || surnamame.value.length < 3 || surnamame.value.length < 3 || email.value.length < 3 || username.value.length < 3) {
            msg.textContent = "Inserisci Tutti i Campi";
            return;
        }

        if (pass.value.length < 3) {
            msg.textContent = "Password Troppo Corta";
            return;
        }

        const encryptedPassword = encryptPassword(pass.value);
        var json =
        {
            name: name.value,
            surnamame: surnamame.value,
            email: email.value,
            password: encryptedPassword,
            username: username.value
        };

        let respo = await sendToServer("/signIn", json, "POST");
        if (respo.message != "0") {
            msg.textContent = "Account Registrato";
            tryToLogIn(email.value, pass.value);

        } else {
            msg.textContent = "Incorrect Field";
            return;
        }

    })

}


function encryptPassword(password) {
    return CryptoJS.MD5(password).toString();
}





async function tryToLogIn(email, password) {

const encryptedPassword = encryptPassword(password);
    var json =
    {
        email: email,
        password: encryptedPassword
    };
    let respo = await sendToServer("/login", json, "POST");

    respo = JSON.stringify(respo);
    respo = JSON.parse(respo);

    if (respo.message == "1") {
        console.log("Entrato");
        window.location.href = '/';
    }
    return respo.message;
}

function sendToServer(indirizzo, json, callback) {
    return promise = new Promise(function (resolve, reject) {
        fetch(indirizzo, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify(json)
        })
            .then((response) => {
                if (response.status === 200) {
                    console.log('response:', response);
                    return response.json();
                }
            })
            .then((data) => {
                resolve(data);
                console.log('Success:', data);
                callback(data);

            })
            .catch(err => {
                reject(err);
                if (err === "server") return console.log(err)
            })
    });

}
