const exp = require('express');
const router_Enseignant = exp.Router();
const N_Enseignant = require("../Models/Enseignant");
const mult = require("multer");
const cryptage = require("bcrypt");
const jwt = require("jsonwebtoken");

//--------------------------------------------------------------

photoname = "";
const mystorge = mult.diskStorage({
    destination: './Images',
    filename: (req, photo, redirect) => {
        L_date = Date.now();
        let f1 = L_date + "." + photo.mimetype.split('/')[1];
        redirect(null, f1);
        photoname = f1;
    }
});

const upload = mult({ storage: mystorge });


VerifierToken = (req, res, next) =>
 { let token = req.headers.authorization;
     if (!token) {
         res.send(" Acces rejected  !!! Bara ched darkom ")
         } try {
             jwt.verify(token, user.Mot_De_Pass);
              next(); 
            } catch (error) {
                 res.status(500).send(error) 
                } }
                
//_____________________________________________________________________________________________________

router_Enseignant.post("/InscriptionEnseignant", upload.any('img'), (req, res) => {

    data = req.body;
    cle = cryptage.genSaltSync(10);
    passwordCrypter = cryptage.hashSync(data.Mot_De_Pass, cle);
    data.Mot_De_Pass = passwordCrypter;
    po = new N_Enseignant(data);
    po.image = photoname;
    po.save().then(() => {
        photoname = "";
        res.status(200).send(po);
    }).catch(() => {
        res.status(400).send(error);
    });

}
);

router_Enseignant.post("/SignIn", (req, res) => {
    data = req.body;


});


router_Enseignant.get("/Lister", VerifierToken, (req, res) => {
    N_Enseignant.find().then((result) => {
        res.send(result);
    }).catch(() => {
        res.send('error');
    });
});


router_Enseignant.post("/SIGN", async (req, res) => {
    data = req.body;
    user = await N_Enseignant.findOne({ Email: data.Email })
    if (!user) {
        res.status(401).send("Email Icorrect");
    } else {
        verifPass = cryptage.compareSync(data.Mot_De_Pass, user.Mot_De_Pass);
        if (!verifPass) {
            res.status(402).send("Password Icorrect");
        } else {
            payload = {
                id: user._id,
                NomPrenom: user.NomPrenom,
                image: user.image

            }
            tokenE = jwt.sign(payload, user.Mot_De_Pass, { expiresIn: "1h" });
            res.status(200).send({ MyToken: tokenE })
        }
    }
});





router_Enseignant.put("/Modifier", (req, res) => { });
router_Enseignant.delete("/Supprimer", (req, res) => { });
module.exports = router_Enseignant;
