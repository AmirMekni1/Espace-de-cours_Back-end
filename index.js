const exp = require('express');
const Shema_Etudiant = require("./Route/R_Etudiant");  
const Shema_Enseignant = require("./Route/R_Enseignant"); 
require("./Connexion/DataBase");         
const app = exp();
app.use(exp.json());

app.use("/Etudiant",Shema_Etudiant);
app.use("/Enseignant",Shema_Enseignant);
app.listen(3000,()=>{
    console.log("server work");
})