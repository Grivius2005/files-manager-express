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


    async createFile(fileName,ext)
    {
        let filePath = path.join(this.storagePath, `${fileName}.${ext}`);
        const check = await FileManager.ifExists(filePath)
        if(check)
        {
            fileName = fileName + "_copy_" + Date.now().toString()
            filePath = path.join(this.storagePath, `${fileName}.${ext}`);
        }
        try
        {
            const text = await FileManager.readFile(path.join(__dirname,"default-texts",`default.${ext}`))
            await fsPromises.writeFile(filePath,text)
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
        const check = await FileManager.ifExists(dirPath)
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

    async renameDir(dirName, oldDirPath)
    {
        let index = oldDirPath.length - 1
        while(oldDirPath[index] != "\\" && oldDirPath[index] != "/")
        {
            index-=1
        }
        const basePath = oldDirPath.substring(0,index)
        let newDirPath = path.join(basePath,dirName)
        if(newDirPath == oldDirPath)
        {
            return
        }
        const check = await FileManager.ifExists(newDirPath)
        if(check)
        {
            dirName = dirName + "_copy_" + Date.now().toString()
            newDirPath = path.join(basePath,dirName)
        }
        try
        {
            await fsPromises.rename(oldDirPath,newDirPath)
            this.storagePath = newDirPath;
            return newDirPath;
        }
        catch(ex)
        {
            throw new Error(`Rename dir error! (${ex})`)
        }
    }

    static async  deleteFile(filePath)
    {
        try
        {
            await fsPromises.unlink(filePath)
        }
        catch(ex)
        {
            throw new Error(`Delete file error! (${ex})`)
        }
    }

    static async deleteDir(dirPath)
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

    static async uploadCheck(filePath)
    {
        const baseName = path.basename(filePath)
        const normalName = baseName.substring(0,baseName.indexOf("_copy_")) + path.extname(filePath)
        try
        {
            FileManager.renameFile(path.basename(normalName,path.extname(normalName)),path.extname(normalName),filePath)
        }
        catch(ex)
        {
            throw new Error(`Upload check file error! (${ex})`)
        }
 
    }

    static async readFile(filePath)
    {
        if(!(await FileManager.ifExists(filePath)))
        {
            throw new Error(`Read file error! (No file on url: ${filePath})`)
        }
        try
        {
            return await fsPromises.readFile(filePath)
        }
        catch
        {
            throw new Error(`Read file error! (${ex})`)
        }

    }

    static async saveFile(content,filePath)
    {
        if(!(await FileManager.ifExists(filePath)))
        {
            throw new Error(`Save file error! (No file on url: ${filePath})`)
        }
        else
        {
            const text = await FileManager.readFile(filePath)
        }
        try
        {
            await fsPromises.writeFile(filePath,content)
        }
        catch
        {
            throw new Error(`Save file error! (${ex})`)
        }
    }

    static async renameFile(fileName,newExt,oldFilePath)
    {
        let index = oldFilePath.length - 1
        while(oldFilePath[index] != "\\" && oldFilePath[index] != "/")
        {
            index-=1
        }
        const basePath = oldFilePath.substring(0,index)
        let newFilePath = path.join(basePath,fileName + newExt)
        if(newFilePath == oldFilePath)
        {
            return
        }
        const check = await FileManager.ifExists(newFilePath)
        if(check)
        {
            fileName = fileName + "_copy_" + Date.now().toString() + newExt
            newFilePath = path.join(basePath,fileName)
        }
        try
        {
            await fsPromises.rename(oldFilePath,newFilePath)
            return newFilePath;
        }
        catch(ex)
        {
            throw new Error(`Rename file error! (${ex})`)
        }

    }


    static async ifExists(dirFilePath)
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