const mongo = require("mongoose");

const EnseignantModel = mongo.model("Enseignant",{
 
    NomPrenom     :     {type : String},
    Email         :     {type : String},
    Mot_De_Pass   :     {type : String},
    Verification  :     {type : String , default : false},
    Role          :     {type : String},
    image         :     {type : String},
    CDCE          :     {type : String},
    RESET         :     {type : String , default : ""},
    RESET_EXP     :     {type : Date},
   
});
module.exports = EnseignantModel;
