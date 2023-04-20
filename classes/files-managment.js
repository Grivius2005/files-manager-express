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

    static isFile(dirFilePath)
    {
        const name = path.basename(dirFilePath)
        return name.includes(".");
    }

}




module.exports = FileManager