const exp = require('express');
const router_Enseignant = exp.Router();
const N_Enseignant = require("../Models/Enseignant");
const mult = require("multer");
const cryptage = require("bcrypt");
const jwt = require("jsonwebtoken");
const { SendConfirmerEmail } = require('../SocialMedia/BoiteGmail');
const LocalStorage = require('node-localstorage').LocalStorage;
const localStorage = new LocalStorage('./scratch');


//___________________________________________________________________________________________________________________________________________________________________________


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

//___________________________________________________________________________________________________________________________________________________________________________


const upload = mult({ storage: mystorge });


//___________________________________________________________________________________________________________________________________________________________________________


VerifierToken = (req, res, next) => {
    let token = req.headers.authorization;
    if (!token) {
        res.send(" Acces rejected  !!! Bara ched darkom ")
    } try {
        jwt.verify(token, user.Mot_De_Pass);
        next();
    } catch (error) {
        res.status(500).send(error)
    }
}

//___________________________________________________________________________________________________________________________________________________________________________


router_Enseignant.post("/InscriptionEnseignant", upload.any('img'), (req, res) => {

    let resultat = require("crypto").randomBytes(32).toString("hex")

    data = req.body;
    cle = cryptage.genSaltSync(10);
    passwordCrypter = cryptage.hashSync(data.Mot_De_Pass, cle);
    data.Mot_De_Pass = passwordCrypter;
    po = new N_Enseignant(data);
    po.image = photoname;
    po.CDCE = resultat
    po.save().then(() => {
        photoname = "";
        res.status(200).send({ msg: data });
        SendConfirmerEmail(data.Email, resultat)
    }).catch(() => {
        res.status(400).send(error);
    });

}
);

//___________________________________________________________________________________________________________________________________________________________________________

router_Enseignant.post("/login", async (req, res) => {
    data = req.body;
const userEn = await N_Enseignant.findOne({ Email: data.Email })
if (!userEn) {
    res.status(401).send("Email Icorrect");
} else {
    verifPass = cryptage.compareSync(data.Mot_De_Pass, userEn.Mot_De_Pass);
    if (!verifPass) {
        res.status(402).send("Password Icorrect");
    } else if (userEn.Verification == "true") {
        payload = {
            id: userEn._id,
            NomPrenom: userEn.NomPrenom,
            image: userEn.image,
            Email: userEn.Email,
            Role: userEn.Role
        }
        tokenE = jwt.sign(payload, userEn.Mot_De_Pass, { expiresIn: "1h" });
        res.status(200).send({ MyToken: tokenE })
    }
}
})
//___________________________________________________________________________________________________________________________________________________________________________


router_Enseignant.get("/Lister", VerifierToken, (req, res) => {
    N_Enseignant.find().then((result) => {
        res.send(result);
    }).catch(() => {
        res.send('error');
    });
});

//___________________________________________________________________________________________________________________________________________________________________________


router_Enseignant.post("/login", (req, res) => {
    data = req.body;
    user = N_Enseignant.findOne({ Email: data.Email })
    if (!user) {
        res.status(401).send("Email Icorrect");
    } else {
        verifPass = cryptage.compareSync(data.Mot_De_Pass, user.Mot_De_Pass);
        if (!verifPass) {
            res.status(402).send("Password Icorrect");
        } else if (user.Verification == "true") {
            payload = {
                id: user._id,
                NomPrenom: user.NomPrenom,
                image: user.image,
                Email: user.Email,
                Role: user.Role
            }
            tokenE = jwt.sign(payload, user.Mot_De_Pass, { expiresIn: "1h" });
            res.status(200).send({ MyToken: tokenE })
        }
    }
});

//___________________________________________________________________________________________________________________________________________________________________________






router_Enseignant.delete("/Supprimer", (req, res) => { });
module.exports = router_Enseignant;