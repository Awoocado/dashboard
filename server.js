// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const db = require("./database.js");
const express = require("express");
const passport = require("passport");
(async () => {
  await db.then(() => console.log("Connected to the database"));
  const app = express();
  const session = require("express-session");
  const MongoStore = require("connect-mongo")(session);
  const DS = require("./strategies/discord.js");
  app.use(express.static("public"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }))
  app.use(
    session({
      secret: process.env.SECRET,
      cookie: {
        maxAge: 60000 * 60 * 24
      },
      saveUninitialized: false,
      resave: false,
      name: "discord.oauth2",
      store: new MongoStore({ mongooseConnection: require("mongoose").connection })
    })
  );
  app.set("view engine", "ejs");
  app.set("views", require("path").join(__dirname, "views"));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use("/auth", require("./routes/auth"));
  app.use("/dashboard", require("./routes/dashboard"));
  app.use("/wwd", require("./routes/wwd"));

  app.get("/", (req, res) => {
    if(req.user) {
      res.render("home", {
      username: req.user.username,
      user: req.user,
      logged: true
    });
    } else {
      res.render("home", {
      username: "strange",
      user: req.user,
      logged: false
    });
    }
  });

  // listen for requests :)
  const listener = app.listen(process.env.PORT, () => {
    console.log("Your app is listening on port " + listener.address().port);
  });
})().catch(err => {
  console.log(err);
  process.exit(1);
});