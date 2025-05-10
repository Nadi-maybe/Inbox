// =========================================================
// CONFIGURAÇÃO BÁSICA DO SERVIDOR
// =========================================================

/**
 * Importação dos módulos necessários
 * Express: Framework web para criar o servidor e gerenciar rotas
 * Path: Biblioteca para trabalhar com caminhos de arquivos
 * Body-parser: Middleware para interpretar dados enviados pelo usuário
 * Multer: Middleware para processar upload de arquivos
 * FS: Módulo para operações de sistema de arquivos
 */
const pool = require('./connectAndCreateTable');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const bcrypt = require('bcrypt');

/**
 * Configuração do armazenamento para upload de arquivos de grupos
 * Determina onde os arquivos serão salvos e como serão nomeados
 */
const storage = multer.diskStorage({
    // Define o diretório de destino para os uploads
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, 'public/images/grupos');

        // Cria o diretório se não existir
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
    },
    // Define o nome do arquivo com timestamp para evitar duplicatas
    filename: function (req, file, cb) {
        // Gera um nome único para o arquivo usando timestamp e número aleatório
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'group-' + uniqueSuffix + ext);
    }
});

/**
 * Configuração do armazenamento para upload de fotos de perfil
 * Similar à config de grupos, mas com diretório separado
 */
const storagePerfil = multer.diskStorage({
    // Define o diretório de destino para os uploads de perfil
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, 'public/images/perfil');

        // Cria o diretório se não existir
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
    },
    // Define o nome do arquivo com timestamp para evitar duplicatas
    filename: function (req, file, cb) {
        // Gera um nome único para o arquivo
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'profile-' + uniqueSuffix + ext);
    }
});

/**
 * Filtro para permitir apenas imagens nos uploads
 * Retorna erro se o arquivo não for uma imagem
 */
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Apenas imagens são permitidas!'), false);
    }
};

/**
 * Configuração do middleware Multer para upload de arquivos de grupos
 * Define storage, filtro e limites
 */
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // Limite de 5MB
    }
});

/**
 * Configuração do middleware Multer para upload de fotos de perfil
 * Define storage, filtro e limites
 */
const uploadPerfil = multer({
    storage: storagePerfil,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // Limite de 5MB
    }
});

// Criando a aplicação Express
const app = express();
// Define a porta onde o servidor vai rodar (3000 por padrão)
const PORT = process.env.PORT || 3000;

// =========================================================
// CONFIGURAÇÃO DA VISUALIZAÇÃO E MIDDLEWARES
// =========================================================

/**
 * Configurando o EJS como sistema de templates
 * EJS permite a criação de páginas HTML dinâmicas
 */
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

/**
 * Configura o body-parser para processar dados dos formulários e JSON
 * Essencial para receber dados POST do cliente
 */
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/**
 * Configura o diretório 'public' para servir arquivos estáticos
 * Contém CSS, JavaScript, imagens, etc.
 */
app.use(express.static(path.join(__dirname, 'public')));

// =========================================================
// ARMAZENAMENTO DE DADOS (em memória - substituir por BD)
// =========================================================

/**
 * Armazenamento temporário para dados 
 * NOTA: Em uma aplicação real, estes dados seriam armazenados em um banco de dados
 * Você pode substituir estas arrays por chamadas ao seu banco de dados quando implementar o back-end
 */
let usuarios = []; // Usuários cadastrados
let grupos = [];    // Grupos criados
let registros = [];  // Registros de reservas
let produtos = [];   // Produtos disponíveis
let notificacoes = []; // Notificações do sistema

/**
 * Usuário padrão para teste inicial
 * REMOVER em produção após implementar banco de dados
 */
usuarios.push({
    id: '12345',
    nome: 'User',
    email: 'user@example.com',
    senha: '123456',
    apelido: 'Apelido',
    telefone: '(99) 99999-9999',
    photo: '/images/default-profile.svg'
});

/**
 * Notificação inicial para mostrar o sistema funcionando
 * REMOVER em produção após implementar banco de dados
 */
notificacoes.push({
    id: Date.now().toString(),
    tipo: 'info',
    titulo: 'Bem-vindo ao Inbox',
    mensagem: 'Seja bem-vindo ao Inbox, seu app de gerenciamento de objetos',
    lida: false,
    data: new Date()
});

/**
 * Variável para simular uma sessão de usuário
 * NOTA: Em produção, usar um sistema adequado de gerenciamento de sessão
 * como express-session, connect-mongo, etc.
 */
let usuarioAtual = null;

// =========================================================
// ROTAS DE AUTENTICAÇÃO
// =========================================================

/**
 * Rota: GET /login
 * Descrição: Exibe a página de login
 */
