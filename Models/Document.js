const mongo = require("mongoose");

const DocumentModel = mongo.model("Document",{
    id              :     {},
    Email           :     {},
    DateLimitte     :     {},
    Fichier         :     {},
    texte           :     {},
    Commentaire     :     [],
    NomPrenom       :      {},
    image           :       {}
});
module.exports = DocumentModel
