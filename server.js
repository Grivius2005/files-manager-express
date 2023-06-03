const express = require("express")
const app = express()
const hbs = require("express-handlebars")
const path = require("path")
const PORT = process.env.PORT || 3000
const formats = require("./data/formats.json")
const colorPalettes = require("./data/color-palettes.json")
const baseStorePath = path.join(__dirname,"upload")
const FileManager = require("./classes/files-managment")
const fManager = new FileManager(baseStorePath)
const formidable = require("formidable")

let editorStyling = {
    fontSize:15,
    colorPalettes:colorPalettes[0],
    colorPalettesIndex:0
}



app.set("views",path.join(__dirname,"views"))
app.engine("hbs",hbs({
    defaultLayout: 'main.hbs',
    extname: '.hbs',
    partialsDir: "views/partials",
    helpers: {
        isEqual:(a,b)=>{
            return a==b
        },
        getFileName: (filePath)=>{
            let name = path.basename(filePath);
            if(name.substring(0,name.lastIndexOf(".")).length > 12)
            {
                name = name.substring(0,12) + "[...]" + path.extname(filePath)
            }
            return name;
        },
        getFileNameForInput:(filePath)=>{
            return path.parse(filePath).name;
        },
        getDirName: (dirPath)=>{
            let name = path.basename(dirPath);
            if(name.length > 12)
            {
                name = name.substring(0,12) + "[...]"
            }
            return name;
        },
        getExtension: (filePath)=>{
            const ext = (path.extname(filePath)).replace(".","").toLowerCase();
            return formats.all.includes(ext) ? ext : "default"
        },
        getDirPath:(filePath)=>{
            let index = filePath.length - 1
            while(filePath[index] != "\\" && filePath[index] != "/")
            {
                index-=1
            }
            return filePath.substring(0,index)
        },
        pathDirFormat: (dirPath)=>{
            let pathParts = dirPath.includes("/") ? dirPath.split("/") : dirPath.split("\\")
            pathParts = pathParts.filter((part=>part))
            const pathObjects = [
                {
                    full: "",
                    short: "home"
                }
            ]
            for(let i=0;i<pathParts.length;i++)
            {
                let newFullPath = ""
                for(let j=0;j<i+1;j++)
                {
                    newFullPath = path.join(newFullPath,pathParts[j])
                }

                pathObjects.push({
                    full:newFullPath,
                    short: pathParts[i].length > 12 ? pathParts[i].substring(0,12) + "[...]" : pathParts[i]
                })
            }
            return pathObjects
        },
        pathFileFormat:(filePath)=>{
            let pathParts = filePath.includes("/") ? filePath.split("/") : filePath.split("\\")
            pathParts = pathParts.filter((part=>part))
            const pathObjects = [
                {
                    full: "",
                    short: "home"
                }
            ]
            for(let i=0;i<pathParts.length;i++)
            {
                let newFullPath = ""
                for(let j=0;j<i+1;j++)
                {
                    newFullPath = path.join(newFullPath,pathParts[j])
                }
                let shortPath = pathParts[i]
                if(i==pathParts.length-1)
                {
                    const ext = path.extname(shortPath)
                    const extIndex = shortPath.lastIndexOf(ext)
                    shortPath = shortPath.substring(0,extIndex).length > 12 ? shortPath.substring(0,12) + "[...]" + ext : shortPath
                    pathObjects.shift()
                }
                else
                {
                    shortPath = shortPath.length > 12 ? shortPath.substring(0,12) + "[...]" : shortPath
                }
                

                pathObjects.push({
                    full:newFullPath,
                    short: shortPath
                })
            }
            return pathObjects
        },
        isInDir: (dirPath) => {
            return dirPath != "" && dirPath != "\\" && dirPath != "/"
        },
        isEditable:(filePath)=>{
            return formats.editable.includes(path.extname(filePath).replace(".","").toLowerCase())
        },
        isImage:(filePath)=>{
            return formats.image.includes(path.extname(filePath).replace(".","").toLowerCase())
        },
        safeFileFormat:(filePath)=>{
            return filePath.split("").map((char)=>char == "\\" ? "\\\\" : char).join("")
        }
    }
}))
app.set("view engine","hbs")
app.use(express.json())



