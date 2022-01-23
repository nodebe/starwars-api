const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient()

async function addComments(movie_id, comment, commentor_ip){
    try{
        const add_comment = await prisma.comment.create({
            data: {
              movie_id,
              comment,
              commentor_ip
            },
        });
        return {"status":"ok"}
    } catch(error){
        throw new Error(`Database error on function addComments: ${error}`)
    }
    
}

// fetch comments from database
async function fetchMovieComments(movie_id){
    try {
        const comments = await prisma.comment.findMany({
            where:{
                movie_id: movie_id
            },
        })
        return comments.reverse() 
    } catch (error) {
        throw new Error(`Database error on function fetchMovieComments: ${error}`)
    }
    
}

const movies_arranger = async (movies) => {
    try {
        let arranged_movies = []

        for (const result of movies) {
            let movie = {}
            movie['title'] = result.title
            movie['id'] = result.episode_id
            movie['opening_crawl'] = result.opening_crawl
            comments = await fetchMovieComments(result.episode_id)
            movie['no. of comments'] = comments.length
            movie['date'] = result.release_date
            arranged_movies.push(movie)
        }

        return  await sortByDate(await arranged_movies);
    } catch (error) {
        throw new Error(`Error on function movies_arranger: ${error}`)
    }
    
}

const getComments = async(movie_id) => {
    // Fetch comments from database
    const fetch_comments = await fetchMovieComments(movie_id)
    return fetch_comments
}

const sortByDate = (movie_list) => {
    // This returns the movie list sorted by their date
    const sorter = (a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    sorted_movies = movie_list.sort(sorter)

    return sorted_movies
}

const character_arranger = async (parameters, characters) => {
    const sort_characters = await character_sort(parameters.sort, parameters.sortType, characters)
    
    const filter_characters = await characters_filter(parameters.gender, sort_characters)
    
    const total_number_of_characters = filter_characters.length
    let total_height_of_characters_in_cm = 0
    let total_height_of_characters_in_feet = 0

    const arranged_characters = []

    for (const i of filter_characters){
        let character = {}
        character['name'] = i['name']
        character['height_in_cm'] = i.height
        character['height_in_feet'] = (i.height * 0.0328084).toFixed(2)

        // Adding height of character to the total height
        total_height_of_characters_in_cm += ( 1 * character['height_in_cm'])
        total_height_of_characters_in_feet += (1 * character['height_in_feet'])

        // Pushing character's data to arranged_characters
        arranged_characters.push(character)
    }

    response = {
        total_number_of_characters,
        total_height_of_characters_in_cm,
        total_height_of_characters_in_feet,
        arranged_characters
    }
    return response
}

const character_sort = (sort_param, sort_type, characters) => {
    // This function sorts the characters according to the sort parameters passed in
    if (sort_param === "name" || sort_param === "gender"){
        characters.sort(function(a, b){
            let x = a[sort_param].toLowerCase();
            let y = b[sort_param].toLowerCase();
            if (x < y) {return -1} 
            if (x > y) {return 1}
            return 0;
        })
    }else if (sort_param === "height"){
        characters.sort(function(a, b){
            return a - b
        });
    }

    if (sort_type === "desc"){
        return characters.reverse();
    }else {
        return characters;
    }
    
}

const characters_filter = (filter_param, characters) => {
    let filtered_characters = [];
    for (let i = 0; i < characters.length; i++){
        if (characters[i]['gender'] === filter_param){
            matched_character = filtered_characters.push(characters[i])
        }
    }
    return filtered_characters
}

module.exports = {
    movies_arranger,
    character_arranger,
    addComments,
    fetchMovieComments
}