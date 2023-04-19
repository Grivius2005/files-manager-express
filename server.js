const express = require("express")
const app = express()
const hbs = require("express-handlebars")
const bodyParser = require("body-parser")
const path = require("path")
const PORT = process.env.PORT || 3000
const FileManager = require("./operations/files-managment")
const fManager = new FileManager(path.join(__dirname,"/files"))

app.use(express.static("static"))
app.use(bodyParser.urlencoded({extended:true}))
app.set("views",path.join(__dirname,"views"))
app.engine("hbs",hbs({
    defaultLayout: 'main.hbs',
    extname: '.hbs',
    partialsDir: "views/partials",
    helpers: {

    }
}))
app.set("view engine","hbs")
app.use(express.json())


app.get("/",(req,res)=>{
    res.render("home.hbs")
})

app.post("/addFile",(req,res)=>{
    fManager.readTxtFile("file01").then((data)=>{
        console.log(data)
    })
    res.redirect("/")
})


app.listen(PORT,()=>{
    console.log(`Server works on port: ${PORT}`)
})



