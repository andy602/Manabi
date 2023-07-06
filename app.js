//jshint esversion:6

//enables add-ons
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");

const app = express();
const https = require("https");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
// connect to mongodb and establish database
mongoose.connect('mongodb://localhost:27017/manabiDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
// item schema for todo-list inputs
const itemsNewSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsNewSchema);

const item1 = new Item({
  name: "Welcome to your college checklist!"
});
defaultItems=[item1];


app.get("/", function(req, res){

  const url="https://zenquotes.io/api/today/[your_key]"
  https.get(url, function(response){

    response.on("data", function(data){
      var quote=JSON.parse(data);
      var finalQuote=quote[0];
      console.log(finalQuote.q);
      var author=finalQuote.a;
      res.render("home", {inspiration:finalQuote.q, author:finalQuote.a});
    });
  });


});
app.get("/checklist", function(req, res){
  Item.find({}, function(err, foundItems){
  // if list is empty, add default item
  if(foundItems.length===0){
    Item.insertMany(defaultItems, function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Successfully inserted defaultItems array.");

      }

    });
    res.redirect("/checklist");
  }else{
    res.render("checklist", {newListItems: foundItems});
  }

});
});

app.post("/checklist", function(req, res) {
  const itemName = req.body.newItem;
  const item= new Item({
    name:itemName
  });
  item.save();
  res.redirect("/checklist");


});
app.post("/delete", function(req, res){
  // deletes item when checkbox is clicked
  const checkedItemId=req.body.checkbox;
  Item.findByIdAndRemove(checkedItemId, function(err){
    if(!err){
      console.log("success");
      res.redirect("/checklist");
    }
  });
});

app.get("/the_list", function(req, res){
  res.render("the_list");
});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
