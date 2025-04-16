
const express = require('express');
const app = express(); 


app.set('view engine', 'ejs');
app.use(express.static('public'));


app.use(express.urlencoded({ extended: true }));


const projetos = [
  {
    id: 1,
    nome: "Portfólio 2025",
    descricao: "Portfólio desenvolvido como parte da disciplina de Desenvolvimento Web 2.",
    github: "https://github.com/seu-usuario/meu-portfolio",

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
    id: 4,
    nome: "Timer",
    descricao: "Timer feito com JavaScript",
    github: "https://github.com/laviniappiratello/timer"
  },
];



// 5. Rotas
app.get('/', (req, res) => {
  res.render('index', {
    title: 'Meu Portfólio',
    projetos: projetos.slice(0, 4), 
  });
});

app.get('/projetos', (req, res) => {
  res.render('projetos', {
    title: 'Meus Projetos',
    projetos: projetos
  });
});


const PORT = process.env.PORT || 8080; 
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
