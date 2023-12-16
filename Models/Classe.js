const mongo = require("mongoose");

const ClasseModel = mongo.model("Classes",{

    Email             :     {type : String, default : "" },
    NomDeClasse       :     {type : String, default : "" },
    image             :     {type : String, default : "" }

});
module.exports = ClasseModel
