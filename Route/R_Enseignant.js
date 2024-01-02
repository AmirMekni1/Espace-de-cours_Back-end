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
const session = require('express-session');
const { model } = require('mongoose');

//___________________________________________________________________________________________________________________________________________________________________________


photoname = "";
const mystorge = mult.diskStorage({
    destination: './Images',
    filename: (req, image, redirect) => {
        console.log("photo : ",req.body)
        L_date = Date.now();
        let f1 = L_date + "." + image.mimetype.split('/')[1];
        redirect(null, f1);
        photoname = f1;
        console.log("photoname : ",photoname)
    }
});

//___________________________________________________________________________________________________________________________________________________________________________


const upload = mult({ storage: mystorge }).single('image');


//___________________________________________________________________________________________________________________________________________________________________________

function authenticateToken(req, res, next) {
    const token = req.header('Authorization');
    if (!token) {
        return res.status(401).json({ message: 'Token manquant' });
    }
    jwt.verify(token, "24884920", (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Acces rejected  !!!' });
        }

        next();
    });
}


//___________________________________________________________________________________________________________________________________________________________________________


router_Enseignant.post("/InscriptionEnseignant", upload, (req, res) => {

    let resultat = require("crypto").randomBytes(32).toString("hex")

    data = req.body;
    cle = cryptage.genSaltSync(10);
    passwordCrypter = cryptage.hashSync(data.Mot_De_Pass, cle);
    data.Mot_De_Pass = passwordCrypter;
    po = new N_Enseignant(data);
    M = new Matiere()
    M.Email = data.Email
    po.image = req.file.filename;
    po.MédiasSociaux.SiteWeb    ="www.Exemple-SiteWeb.com"
    po.MédiasSociaux.GitHub     ="www.Exemple-GitHub.com"
    po.MédiasSociaux.Twitter    ="www.Exemple-Twitter.com"
    po.MédiasSociaux.Instagram  ="www.Exemple-Instagram.com"
    po.MédiasSociaux.Facebook   ="www.Exemple-Facebook.com"
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
                Role: userEn.Role,
                Telephone : userEn.Telephone
            }
            tokenE = jwt.sign(payload, "24884920", { expiresIn: "1h" });
            req.session.MyToken = tokenE
            res.status(200).send({ MyToken: tokenE })
        }
    }
})
//___________________________________________________________________________________________________________________________________________________________________________


