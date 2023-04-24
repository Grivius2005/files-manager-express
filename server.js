const express = require("express")
const app = express()
const hbs = require("express-handlebars")
const path = require("path")
const PORT = process.env.PORT || 3000
const formats = require("./data/formats.json")
const FileManager = require("./classes/files-managment")
const fManager = new FileManager(path.join(__dirname,"upload"))
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
        }
    }
}))
app.set("view engine","hbs")
app.use(express.json())



app.get("/",(req,res)=>{

    fManager.getStorageData()
    .then((data)=>{
        const ctx = {
            title:"Home",
            storageData:data,
        }
        res.render("home.hbs",ctx)
    })
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
        fManager.deleteFile(fields.path)
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
        fManager.deleteDir(fields.path)
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
        res.download(req.query.path)
        return
    }
    res.redirect("/")
})

app.post("/upload",(req,res)=>
{
    let form = formidable({})
    form.uploadDir = path.join(__dirname,"upload")
    form.keepExtensions = true
    form.multiples = true
    form.parse(req,(err, fields, files) => 
    {
        if(JSON.stringify(files) == "{}")
        {
            res.redirect("/")
            return
        }
        if(!files.uploadFiles.length)
        {
            fManager.uploadFile(files.uploadFiles.path,files.uploadFiles.name)
            .catch((err)=>{
                console.log(err)
            })
        }
        else
        {
            for(let i=0;i<files.uploadFiles.length;i++)
            {
                fManager.uploadFile(files.uploadFiles[i].path,files.uploadFiles[i].name)
                .catch((err)=>{
                    console.log(err)
                })
            } 
        }
        res.redirect("/")
    });
})




app.use(express.static("static"))

app.listen(PORT,()=>{
    console.log(`Server works on port: ${PORT}`)
})