app.get("/",(req,res)=>{
    if(req.query.path == undefined || req.query.path == "")
    {
        fManager.storagePath = baseStorePath
        fManager.getStorageData(baseStorePath)
        .then((data)=>{
            const ctx = {
                title:"Home",
                storageData:data,
                currentPath:fManager.storagePath.replace(baseStorePath,""),
                editableExt:formats.editable,
                imageExt:formats.image
            }
            res.render("home.hbs",ctx)
        })
    }
    else
    {
        const newPath = getFullPath(req.query.path)
        FileManager.tryAccess(newPath)
        .then((check)=>{
            if(check)
            {
                fManager.storagePath = newPath
            }
            else
            {
                res.redirect("/")
                return
            }
            fManager.getStorageData(baseStorePath)
            .then((data)=>{
                const ctx = {
                    title:"Home",
                    storageData:data,
                    currentPath:fManager.storagePath.replace(baseStorePath,""),
                    editableExt:formats.editable,
                    imageExt:formats.image
                }
                res.render("home.hbs",ctx)
            })
        })
    }

})



app.post("/addFile",(req,res)=>{
    let form = formidable({})
    form.parse(req, (err,fields,files)=>{
        const filename = fields.filename
        const ext = fields.ext
        fManager.storagePath = path.join(baseStorePath,fields.currentPath)
        fManager.createFile(filename,ext)
        .then(()=>{
            res.redirect(`/?path=${fields.currentPath}`)
        })
        .catch((err)=>{
            console.log(err)
            res.redirect(`/`)
        })
    })


})

app.post("/addDir",(req,res)=>{
    let form = formidable({})
    form.parse(req, (err,fields,files)=>{
        const dirname = fields.dirname
        fManager.storagePath = path.join(baseStorePath,fields.currentPath)
        fManager.createDir(dirname)
        .then(()=>{
            res.redirect(`/?path=${fields.currentPath}`)
        })
        .catch((err)=>{
            console.log(err)
            res.redirect(`/`)
        })
    })
})

app.post("/delFile",(req,res)=>
{
    let form = formidable({})
    form.parse(req, (err,fields,files)=>{
        const filePath = getFullPath(fields.path)
        FileManager.deleteFile(filePath)
        .then(()=>{
            res.redirect(`/?path=${fields.currentPath}`)
        })
        .catch((err)=>{
            console.log(err)
            res.redirect(`/`)
        })
    })


})


app.post("/delDir",(req,res)=>
{
    let form = formidable({})
    form.parse(req, (err,fields,files)=>{
        const dirPath = getFullPath(fields.path)
        FileManager.deleteDir(dirPath)
        .then(()=>{
            res.redirect(`/?path=${fields.currentPath}`)
        })
        .catch((err)=>{
            console.log(err)
            res.redirect(`/`)
        })
    })


})

app.get("/getFile",(req,res)=>
{
    if(req.query.path != undefined)
    {
        const filePath = getFullPath(req.query.path)
        FileManager.ifExists(filePath).then(data=>{
            if(data)
            {
                res.sendFile(filePath)
            }
            else
            {
                res.redirect("/")
            }
        })

    }
    else
    {
        res.redirect("/")
    }

})

app.post("/downloadFile",(req,res)=>
{
    let form = formidable({})
    form.parse(req, (err,fields,files)=>{
        const filePath = getFullPath(fields.path)
        FileManager.ifExists(filePath).then(data=>{
            if(data)
            {
                res.download(filePath)
            }
            else
            {
                res.redirect("/")
            }

        })
    })
})