router_Enseignant.get("/Lister/:id",authenticateToken, (req, res) => {
    const id = req.params.id
    N_Enseignant.findOne({_id:id}).then((result) => {
        res.send(result);
    }).catch((err) => {
        res.send(err);
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
    const data = req.body.PWD;
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

router_Enseignant.post("/EE/:id", async (req, res) => {
    const data = req.body.o
    const REET = await N_Enseignant.findOne({ RESET: code })
    if (REET) {
        res.status(200).send({ MyTokenn: "true" })
    } else {
        res.status(500).send({ MyTokenn: "false" })
    }
})


//___________________________________________________________________________________________________________________________________________________________________________


router_Enseignant.post("/AjouterMatiereEnseignant/:id", authenticateToken, async (req, res) => {
    const identifiant = req.params.id
    const data = req.body.o
    const REET = await N_Enseignant.findByIdAndUpdate({ _id: identifiant }, { $push: { MatiereEn: data } })
    if (REET) {
        res.status(200).send({ MyTokenn: "true" })
    } else {
        res.status(500).send({ MyTokenn: "false" })
    }
})


//___________________________________________________________________________________________________________________________________________________________________________

router_Enseignant.get("/RecupererMatiereEnseignant/:id", authenticateToken, async (req, res) => {
    const identifiant = req.params.id
    const REET = await N_Enseignant.findOne({ _id: identifiant }, { MatiereEn: 1 })
    if (REET) {
        res.status(200).send(REET.MatiereEn)
    } else {
        res.status(500).send({ MyTokenn: "false" })
    }
})

//___________________________________________________________________________________________________________________________________________________________________________



router_Enseignant.put('/MiseAjourProfile',upload, async (req, res) => {
    
    console.log("photoname",req.file.filename)
  const identifiant = req.params.id;
  const dat = req.body;
  try {
    const updatedEnseignant = await N_Enseignant.findByIdAndUpdate(
      { _id: dat.id },
      {
        $set: {
          'MédiasSociaux.SiteWeb'  : dat.SiteWeb,
          'MédiasSociaux.GitHub'   : dat.GitHub,
          'MédiasSociaux.Twitter'  : dat.Twitter,
          'MédiasSociaux.Instagram': dat.Instagram,
          'MédiasSociaux.Facebook' : dat.Facebook,
           NomPrenom               : dat.NomPrenom,
           Telephone               : dat.Telephone,
           
          // Ajoutez d'autres champs si nécessaire
        },
           
      },
      { new: true } 
    );

    if (updatedEnseignant) {
        updatedEnseignant.image = req.file.filename;
        updatedEnseignant.save()
      res.status(200).json({ MyTokenn: 'true', updatedEnseignant });
    } else {
      res.status(404).json({ MyTokenn: 'false', message: 'Enseignant non trouvé' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ MyTokenn: 'false', message: 'Erreur interne du serveur' });
  }
});

//___________________________________________________________________________________________________________________________________________________________________________

router_Enseignant.get("/GetAllMediasSociaux/:id",authenticateToken, async (req, res) => {
    const enseignantId = req.params.id;

    try {
        const enseignant = await N_Enseignant.findOne( { _id: enseignantId });

        if (!enseignant) {
            return res.status(404).json({ message: 'Erreur' });
        }

        const mediasSociaux = enseignant.MédiasSociaux;
        const myArray = Object.values(mediasSociaux);
        res.status(200).send(myArray)
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error });
    }
});

//___________________________________________________________________________________________________________________________________________________________________________

router_Enseignant.delete('/SupprimerMatiereEnseignant/:id/:M',authenticateToken, async (req, res) => {
    const enseignantId = req.params.id;
    const enseignantMat = req.params.M;

    try {
        const result = await N_Enseignant.findByIdAndUpdate(
            { _id: enseignantId },
            { $pull: { MatiereEn: enseignantMat } }
        );

        if (result) {
            res.status(200).json({ message: 'Matière supprimée avec succès' });
        } else {
            res.status(404).json({ message: 'Enseignant non trouvé' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la suppression de la matière' });
    }
});


//___________________________________________________________________________________________________________________________________________________________________________

router_Enseignant.get('/search/:query', async (req, res) => {
    const query = req.params.query;
  
    try {
      const results = await N_Enseignant.find({
        $or: [
          {NomPrenom : { $regex: query, $options: 'i' } }, // i: insensible à la casse
          {Email : { $regex: query, $options: 'i' } },
          {Mot_De_Pass : { $regex: query, $options: 'i' } },
          {Verification : { $regex: query, $options: 'i' } },
          {Role : { $regex: query, $options: 'i' } },
          {image : { $regex: query, $options: 'i' } },
          {CDCE : { $regex: query, $options: 'i' } },
          {RESET : { $regex: query, $options: 'i' } },
          {RESET_EXP : { $regex: query, $options: 'i' } },
          {Telephone : { $regex: query, $options: 'i' } },
          {MatiereEn : { $regex: query, $options: 'i' } },
          {MédiasSociaux : { $regex: query, $options: 'i' } },
          // Ajoutez d'autres champs de recherche au besoin
        ],
      }).exec();
  
      res.json(results);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

//___________________________________________________________________________________________________________________________________________________________________________


//___________________________________________________________________________________________________________________________________________________________________________


//___________________________________________________________________________________________________________________________________________________________________________


//___________________________________________________________________________________________________________________________________________________________________________


//___________________________________________________________________________________________________________________________________________________________________________

module.exports = router_Enseignant;
