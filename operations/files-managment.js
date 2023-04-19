const path = require("path")
const fsPromises = require("fs").promises

class FileManager
{
    #storagePath
    constructor(storagePath)
    {
        this.storagePath = storagePath
    }

    async readTxtFile(fileName)
    {
        const filePath = path.join(this.storagePath, `${fileName}.txt`);
        try
        {
            const data = await fsPromises.readFile(filePath,"utf-8");
            return data
        }
        catch(ex)
        {
            console.log(`Read file error (${ex})`)
            return null
        } 
    }

    async saveTxtFile(fileName)
    {
        const filePath = path.join(this.storagePath, `${fileName}.txt`);
        try
        {
            await fsPromises.writeFile(filePath,"test");
            return true;
        }
        catch(ex)
        {
            console.log(`Save file error (${ex})`)
            return false
        }
    }
}

module.exports = FileManager