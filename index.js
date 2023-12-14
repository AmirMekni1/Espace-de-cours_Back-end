const exp = require('express');
const Shema_Etudiant = require("./Route/R_Etudiant");  
const Shema_Enseignant = require("./Route/R_Enseignant"); 
const schema_Matiere = require("./Route/R_Matiere.js");
require("./Connexion/DataBase");         
const app = exp();
app.use(exp.json());
app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Origin','*')
    res.setHeader('Access-Control-Request-Method','*')
    res.setHeader('Access-Control-Allow-Headers','*')
    next()
})
app.use("/GetImage",exp.static("./Images"))
app.use("/GetImageMatiere",exp.static("./ImagesMatiere"))
app.use("/Etudiant",Shema_Etudiant);
app.use("/Enseignant",Shema_Enseignant);
app.use("/Matiere",schema_Matiere);
app.listen(3000,()=>{
    console.log("server work");
})