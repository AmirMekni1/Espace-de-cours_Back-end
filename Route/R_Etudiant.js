const exp = require('express');
const router_Etudiant = exp.Router();
const N_Etudiant = require("../Models/Etudiant");
const mult = require("multer");
const cryptage = require("bcrypt");
const jwt = require("jsonwebtoken");
//--------------------------------------------------------------

photoname = "";
const mystorge=mult.diskStorage({
    destination : './Images',
    filename : (req,photo,redirect)=>{
        L_date = Date.now();
        let f1 = L_date+"."+photo.mimetype.split('/')[1];
        redirect(null,f1);
        photoname = f1 ;
    }
});

const upload = mult({storage : mystorge});

router_Etudiant.post("/InscriptionEtudiant", upload.any('img'), (req,res)=>{
    
        data = req.body;
        cle = cryptage.genSaltSync(10);
        passwordCrypter = cryptage.hashSync("data.Mot_De_Pass",cle);
        data.Mot_De_Pass = passwordCrypter ;
        po = new N_Etudiant(data);
        po.image = photoname ;
        po.save().then(()=>{
                photoname = "";
                res.status(200).send(po);
        }).catch(()=>{
                 res.status(400).send(error);
        });
        
    }
);

router_Etudiant.post("/SignIn",(req,res)=>{
    data = req.body;
  
    
});


router_Etudiant.get("/Lister",(req,res)=>{
    N_Etudiant.find().then((result)=>{
        res.send(result);
    }).catch(()=>{
        res.send('error');
    });
});
 router_Etudiant.post("/Connexion",(req,res)=>{
    data = req.body;
    N_Etudiant.findOne({Email : data.Email}).then(()=>{

        let Passe =  cryptage.compareSync(data.Mot_De_Pass,N_Etudiant.Mot_De_Pass);
         if(!Passe){
             res.send("Mot de Passe Icorrect");
         }else{
             payload = {
                 __id : N_Etudiant._id ,
                 email : N_Etudiant.Email ,
                 motdepasse : N_Etudiant.NomPrenom
             }
            let userToken = jwt.sign(payload,'24884920');
             res.status(200).send({mytoken : userToken})
         }
    });
    
   
    });

router_Etudiant.put("/Modifier",(req,res)=>{});
router_Etudiant.delete("/Supprimer",(req,res)=>{});
module.exports=router_Etudiant;
