const exp = require('express');
const router_Etudiant = exp.Router();
const N_Etudiant = require("../Models/Etudiant");
const mult = require("multer");
const cryptage = require("bcrypt");
const jwt = require("jsonwebtoken");
const { SendConfirmerEmail } = require('../Notification/BoiteGmail');
const { ResettPassword } = require('../Notification/ResetPassword');
const LocalStorage = require('node-localstorage').LocalStorage;
const localStorage = new LocalStorage('./scratch');
const alert = require("alert")
const session = require('express-session');
const N_Matiere = require("../Models/Matiere")

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


router_Etudiant.post("/InscriptionEtudiant", upload, (req, res) => {

    let resultat = require("crypto").randomBytes(32).toString("hex")

    data = req.body;
    cle = cryptage.genSaltSync(10);
    passwordCrypter = cryptage.hashSync(data.Mot_De_Pass, cle);
    data.Mot_De_Pass = passwordCrypter;
    po = new N_Etudiant(data);
    po.image = req.file.filename;
    po.CDCE = resultat
    po.RESET_EXP = Date.now()+36000
    po.MédiasSociaux.SiteWeb    ="www.Exemple-SiteWeb.com"
    po.MédiasSociaux.GitHub     ="www.Exemple-GitHub.com"
    po.MédiasSociaux.Twitter    ="www.Exemple-Twitter.com"
    po.MédiasSociaux.Instagram  ="www.Exemple-Instagram.com"
    po.MédiasSociaux.Facebook   ="www.Exemple-Facebook.com"
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


router_Etudiant.post("/verifierEmail/:id", async (req, res) => {
    const cle = req.params.id
    const ok = await N_Etudiant.findOne({ CDCE: cle , RESET_EXP : {$gt : Date.now() } })
    if (ok) {
        ok.Verification = "true"
        ok.save()
        res.send('Etu')
    } else {
        res.send('erreur')
    }
})
//___________________________________________________________________________________________________________________________________________________________________________


router_Etudiant.get("/Lister/:id", authenticateToken, (req, res) => {
    const id = req.params.id
    console.log("kjn : ",id)
    N_Etudiant.find({_id:id}).then((result) => {
        res.send(result);
    }).catch(() => {
        res.send('error');
    });
});

//___________________________________________________________________________________________________________________________________________________________________________

router_Etudiant.post("/login", async (req, res) => {
    data = req.body;
    const userEt = await N_Etudiant.findOne({ Email: data.Email })
    if (!userEt) {
        res.status(401).send("Email Icorrect");
    } else {
        verifPass = cryptage.compareSync(data.Mot_De_Pass, userEt.Mot_De_Pass);
        if (!verifPass) {
            res.status(402).send("Password Icorrect");
        } else if (userEt.Verification == "true") {
            payload = {
                id: userEt._id,
                NomPrenom: userEt.NomPrenom,
                image: userEt.image,
                Email: userEt.Email,
                Role: userEt.Role,
                Telephone : userEt.Telephone
            }
            tokenE = jwt.sign(payload,"24884920", { expiresIn: "1h" });
            req.session.MyToken=tokenE
            res.status(200).send({ MyToken: tokenE })
        }
    }
})


//___________________________________________________________________________________________________________________________________________________________________________



router_Etudiant.post("/ResetPassword", async (req, res) => {
    data = req.body.texte;
    const ox = await N_Etudiant.findOne({ Email: data })
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

router_Etudiant.post("/NewPassword/:id", async (req, res) => {
    const code = req.params.id
    const data = req.body.texte;
        const REEN = await N_Etudiant.findOne({ RESET: code , RESET_EXP : {$gt : Date.now() }  })
        if (REEN) {
            const salt = cryptage.genSaltSync(10)
            const password = cryptage.hashSync(data, salt)
            REEN.Mot_De_Pass = password
            REEN.save()
            res.status(200).send({ MyTokenn: "ok" })
        }
    }
)



//___________________________________________________________________________________________________________________________________________________________________________

router_Etudiant.put('/MiseAjourProfile',upload, async (req, res) => {
    
   
  const identifiant = req.params.id;
  const dat = req.body;
  try {
    const updatedEtudiant = await N_Etudiant.findByIdAndUpdate(
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
           
        },
           
      },
      { new: true } 
    );

    if (updatedEtudiant) {
        if (photoname != ""){
            updatedEtudiant.image = photoname
          }
        updatedEtudiant.save()
      res.status(200).json({ MyTokenn: 'true', updatedEtudiant });
    } else {
      res.status(404).json({ MyTokenn: 'false', message: 'Enseignant non trouvé' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ MyTokenn: 'false', message: 'Erreur interne du serveur' });
  }
});


//___________________________________________________________________________________________________________________________________________________________________________

router_Etudiant.get("/GetAllMediasSociaux/:id",authenticateToken, async (req, res) => {
    const EtudiantId = req.params.id;

    try {
        const Etudiant = await N_Etudiant.findOne( { _id: EtudiantId });

        if (!Etudiant) {
            return res.status(404).json({ message: 'Erreur' });
        }

        const mediasSociaux = Etudiant.MédiasSociaux;
        const myArray = Object.values(mediasSociaux);
        res.status(200).send(myArray)
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error });
    }
});

//___________________________________________________________________________________________________________________________________________________________________________


router_Etudiant.get("/RecupererMatiereEtudiant/:id", authenticateToken, async (req, res) => {
    const identifiant = req.params.id
    const REET = await N_Etudiant.findOne({ _id: identifiant }, { MatiereET: 1 })
    if (REET) {
        res.status(200).send(REET.MatiereET)
    } else {
        res.status(500).send({ MyTokenn: "false" })
    }
})


//___________________________________________________________________________________________________________________________________________________________________________

router_Etudiant.post("/AjouterMatiereEtudiant/:id", authenticateToken, async (req, res) => {
    const identifiant = req.params.id
    const data = req.body.o
    const REET = await N_Etudiant.findByIdAndUpdate({ _id: identifiant }, { $push: { MatiereET: data } })
    if (REET) {
        res.status(200).send({ MyTokenn: "true" })
    } else {
        res.status(500).send({ MyTokenn: "false" })
    }
})



//___________________________________________________________________________________________________________________________________________________________________________

router_Etudiant.delete('/SupprimerMatiereEtudiant/:id/:M',authenticateToken, async (req, res) => {
    const EtudiantId = req.params.id;
    const EtudiantMat = req.params.M;

    try {
        const result = await N_Etudiant.findByIdAndUpdate(
            { _id: EtudiantId },
            { $pull: { MatiereET: EtudiantMat } }
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

router_Etudiant.post("/RejoindreAuMatiere/:id",authenticateToken, async (req, res) => {
    const identifiant = req.params.id
    const Email = req.body.Email
    console.log("ugyugyu : ",Email)
    const REET = await N_Matiere.findOneAndUpdate({ cle_Etudiant: identifiant }, { $push: { Les_Etudiants: Email } }).then().catch((e)=>{res.send(e)})
   
})



//___________________________________________________________________________________________________________________________________________________________________________

    router_Etudiant.get("/GetAllCardMatiere/:id",authenticateToken, async (req, res) => {
        
           await N_Matiere.find({Les_Etudiants : req.params.id}).then((d)=>{
            res.status(200).send(d)
           }).catch((e)=>{
            res.status(500).send(e)
           })
          
      });

//___________________________________________________________________________________________________________________________________________________________________________

router_Etudiant.put('/QuitterMatiere/:id', async (req, res) => {
    const cle = req.params.id;
    const dat = req.body;
    console.log("cle : ", cle);
    console.log("dat : ", dat);
  
    await N_Matiere.findOneAndUpdate(
      { cle_Etudiant: cle },
      {
        $pull: {
            Les_Etudiants : { $in: [dat.Email] },
        },
      },
      { new: true }
    ).then(() => {
        res.send("e");
    }).catch((e) => {
      res.send(e);
    });
  });
  


//___________________________________________________________________________________________________________________________________________________________________________

router_Etudiant.get("/GetCardMatiere/:id",authenticateToken, async (req, res) => {
        
    await N_Matiere.find({cle_Etudiant : req.params.id}).then((d)=>{
     res.status(200).send(d)
    }).catch((e)=>{
     res.status(500).send(e)
    })
   
});

//___________________________________________________________________________________________________________________________________________________________________________



//___________________________________________________________________________________________________________________________________________________________________________



//___________________________________________________________________________________________________________________________________________________________________________



//___________________________________________________________________________________________________________________________________________________________________________



//___________________________________________________________________________________________________________________________________________________________________________



//___________________________________________________________________________________________________________________________________________________________________________



//___________________________________________________________________________________________________________________________________________________________________________



//___________________________________________________________________________________________________________________________________________________________________________




//___________________________________________________________________________________________________________________________________________________________________________



//___________________________________________________________________________________________________________________________________________________________________________






module.exports = router_Etudiant;
