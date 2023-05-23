const textContent = document.getElementById("text-content")
const lineCounter = document.getElementById("line-counter")
const fileRenameDialog = document.getElementById("fileRenameDialog")
const extSelect = document.getElementById("ext")
const extSwitch = document.getElementById("extSwitch")
const extInfo = document.getElementById("extInfo")


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


async function  saveFile(filePath)
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

    await fetch("/editor",options)
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






lineCount()