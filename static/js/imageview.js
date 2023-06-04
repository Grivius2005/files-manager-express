const imageShowPath = document.getElementById("fullpath").value
const filePath = document.getElementById('path').value
const canvas = document.getElementById("canvas")
const context = canvas.getContext("2d")
const imageDiv = document.getElementById("imageDiv")
const fileRenameDialog = document.getElementById("fileRenameDialog")
const extSelect = document.getElementById("ext")
const extSwitch = document.getElementById("extSwitch")
const extInfo = document.getElementById("extInfo")
const filtersDiv = document.getElementById("filtersDiv")

let filtersOpen = false;
let filterSelected = "none";

extSelect.disabled = true
extInfo.style.display = "none"
extSwitch.checked = false

let img = new Image()

function init()
{
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

function openFilters()
{
    filtersOpen = !filtersOpen
    if(filtersOpen)
    {
        document.documentElement.style.setProperty("--filter-div-width","16em")
        document.documentElement.style.setProperty("--filter-div-height","60em")
    }
    else
    {
        document.documentElement.style.setProperty("--filter-div-width","0")
        document.documentElement.style.setProperty("--filter-div-height","0")
    }
}

function changeFilter(filter)
{
    filterSelected = filter == "none" ? "none" : `${filter}(100%)`
    document.documentElement.style.setProperty("--image-filter",filterSelected)
    context.filter = filterSelected
    context.drawImage(img, 0, 0, canvas.width, canvas.height);
}

function saveImage(path,fileName)
{
    canvas.toBlob((blob)=>{
        const fd = new FormData()
        fd.append("img",blob)

        const options = {
            method:"POST",
            body:fd
        }

        fetch(`/imageview?path=${path}`,options)
        .then((res)=>res.text())
        .then(data=>{
            if(data != "")
            {
                alert("Save file error! (Probably file doesn't exist anymore or file is too big to upload)")
                window.location.replace("/")
            }
            alert("File was saved")
            return true
        })
        .catch((err)=>{
            alert(`Save error (${err})`)
        })

    })
}


window.onload = init