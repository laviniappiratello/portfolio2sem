const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
require('dotenv').config();

const app = express();
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//conexão com o banco 
const db = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false // necessário para conexões em produção no Render
  }
});



//verificação de conexão

db.connect()
  .then(() => console.log('✅ Conectado ao PostgreSQL!'))
  .catch(err => console.error('❌ Erro de conexão:', err.message));

// dados estáticos dos projetos
const projetos = [
  {
    id: 1,
    nome: "Portfólio 2025",
    descricao: "Portfólio desenvolvido como parte da disciplina de Desenvolvimento Web 2.",
    github: "https://github.com/laviniappiratello/portfolio2sem",
  },
  {
    id: 2,
    nome: "1ºAPI - Aprendizado por Projeto Integrado",
    descricao: "Website para a leitura e armazenamento de dados.",
    github: "https://github.com/laviniappiratello/Byte_Team-API-1-"
  },
  {
    id: 3,
    nome: "2ºAPI - Aprendizado por Projeto Integrado",
    descricao: "Dashboard de monitoração para a plataforma Helpnei.",
    github: "https://github.com/laviniappiratello/API-2DSM"
  },
  {
    id: 4,
    nome: "Site de Filmes de Terror",
    descricao: "Site de filmes de terror que utiliza banco de dados para armazenar informações dos filmes e permite que os usuários interajam por meio de formulários criados com JavaScript e Bootstrap.",
    github: "https://github.com/laviniappiratello/site_filmes"
  },
  {
    id: 5,
    nome: "Portfólio 2024",
    descricao: "Portfólio desenvolvido como parte da disciplina de Desenvolvimento Web 1.",
    github: "https://laviniappiratello.github.io/portfolio/#home"
  },
  {
    id: 6,
    nome: "Timer",
    descricao: "Timer feito com JavaScript",
    github: "https://github.com/laviniappiratello/timer"
  },
];

//rotas principais
app.get('/', (req, res) => {
  res.render('index', {
    title: 'Meu Portfólio',
    projetos: projetos.slice(0, 4)
  });
});

app.get('/projetos', (req, res) => {
  res.render('projetos', {
    title: 'Meus Projetos',
    projetos
  });
});

app.get('/contato', async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT mensagens.id AS mensagem_id, usuarios.nome, mensagens.mensagem
      FROM mensagens
      INNER JOIN usuarios ON mensagens.usuario_id = usuarios.id
      ORDER BY usuarios.nome, mensagens.id;
    `);
    res.render('contato', { mensagens: rows });
  } catch (err) {
    console.error('Erro ao buscar mensagens:', err);
    res.status(500).send('Erro no servidor');
  }
});

// Criar usuário e mensagem
app.post('/api/mensagens', async (req, res) => {
  const { nome, email, mensagem } = req.body;
  console.log('Recebido:', { nome, email, mensagem });

  try {
    let userId;

    // Verifica se o usuário já existe pelo email
    const checkUser = await db.query(`SELECT id FROM usuarios WHERE email = $1`, [email]);
    if (checkUser.rows.length > 0) {
      userId = checkUser.rows[0].id;
      console.log('Usuário existente com id:', userId);
    } else {
      // Insere novo usuário
      const insertUser = await db.query(
        `INSERT INTO usuarios (nome, email) VALUES ($1, $2) RETURNING id`,
        [nome, email]
      );
      userId = insertUser.rows[0].id;
      console.log('Usuário criado com id:', userId);
    }

    // Insere mensagem
    await db.query(`INSERT INTO mensagens (usuario_id, mensagem) VALUES ($1, $2)`, [userId, mensagem]);
    console.log('Mensagem inserida com sucesso');

    // Pode enviar JSON ou redirecionar
    return res.redirect('/contato');
    // ou: return res.json({ success: true });
  } catch (err) {
    console.error('Erro ao processar mensagem:', err);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
});

app.get('/api/mensagens-com-usuario', async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT mensagens.id AS mensagem_id, usuarios.id AS usuario_id, usuarios.nome, usuarios.email, mensagens.mensagem, mensagens.data_envio
      FROM mensagens
      INNER JOIN usuarios ON mensagens.usuario_id = usuarios.id
      ORDER BY mensagens.data_envio DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Erro ao listar mensagens:', err);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// Rota para listar usuários via API JSON
app.get('/api/usuarios', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM usuarios');
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar usuários:', err);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

// Rota para deletar mensagem pelo id
app.delete('/api/mensagens/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM mensagens WHERE id = $1', [id]);
    console.log(`Mensagem com id ${id} deletada`);
    return res.redirect('/contato');
  } catch (err) {
    console.error('Erro ao deletar mensagem:', err);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// Inicia o servidor
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});




// cd meu-porfolio npm i 
 //http://localhost:8080/api/mensagens-com-usuario
 //http://localhost:8080/api/usuarios
 
