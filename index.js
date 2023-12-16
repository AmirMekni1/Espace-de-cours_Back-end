const exp = require('express');
const Shema_Etudiant = require("./Route/R_Etudiant");  
const Shema_Enseignant = require("./Route/R_Enseignant"); 
const schema_Matiere = require("./Route/R_Matiere.js");
const schema_Classe = require("./Route/R_Classe.js");
const session = require('express-session');
const cors = require('cors');
require("./Connexion/DataBase");         
const app = exp();
app.use(cors());
app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Origin','*')
    res.setHeader('Access-Control-Request-Method','*')
    res.setHeader('Access-Control-Allow-Headers','*')
    next()
})
app.use(exp.json());
app.use(session({
    secret: '24884920', 
    resave: true,
    saveUninitialized: true,
  }));

app.use("/GetImage",exp.static("./Images"))
app.use("/GetImageMatiere",exp.static("./ImagesMatiere"))
app.use("/GetImageClasse",exp.static("./ImagesClasse"))
app.use("/Etudiant",Shema_Etudiant);
app.use("/Enseignant",Shema_Enseignant);
app.use("/Matiere",schema_Matiere);
app.use("/Classe",schema_Classe);
app.listen(3000,()=>{
    console.log("server work");
})