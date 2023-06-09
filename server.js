const express = require("express")
const app = express()
const hbs = require("express-handlebars")
const path = require("path")
const PORT = process.env.PORT || 3000
const formats = require("./data/formats.json")
const colorPalettes = require("./data/color-palettes.json")
const filters = require("./data/filters.json")
const baseStorePath = path.join(__dirname,"upload")
const userDataPath = path.join(__dirname,"data","logins.json")
const FileManager = require("./classes/files-managment")
const fManager = new FileManager(baseStorePath)
const formidable = require("formidable")
const cookieparser = require("cookie-parser");
const crypto = require("crypto")



let editorStyling = {
    fontSize:15,
    colorPalettes:colorPalettes[0],
    colorPalettesIndex:0
}


function checkLogin()
{
    return (req,res,next) =>{
        if(req.path.includes("login") || req.path.includes("register") )
        {
            next()
        }
        else if(!req.cookies.login)
        {
            res.redirect("/login?info=3")
        }
        else
        {
            next()
        }
    }
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
        OR:(a,b)=>{
            return a || b
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
        },
        makeFilter: (filter)=>{
            return filter == "none" ? filter : `${filter}(100%)`;
        }
    }
}))

app.set("view engine","hbs")
app.use(express.json({limit: '100mb'}))
app.use(cookieparser())
app.use(express.static("static"))
app.use(checkLogin())


app.get("/",(req,res)=>{
    res.redirect("/login")
})


app.get("/login",(req,res)=>{
    if(req.cookies.login)
    {
        res.redirect("/home")
        return
    }
    const {info} = req.query
    let ctx = {
        title:"Login",
    }
    if(info == 1)
    {
        ctx = {...ctx, info:"Incorrect login data!"}
    }
    else if(info == 2)
    {
        ctx = {...ctx, info:"You have been logout!"}
    }
    else if(info == 3)
    {
        ctx = {...ctx, info:"You are not logged!"}
    }

    res.render("login.hbs",ctx)
})

app.post("/login",(req,res)=>{
    FileManager.readFile(userDataPath)
    .then((userdata)=>{
        let objUserData = JSON.parse(userdata.toString())
        let form = formidable({})
        form.parse(req, (err,fields,files)=>{
            const {login,password} = fields
            const index = objUserData.findIndex((user)=>{
                const hashPass = crypto.createHash("sha256").update(password).digest('hex')
                return user.login == login && user.password == hashPass
            })

            if(index < 0)
            {
                res.redirect("/login?info=1")
            }
            else
            {
                res.cookie("login",login,{ httpOnly: true, maxAge: 15 * 60 * 1000 })
                res.redirect("/home")
            }

        })
    })
    
})


app.get("/logout",(req,res)=>{
    res.clearCookie("login");
    res.redirect("/login?info=2")
})


app.get("/register",(req,res)=>{
    if(req.cookies.login)
    {
        res.redirect("/home")
        return
    }
    const {info} = req.query
    let ctx = {
        title:"Register",
    }
    if(info == 1)
    {
        ctx = {...ctx, info:"User exists!"}
    }

    res.render("register.hbs",ctx)
})
app.post("/register",(req,res)=>{
    FileManager.readFile(userDataPath)
    .then((userdata)=>{
        let objUserData = JSON.parse(userdata.toString())
        let form = formidable({})
        form.parse(req, (err,fields,files)=>{
            const {login,password} = fields
            const users = objUserData.map(user=>user.login)
            if(users.includes(login))
            {
                res.redirect("/register?info=1")
            }
            else
            {
                const hashPass = crypto.createHash("sha256").update(password).digest('hex')
                objUserData.push({login,password:hashPass})
                FileManager.saveFile(JSON.stringify(objUserData),userDataPath).then(()=>{
                    FileManager.createDir(baseStorePath,login).then(()=>{
                        res.redirect("/login")
                    })
                })
            }

        })
    })
})



