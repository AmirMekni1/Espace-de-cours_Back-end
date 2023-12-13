const exp = require('express');
const router_Enseignant = exp.Router();
const N_Enseignant = require("../Models/Enseignant");
const mult = require("multer");
const cryptage = require("bcrypt");
const jwt = require("jsonwebtoken");
const { SendConfirmerEmail } = require('../SocialMedia/BoiteGmail');
const { ResettPassword } = require('../SocialMedia/ResetPassword');
const LocalStorage = require('node-localstorage').LocalStorage;
const localStorage = new LocalStorage('./scratch');
const Matiere = require("../Models/Matiere")

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
    M = new Matiere()
    M.Email = data.Email
    po.image = photoname;
    po.CDCE = resultat
    po.RESET_EXP = Date.now()
    po.save().then(() => {
        M.save()
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


//___________________________________________________________________________________________________________________________________________________________________________

router_Enseignant.post("/verifierEmail/:id", async (req, res) => {
    const cle = req.params.id
    const ok = await N_Enseignant.findOne({ CDCE: cle })
    if (ok) {
        ok.Verification = "true"
        ok.save()
        res.send('En')
    } else {
        res.send('erreur')
    }
})

//___________________________________________________________________________________________________________________________________________________________________________

router_Enseignant.post("/ResetPassword", async (req, res) => {
    data = req.body.texte
    const ox = await N_Enseignant.findOne({ Email: data })
    if (ox) {
        const chaine = require("crypto").randomBytes(60).toString("hex")
        ox.RESET = chaine
        ResettPassword(ox.Email, chaine)
        ox.RESET_EXP = Date.now() + 3600000
        ox.save()
        res.status(200).send({ MyTokenn: "ok" })
    } else {
        res.status(401).send({ msg: "not found" })

    }
})


//___________________________________________________________________________________________________________________________________________________________________________


router_Enseignant.post("/NewPassword/:id", async (req, res) => {
    const code = req.params.id
    const data = req.body.texte;
    const REET = await N_Enseignant.findOne({ RESET: code, RESET_EXP: { $gt: Date.now() } })
    if (REET) {
        const salt = cryptage.genSaltSync(10)
        const password = cryptage.hashSync(data, salt)
        REET.Mot_De_Pass = password
        REET.save()
        res.status(200).send({ MyTokenn: "ok" })
    }
})


//___________________________________________________________________________________________________________________________________________________________________________






router_Enseignant.delete("/Supprimer", (req, res) => { });
module.exports = router_Enseignant;
