const mongo = require("mongoose");
const AdminModel = mongo.model("Administarteur",{
    identifiant : { type : String }
});
module.exports = AdminModel;