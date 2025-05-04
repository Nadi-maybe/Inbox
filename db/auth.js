// auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('./db.js');

// Rota de registro
router.post('/register', async (req, res) => {
  const { nome, email, senha } = req.body;
  try {
    // Verificar se o usuário já existe
    const userExists = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).send('Usuário já existe');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(senha, 10);
    console.log("Registrando usuário:", nome, email);
    // Inserir novo usuário
    await db.query(
        
      'INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3)',
      [nome, email, hashedPassword]
    );

    res.status(201).send('Usuário registrado com sucesso');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro no servidor');
  }
});

// Rota de login
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  try {
    // Buscar usuário
    const user = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.status(400).send('Usuário não encontrado');
    }

    // Comparar senhas
    const validPassword = await bcrypt.compare(senha, user.rows[0].senha);
    if (!validPassword) {
      return res.status(400).send('Senha incorreta');
    }

    // Autenticação bem-sucedida
    res.status(200).send('Login bem-sucedido');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro no servidor');
  }
});

module.exports = router;
