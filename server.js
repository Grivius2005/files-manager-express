const express = require("express")
const app = express()
const hbs = require("express-handlebars")
const bodyParser = require("body-parser")
const path = require("path")
const PORT = process.env.PORT || 3000
const FileManager = require("./classes/files-managment")
const fManager = new FileManager(path.join(__dirname,"/upload"))


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
    const ctx = {
        title:"Home"
    }
    res.render("home.hbs",ctx)
})

app.post("/addFile",(req,res)=>{

    res.redirect("/")
})

app.use(express.static("static"))

app.listen(PORT,()=>{
    console.log(`Server works on port: ${PORT}`)
})



