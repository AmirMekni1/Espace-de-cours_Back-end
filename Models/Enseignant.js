const mongo = require("mongoose");

const EnseignantModel = mongo.model("Enseignant",{
 
    NomPrenom         :     {type : String},
    Email             :     {type : String},
    Mot_De_Pass       :     {type : String},
    Verification      :     {type : String , default : false},
    Role              :     {type : String},
    image             :     {type : String},
    CDCE              :     {type : String},
    RESET             :     {type : String , default : ""},
    RESET_EXP         :     {type : Date},
    Telephone         :     {type : String , default : ""},
    MatiereEn         :     [ String ],
    
    MédiasSociaux     :     {
        SiteWeb        :   {type : String , default : ""} ,  
        GitHub         :   {type : String , default : ""} ,  
        Twitter        :   {type : String , default : ""} ,  
        Instagram      :   {type : String , default : ""} ,  
        Facebook       :   {type : String , default : ""}   
    }
    
   
});
module.exports = EnseignantModel;


