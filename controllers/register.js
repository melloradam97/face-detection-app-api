const handleRegister = (req, res, db, bcrypt) => {
  const { email, name, password } = req.body;
  if (!email || !name || !password) {
    return res.status(400).json('incorrect form submission');
  }
  const hash = bcrypt.hashSync(password);
    db.transaction(trx => {                // transactions for more than two things
      trx.insert({
        hash: hash, 
        email: email
      })
      .into('login')
      .returning('email')
      .then(loginEmail => {
        return trx('users')
          .returning('*')
          .insert({
            email: loginEmail[0],
            name: name,
            joined: new Date()
          })
          .then(user => {
            res.json(user[0]);
          })
      })
      .then(trx.commit)                   // to make sure it gets added
      .catch(trx.rollback)                // if anything fails it rolls back changes
    })
    .catch(err => res.status(400).json('unable to register'))
}

module.exports = {
  handleRegister
};