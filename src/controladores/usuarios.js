const conexao = require("../conexao");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = require("../jwt-secret");

const cadastrarUsuario = async (req, res) => {
    const { nome, email, senha, nome_loja } = req.body;

    if (!nome) {
        return res.status(400).json({ "mensagem": "O campo nome é obrigatório" });
    }
    if (!email) {
        return res.status(400).json({ "mensagem": "O campo email é obrigatório" });
    }
    if (!senha) {
        return res.status(400).json({ "mensagem": "O campo senha é obrigatório" });
    }
    if (!nome_loja) {
        return res.status(400).json({ "mensagem": "O campo nome_loja é obrigatório" });
    }

    try {
        const queryVerificacao = "select * from usuarios where email = $1";
        const { rowCount: quantidadeUsuarios } = await conexao.query(queryVerificacao, [email]);

        if (quantidadeUsuarios > 0) {
            return res.status(400).json({ "mensagem": "Já existe usuário cadastrado com o e-mail informado." });
        }

        const senhaCriptografada = await bcrypt.hash(senha, 10);

        const queryCadastro = "insert into usuarios (nome, email, senha, nome_loja) values ($1, $2, $3, $4)";
        const usuarioCadastrado = await conexao.query(queryCadastro, [nome, email, senhaCriptografada, nome_loja]);

        if (usuarioCadastrado.rowCount === 0) {
            return res.status(400).json({ "mensagem": "Não foi possível cadastrar o usuário" });
        }

        return res.status(201).json();
    } catch (error) {
        return res.status(400).json(error);
    }
}

const logarUsuario = async (req, res) => {
    const { email, senha } = req.body;

    if (!email) {
        return res.status(400).json({ "mensagem": "O campo email é obrigatório" });
    }
    if (!senha) {
        return res.status(400).json({ "mensagem": "O campo senha é obrigatório" });
    }

    try {
        const queryProcurarUsuario = "select * from usuarios where email = $1";
        const usuarios = await conexao.query(queryProcurarUsuario, [email]);

        if (usuarios.rowCount === 0) {
            return res.status(400).json({ "mensagem": "Usuário e/ou senha inválido(s)." });
        }

        const usuario = usuarios.rows[0];
        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

        if (!senhaCorreta) {
            return res.status(400).json({ "mensagem": "Usuário e/ou senha inválido(s)." });
        }

        const token = jwt.sign({ id: usuario.id }, JWT_SECRET);
        return res.status(200).json({ "mensagem": token });
    } catch (error) {
        return res.status(400).json(error);
    }
}

const obterUsuario = async (req, res) => {
    const { usuario } = req;

    if (!usuario) {
        return res.status(401).json({ "mensagem": "Para acessar este recurso um token de autenticação válido deve ser enviado." });
    }

    return res.status(200).json(usuario);
}

const atualizarUsuario = async (req, res) => {
    const { usuario } = req;
    const { nome, email, senha, nome_loja } = req.body;

    if (!usuario) {
        return res.status(401).json({ "mensagem": "Para acessar este recurso um token de autenticação válido deve ser enviado." });
    }
    if (!nome) {
        return res.status(400).json({ "mensagem": "O campo nome é obrigatório" });
    }
    if (!email) {
        return res.status(400).json({ "mensagem": "O campo email é obrigatório" });
    }
    if (!senha) {
        return res.status(400).json({ "mensagem": "O campo senha é obrigatório" });
    }
    if (!nome_loja) {
        return res.status(400).json({ "mensagem": "O campo nome_loja é obrigatório" });
    }

    try {
        const queryVericacaoEmail = "select * from usuarios where email = $1 and id <> $2";
        const usuarios = await conexao.query(queryVericacaoEmail, [email, usuario.id]);

        if (usuarios.rowCount > 0) {
            return res.status(400).json({ "mensagem": "Já existe usuário cadastrado com o e-mail informado." });
        }

        const senhaCriptografada = await bcrypt.hash(senha, 10);

        const queryAtualizarUsuario = `update usuarios set
            nome = $1,
            email = $2,
            senha = $3,
            nome_loja = $4
            where id = $5
        `;
        const usuarioAtualizado = await conexao.query(queryAtualizarUsuario,
            [nome, email, senhaCriptografada, nome_loja, usuario.id]);

        if (usuarioAtualizado.rowCount === 0) {
            return res.status(400).json({ "mensagem": "Não foi possível atualizar o usuário" });
        }

        return res.status(204).json();
    } catch (error) {
        return res.status(400).json(error);
    }

}

module.exports = {
    cadastrarUsuario,
    logarUsuario,
    obterUsuario,
    atualizarUsuario
}