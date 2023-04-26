const fileDialog = document.getElementById("fileDialog")
const dirDialog = document.getElementById("dirDialog")
const renameDirDialog = document.getElementById("renameDirDialog")
const uploadFiles = document.getElementById("uploadFiles")

const MB = 1048576;

uploadFiles.onchange = function()
{
    if(this.files[0].size > 100 * MB){
        alert("File or files are too big!");
        this.value = "";
     };
}


function switchTxtFileDialog()
{
    if(!fileDialog.open)
    {
        document.body.style.filter = "brightness(0.5)"
        fileDialog.showModal();
    } 
    else 
    {
        document.body.style.filter = ""
        fileDialog.close();
    }

}

function switchDirDialog()
{
    if(!dirDialog.open)
    {
        document.body.style.filter = "brightness(0.5)"
        dirDialog.showModal();
    } 
    else 
    {
        document.body.style.filter = ""
        dirDialog.close();
    }
}

function switchRenameDirDialog()
{
    if(!renameDirDialog.open)
    {
        document.body.style.filter = "brightness(0.5)"
        renameDirDialog.showModal();
    } 
    else 
    {
        document.body.style.filter = ""
        renameDirDialog.close();
    }
}

function validateInput(sender)
{
    if(sender.value == "")
    {
        alert("Name can't be empty!")
        return false
    }
    return true
}