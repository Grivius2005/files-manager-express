const path = require("path")
const fsPromises = require("fs").promises

class FileManager
{
    storagePath = ""
    constructor(storagePath)
    {
        this.storagePath = storagePath
    }


    async getStorageData(baseStorePath)
    {
        let res = await fsPromises.readdir(this.storagePath)
        res = res.filter((file)=>{
            return !(file[0] == ".")
        })
        const pathsData = res.map((file)=>{
            const full =  path.join(this.storagePath,file)
            return full.replace(baseStorePath,"")
        })

        const data = {
            files:[],
            dirs:[]
        }

        for(let elem of pathsData)
        {
            const fullPath = path.join(baseStorePath,elem)
            const res = await FileManager.isFile(fullPath)
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
            throw new Error(`Create file error! (${ex})`)
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
            throw new Error(`Create dir error! (${ex})`)
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
            await fsPromises.rm(dirPath,{ recursive: true })
        }
        catch(ex)
        {
            throw new Error(`Delete directory error! (${ex})`)
        }

    }

    async renameDir(dirName, oldDirPath)
    {
        let newDirPath = path.join(oldDirPath.replace(path.basename(oldDirPath),""), `${dirName}`);
        if(newDirPath == oldDirPath)
        {
            return
        }
        const check = await this.ifExists(newDirPath)
        if(check)
        {
            dirName = dirName + "_copy_" + Date.now().toString()
            newDirPath  = path.join(oldDirPath.replace(path.basename(oldDirPath),""), `${dirName}`);
        }
        try
        {
            await fsPromises.rename(oldDirPath,newDirPath)
            this.storagePath = newDirPath;
            return true;
        }
        catch(ex)
        {
            throw new Error(`Save dir error! (${ex})`)
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

    static async tryAccess(path)
    {
        try
        {
            await fsPromises.access(path)
            return true;
        }
        catch
        {            
            return false;
        }
    }

    
}






module.exports = FileManager