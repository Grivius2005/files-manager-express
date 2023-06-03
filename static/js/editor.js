const textContent = document.getElementById("text-content")
const lineCounter = document.getElementById("line-counter")
const fileRenameDialog = document.getElementById("fileRenameDialog")
const extSelect = document.getElementById("ext")
const extSwitch = document.getElementById("extSwitch")
const extInfo = document.getElementById("extInfo")
const fontSizeDisplay = document.getElementById("fontSize")

let fontInterval

let fontSize = 15
let colorPalettesIndex = 0
let color = "#FFFFFF"
let bgColor = "#000000"
fontSizeDisplay.innerText = fontSize

window.addEventListener("mouseup",clearFontInterval)

textContent.onkeydown = function(e){
    if (e.keyCode === 9) 
    {
        this.setRangeText(
            '    ',
            this.selectionStart,
            this.selectionStart,
            'end'
        )
        return false; 
    }
}  


function init()
{
    fetch("/editorStyling")
    .then(res=>res.json())
    .then((data)=>{
        fontSize = data.fontSize
        color = data.colorPalettes.color
        bgColor = data.colorPalettes.bgColor
        colorPalettesIndex = data.colorPalettesIndex
        editorChange()
    })
}

function sendStyling()
{
    const options = {
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            fontSize: fontSize,
            colorPalettesIndex:colorPalettesIndex
        })
    }


    fetch("/editorStyling",options)
    .then(res=>res.json())
    .then((data)=>{
        fontSize = data.fontSize
        color = data.colorPalettes.color
        bgColor = data.colorPalettes.bgColor
        colorPalettesIndex = data.colorPalettesIndex
        editorChange()
        alert("Styling saved!")
    })
}

function editorChange()
{
    document.documentElement.style.setProperty("--font-size",`${fontSize}px`)
    document.documentElement.style.setProperty("--color",color)
    document.documentElement.style.setProperty("--bg-color",bgColor)
    document.documentElement.style.setProperty("--line-heigth",`${fontSize+5}px`)
}


extSelect.disabled = true
extInfo.style.display = "none"
extSwitch.checked = false



 


function extCheck(defualtExt){
    extInfo.style.display = extSwitch.checked ? "block":"none"
    extSelect.disabled = !extSwitch.checked
    if(!extSwitch.checked)
    {
        extSelect.value = defualtExt
    }
}


function lineCount()
{
    let count = 2
    lineCounter.innerHTML = "<p>1</p>"
    for(let char of textContent.value)
    {
        if(char == "\n")
        {
            const num = document.createElement("p")
            num.innerText = count
            count+=1
            lineCounter.appendChild(num)
        }
    }
    textContent.rows = count
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

function setFontInterval(value)
{
    fontInterval = setInterval(()=>{
        changeFontSize(value)
    },100)
}

function clearFontInterval()
{
    clearInterval(fontInterval)
}

function changeFontSize(value)
{
    fontSize+=value
    if(fontSize < 1)
    {
        fontSize = 1
        clearInterval(fontInterval)
    }
    if(fontSize > 50)
    {
        fontSize = 50
        clearInterval(fontInterval)
    }
    editorChange()
}

function changeColorPalete()
{
    fetch(`/editorColorPalettes?index=${colorPalettesIndex+1}`)
    .then(res=>res.json())
    .then((data)=>{
        color = data.colorPalettes.color
        bgColor = data.colorPalettes.bgColor
        colorPalettesIndex = Number(data.colorPalettesIndex)
        editorChange()
    })
}




function saveFile(filePath)
{
    const options = {
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            newContent:textContent.value,
            filePath:filePath
        })
    }

    fetch("/editor",options)
    .then((res)=>res.text())
    .then(data=>{
        if(data != "")
        {
            alert("Save file error! (Probably file doesn't exist anymore)")
            window.location.replace("/")
        }
        alert("File was saved")
        return true
    })
    .catch((err)=>{
        alert(`Save error (${err})`)
    })

}

window.onload = init
editorChange()
lineCount()