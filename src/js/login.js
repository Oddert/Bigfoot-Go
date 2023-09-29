const loginTitle = document.querySelector('.form-title.login')
const registerTitle = document.querySelector('.form-title.register')

const loginForm = document.querySelector('.form-body.login')
const registerForm = document.querySelector('.form-body.register')

loginTitle.onclick = () => {
    loginTitle.classList.remove('faded')
    registerTitle.classList.add('faded')
    loginForm.classList.remove('hidden')
    registerForm.classList.add('hidden')
}

registerTitle.onclick = () => {
    registerTitle.classList.remove('faded')
    loginTitle.classList.add('faded')
    registerForm.classList.remove('hidden')
    loginForm.classList.add('hidden')
}