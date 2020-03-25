const crypto = require('crypto');
const connection = require('../database/connection');

module.exports = {
    // Request, cliente manda pra API (pessoa solicita para ver o conteúdo)
    // Response: API manda pro cliente (eu disponibilizo o conteúdo)
    async index (request, response){
        const ongs = await connection('ongs').select('*');

        return response.json(ongs);
    },

    async create (request, response){
        // desestruturação (em vez de const 'body = request.body', uma variável para cada campo)
        const {name, email, whatsapp, city, uf} = request.body;

        // pacote do node para criptografia, possui método para criar uma string aleatória (4 bytes hexadecimais)
        const id = crypto.randomBytes(4).toString('HEX');

        // o await é pq o insert demora, então espera terminar o insert todo para retornar o json, então adicionei um async na função POST
        await connection('ongs').insert({
            id,
            name,
            email,
            whatsapp,
            city,
            uf,
        })

        return response.json({id});
    }
};