const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const app = express();

const methodOverride = require('method-override');
app.use(methodOverride('_method'));


// configurações
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//conexão com o banco 
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '060106',
  database: 'portfolio_db'
});

//verificação de conexão
db.connect(err => {
  if (err) {
    console.error('Erro de conexão com MySQL:', err.message);
    return;
  }
  console.log(' Conectado ao MySQL!');
});

// dados estáticos dos projetos
const projetos = [
  {
    id: 1,
    nome: "Portfólio 2025",
    descricao: "Portfólio desenvolvido como parte da disciplina de Desenvolvimento Web 2.",
    github: "https://github.com/laviniappiratello/portfolio_",
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

app.get('/contato', (req, res) => {
  const sql = `
    SELECT mensagens.id AS mensagem_id, usuarios.nome, mensagens.mensagem
    FROM mensagens
    INNER JOIN usuarios ON mensagens.usuario_id = usuarios.id
    ORDER BY usuarios.nome, mensagens.id;
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Erro ao buscar mensagens:', err.message);
      return res.status(500).send('Erro no servidor');
    }
    
    // Passa as mensagens para a view
    res.render('contato', { mensagens: results });
  });
});



//---------------- CRUD ----------------

//criar usuário e mensagem relacionada
app.post('/api/mensagens', (req, res) => {
  const { nome, email, mensagem } = req.body;

  //verifica se o usuário já existe
  const checkUserQuery = `SELECT id FROM usuarios WHERE email = ?`;
  db.query(checkUserQuery, [email], (err, results) => {
    if (err) {
      console.error('Erro ao verificar usuário:', err.message);
      return res.status(500).json({ error: 'Erro no servidor' });
    }

    if (results.length > 0) {
      //usuário já existe, usa o id para salvar a mensagem
      const userId = results[0].id;
      salvarMensagem(userId, mensagem, res);
    } else {
      //usuário não existe, insere e depois salva a mensagem
      const insertUserQuery = `INSERT INTO usuarios (nome, email) VALUES (?, ?)`;
      db.query(insertUserQuery, [nome, email], (err, result) => {
        if (err) {
          console.error('Erro ao criar usuário:', err.message);
          return res.status(500).json({ error: 'Erro no servidor' });
        }
        const userId = result.insertId;
        salvarMensagem(userId, mensagem, res);
      });
    }
  });
});




//mostrar relacionamento entre as tabelas
app.get('/api/mensagens-com-usuario', (req, res) => {
  const sql = `
    SELECT mensagens.id AS mensagem_id, usuarios.id AS usuario_id, usuarios.nome, usuarios.email, mensagens.mensagem, mensagens.data_envio
    FROM mensagens
    INNER JOIN usuarios ON mensagens.usuario_id = usuarios.id
    ORDER BY mensagens.data_envio DESC

  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Erro ao buscar mensagens com usuários:', err.message);
      return res.status(500).json({ error: 'Erro no servidor' });
    }
    res.json(results);
  });
});

//mostrar so os usuarios sem as mensagens 
app.get('/api/usuarios', (req, res) => {
  db.query('SELECT * FROM usuarios', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
    res.json(results);
  });
});



// deletar mensagem
app.delete('/api/mensagens/:id', (req, res) => {
  db.query('DELETE FROM mensagens WHERE id = ?', [req.params.id], (err) => {
    if (err) {
      console.error('Erro ao deletar mensagem:', err.message);
      return res.status(500).json({ error: 'Erro no servidor' });
    }
    res.redirect('/contato'); // redireciona pra página de contato após deletar
  });
});

// iniciar servidor
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});


function salvarMensagem(userId, mensagem, res, isForm = false) {
  const insertMessageQuery = `INSERT INTO mensagens (usuario_id, mensagem) VALUES (?, ?)`;
  db.query(insertMessageQuery, [userId, mensagem], (err, result) => {
    if (err) {
      console.error('Erro ao salvar mensagem:', err.message);
      return isForm ? res.status(500).send('Erro no servidor') : res.status(500).json({ error: 'Erro no servidor' });
    }

    if (isForm) {
      // Redireciona para a página de contato após salvar a mensagem
      return res.redirect('/contato');
    }
    return res.redirect('/contato');
    res.json({ success: true, id: result.insertId });
  });
}



// cd meu-porfolio npm i 
 //http://localhost:8080/api/mensagens-com-usuario
 //http://localhost:8080/api/usuarios
 