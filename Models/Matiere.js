const mongo = require("mongoose");

const MatiereModel = mongo.model("Matiere",{
    
    Email             :     {type : String, default : "" },
    NomMatier         :     {type : String, default : "" },
    Telephone         :     {},
    image             :     {type : String, default : "" },
    Classe            :     {type : String, default : "" },
    cle_Etudiant      :     {type : String, default : "" },
    Les_Etudiants     :     []
    
});
module.exports = MatiereModel
