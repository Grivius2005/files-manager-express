const textContent = document.getElementById("text-content")
const lineCounter = document.getElementById("line-counter")


textContent.addEventListener("input",lineCount)
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
    .then(()=>{
        alert("File was saved")
        return true
    })
    .catch((err)=>{
        alert(`Save error (${err})`)
    })

}






lineCount()