app.get("/home",(req,res)=>{
    const user = req.cookies.login
    if(req.query.path == undefined || req.query.path == "")
    {
        fManager.storagePath = getFullPath(user)
        fManager.getStorageData(getFullPath(user))
        .then((data)=>{
            const ctx = {
                title:"Home",
                storageData:data,
                currentPath:fManager.storagePath.replace(getFullPath(user),""),
                editableExt:formats.editable,
                imageExt:formats.image
            }
            res.render("home.hbs",ctx)
        })
    }
    else
    {
        const newPath = getFullPath(path.join(user,req.query.path))
        FileManager.tryAccess(newPath)
        .then((check)=>{
            if(check)
            {
                fManager.storagePath = newPath
            }
            else
            {
                res.redirect("/home")
                return
            }
            fManager.getStorageData(getFullPath(user))
            .then((data)=>{
                const ctx = {
                    title:"Home",
                    storageData:data,
                    currentPath:fManager.storagePath.replace(getFullPath(user),""),
                    editableExt:formats.editable,
                    imageExt:formats.image
                }
                res.render("home.hbs",ctx)
            })
        })
    }

})



app.post("/addFile",(req,res)=>{
    const user = req.cookies.login
    let form = formidable({})
    form.parse(req, (err,fields,files)=>{
        const filename = fields.filename
        const ext = fields.ext
        fManager.storagePath = getFullPath(path.join(user,fields.currentPath))
        fManager.createFile(filename,ext)
        .then(()=>{
            res.redirect(`/home?path=${fields.currentPath}`)
        })
        .catch((err)=>{
            console.log(err)
            res.redirect(`/home`)
        })
    })


})

app.post("/addDir",(req,res)=>{
    const user = req.cookies.login
    let form = formidable({})
    form.parse(req, (err,fields,files)=>{
        const dirname = fields.dirname
        fManager.storagePath = getFullPath(path.join(user,fields.currentPath))
        fManager.createDir(dirname)
        .then(()=>{
            res.redirect(`/home?path=${fields.currentPath}`)
        })
        .catch((err)=>{
            console.log(err)
            res.redirect(`/home`)
        })
    })
})

app.post("/delFile",(req,res)=>
{
    const user = req.cookies.login
    let form = formidable({})
    form.parse(req, (err,fields,files)=>{
        const filePath = getFullPath(path.join(user,fields.path))
        console.log(filePath)
        FileManager.deleteFile(filePath)
        .then(()=>{
            res.redirect(`/home?path=${fields.currentPath}`)
        })
        .catch((err)=>{
            console.log(err)
            res.redirect(`/home`)
        })
    })


})


app.post("/delDir",(req,res)=>
{
    const user = req.cookies.login
    let form = formidable({})
    form.parse(req, (err,fields,files)=>{
        const dirPath = getFullPath(path.join(user,fields.path))
        FileManager.deleteDir(dirPath)
        .then(()=>{
            res.redirect(`/home?path=${fields.currentPath}`)
        })
        .catch((err)=>{
            console.log(err)
            res.redirect(`/home`)
        })
    })


})

app.get("/getFile",(req,res)=>
{
    const user = req.cookies.login
    if(req.query.path != undefined)
    {
        const filePath = getFullPath(path.join(user,req.query.path))
        FileManager.ifExists(filePath).then(data=>{
            if(data)
            {
                res.sendFile(filePath)
            }
            else
            {
                res.redirect("/home")
            }
        })

    }
    else
    {
        res.redirect("/home")
    }

})

app.post("/downloadFile",(req,res)=>
{
    const user = req.cookies.login
    let form = formidable({})
    form.parse(req, (err,fields,files)=>{
        const filePath = getFullPath(path.join(user,fields.path))
        FileManager.ifExists(filePath).then(data=>{
            if(data)
            {
                res.download(filePath)
            }
            else
            {
                res.redirect("/home")
            }

        })
    })
})

