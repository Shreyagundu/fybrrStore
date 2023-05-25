// window.addEventListener('load', () => {
//   const form = document.getElementById('login-form');
//   form.addEventListener('submit', (e) => {
//       e.preventDefault();
//       let formData = new FormData(form);
//       let data = {};
//       for (var [key, value] of formData.entries()) {
//           data[key] = value;
//       }
//       console.log('hello');
//       axios({
//           method: "post",
//           url: location.protocol + "//" + location.host + "/api/login",
//           data: data,
//           // headers: { "Content-Type": "application/json" }
//       })
//       .then(function (response) {
//           //handle success
//           console.log(response);
//       })
//       .catch(function (response) {
//           //handle error
//           console.log(response);
//       });
//   })
// })

const loginText = document.querySelector(".title-text .login");
const loginForm = document.querySelector("form.login");
const loginBtn = document.querySelector("label.login");
const signupBtn = document.querySelector("label.signup");
const signupLink = document.querySelector("form .signup-link a");
signupBtn.onclick = (() => {
    loginForm.style.marginLeft = "-50%";
    loginText.style.marginLeft = "-50%";
});
loginBtn.onclick = (() => {
    loginForm.style.marginLeft = "0%";
    loginText.style.marginLeft = "0%";
});
signupLink.onclick = (() => {
    signupBtn.click();
    return false;
});

window.addEventListener('load', () => {
    const formL = document.getElementById('login-form');
    formL.addEventListener('submit', (e) => {
        e.preventDefault();
        let formDataL = new FormData(formL);
        let data = {};
        for (var [key, value] of formDataL.entries()) {
            data[key] = value;
        }
        console.log('hello');
        axios({
                method: "post",
                url: location.protocol + "//" + location.host + "/api/users/login",
                data: data,
                // headers: { "Content-Type": "application/json" }
            })
            .then(function(response) {
                // handle success
                console.log(response);
                let token = readCookie('authToken');
                if (token) {
                    window.location.href = location.protocol + "//" + location.host + '/';
                }
            })
            .catch(function(response) {
                // handle error
                console.log(response);
                alert('Username or Password don\'t match.');
            });

    })

    const formS = document.getElementById('signup-form');
    formS.addEventListener('submit', (e) => {
        e.preventDefault();
        let formDataS = new FormData(formS);
        let data = {};
        for (var [key, value] of formDataS.entries()) {
            data[key] = value;
        }
        if (data['password'] != data['conf-pswd']) {
            alert('Confirm the correct password');
            return;
        }
        console.log('hello');
        axios({
                method: "post",
                url: location.protocol + "//" + location.host + "/api/users/register",
                data: data,
                // headers: { "Content-Type": "application/json" }
            })
            .then(function(response) {
                //handle success
                console.log(response);
                window.location.href = location.protocol + "//" + location.host + '/';
            })
            .catch(function(response) {
                //handle error
                console.log(response);
                alert('Username not unique.');
            });
    })
})

function readCookie(k) {
    return (document.cookie.match('(^|; )' + k + '=([^;]*)') || 0)[2]
}