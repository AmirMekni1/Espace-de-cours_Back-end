const mongo = require("mongoose");

const DocumentModel = mongo.model("Document",{
    id              :     {},
    Email           :     {},
    DateLimitte     :     {},
    Fichier         :     {},
    texte           :     {},
    Commentaire       :     []
});
module.exports = DocumentModel
