const fileDialog = document.getElementById("fileDialog")
const folderDialog = document.getElementById("folderDialog")

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

function switchFolderDialog()
{
    if(!folderDialog.open)
    {
        folderDialog.showModal();
    } 
    else 
    {
        folderDialog.close();
    }
}