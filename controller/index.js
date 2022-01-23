const { Router } = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const utils = require("../utils")

const api = Router();
const jsonParser = bodyParser.json();

const error_call = (res, error) => {
    console.log(error)
    return res.status(500).json({
        message: "Internal Server Error"
    });
}

const url = 'https://swapi.py4e.com/api/'

const home = (req, res) => {
	try {
		res.status(200).json({
            message: 'Welcome to Star Wars Movie Phase',
            data: {
                projectName: 'MetaCare StarWars',
                author: 'Ikem Nodebechukwu Anthony',
            }
        });
	} catch (e) {
		return error_call(res, e);
	}
};

const movies = ( async (req, res) => {
    try{
        movies_list = []
        const response = await axios.get(url + 'films')
        const movies = await response.data.results;
            
        const arrange = await utils.movies_arranger(movies);

        return res.status(200).json({
            "response" : arrange
        })
    } catch(e){
        return error_call(res, e)
    }
})

const characters = async (req, res) => {
    try {
        const response = await axios.get(url + `films/${req.body.movie_id}`);
        const response_characters = await response.data.characters

        // Fetching and storing individual character metadata
        const characters = []
        for (const character of response_characters){
            const fetch_character = await axios.get(`${character}`)
            const char= await fetch_character.data
            characters.push(char)
        }

        const query = req.body;
        const sort = query.sort;
        const sortType = query.sortType;
        const gender = query.gender;
        const parameters = {sort, sortType, gender}

        // Passing to the character_arrange function
        const arrange = await utils.character_arranger(parameters, characters);

        return res.status(200).json({
            "response": await arrange
        });
    } catch (e) {
        return error_call(res, e);
    }
}

const add_comment = ( async (req, res) => {
    try {
        const movie_id = req.body.movie_id;
        const comment = req.body.comment.slice(0, 500); // This limits the comment length to 500
        const commentor_ip = req.body.commentor_ip;
        const add_comment = await utils.addComments(movie_id, comment, commentor_ip);
        if (add_comment.status == "ok"){
            return res.status(200).json({
                "response": "Comment Added Successfully!"
            })
        }

    } catch (e) {
        error_call(res, e)
    }
})

const list_comments = ( async (req, res) => {
    try {
        const movie_id = req.body.movie_id;
        const fetch_comments = await utils.fetchMovieComments(movie_id);

        return res.status(200).json({
            "response": fetch_comments
        })

    } catch (e) {
        error_call(res, e)
    }
})

module.exports = () => {

	api.get('/', home);
    api.get('/movie_list', movies);
    api.get('/get_characters', jsonParser, characters);
    api.post('/add_comment', jsonParser, add_comment)
    api.get('/list_comments', jsonParser, list_comments)

	return api;
};