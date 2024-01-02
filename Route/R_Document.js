const exp = require('express');
const router_Document = exp.Router();
const mult = require("multer");
const Document = require("../Models/Document")
const https = require('https');
const jwt = require("jsonwebtoken");
const { error } = require('console');


//______________________________________________________________________________________________________________________________________________




//______________________________________________________________________________________________________________________________________________


//recuperer image


photoname = "";
const mystorge = mult.diskStorage({
  destination: './Documents',
  filename: (req, Fichier, redirect) => {
    L_date = Date.now();
    let f1 = L_date + "." + Fichier.mimetype.split('/')[1];
    redirect(null, f1);
    photoname = f1;
  }
});


const upload = mult({ storage: mystorge }).single("Fichier");
//______________________________________________________________________________________________________________________________________________

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



//______________________________________________________________________________________________________________________________________________
//ajouter Document
router_Document.post("/AjouterDoucument", authenticateToken, upload, (req, res) => {
  const data = req.body;
  const po = new Document(data);
  if (data.Fichier == "") {
    po.Fichier = "Message !";
  } else {
    po.Fichier = req.file.filename;
  }
  po.save().then(() => {
   
    res.send("ok");
  }).catch(() => {
    res.send("erreur");
  });
}
);

//______________________________________________________________________________________________________________________________________________


router_Document.post("/AjouterCommentaireDansDoucument/:id",authenticateToken, async (req, res) => {
  const documentId = req.params.id;
  const commentaireData = req.body;
  
    const document = await Document.findByIdAndUpdate({_id:documentId},{ $push: {Commentaire : commentaireData}
    }).then(()=>{ res.status(500).json({ message: "commentaire ajouter avec sucess" })}).catch((err)=>{
         res.status(404).json({ message: err })
    })})

   
//______________________________________________________________________________________________________________________________________________


router_Document.get("/RecupereCommentaireDansDoucument/:id", async (req, res) => {
  const documentId = req.params.id;
    const document = await Document.findById({_id:documentId},{Commentaire : 1}).then((d)=>{ res.status(500).send(d)}).catch((err)=>{
         res.status(404).json({ message: err })
    })})

   

//______________________________________________________________________________________________________________________________________________


//lister Documents
router_Document.get("/Lister/:id", authenticateToken, async (req, res) => {
  console.log(req.params.id)
  await Document.find({ id: req.params.id }).then((result) => {
    res.status(200).send(result);
  }).catch(() => {
    res.status(500).send('error');
  });
});

//______________________________________________________________________________________________________________________________________________
router_Document.get("/GetDocument/:id", authenticateToken, async (req, res) => {

  await Document.find({ _id: req.params.id }).then((d) => {
    res.status(200).send(d)
  }).catch((e) => {
    res.status(500).send(e)
  })

});

//______________________________________________________________________________________________________________________________________________

router_Document.delete("/deleteDocument/:id", authenticateToken, async (req, res) => {
  const x = await Document.findByIdAndDelete(req.params.id)
  if (x) {
    res.status(200).send({ Message: "ok" })
  } else {
    res.status(500).send({ Message: "erreur" })
  }
})
//______________________________________________________________________________________________________________________________________________

router_Document.put('/MiseAjourDocument/:id', upload, async (req, res) => {
  const documentId = req.params.id;
  const newData = req.body;
  console.log("d,,,,", photoname)

  console.log(newData)
 

    const updatedDocument = await Document.findByIdAndUpdate(
      documentId,
      { $set: newData }, 
      { new: true }
    );

    if (updatedDocument) {
      updatedDocument.Fichier = req.file.filename
      updatedDocument.save()
      res.status(200).json({ message: 'Document mis à jour avec succès', updatedDocument });
    } else {
      res.status(404).json({ message: 'Document non trouvé' });
    }
 
});


//______________________________________________________________________________________________________________________________________________

router_Document.delete("/deleteAllDocument/:id", async (req, res) => {
  const x = await Document.findOneAndDelete({id : req.params.id})
  if (x) {
    res.status(200).send({ Message: "ok" })
  } else {
    res.status(500).send({ Message: "erreur" })
  }
})

//______________________________________________________________________________________________________________________________________________

router_Document.get('/search/:query', async (req, res) => {
  const query = req.params.query;

  try {
    const results = await Document.find({
      $or: [
        { id: { $regex: query, $options: 'i' } }, // i: insensible à la casse
        { Email: { $regex: query, $options: 'i' } },
        { DateLimitte: { $regex: query, $options: 'i' } },
        { texte: { $regex: query, $options: 'i' } },
        { Commentaire: { $regex: query, $options: 'i' } },
        { Fichier: { $regex: query, $options: 'i' } },
        // Ajoutez d'autres champs de recherche au besoin
      ],
    }).exec();

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//______________________________________________________________________________________________________________________________________________
//______________________________________________________________________________________________________________________________________________
//______________________________________________________________________________________________________________________________________________
//______________________________________________________________________________________________________________________________________________
//______________________________________________________________________________________________________________________________________________
//______________________________________________________________________________________________________________________________________________
//______________________________________________________________________________________________________________________________________________
//______________________________________________________________________________________________________________________________________________
//______________________________________________________________________________________________________________________________________________
//______________________________________________________________________________________________________________________________________________
//______________________________________________________________________________________________________________________________________________
//______________________________________________________________________________________________________________________________________________
//______________________________________________________________________________________________________________________________________________
//______________________________________________________________________________________________________________________________________________
//______________________________________________________________________________________________________________________________________________
//______________________________________________________________________________________________________________________________________________
//______________________________________________________________________________________________________________________________________________
//______________________________________________________________________________________________________________________________________________

module.exports = router_Document;