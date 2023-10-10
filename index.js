const express = require("express");
const app = express();
const path = require("path");
const Camp = require("./models/camps");
const methodOverride = require('method-override');
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const errorHandle = require("./ErrorHandle");

mongoose.connect('mongodb://127.0.0.1:27017/yelpcamp');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Connected to Yelp Database");
});

app.engine("ejs", ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/camp/newcamp", (req, res) => {
    res.render("new");
});

app.get("/camp/:id", async (req, res, next) => {
    try {
        const camp_with_id = await Camp.findById(req.params.id);
        if (!camp_with_id) {
            return next(new errorHandle(404, "Camp does not exist!"));
        }
        res.render("camp", { camp_with_id });
    }
    catch {
        return next(new errorHandle(500, "What are you trying to do man?!?!"));
    }
});

app.get("/allcamps", async (req, res, next) => {
    try {
        const allcamps = await Camp.find({});
        res.render("all", { allcamps });
    } catch {
        return next(new errorHandle(500, "Could not find all camps"));
    }
});

app.post("/camp/add", async (req, res, next) => {
    const camp = Camp({
        "price": req.body.price,
        "title": req.body.title,
        "location": req.body.location,
        "description": req.body.description,
        "image": req.body.image
    });

    try {
        await camp.save();
    } catch {
        return next(new errorHandle(500, "Camp could not be saved"));
    }
    res.redirect("/allcamps");
});

app.delete("/camp/:id", async (req, res, next) => {
    try {
        await Camp.findByIdAndDelete(req.params.id);
        res.redirect("/allcamps");
    } catch {
        return next(new errorHandle(500, "Camp could not be deleted"));
    }
});

app.delete("/allcamps", async (req, res, next) => {
    try {
        await Camp.deleteMany({});
    } catch {
        return next(new errorHandle(500, "Could not delete all camps"));
    }
    res.redirect("/");
});

app.patch("/camp/:id", async (req, res, next) => {
    try {
        const camp_with_id = await Camp.findById(req.params.id);
        if (!camp_with_id) {
            return next(new errorHandle(404, "Camp does not exist!"));
        }
        res.render("edit", { camp_with_id });
    }
    catch {
        return next(new errorHandle(500, "What are you trying to do man?!?!"));
    }
});

app.patch("/camp/updateprice/:id", async (req, res, next) => {
    try {
        await Camp.findByIdAndUpdate(req.params.id, { "price": req.body.price, "image": req.body.image });
    } catch {
        return next(new errorHandle(500, "Camp could not be updated"));
    }
    res.redirect("/allcamps");
});

app.use((req, res) => {
    res.status(404).render("notfound");
});

// Basic error handling
app.use((err, req, res, next) => {
    const { status = 500, message = "OH NO! THIS SHOULD NOT HAVE HAPPENED" } = err;
    res.status(status).render("error", { message });
});

app.listen(8000, () => {
    console.log("Yelp camp activated on port 8000");
});