const express = require("express");
const usuarios = require("./controladores/usuarios");
const produtos = require("./controladores/produtos");
const verificaLogin = require("./filtros/verificaLogin");

const rotas = express();

rotas.post("/usuario", usuarios.cadastrarUsuario);
rotas.post("/login", usuarios.logarUsuario);

rotas.use(verificaLogin);

rotas.get("/usuario", usuarios.obterUsuario);
rotas.put("/usuario", usuarios.atualizarUsuario);

rotas.get("/produtos", produtos.listarProdutos);
rotas.get("/produtos/:id", produtos.obterProduto);
rotas.post("/produtos", produtos.cadastrarProduto);
rotas.put("/produtos/:id", produtos.atualizarProduto);
rotas.delete("/produtos/:id", produtos.deletarProduto);

module.exports = rotas;