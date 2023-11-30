const exp = require('express');
const router_Enseignant = exp.Router();
const N_Enseignant = require("../Models/Enseignant");
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


VerifierToken = (req,res,next)=>{
    let token = req.headers.autorization;
    if (!token){
        res.send("Acces Rejected !!!")
    }
    try {
        jwt.verify(token,"24884920");
        next();
    } catch (error) {
        res.send(error)
    }
}
router_Enseignant.post("/InscriptionEnseignant", upload.any('img'), (req,res)=>{
    
        data = req.body;
        cle = cryptage.genSaltSync(10);
        passwordCrypter = cryptage.hashSync("data.Mot_De_Pass",cle);
        data.Mot_De_Pass = passwordCrypter ;
        po = new N_Enseignant(data);
        po.image = photoname ;
        po.save().then(()=>{
                photoname = "";
                res.status(200).send(po);
        }).catch(()=>{
                 res.status(400).send(error);
        });
        
    }
);

router_Enseignant.post("/SignIn",(req,res)=>{
    data = req.body;
  
    
});


router_Enseignant.get("/Lister",VerifierToken,(req,res)=>{
    N_Enseignant.find().then((result)=>{
        res.send(result);
    }).catch(()=>{
        res.send('error');
    });
});


 router_Enseignant.post("/Connexion", async (req,res)=>{
    data = req.body;
   user = await N_Enseignant.findOne({Email : data.Email})
    if (!user){
        res.status(401).send("Email Icorrect");
    }else{
        cryptage.compare(data.Mot_De_Pass,user.Mot_De_Pass).then((Passe)=>{

            if(!Passe){
                res.send("Mot de Passe Icorrect");
            }else{
                payload = {
                    __id : user._id ,
                    email : user.Email ,
                    motdepasse : user.NomPrenom
                }
               let userToken = jwt.sign(payload,'24884920');
                res.status(200).send({mytoken : userToken})
            }

        });
    }
});
    
   


router_Enseignant.put("/Modifier",(req,res)=>{});
router_Enseignant.delete("/Supprimer",(req,res)=>{});
module.exports=router_Enseignant;
