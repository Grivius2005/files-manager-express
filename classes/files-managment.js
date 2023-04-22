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
            dirs:[]
        }

        for(let elem of fullPathsData)
        {
            const res = await FileManager.isFile(elem)
            if(res)
            {
                data.files.push(elem)
            }
            else
            {
                data.dirs.push(elem)
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


    async createDir(dirName)
    {
        let dirPath = path.join(this.storagePath, `${dirName}`);
        const check = await this.ifExists(dirPath)
        if(check)
        {
            dirName = dirName + "_copy_" + Date.now().toString()
            dirPath = path.join(this.storagePath, `${dirName}`);
        }
        try
        {
            await fsPromises.mkdir(dirPath)
            return true;
        }
        catch(ex)
        {
            throw new Error(`Save dir error! (${ex})`)
        }
    }

    async deleteFile(filePath)
    {
        try
        {
            await fsPromises.unlink(filePath)
        }
        catch(ex)
        {
            throw new Error(`Delete directory error! (${ex})`)
        }
    }


    async deleteDir(dirPath)
    {
        try
        {
            await fsPromises.rmdir(dirPath)
        }
        catch(ex)
        {
            throw new Error(`Delete directory error! (${ex})`)
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

    static async isFile(dirFilePath)
    {
        return await fsPromises.lstat(dirFilePath)
        .then(res=>!res.isDirectory());
    }
    

}







module.exports = FileManager