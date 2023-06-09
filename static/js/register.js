

const passInput = document.getElementById("password")
const confirmPassInput = document.getElementById("confirmPassword")

function checkForm()
{
    const check = passInput.value == confirmPassInput.value
    if(!check)
    {
        alert("Password in cofirm is not the same as main password!")
        return false
    }
    return true

}