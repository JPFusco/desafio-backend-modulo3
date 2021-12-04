drop table if exists usuarios;

create table usuarios (
    id serial primary key,
    nome text not null,
    nome_loja text not null,
    email text not null unique,
    senha text not null
);

drop table if exists produtos;

create table produtos (
    id serial primary key,
    usuario_id integer not null references usuarios (id),
    nome text not null,
    quantidade integer not null,
    categoria text not null,
    preco integer not null,
    descricao text not null,
    imagem text not null
);