const fileDialog = document.getElementById("fileDialog")
const dirDialog = document.getElementById("dirDialog")

function switchTxtFileDialog()
{
    if(!fileDialog.open)
    {
        fileDialog.showModal();
    } 
    else 
    {
        fileDialog.close();
    }

}

function switchDirDialog()
{
    if(!dirDialog.open)
    {
        dirDialog.showModal();
    } 
    else 
    {
        dirDialog.close();
    }
}