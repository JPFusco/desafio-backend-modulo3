const conexao = require("../conexao");

const listarProdutos = async (req, res) => {
    const { usuario } = req;
    const { categoria } = req.query;

    if (!usuario) {
        return res.status(401).json({ "mensagem": "Para acessar este recurso um token de autenticação válido deve ser enviado." });
    }

    try {
        let produtos;

        if (!categoria) {
            const queryListagem = "select * from produtos where usuario_id = $1 order by id";
            produtos = await conexao.query(queryListagem, [usuario.id]);
        }
        else {
            const queryListagem = "select * from produtos where usuario_id = $1 and categoria = $2 order by id";
            produtos = await conexao.query(queryListagem, [usuario.id, categoria]);
        }

        return res.status(200).json(produtos.rows);
    } catch (error) {
        return res.status(400).json(error);
    }
}

const obterProduto = async (req, res) => {
    const { usuario } = req;
    const { id: produtoId } = req.params;

    if (!usuario) {
        return res.status(401).json({ "mensagem": "Para acessar este recurso um token de autenticação válido deve ser enviado." });
    }

    try {
        const queryObterProduto = "select * from produtos where id = $1";
        const produtos = await conexao.query(queryObterProduto, [produtoId]);

        if (produtos.rowCount === 0) {
            return res.status(404).json({ "mensagem": `Não existe produto cadastrado com ID ${produtoId}.` });
        }

        const produto = produtos.rows[0];

        if (produto.usuario_id !== usuario.id) {
            return res.status(403).json({ "mensagem": "O usuário logado não tem permissão para acessar este produto." });
        }

        return res.status(200).json(produto);
    } catch (error) {
        return res.status(400).json(error);
    }
}

const cadastrarProduto = async (req, res) => {
    const { usuario } = req;
    const { nome, quantidade, categoria, preco, descricao, imagem } = req.body;

    if (!usuario) {
        return res.status(401).json({ "mensagem": "Para cadastrar um produto, o usuário deve estar autenticado." });
    }
    if (!nome) {
        return res.status(400).json({ "mensagem": "O nome do produto deve ser informado" });
    }
    if (quantidade <= 0) {
        return res.status(400).json({ "mensagem": "A quantidade do produto deve ser maior que zero" });
    }
    if (!quantidade) {
        return res.status(400).json({ "mensagem": "A quantidade do produto deve ser informada" });
    }
    if (!preco) {
        return res.status(400).json({ "mensagem": "O preco do produto deve ser informado" });
    }
    if (!descricao) {
        return res.status(400).json({ "mensagem": "A descrição do produto deve ser informada" });
    }

    try {
        const queryCadastro = `insert into produtos (usuario_id, nome, quantidade, categoria, preco, descricao, imagem)
            values ($1, $2, $3, $4, $5, $6, $7)
        `;
        const produtoCadastrado = await conexao.query(queryCadastro,
            [usuario.id, nome, quantidade, categoria, preco, descricao, imagem]
        );

        if (produtoCadastrado.rowCount === 0) {
            return res.status(400).json({ "mensagem": "Não foi possível cadastrar o produto" });
        }

        return res.status(201).json();
    } catch (error) {
        return res.status(400).json(error);
    }
}

const atualizarProduto = async (req, res) => {
    const { usuario } = req;
    const { id: produtoId } = req.params;
    const { nome, quantidade, categoria, preco, descricao, imagem } = req.body;

    if (!usuario) {
        return res.status(401).json({ "mensagem": "Para atualizar um produto, o usuário deve estar autenticado." });
    }
    if (!nome) {
        return res.status(400).json({ "mensagem": "O campo nome é obrigatório" });
    }
    if (!quantidade) {
        return res.status(400).json({ "mensagem": "O campo quantidade é obrigatório" });
    }
    if (!preco) {
        return res.status(400).json({ "mensagem": "O campo preco é obrigatório" });
    }
    if (!descricao) {
        return res.status(400).json({ "mensagem": "O campo descricao é obrigatório" });
    }

    try {
        const queryObterProduto = "select * from produtos where id = $1";
        const produtos = await conexao.query(queryObterProduto, [produtoId]);

        if (produtos.rowCount === 0) {
            return res.status(404).json({ "mensagem": `Não existe produto cadastrado com ID ${produtoId}.` });
        }

        const produto = produtos.rows[0];

        if (produto.usuario_id !== usuario.id) {
            return res.status(403).json({ "mensagem": "O usuário logado não tem permissão para atualizar este produto." });
        }

        const queryAtualizarProduto = `update produtos set 
            nome = $1,
            quantidade = $2,
            categoria = $3,
            preco = $4,
            descricao = $5,
            imagem = $6
            where id = $7
        `;
        const produtoAtualizado = await conexao.query(queryAtualizarProduto,
            [nome, quantidade, categoria, preco, descricao, imagem, produtoId]
        );

        if (produtoAtualizado.rowCount === 0) {
            return res.status(400).json({ "mensagem": "Não foi possível atualizar o produto" });
        }

        return res.status(204).json();
    } catch (error) {
        return res.status(400).json(error);
    }
}

const deletarProduto = async (req, res) => {
    const { usuario } = req;
    const { id: produtoId } = req.params;

    if (!usuario) {
        return res.status(401).json({ "mensagem": "Para remover um produto, o usuário deve estar autenticado." });
    }

    try {
        const queryObterProduto = "select * from produtos where id = $1";
        const produtos = await conexao.query(queryObterProduto, [produtoId]);

        if (produtos.rowCount === 0) {
            return res.status(404).json({ "mensagem": `Não existe produto cadastrado com ID ${produtoId}.` });
        }

        const produto = produtos.rows[0];

        if (produto.usuario_id !== usuario.id) {
            return res.status(403).json({ "mensagem": "O usuário logado não tem permissão para remover este produto." });
        }

        const queryRemoverProduto = `delete from produtos where id = $1`;
        const produtoRemovido = await conexao.query(queryRemoverProduto, [produtoId]);

        if (produtoRemovido.rowCount === 0) {
            return res.status(400).json({ "mensagem": "Não foi possível remover o produto" });
        }

        return res.status(204).json();
    } catch (error) {
        return res.status(400).json(error);
    }
}

module.exports = {
    listarProdutos,
    obterProduto,
    cadastrarProduto,
    atualizarProduto,
    deletarProduto
}