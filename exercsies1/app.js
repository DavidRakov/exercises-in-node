const express = require("express");
const uuid = require("uuid");
const bcrypt = require("bcrypt");
const checkEmail = require("emailvalid");
const passwordValidator = require("password-validator");
const validator = require("validator");
// console.log(validator);
const emailvalid = new checkEmail({ allowFreemail: true });
const validOption = new passwordValidator();
validOption
  .is()
  .min(8) // Minimum length 8
  .is()
  .max(100) // Maximum length 100
  .has()
  .uppercase() // Must have uppercase letters
  .has()
  .lowercase() // Must have lowercase letters
  .has()
  .digits(2) // Must have at least 2 digits
  .has()
  .not()
  .spaces();

console.log(validOption.validate("vali"));
const saltRounds = 10;
const app = express();

const PORT = 6553;

let users = [
  { id: "1", email: "david", password: "ddf@fgf" },
  { id: "2", email: "davidr", password: "ddf@fgfdb" },
  { id: "3", email: "davidbg", password: "dddf@fgvef" },
];

const hashPassword = async (pass) => {
  let newPass = await bcrypt.hashSync(pass, saltRounds, (err, hash) => {
    return hash;
  });
  return newPass;
};

const compareHash = async (pass, hash) => {
  let result = await bcrypt.compareSync(pass, hash, (err, result) => {
    return result;
  });
  return result;
};

//חיפוש משתמש על פי אימייל וסיסמה
const myFilter = (element, userInfo) => {
  if (
    element.email === userInfo.email &&
    element.password === userInfo.password
  ) {
    return element;
  }
};

//הפיכת הקבצים לקובץ JSON
app.use(express.json());

//שליפת כל המשתמשים
app.get("/user/user", (req, res) => {
  res.send(users);
});

//שליפת משתמש מסוים
app.get("/user", (req, res) => {
  const userInfo = req.query;
  console.log(userInfo);
  try {
    const user = users.filter((element) => myFilter(element, userInfo));
    console.log(user);
    if (user.length) {
      res.send(user);
    } else {
      throw Error("no user");
    }
  } catch (error) {
    res.send(error.message);
  }
});

//הוספת משתמש חדש
app.post("/user", (req, res) => {
  const newUser = req.body;
  const newId = uuid.v4();
  try {
    const user = users.find((user) => user.email === newUser.email);
    if (user === undefined) {
      newUser.id = newId;
      hashPassword(newUser.password).then((newPass) => {
        newUser.password = newPass;
        users.push(newUser);
        res.send(`added to users ${newUser.password}`);
      });
    } else {
      throw new Error("user already exist");
    }
  } catch (error) {
    res.status(400).send(`${error.message}`);
  }
});

app.put("/user", (req, res) => {
  const userInfo = req.query;
  const update = req.body;
  try {
    const user = users.find((element) => myFilter(element, userInfo));
    if (user !== undefined) {
      user.email = update.email;
      user.password = update.password;
      res.send("success");
    } else {
      throw new Error("no user");
    }
  } catch (error) {
    res.send(error.message);
  }
});

app.delete("/:id", (req, res) => {
  const id = req.params.id;
  const temp = users.filter((element) => element.id !== id);
  users = temp;
  res.send("user deleted");
});

app.listen(PORT, () => {
  console.log(`listen on: http://localhost:${PORT}`);
});
