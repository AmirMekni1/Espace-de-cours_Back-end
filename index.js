const exp = require('express');
const Shema_Etudiant = require("./Route/R_Etudiant");  
require("./Connexion/DataBase");         
const app = exp();
app.use(exp.json());

app.use("/Etudiant",Shema_Etudiant);
app.listen(3000,()=>{
    console.log("server work");
})