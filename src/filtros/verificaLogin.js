const conexao = require("../conexao");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = require("../jwt-secret");

const verificaLogin = async (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization) {
        return res.status(401).json({ "mensagem": "Para acessar este recurso um token de autenticação válido deve ser enviado." });
    }

    const token = authorization.replace("Bearer ", "");

    try {
        const { id } = jwt.verify(token, JWT_SECRET);
        const queryConsultaUsuario = "select * from usuarios where id = $1";
        const usuarios = await conexao.query(queryConsultaUsuario, [id]);

        if (usuarios.rowCount === 0) {
            return res.status(404).json({ "mensagem": "Não foi encontrado um usuário para o token informado" });
        }

        const { senha, ...usuario } = usuarios.rows[0];
        req.usuario = usuario;

        next();
    } catch (error) {
        return res.status(400).json({ "mensagem": error.message });
    }
}

module.exports = verificaLogin;