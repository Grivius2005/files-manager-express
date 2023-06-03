const imageShowPath = document.getElementById("fullpath").value
const filePath = document.getElementById('path').value
const canvas = document.getElementById("canvas")
const context = canvas.getContext("2d")
const imageDiv = document.getElementById("imageDiv")
const fileRenameDialog = document.getElementById("fileRenameDialog")
const extSelect = document.getElementById("ext")
const extSwitch = document.getElementById("extSwitch")
const extInfo = document.getElementById("extInfo")



extSelect.disabled = true
extInfo.style.display = "none"
extSwitch.checked = false


function init()
{
    const img = new Image()

    img.onload = ()=>{
        canvas.width = img.width
        canvas.height = img.height
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
        const isImageBig = img.width > 1280 || img.height > 720;
        imageDiv.style.width = (isImageBig ? img.width/2 : img.width) + "px"
        imageDiv.style.height = (isImageBig ? img.height/2 : img.height) + "px"
    }

    img.src = imageShowPath
}

function switchFileRenameDialog()
{
    if(!fileRenameDialog.open)
    {
        document.body.style.filter = "brightness(0.5)"
        fileRenameDialog.showModal();
    } 
    else 
    {
        document.body.style.filter = ""
        fileRenameDialog.close();
    }
}

function extCheck(defualtExt){
    extInfo.style.display = extSwitch.checked ? "block":"none"
    extSelect.disabled = !extSwitch.checked
    if(!extSwitch.checked)
    {
        extSelect.value = defualtExt
    }
}


window.onload = init