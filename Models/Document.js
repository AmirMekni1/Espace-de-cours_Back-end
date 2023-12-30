const mongo = require("mongoose");

const DocumentModel = mongo.model("Document",{

    Email           :     {type : String, default : "" },
    DateLimitte     :     {type : String, default : "" },
    Fichier        :     {type : String, default : "" },
    texte            :    {type : String, default : "" },

});
module.exports = DocumentModel
