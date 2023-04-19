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
            throw new Error(`Read file error! (${ex})`)
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
            throw new Error(`Save file error! (${ex})`)
        }
    }
}

module.exports = FileManager