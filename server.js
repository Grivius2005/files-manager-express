const express = require("express")
const app = express()
const hbs = require("express-handlebars")
const path = require("path")
const PORT = process.env.PORT || 3000
const formats = require("./data/formats.json")
const baseStorePath = path.join(__dirname,"upload")
const FileManager = require("./classes/files-managment")
const fManager = new FileManager(baseStorePath)
const formidable = require("formidable")

app.set("views",path.join(__dirname,"views"))
app.engine("hbs",hbs({
    defaultLayout: 'main.hbs',
    extname: '.hbs',
    partialsDir: "views/partials",
    helpers: {
        getFileName: (filePath)=>{
            let name = path.basename(filePath);
            if(name.substring(0,name.lastIndexOf(".")).length > 12)
            {
                name = name.substring(0,12) + "[...]" + path.extname(filePath)
            }
            return name;
        },
        getDirName: (dirPath)=>{
            let name = path.basename(dirPath);
            if(name.length > 12)
            {
                name = name.substring(0,12) + "[...]"
            }
            return name;
        },
        getExtention: (filePath)=>{
            const ext = (path.extname(filePath)).replace(".","").toLowerCase();
            return formats.includes(ext) ? ext : "default"
        },
        pathFormat: (dirPath)=>{
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
                for(let j=i;j>=0;j--)
                {
                    newFullPath = path.join(newFullPath,pathParts[j])
                }
                pathObjects.push({
                    full:newFullPath,
                    short:pathParts[i]
                })
            }
            return pathObjects
        },
        isInDir: (dirPath) => {
            return dirPath != "" && dirPath != "\\" && dirPath != "/"
        }
    }
}))
app.set("view engine","hbs")
app.use(express.json())



app.get("/",(req,res)=>{
    if(req.query.path == undefined)
    {
        fManager.getStorageData(baseStorePath)
        .then((data)=>{
            const ctx = {
                title:"Home",
                storageData:data,
                currentPath:fManager.storagePath.replace(baseStorePath,"")
            }
            res.render("home.hbs",ctx)
        })
    }
    else if(req.query.path == "")
    {
        fManager.storagePath = baseStorePath
        res.redirect("/")
    }
    else
    {
        const newPath = getFullPath(req.query.path)
        FileManager.tryAccess(newPath).then((check)=>{
            if(check)
            {
                fManager.storagePath = newPath
            }
            res.redirect("/")
        })
    }

})




app.post("/addTxtFile",(req,res)=>{
    let form = formidable({})
    form.parse(req, (err,fields,files)=>{
        const filename = fields.filename
        fManager.createTxtFile(filename)
        .then(()=>{
            res.redirect("/")
        })
        .catch((err)=>{
            console.log(err)
            res.redirect("/")
        })
    })


})

app.post("/addDir",(req,res)=>{
    let form = formidable({})
    form.parse(req, (err,fields,files)=>{
        const dirname = fields.dirname
        fManager.createDir(dirname)
        .then(()=>{
            res.redirect("/")
        })
        .catch((err)=>{
            console.log(err)
            res.redirect("/")
        })
    })
})

app.post("/delFile",(req,res)=>
{
    let form = formidable({})
    form.parse(req, (err,fields,files)=>{
        const filePath = getFullPath(fields.path)
        fManager.deleteFile(filePath)
        .then(()=>{
            res.redirect("/")
        })
        .catch((err)=>{
            console.log(err)
            res.redirect("/")
        })
    })


})


app.post("/delDir",(req,res)=>
{
    let form = formidable({})
    form.parse(req, (err,fields,files)=>{
        const dirPath = getFullPath(fields.path)
        fManager.deleteDir(dirPath)
        .then(()=>{
            res.redirect("/")
        })
        .catch((err)=>{
            console.log(err)
            res.redirect("/")
        })
    })


})

app.get("/getFile",(req,res)=>
{
    if(req.query.path != undefined)
    {
        const filePath = getFullPath(req.query.path)
        res.sendFile(filePath)
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
        res.download(filePath)
    })
})

app.post("/upload",(req,res)=>
{
    let form = formidable({})
    form.uploadDir = fManager.storagePath
    form.keepExtensions = true
    form.multiples = true
    form.on("fileBegin",async (name, file)=>{
        file.path = form.uploadDir + "/" + file.name;
        if(await fManager.ifExists(file.path))
        {
            file.path = form.uploadDir + "/" + file.name.substring(0,file.name.lastIndexOf(".")) + "_copy_" + Date.now().toString() + path.extname(file.name)
        }
    })
    form.parse(req,(err, fields, files) => 
    {
        res.redirect("/")
    });
})

app.post("/renameDir",(req,res)=>{
    let form = formidable({})
    form.parse(req, (err,fields,files)=>{
        const dirname = fields.dirname
        const oldDirPath = getFullPath(fields.oldDirPath)
        fManager.renameDir(dirname,oldDirPath)
        .then(()=>{
            res.redirect("/")
        })
        .catch((err)=>{
            console.log(err)
            res.redirect("/")
        })
    })
})




app.use(express.static("static"))

app.listen(PORT,()=>{
    console.log(`Server works on port: ${PORT}`)
})


function getFullPath(part)
{
    return path.join(baseStorePath,part)
}



