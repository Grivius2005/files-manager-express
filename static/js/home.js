const fileDialog = document.getElementById("fileDialog")
const dirDialog = document.getElementById("dirDialog")

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