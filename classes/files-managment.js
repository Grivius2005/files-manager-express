const path = require("path")
const fsPromises = require("fs").promises

class FileManager
{
    storagePath = ""
    constructor(storagePath)
    {
        this.storagePath = storagePath
    }


    async getStorageData()
    {
        const res = await fsPromises.readdir(this.storagePath)
        const fullPathsData = res.map((file)=>{
            return path.join(this.storagePath,file)
        })
        const data = {
            files:[],
            folders:[]
        }

        for(let elem of fullPathsData)
        {
            if(FileManager.isFile(elem))
            {
                data.files.push(elem)
            }
            else
            {
                data.folders.push(elem)
            }
        }

        return data;
    }


    async createTxtFile(fileName)
    {
        let filePath = path.join(this.storagePath, `${fileName}.txt`);
        const check = await this.ifExists(filePath)
        if(check)
        {
            fileName = fileName + "_copy_" + Date.now().toString()
            filePath = path.join(this.storagePath, `${fileName}.txt`);
        }
        try
        {
            await fsPromises.writeFile(filePath,"");
            return true;
        }
        catch(ex)
        {
            throw new Error(`Save file error! (${ex})`)
        }
    }


    async createFolder(folderName)
    {
        let folderPath = path.join(this.storagePath, `${folderName}`);
        const check = await this.ifExists(folderPath)
        if(check)
        {
            folderName = folderName + "_copy_" + Date.now().toString()
            folderPath = path.join(this.storagePath, `${folderName}`);
        }
        try
        {
            await fsPromises.mkdir(folderPath)
            return true;
        }
        catch(ex)
        {
            throw new Error(`Save folder error! (${ex})`)
        }
    }


    async ifExists(dirFilePath)
    {
        try
        {
            await fsPromises.access(dirFilePath)
            return true;
        }
        catch
        {
            return false;
        }
    }

    static isFile(dirFilePath)
    {
        const name = path.basename(dirFilePath)
        return name.includes(".");
    }
    

}







module.exports = FileManager