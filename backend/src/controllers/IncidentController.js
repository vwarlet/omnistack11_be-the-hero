const connection = require('../database/connection');

module.exports = {
    async index (request, response){
        const { page = 1 } = request.query;

        const [count] = await connection('incidents').count();

        const incidents = await connection('incidents')
            // tabela ongs, onde o ongs.id é igual ao incidents.ong_id
            .join('ongs', 'ongs.id', '=', 'incidents.ong_id')
            .limit(5)
            .offset((page - 1) * 5)
            .select(['incidents.*', 'ongs.name', 'ongs.email', 'ongs.whatsapp', 'ongs.city', 'ongs.uf']); //se mandar listar tudo, o incidente retorna o id da ong (mesmo nome 'id')

        response.header('X-Total-Count', count['count(*)']);

        return response.json(incidents);
    },

    async create (request, response){
        // desestruturação (em vez de const 'body = request.body', uma variável para cada campo)
        const {title, description, value} = request.body;

        const ong_id = request.headers.authorization;

        // o await é pq o insert demora, então espera terminar o insert todo para retornar o json, então adicionei um async na função POST
        const [id] = await connection('incidents').insert({
            title,
            description,
            value,
            ong_id,
        })

        return response.json({id});
    },

    async delete (request, response){
        const {id} = request.params;
        const ong_id = request.headers.authorization;

        const incident = await connection('incidents').where('id',id).select('ong_id').first();
        
        if(incident.ong_id !== ong_id){
            return response.status(401).json({ error: 'Operation not permited.' });
        }

        await connection('incidents').where('id',id).delete();

        // status 204: sem conteúdo
        return response.status(204).send();
    }
};