const fileDialog = document.getElementById("fileDialog")
const folderDialog = document.getElementById("folderDialog")

function switchTxtFileDialog()
{
    return false;
    if(!fileDialog.open)
    {
        fileDialog.showModal();
    } 
    else 
    {
        fileDialog.close();
    }

}

function switchFolderDialog()
{
    return false;
    if(!folderDialog.open)
    {
        folderDialog.showModal();
    } 
    else 
    {
        folderDialog.close();
    }
}