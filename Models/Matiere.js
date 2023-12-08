const mongo = require("mongoose");

const MatiereModel = mongo.model("Matiere",{

    Email             :     {type : String, default : "" },
    NomMatier         :     {type : String, default : "" },
    image             :     {type : String, default : "" }

});
module.exports = MatiereModel
