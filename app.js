//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB");
const workItems = [];

const itemsSchema = {
  name : String
}
const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
  name : "Buy food"
})
const item2 = new Item({
  name : "cook food"
})
const item3 = new Item({
  name : "Eat food"
})
const defaultItems = [item1,item2,item3];



app.get("/", function(req, res) {

const day = date.getDate();
Item.find({},function(err,foundItems){

  if(foundItems.length === 0){
    Item.insertMany(defaultItems,function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("Successfully added three items into the todolistDB")
      }
    })
    res.redirect("/")
  }

  else{
    res.render("list", {listTitle: day, newListItems: foundItems});
  }

})


});

app.post("/", function(req, res){

  const daycheck = date.getDate();

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  })

  if(listName === daycheck){
    item.save();
    res.redirect("/");
  }
  else
  {
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName)
    })
  }

});

app.post("/delete",function(req,res){
  const daycheck = date.getDate();
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === daycheck){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("Deleted Successfully")
      }
      res.redirect("/");
    })
  }
  else
  {
    List.findOneAndUpdate({name:listName},{$pull:{items: {_id:checkedItemId}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    })
  }

})

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List",listSchema);

app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        //create a new list
        const list = new List({
          name:customListName,
          items: defaultItems
        })
        list.save();
        res.redirect("/" + customListName)
      }
      else{
        //show an existing list
        console.log(foundList)
        res.render("list", {listTitle: customListName, newListItems: foundList.items});

      }
    }
  })



})

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
