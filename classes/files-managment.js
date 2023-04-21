const path = require("path")
const fs = require("fs")
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

    async createTxtFile(fileName)
    {
        let filePath = path.join(this.storagePath, `${fileName}.txt`);
        if(this.checkIfExists(filePath))
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
        if(this.checkIfExists(folderPath))
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
            throw new Error(`Save file error! (${ex})`)
        }
    }

    static isFile(dirFilePath)
    {
        const name = path.basename(dirFilePath)
        return name.includes(".");
    }

    async checkIfExists(dirFilePath)
    {
        return fsPromises.access(dirFilePath, fs.constants.F_OK)
        .then(()=>true)
        .catch(()=>false)
    }

}




module.exports = FileManager