app.get('/login', (req, res) => {
    res.render('login');
});

/**
 * Rota: POST /login
 * Descrição: Processa o login do usuário
 * Parâmetros:
 * - email: Email ou nome de usuário
 * - senha: Senha do usuário
 */
app.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    try {
        // 1. Buscar usuário no banco de dados
        const result = await pool.query(
            'SELECT * FROM usuarios WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.render('login', {
                error: 'Email ou senha incorretos',
                email: email
            });
        }

        const usuario = result.rows[0];

        // 2. Verificar senha
        const senhaValida = await bcrypt.compare(senha, usuario.senha);

        if (!senhaValida) {
            return res.render('login', {
                error: 'Email ou senha incorretos',
                email: email
            });
        }

        // 3. Armazenar usuário na sessão
        usuarioAtual = usuario;

        res.redirect('/');
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).send('Erro ao fazer login');
    }
});
/**
 * Rota: GET /registro
 * Descrição: Exibe a página de registro de novo usuário
 */
app.get('/registro', (req, res) => {
    res.render('registro');
});

/**
 * Rota: POST /registro
 * Descrição: Processa o registro de um novo usuário
 * Parâmetros:
 * - nome: Nome completo do usuário
 * - email: Email do usuário
 * - senha: Senha escolhida
 * - confirmar_senha: Confirmação da senha
 */
app.post('/registro', async (req, res) => {
    const { nome, email, senha } = req.body;

    try {
        // 1. Criptografar a senha
        const saltRounds = 10;
        const senhaCriptografada = await bcrypt.hash(senha, saltRounds);

        // 2. Inserir no banco de dados
        await pool.query(
            'INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3)',
            [nome, email, senhaCriptografada]
        );

        res.redirect('/login');
    } catch (error) {
        console.error('Erro ao registrar usuário:', error);
        res.status(500).send('Erro ao registrar usuário');
    }
});

/**
 * Rota: GET /completar-perfil
 * Descrição: Exibe a página para completar o perfil após o registro
 * Acesso: Apenas usuários recém-registrados
 */
app.get('/completar-perfil', (req, res) => {
    // Se não há usuário logado ou não é um registro novo, redirecionar para login
    if (!usuarioAtual || !usuarioAtual.registroCriado) {
        return res.redirect('/login');
    }

    res.render('completar-perfil');
});

/**
 * Rota: POST /completar-perfil
 * Descrição: Processa as informações adicionais do perfil
 * Parâmetros:
 * - profile-photo: Foto de perfil (arquivo)
 * - apelido: Apelido opcional
 * - telefone: Telefone opcional
 */
app.post('/completar-perfil', uploadPerfil.single('profile-photo'), async (req, res) => {
    if (!usuarioAtual) {
        return res.redirect('/login');
    }

    try {
        const { apelido, telefone } = req.body;
        let photoPath = '/images/default-profile.svg';

        if (req.file) {
            photoPath = `/images/perfil/${req.file.filename}`;
        }

        // Atualizar no banco de dados
        await pool.query(
            'UPDATE usuarios SET apelido = $1, telefone = $2, photo = $3 WHERE id = $4',
            [apelido || '', telefone || '', photoPath, usuarioAtual.id]
        );

        res.redirect('/');
    } catch (error) {
        console.error('Erro ao completar perfil:', error);
        res.status(500).send('Erro ao completar perfil');
    }
});
/**
 * Rota: GET /logout
 * Descrição: Encerra a sessão do usuário
 */
app.get('/logout', (req, res) => {
    // Limpar usuário atual
    // NOTA: Em produção, destruir sessão adequadamente
    usuarioAtual = null;

    // Redirecionar para login
    res.redirect('/login');
});

// =========================================================
// ROTAS PRINCIPAIS DA APLICAÇÃO
// =========================================================

/**
 * Rota: GET /
 * Descrição: Página inicial da aplicação
 * Acesso: Apenas usuários autenticados
 */
app.get('/', (req, res) => {
    // Se não há usuário logado, redirecionar para login
    if (!usuarioAtual) {
        return res.redirect('/login');
    }

    // Dados de usuário para a view
    // NOTA: Em produção, obter dados atualizados do banco
    const user = {
        name: usuarioAtual.nome,
        groups: grupos,
        registros: registros
    };

    // Renderiza a página inicial com os dados do usuário
    res.render('index', { user });
});

/**
 * Rota: GET /produtos
 * Descrição: Página de produtos disponíveis para reserva
 * Acesso: Apenas usuários autenticados
 */
app.get('/produtos', (req, res) => {
    // Se não há usuário logado, redirecionar para login
    if (!usuarioAtual) {
        return res.redirect('/login');
    }

    // Renderiza a página de produtos
    res.render('produtos', {
        grupos: grupos,
        produtos: produtos
    });
});

