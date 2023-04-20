const express = require("express")
const app = express()
const hbs = require("express-handlebars")
const bodyParser = require("body-parser")
const path = require("path")
const PORT = process.env.PORT || 3000
const formats = require("./data/formats.json")
const FileManager = require("./classes/files-managment")
const fManager = new FileManager(path.join(__dirname,"/upload"))

app.use(bodyParser.urlencoded({extended:true}))
app.set("views",path.join(__dirname,"views"))
app.engine("hbs",hbs({
    defaultLayout: 'main.hbs',
    extname: '.hbs',
    partialsDir: "views/partials",
    helpers: {
        getDirFileName: (dirFilePath)=>{
            return path.basename(dirFilePath);
        },
        getExtention: (filePath)=>{
            const ext = (path.extname(filePath)).replace(".","");
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
            storageData:data
        }
        res.render("home.hbs",ctx)
    })



})

app.post("/addFile",(req,res)=>{

    res.redirect("/")
})

app.use(express.static("static"))

app.listen(PORT,()=>{
    console.log(`Server works on port: ${PORT}`)
})