app.post("/upload",(req,res)=>
{
    const uploadPath = path.join(baseStorePath,req.query.path)
    FileManager.tryAccess(uploadPath)
    .then((check)=>{
        if(!check)
        {
            res.redirect("/")
            return
        }
        let form = formidable({})
        form.uploadDir = uploadPath
        form.keepExtensions = true
        form.multiples = true
        form.on("error",(err)=>{
            res.redirect("/")
        })
        form.on("fileBegin", (name, file)=>{
            file.path = form.uploadDir + "/" + file.name.substring(0,file.name.lastIndexOf(".")) + "_copy_" + Date.now().toString() + path.extname(file.name)
        })
        form.on("file",async (name,file)=>{
            FileManager.uploadCheck(file.path)
            .catch((err)=>{
                res.redirect("/")
            })
        })
        form.parse(req,(err, fields, files) => 
        {
            res.redirect(`/?path=${req.query.path}`)
        });
    })
})

app.post("/renameDir",(req,res)=>{
    let form = formidable({})
    form.parse(req, (err,fields,files)=>{
        const dirname = fields.dirname
        const oldDirPath = getFullPath(fields.oldDirPath)
        fManager.renameDir(dirname,oldDirPath)
        .then((newDirPath)=>{
            res.redirect(`/?path=${newDirPath.replace(baseStorePath,"")}`)
        })
        .catch((err)=>{
            console.log(err)
            res.redirect("/")
        })
    })
})

app.post("/renameFile",(req,res)=>{
    let form = formidable({})
    form.parse(req, (err,fields,files)=>{
        const filename = fields.filename
        const ext = fields.ext === undefined ? fields.defaultExt : fields.ext
        const oldFilePath = getFullPath(fields.oldFilePath)
        FileManager.renameFile(filename,ext,oldFilePath)
        .then((newFilePath)=>{
            if(formats.image.includes(path.extname(newFilePath).replace(".","")))
            {
                res.redirect(`/imageview?path=${newFilePath.replace(baseStorePath,"")}`)
            }
            else
            {
                res.redirect(`/editor?path=${newFilePath.replace(baseStorePath,"")}`)
            }
        })
        .catch((err)=>{
            console.log(err)
            res.redirect("/")
        })
    })
})

app.get("/editor",(req,res)=>
{
    if(req.query.path != undefined)
    {
        const filePath = getFullPath(req.query.path)
        FileManager.readFile(filePath)
        .then((data)=>{
            const ctx = {
                title:"Editor",
                filePath:req.query.path,
                fileContent:data,
                editableExt:formats.editable,
                editorStyling:editorStyling
            }
            res.render("editor.hbs",ctx)
        })
        .catch((err)=>{
            console.log(err)
            res.redirect("/")
        })
    }
    else
    {
        res.redirect("/")
    }
})

app.post("/editor",(req,res)=>{
    res.setHeader("Content-Type","text/plain")
    const {newContent,filePath} = req.body
    FileManager.saveFile(newContent,getFullPath(filePath))
    .then(()=>{
        res.send("")
    })
    .catch((err)=>{
        console.log(err)
        res.send(err.toString())
    })
})

app.get("/editorStyling",(req,res)=>{
    res.setHeader("Content-Type","application/json")
    res.send(JSON.stringify(editorStyling))
})


app.post("/editorStyling",(req,res)=>{
    res.setHeader("Content-Type","application/json")
    const {fontSize, colorPalettesIndex} = req.body
    editorStyling.fontSize = fontSize
    editorStyling.colorPalettes = colorPalettes[colorPalettesIndex]
    editorStyling.colorPalettesIndex = colorPalettesIndex
    res.send(JSON.stringify(editorStyling))
})

app.get("/editorColorPalettes",(req,res)=>{
    res.setHeader("Content-Type","application/json")
    let index = req.query.index
    if(index >= colorPalettes.length)
    {
        index = 0
    }
    const palette = {
        colorPalettes:colorPalettes[index],
        colorPalettesIndex:index
    }
    res.send(JSON.stringify(palette))
})

app.get("/imageview",(req,res)=>{
    if(req.query.path != undefined)
    {
        const ctx = {
            title:"Image View",
            filePath:req.query.path,
            imageExt:formats.image
        }
        res.render("imageview.hbs",ctx)
    }
    else
    {
        res.redirect("/")
    }
})




app.use(express.static("static"))

app.listen(PORT,()=>{
    console.log(`Server works on port: ${PORT}`)
})


function getFullPath(part)
{
    return path.join(baseStorePath,part)
}