/**
 * Rota: GET /perfil
 * Descrição: Página de perfil do usuário
 * Acesso: Apenas usuários autenticados
 */
app.get('/perfil', (req, res) => {
    // Se não há usuário logado, redirecionar para login
    if (!usuarioAtual) {
        return res.redirect('/login');
    }

    // Dados do usuário para a view
    const user = {
        name: usuarioAtual.nome,
        id: usuarioAtual.id,
        photo: usuarioAtual.photo,
        apelido: usuarioAtual.apelido,
        email: usuarioAtual.email,
        telefone: usuarioAtual.telefone,
        historico: []
    };

    // Renderiza a página de perfil
    res.render('perfil', { user });
});

/**
 * Rota: GET /notificacoes
 * Descrição: Página de notificações do usuário
 * Acesso: Apenas usuários autenticados
 */
app.get('/notificacoes', (req, res) => {
    // Se não há usuário logado, redirecionar para login
    if (!usuarioAtual) {
        return res.redirect('/login');
    }

    // Renderiza a página de notificações
    res.render('notificacoes', { notificacoes });
});

/**
 * Rota: GET /criar-grupo
 * Descrição: Página para criar um novo grupo
 * Acesso: Apenas usuários autenticados
 */
app.get('/criar-grupo', (req, res) => {
    // Se não há usuário logado, redirecionar para login
    if (!usuarioAtual) {
        return res.redirect('/login');
    }

    // Renderiza a página de criação de grupo
    res.render('criar-grupo');
});

/**
 * Rota: POST /criar-grupo
 * Descrição: Processa a criação de um novo grupo
 * Parâmetros:
 * - nome: Nome do grupo
 * - descricao: Descrição do grupo
 * - groupPhoto: Foto do grupo (arquivo)
 */
app.post('/criar-grupo', upload.single('groupPhoto'), async (req, res) => {
    if (!usuarioAtual) {
        return res.redirect('/login');
    }

    try {
        const { nome, descricao } = req.body;
        let photoPath = '/images/default-profile.svg';

        if (req.file) {
            photoPath = `/images/grupos/${req.file.filename}`;
        }

        // Inserir grupo no banco de dados
        const result = await pool.query(
            'INSERT INTO grupos (nome, descricao, photo, criado_por) VALUES ($1, $2, $3, $4) RETURNING *',
            [nome, descricao || '', photoPath, usuarioAtual.id]
        );

        const novoGrupo = result.rows[0];

        res.redirect('/');
    } catch (error) {
        console.error('Erro ao criar grupo:', error);
        res.status(500).send('Erro ao criar grupo');
    }
});
// =========================================================
// API ENDPOINTS
// =========================================================

/**
 * Endpoint: GET /api/produtos/grupo/:id
 * Descrição: Retorna produtos de um grupo específico
 * Parâmetros:
 * - id: ID do grupo (URL params)
 */
app.get('/api/produtos/grupo/:id', (req, res) => {
    const grupoId = req.params.id;

    // Filtrando produtos pelo ID do grupo
    const produtosDoGrupo = produtos.filter(produto => produto.groupId === grupoId);

    res.json(produtosDoGrupo);
});

/**
 * Endpoint: POST /api/produtos
 * Descrição: Adiciona um novo produto
 * Parâmetros:
 * - nome: Nome do produto
 * - descricao: Descrição do produto
 * - groupId: ID do grupo ao qual o produto pertence
 */
app.post('/api/produtos', (req, res) => {
    const { nome, descricao, groupId } = req.body;

    if (!nome || !groupId) {
        return res.status(400).json({ erro: 'Nome e grupo são obrigatórios' });
    }

    // Criar novo produto
    // NOTA: Em produção, salvar no banco de dados
    const novoProduto = {
        id: Date.now().toString(),
        nome,
        descricao: descricao || '',
        groupId,
        createdAt: new Date()
    };

    produtos.push(novoProduto);

    res.status(201).json(novoProduto);
});

/**
 * Endpoint: POST /api/notificacoes/:id/lida
 * Descrição: Marca uma notificação como lida
 * Parâmetros:
 * - id: ID da notificação (URL params)
 */
app.post('/api/notificacoes/:id/lida', (req, res) => {
    const notificacaoId = req.params.id;
    const notificacao = notificacoes.find(n => n.id === notificacaoId);

    if (notificacao) {
        notificacao.lida = true;
        res.json({ sucesso: true });
    } else {
        res.status(404).json({ erro: 'Notificação não encontrada' });
    }
});