app.post("/upload",(req,res)=>
{
    const user = req.cookies.login
    const uploadPath = getFullPath(path.join(user,req.query.path))
    FileManager.tryAccess(uploadPath)
    .then((check)=>{
        if(!check)
        {
            res.redirect("/home")
            return
        }
        let form = formidable({})
        form.uploadDir = uploadPath
        form.keepExtensions = true
        form.multiples = true
        form.on("error",(err)=>{
            res.redirect("/home")
        })
        form.on("fileBegin", (name, file)=>{
            file.path = form.uploadDir + "/" + file.name.substring(0,file.name.lastIndexOf(".")) + "_copy_" + Date.now().toString() + path.extname(file.name)
        })
        form.on("file",async (name,file)=>{
            FileManager.uploadCheck(file.path)
            .catch((err)=>{
                res.redirect("/home")
            })
        })
        form.parse(req,(err, fields, files) => 
        {
            res.redirect(`/home?path=${req.query.path}`)
        });
    })
})

app.post("/renameDir",(req,res)=>{
    const user = req.cookies.login
    let form = formidable({})
    form.parse(req, (err,fields,files)=>{
        const dirname = fields.dirname
        const oldDirPath = getFullPath(path.join(user,fields.oldDirPath))
        fManager.renameDir(dirname,oldDirPath)
        .then((newDirPath)=>{
            res.redirect(`/home?path=${newDirPath.replace(getFullPath(user),"")}`)
        })
        .catch((err)=>{
            console.log(err)
            res.redirect("/home")
        })
    })
})

app.post("/renameFile",(req,res)=>{
    const user = req.cookies.login
    let form = formidable({})
    form.parse(req, (err,fields,files)=>{
        const filename = fields.filename
        const ext = fields.ext === undefined ? fields.defaultExt : fields.ext
        const oldFilePath = getFullPath(path.join(user,fields.oldFilePath))
        FileManager.renameFile(filename,ext,oldFilePath)
        .then((newFilePath)=>{
            if(formats.image.includes(path.extname(newFilePath).replace(".","")))
            {
                res.redirect(`/imageview?path=${newFilePath.replace(getFullPath(user),"")}`)
            }
            else
            {
                res.redirect(`/editor?path=${newFilePath.replace(getFullPath(user),"")}`)
            }
        })
        .catch((err)=>{
            console.log(err)
            res.redirect("/home")
        })
    })
})

app.get("/editor",(req,res)=>
{
    const user = req.cookies.login
    if(req.query.path != undefined)
    {
        const filePath = getFullPath(path.join(user,req.query.path))
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
            res.redirect("/home")
        })
    }
    else
    {
        res.redirect("/home")
    }
})

app.post("/editor",(req,res)=>{
    const user = req.cookies.login
    res.setHeader("Content-Type","text/plain")
    const {newContent,filePath} = req.body
    FileManager.saveFile(newContent,getFullPath(path.join(user,filePath)))
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
    const user = req.cookies.login
    if(req.query.path != undefined)
    {
        const ctx = {
            title:"Image View",
            filePath:req.query.path,
            imageExt:formats.image,
            filters:filters
        }
        res.render("imageview.hbs",ctx)
    }
    else
    {
        res.redirect("/home")
    }
})

app.post("/imageview",(req,res)=>{
    const user = req.cookies.login
    const fullPath = getFullPath(path.join(user,req.query.path))
    let form = formidable({})
    form.on("error",(err)=>{
        console.log(err)
        res.send(err.toString())
    })
    form.on("fileBegin", (name, file)=>{
        file.path = fullPath
    })
    form.parse(req,(err,fields,files)=>{
        res.send("")
    })
})



app.listen(PORT,()=>{
    console.log(`Server works on port: ${PORT}`)
})


function getFullPath(part)
{
    return path.join(baseStorePath,part)
}


