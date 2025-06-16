const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const db = require('./db');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, 'public/images/grupos');
        
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'group-' + uniqueSuffix + ext);
    }
});

const storagePerfil = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, 'public/images/perfil');
        
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'profile-' + uniqueSuffix + ext);
    }
});

const storageProduto = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, 'public/images/produtos');
        
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'produto-' + uniqueSuffix + ext);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Apenas imagens são permitidas!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

const uploadPerfil = multer({ 
    storage: storagePerfil,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

const uploadProduto = multer({ 
    storage: storageProduto,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

let usuarios = [];
let grupos = [];
let registros = [];
let produtos = [];
let notificacoes = [];

usuarios.push({
    id: '12345',
    nome: 'User',
    email: 'user@example.com',
    senha: '123456',
    apelido: 'Apelido',
    telefone: '(99) 99999-9999',
    photo: '/images/default-profile.svg'
});

notificacoes.push({
    id: Date.now().toString(),
    tipo: 'info',
    titulo: 'Bem-vindo ao Inbox',
    mensagem: 'Seja bem-vindo ao Inbox, seu app de gerenciamento de objetos',
    lida: false,
    data: new Date()
});

let usuarioAtual = null;

grupos.push({
    id: '1',
    name: 'Casa',
    photo: '/images/default-group.svg',
    createdAt: new Date()
});

grupos.push({
    id: '2',
    name: 'Trabalho',
    photo: '/images/default-group.svg',
    createdAt: new Date()
});

grupos.push({
    id: '3',
    name: 'Faculdade',
    photo: '/images/default-group.svg',
    createdAt: new Date()
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
    const { email, senha } = req.body;
    
    try {
        const result = await db.query('SELECT * FROM usuario WHERE email = $1 AND senha = $2', [email, senha]);
        
        if (result.rows.length > 0) {
            usuarioAtual = result.rows[0];
            await db.query('UPDATE usuario SET ultimo_login = CURRENT_TIMESTAMP WHERE id = $1', [usuarioAtual.id]);
            res.redirect('/');
        } else {
            res.render('login', { erro: 'Email ou senha inválidos' });
        }
    } catch (error) {
        console.error('Erro no login:', error);
        res.render('login', { erro: 'Erro ao fazer login' });
    }
});

app.get('/registro', (req, res) => {
    res.render('registro');
});

app.post('/registro', async (req, res) => {
    const { nome, email, senha, confirmar_senha } = req.body;

    if (senha !== confirmar_senha) {
        return res.render('registro', {
            error: 'As senhas não coincidem',
            nome,
            email
        });
    }

    try {
        const emailCheck = await db.query('SELECT id FROM usuario WHERE email = $1', [email]);
        if (emailCheck.rows.length > 0) {
            return res.render('registro', {
                error: 'Este email já está em uso',
                nome
            });
        }

        const result = await db.query(
            'INSERT INTO usuario (nome, email, senha, apelido, telefone, foto, data_criacao) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP) RETURNING *',
            [nome, email, senha, '', '', '/images/default-profile.svg']
        );
        const novoUsuario = result.rows[0];
        novoUsuario.registroCriado = true;

        usuarioAtual = novoUsuario;

        notificacoes.push({
            id: Date.now().toString(),
            tipo: 'info',
            titulo: 'Conta criada com sucesso',
            mensagem: `Bem-vindo ao Inbox, ${nome}!`,
            lida: false,
            data: new Date()
        });

        res.redirect('/completar-perfil');
    } catch (error) {
        console.error('Erro ao registrar usuário (detalhe):', error);
        res.render('registro', {
            error: 'Erro ao registrar usuário',
            nome,
            email
        });
    }
});

app.get('/completar-perfil', (req, res) => {
    if (!usuarioAtual || !usuarioAtual.registroCriado) {
        return res.redirect('/login');
    }
    
    res.render('completar-perfil');
});

app.post('/completar-perfil', uploadPerfil.single('profile-photo'), async (req, res) => {
    if (!usuarioAtual) {
        return res.redirect('/login');
    }
    
    try {
        const { apelido, telefone } = req.body;
        let photoPath = usuarioAtual.photo;
        
        if (req.file) {
            photoPath = `/images/perfil/${req.file.filename}`;
        }
        
        await db.query(
            'UPDATE usuario SET apelido = $1, telefone = $2, foto = $3 WHERE id = $4',
            [apelido || '', telefone || '', photoPath, usuarioAtual.id]
        );
        
        usuarioAtual.apelido = apelido || '';
        usuarioAtual.telefone = telefone || '';
        usuarioAtual.photo = photoPath;
        
        usuarioAtual.registroCriado = false;
        
        res.redirect('/');
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        res.render('completar-perfil', { error: 'Erro ao atualizar perfil' });
    }
});

app.get('/logout', (req, res) => {
    usuarioAtual = null;
    
    res.redirect('/login');
});

app.get('/', async (req, res) => {
    if (!usuarioAtual) {
        return res.redirect('/login');
    }

    try {
        const gruposResult = await db.query(`
            SELECT g.id, g.nome as name, g.descricao, g.imagem, g.criador_id, g.data_criacao FROM grupo g
            LEFT JOIN membro_grupo mg ON g.id = mg.grupo_id
            WHERE g.criador_id = $1 OR mg.usuario_id = $1
        `, [usuarioAtual.id]);

        const gruposFormatados = gruposResult.rows.map(group => ({
            ...group,
            imagem: group.imagem || '/images/default-group.svg'
        }));

        const notificacoesResult = await db.query(`
            SELECT * FROM notificacao 
            WHERE usuario_id = $1 AND lida = false
            ORDER BY data_criacao DESC
        `, [usuarioAtual.id]);

        const user = {
            name: usuarioAtual.nome,
            groups: gruposFormatados,
            notificacoes: notificacoesResult.rows
        };
        res.render('index', { user });
    } catch (error) {
        console.error('Erro ao carregar página inicial:', error);
        res.status(500).send('Erro ao carregar página inicial');
    }
});

app.get('/produtos', (req, res) => {
    if (!usuarioAtual) {
        return res.redirect('/login');
    }
    
    res.render('produtos', { 
        grupos: grupos,
        produtos: produtos
    });
});

app.get('/perfil', async (req, res) => {
    if (!usuarioAtual) {
        return res.redirect('/login');
    }

    const gruposResult = await db.query(`
        SELECT g.* FROM grupo g
        LEFT JOIN membro_grupo mg ON g.id = mg.grupo_id
        WHERE g.criador_id = $1 OR mg.usuario_id = $1
    `, [usuarioAtual.id]);

    const user = {
        name: usuarioAtual.nome,
        id: usuarioAtual.id,
        photo: usuarioAtual.photo,
        apelido: usuarioAtual.apelido,
        email: usuarioAtual.email,
        telefone: usuarioAtual.telefone,
        historico: []
    };

    res.render('perfil', { user, grupos: gruposResult.rows });
});

app.get('/notificacoes', (req, res) => {
    if (!usuarioAtual) {
        return res.redirect('/login');
    }
    
    res.render('notificacoes', { notificacoes });
});

app.get('/criar-grupo', (req, res) => {
    if (!usuarioAtual) {
        return res.redirect('/login');
    }
    
    res.render('criar-grupo');
});

app.post('/criar-grupo', upload.single('groupPhoto'), async (req, res) => {
    if (!usuarioAtual) {
        return res.redirect('/login');
    }

    try {
        const { nome, descricao } = req.body;
        let photoPath = '/images/default-group.svg';
        
        if (req.file) {
            photoPath = `/images/grupos/${req.file.filename}`;
        }

        const grupoResult = await db.query(
            'INSERT INTO grupo (nome, descricao, imagem, criador_id) VALUES ($1, $2, $3, $4) RETURNING id',
            [nome, descricao || '', photoPath, usuarioAtual.id]
        );

        await db.query(
            'INSERT INTO membro_grupo (usuario_id, grupo_id) VALUES ($1, $2)',
            [usuarioAtual.id, grupoResult.rows[0].id]
        );

        await db.query(
            'INSERT INTO notificacao (usuario_id, tipo, titulo, mensagem) VALUES ($1, $2, $3, $4)',
            [usuarioAtual.id, 'grupo', 'Novo Grupo Criado', `Você criou o grupo "${nome}"`]
        );

        res.redirect('/grupos');
    } catch (error) {
        console.error('Erro ao criar grupo:', error);
        res.status(500).send('Erro ao criar grupo');
    }
});

app.get('/grupos', async (req, res) => {
    if (!usuarioAtual) {
        return res.redirect('/login');
    }

    try {
        const gruposResult = await db.query(`
            SELECT g.* FROM grupo g
            LEFT JOIN membro_grupo mg ON g.id = mg.grupo_id
            WHERE g.criador_id = $1 OR mg.usuario_id = $1
        `, [usuarioAtual.id]);

        res.render('grupos', {
            grupos: gruposResult.rows
        });
    } catch (error) {
        console.error('Erro ao buscar grupos:', error);
        res.status(500).send('Erro ao buscar grupos');
    }
});

app.get('/api/produtos/grupo/:id', async (req, res) => {
    if (!usuarioAtual) {
        return res.status(401).json({ erro: 'Não autorizado' });
    }

    try {
        const grupoId = req.params.id;

        const membroResult = await db.query(`
            SELECT 1 FROM membro_grupo 
            WHERE usuario_id = $1 AND grupo_id = $2
        `, [usuarioAtual.id, grupoId]);

        if (membroResult.rows.length === 0) {
            return res.status(403).json({ erro: 'Você não é membro deste grupo' });
        }

        const produtosResult = await db.query(
            'SELECT * FROM produto WHERE grupo_id = $1',
            [grupoId]
        );

        res.json(produtosResult.rows);
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        res.status(500).json({ erro: 'Erro ao buscar produtos' });
    }
});

app.post('/api/produtos', async (req, res) => {
    if (!usuarioAtual) {
        return res.status(401).json({ erro: 'Não autorizado' });
    }

    try {
        const { nome, descricao, groupId } = req.body;
        
        if (!nome || !groupId) {
            return res.status(400).json({ erro: 'Nome e grupo são obrigatórios' });
        }

        const membroResult = await db.query(`
            SELECT 1 FROM membro_grupo 
            WHERE usuario_id = $1 AND grupo_id = $2
        `, [usuarioAtual.id, groupId]);

        if (membroResult.rows.length === 0) {
            return res.status(403).json({ erro: 'Você não é membro deste grupo' });
        }

        const produtoResult = await db.query(
            'INSERT INTO produto (nome, descricao, grupo_id, criador_id) VALUES ($1, $2, $3, $4) RETURNING *',
            [nome, descricao || '', groupId, usuarioAtual.id]
        );

        res.status(201).json(produtoResult.rows[0]);
    } catch (error) {
        console.error('Erro ao adicionar produto:', error);
        res.status(500).json({ erro: 'Erro ao adicionar produto' });
    }
});

app.post('/api/notificacoes/:id/lida', async (req, res) => {
    if (!usuarioAtual) {
        return res.status(401).json({ erro: 'Não autorizado' });
    }

    try {
        await db.query(
            'UPDATE notificacao SET lida = true WHERE id = $1 AND usuario_id = $2',
            [req.params.id, usuarioAtual.id]
        );

        res.json({ sucesso: true });
    } catch (error) {
        console.error('Erro ao marcar notificação como lida:', error);
        res.status(500).json({ erro: 'Erro ao marcar notificação como lida' });
    }
});

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

app.delete('/api/notificacoes', (req, res) => {
    notificacoes = [];
    res.json({ sucesso: true });
});

app.get('/api/notificacoes/nao-lidas', (req, res) => {
    const naoLidas = notificacoes.filter(n => !n.lida);
    res.json({ 
        count: naoLidas.length,
        has_unread: naoLidas.length > 0
    });
});

app.post('/api/convites/grupo', (req, res) => {
    const { grupoId, grupoNome, remetente } = req.body;
    
    if (!grupoId || !grupoNome) {
        return res.status(400).json({ erro: 'Dados do grupo são obrigatórios' });
    }
    
    const nomeRemetente = usuarioAtual ? usuarioAtual.nome : (remetente || 'um usuário');
    
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

app.post('/api/convites/:id/aceitar', (req, res) => {
    const conviteId = req.params.id;
    const convite = notificacoes.find(n => n.id === conviteId && n.tipo === 'convite');
    
    if (!convite) {
        return res.status(404).json({ erro: 'Convite não encontrado' });
    }
    
    const grupo = grupos.find(g => g.id === convite.grupoId);
    
    if (!grupo) {
        return res.status(404).json({ erro: 'Grupo não encontrado' });
    }
    
    convite.lida = true;
    
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

app.get('/api/demo/adicionar-convite', (req, res) => {
    if (grupos.length === 0) {
        return res.status(400).json({ erro: 'Não há grupos disponíveis para enviar convites' });
    }
    
    const grupo = grupos[Math.floor(Math.random() * grupos.length)];
    
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

app.get('/criar-produto', (req, res) => {
    if (!usuarioAtual) {
        return res.redirect('/login');
    }
    
    const grupoId = req.query.grupoId;
    if (!grupoId) {
        return res.redirect('/grupos');
    }
    
    res.render('criar-produto', { grupoId, dados: null, erro: null });
});

app.post('/criar-produto', uploadProduto.single('productPhoto'), async (req, res) => {
    if (!usuarioAtual) {
        return res.redirect('/login');
    }
    
    const { nome, descricao, categoria, quantidade, grupoId } = req.body;
    const photo = req.file ? `/images/produtos/${req.file.filename}` : '/images/default-product.svg';
    
    try {
        const result = await db.query(
            'INSERT INTO produto (nome, descricao, categoria, quantidade, foto, grupo_id, criador_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [nome, descricao, categoria, quantidade, photo, grupoId, usuarioAtual.id]
        );
        
        res.redirect('/grupos');
    } catch (error) {
        console.error('Erro ao criar produto:', error);
        res.render('criar-produto', { 
            erro: 'Erro ao criar produto',
            grupoId,
            dados: req.body
        });
    }
});

app.get('/api/produtos/:grupoId', async (req, res) => {
    if (!usuarioAtual) {
        return res.status(401).json({ erro: 'Não autorizado' });
    }
    
    const { grupoId } = req.params;
    
    try {
        const result = await db.query(`
            SELECT p.*, 
                (p.quantidade - COALESCE(
                    (SELECT COUNT(*) FROM reserva r 
                     WHERE r.produto_id = p.id 
                     AND r.status IN ('pendente', 'aprovada', 'em_andamento')
                     AND r.data_fim >= CURRENT_DATE), 0)) AS quantidade_disponivel
            FROM produto p
            WHERE p.grupo_id = $1
            ORDER BY p.nome
        `, [grupoId]);
        
        const produtos = result.rows.map(produto => ({
            ...produto,
            quantidade: produto.quantidade_disponivel
        }));
        
        res.json(produtos);
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        res.status(500).json({ erro: 'Erro ao buscar produtos' });
    }
});

app.get('/reserva/:produtoId', async (req, res) => {
    if (!usuarioAtual) {
        return res.redirect('/login');
    }
    const produtoId = req.params.produtoId;
    try {
        const result = await db.query('SELECT * FROM produto WHERE id = $1', [produtoId]);
        if (result.rows.length === 0) {
            return res.status(404).render('reserva', { produto: null });
        }
        const produto = result.rows[0];
        res.render('reserva', { produto });
    } catch (error) {
        console.error('Erro ao buscar produto para reserva:', error);
        res.status(500).render('reserva', { produto: null });
    }
});

app.post('/reservar', async (req, res) => {
    if (!usuarioAtual) {
        return res.redirect('/login');
    }
    const { produto_id, data_inicio, data_fim, observacoes } = req.body;
    const usuario_id = usuarioAtual.id;
    if (!produto_id || !data_inicio || !data_fim) {
        return res.status(400).send('Dados incompletos');
    }
    try {
        const produtoResult = await db.query('SELECT * FROM produto WHERE id = $1', [produto_id]);
        if (produtoResult.rows.length === 0) {
            return res.status(404).send('Produto não encontrado');
        }
        const produto = produtoResult.rows[0];
        await db.query(
            `SELECT criar_reserva($1, $2, $3, $4, 1)`,
            [produto_id, usuario_id, data_inicio, data_fim]
        );
        res.redirect('/grupos');
    } catch (err) {
        let msg = 'Erro ao criar reserva';
        if (err.message) {
            msg += ': ' + err.message;
        }
        res.status(400).send(msg);
    }
});

app.get('/api/minhas-reservas', async (req, res) => {
    if (!usuarioAtual) {
        return res.status(401).json({ erro: 'Não autorizado' });
    }
    try {
        const result = await db.query(`
            SELECT r.id, r.data_fim, r.status, p.nome, p.foto, p.categoria
            FROM reserva r
            JOIN produto p ON r.produto_id = p.id
            WHERE r.usuario_id = $1 AND r.status IN ('pendente', 'aprovada', 'em_andamento')
            ORDER BY r.data_fim
        `, [usuarioAtual.id]);
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar reservas:', error);
        res.status(500).json({ erro: 'Erro ao buscar reservas' });
    }
});

app.post('/api/devolver-reserva/:id', async (req, res) => {
    if (!usuarioAtual) {
        return res.status(401).json({ erro: 'Não autorizado' });
    }
    const reservaId = req.params.id;
    try {
        await db.query(
            `UPDATE reserva SET status = 'concluida' WHERE id = $1 AND usuario_id = $2`,
            [reservaId, usuarioAtual.id]
        );
        res.json({ sucesso: true });
    } catch (error) {
        console.error('Erro ao devolver reserva:', error);
        res.status(500).json({ erro: 'Erro ao devolver reserva' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
}); 