/**
 * Endpoint: DELETE /api/notificacoes/:id
 * Descrição: Remove uma notificação
 * Parâmetros:
 * - id: ID da notificação (URL params)
 */
app.delete('/api/notificacoes/:id', (req, res) => {
    const notificacaoId = req.params.id;
    const index = notificacoes.findIndex(n => n.id === notificacaoId);

    if (index !== -1) {
        notificacoes.splice(index, 1);
        res.json({ sucesso: true });
    } else {
        res.status(404).json({ erro: 'Notificação não encontrada' });
    }
});

/**
 * Endpoint: DELETE /api/notificacoes
 * Descrição: Remove todas as notificações
 */
app.delete('/api/notificacoes', (req, res) => {
    notificacoes = [];
    res.json({ sucesso: true });
});

/**
 * Endpoint: GET /api/notificacoes/nao-lidas
 * Descrição: Retorna quantidade de notificações não lidas
 */
app.get('/api/notificacoes/nao-lidas', (req, res) => {
    const naoLidas = notificacoes.filter(n => !n.lida);
    res.json({
        count: naoLidas.length,
        has_unread: naoLidas.length > 0
    });
});

/**
 * Endpoint: POST /api/convites/grupo
 * Descrição: Cria um convite para um grupo
 * Parâmetros:
 * - grupoId: ID do grupo
 * - grupoNome: Nome do grupo
 * - remetente: Nome do remetente (opcional)
 */
app.post('/api/convites/grupo', (req, res) => {
    const { grupoId, grupoNome, remetente } = req.body;

    if (!grupoId || !grupoNome) {
        return res.status(400).json({ erro: 'Dados do grupo são obrigatórios' });
    }

    // Obter nome do remetente
    const nomeRemetente = usuarioAtual ? usuarioAtual.nome : (remetente || 'um usuário');

    // Criar notificação de convite
    const convite = {
        id: Date.now().toString(),
        tipo: 'convite',
        titulo: 'Convite para Grupo',
        mensagem: `Você foi convidado por ${nomeRemetente} para participar do grupo "${grupoNome}"`,
        grupoId,
        grupoNome,
        lida: false,
        data: new Date()
    };

    notificacoes.push(convite);

    res.status(201).json(convite);
});

/**
 * Endpoint: POST /api/convites/:id/aceitar
 * Descrição: Aceita um convite para grupo
 * Parâmetros:
 * - id: ID do convite (URL params)
 */
app.post('/api/convites/:id/aceitar', (req, res) => {
    const conviteId = req.params.id;
    const convite = notificacoes.find(n => n.id === conviteId && n.tipo === 'convite');

    if (!convite) {
        return res.status(404).json({ erro: 'Convite não encontrado' });
    }

    // Procurar o grupo
    const grupo = grupos.find(g => g.id === convite.grupoId);

    if (!grupo) {
        return res.status(404).json({ erro: 'Grupo não encontrado' });
    }

    // Marcar notificação como lida
    convite.lida = true;

    // NOTA: Em produção, adicionar usuário ao grupo no banco de dados

    // Criar notificação de confirmação
    const confirmacao = {
        id: Date.now().toString(),
        tipo: 'confirmacao',
        titulo: 'Convite Aceito',
        mensagem: `Você agora faz parte do grupo "${convite.grupoNome}"`,
        lida: false,
        data: new Date()
    };

    notificacoes.push(confirmacao);

    res.json({
        sucesso: true,
        message: 'Convite aceito com sucesso'
    });
});

/**
 * Endpoint: GET /api/demo/adicionar-convite
 * Descrição: Rota de demonstração para adicionar convite
 * NOTA: Remover em produção
 */
app.get('/api/demo/adicionar-convite', (req, res) => {
    // Verificar se existem grupos para convidar
    if (grupos.length === 0) {
        return res.status(400).json({ erro: 'Não há grupos disponíveis para enviar convites' });
    }

    // Selecionar um grupo aleatório
    const grupo = grupos[Math.floor(Math.random() * grupos.length)];

    // Criar notificação de convite
    const convite = {
        id: Date.now().toString(),
        tipo: 'convite',
        titulo: 'Convite para Grupo',
        mensagem: `Você foi convidado por ${usuarioAtual ? usuarioAtual.nome : 'João'} para participar do grupo "${grupo.name}"`,
        grupoId: grupo.id,
        grupoNome: grupo.name,
        lida: false,
        data: new Date()
    };

    notificacoes.push(convite);

    res.json({
        sucesso: true,
        message: 'Convite de demonstração criado com sucesso',
        convite
    });
});

// =========================================================
// INICIANDO O SERVIDOR
// =========================================================

// Inicia o servidor na porta definida
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
}); 