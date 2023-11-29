const mongo = require("mongoose");
 const conn = mongo.connect("mongodb://localhost:27017/EspaceDeCours").then(
    ()=>{
        console.log("Connected");
 }).catch(
    ()=>{
        console.log('Not Connected');
 });
 module.exports=conn;