const { movieValidationSchema } = require("../../../Helper/joivalidation");
const adminArtistRepo = require("../Repositories/admin.artist.repo");
const adminMovieRepo = require("../Repositories/admin.movie.repo");


class adminmovieController {
    async movie_add(req, res) {
        try {
            const artists = await adminArtistRepo.artistdatadindwithid();

            return res.render('admin_page/admin_add_event/add_movie', {
                title: 'Movie Add - BookMyTicket', artists
            })
        } catch (err) {
            console.log(err)
        }
    }

    async movie_add_data_store(req, res) {
        try {
            // console.log(req.body);

            const {
                name,
                languages,
                genre,
                movieCertificate,
                duration,
                releaseDate,
                description,
                cast_id,
                cast_role,
                cast_nickname,
                crew_id,
                crew_role,
                crew_nickname,
                trailerLanguages
            } = req.body;

            const posters = req.files['posters'] ? req.files['posters'].map(f => f.filename) : [];
            const trailersFiles = req.files['trailers'] ? req.files['trailers'] : [];

            // Build cast array
            let cast = [];
            if (Array.isArray(cast_id)) {
                for (let i = 0; i < cast_id.length; i++) {
                    cast.push({
                        cast_id: cast_id[i],
                        cast_role: cast_role[i],
                        cast_nickname: cast_nickname[i] || ''
                    });
                }
            } else if (cast_id) {
                cast.push({
                    cast_id,
                    cast_role,
                    cast_nickname: cast_nickname || ''
                });
            }

            // Build crew array
            let crew = [];
            if (Array.isArray(crew_id)) {
                for (let i = 0; i < crew_id.length; i++) {
                    crew.push({
                        crew_id: crew_id[i],
                        crew_role: crew_role[i],
                        crew_nickname: crew_nickname[i] || ''
                    });
                }
            } else if (crew_id) {
                crew.push({
                    crew_id,
                    crew_role,
                    crew_nickname: crew_nickname || ''
                });
            }

            // Build trailers array
            let trailers = [];
            if (Array.isArray(trailerLanguages)) {
                for (let i = 0; i < trailerLanguages.length; i++) {
                    trailers.push({
                        language: trailerLanguages[i],
                        filename: trailersFiles[i] ? trailersFiles[i].filename : ''
                    });
                }
            } else if (trailerLanguages) {
                trailers.push({
                    language: trailerLanguages,
                    filename: trailersFiles[0] ? trailersFiles[0].filename : ''
                });
            }
            // console.log(cast)
            // console.log(trailers)
            // Validate releaseDate is a valid date
            const releaseDateObj = new Date(releaseDate);
            if (isNaN(releaseDateObj.getTime())) {
                req.flash('error', ['Invalid release date']);
                return res.redirect('/admin/movie-add');
            }

            // Validate input data using Joi schema
            let validatedData;
            try {
                validatedData = await movieValidationSchema.validateAsync({
                    name,
                    posters,
                    languages: Array.isArray(languages) ? languages : [languages],
                    genre: Array.isArray(genre) ? genre : [genre],
                    movieCertificate,
                    duration: Number(duration),
                    releaseDate: releaseDateObj,
                    description,
                    cast,
                    crew,
                    trailers,
                    isdelete: false
                }, { abortEarly: false });
            } catch (validationError) {
                req.flash('error', validationError.details.map(err => err.message));
                return res.redirect('/admin/movie-add');
            }

            // Save the movie data to DB
            const moviecreate = await adminMovieRepo.adddata(validatedData);

            if (moviecreate) {
                return res.redirect('/admin/movie-list');
            } else {
                req.flash('error', ['Failed to save movie']);
                return res.redirect('/admin/movie-add');
            }

        } catch (err) {
            console.error("Movie Save Error:", err);
            res.status(500).send("Server Error");
        }
    }




    async movie_list(req, res) {
        try {
            const moviedata = await adminMovieRepo.shoalldata();
            return res.render('admin_page/admin_add_event/movie_list', {
                title: 'Artist List - BookMyTicket', moviedata
            })
        } catch (err) {
            console.log(err)
        }
    }
    async detete_movie_list(req, res) {
        try {
            const moviedata = await adminMovieRepo.shoallmoviedata();
            return res.render('admin_page/admin_add_event/detete_movie_list', {
                title: 'Artist List - BookMyTicket', moviedata
            })
        } catch (err) {
            console.log(err)
        }
    }
    
    // SINGLE MOVIE DETATILS
    async movie_single(req, res) {
        try {
            const id = req.params.id
            const movie = await adminMovieRepo.siglemovie(id)
          console.log(JSON.stringify(movie, null, 2));

            return res.render('admin_page/admin_add_event/single_movie', {
                title: 'Single Movie  - BookMyTicket', movie
            })
        } catch (err) {
            console.log(err)
        }
    }
    async movie_edit_data_store(req, res) {
        try {
            console.log(req.body)
            console.log(req.files)
            const id = req.params.id;

            const {
                name,
                languages,
                genre,
                movieCertificate,
                duration,
                releaseDate,
                description,
                cast_id,
                cast_role,
                cast_nickname,
                crew_id,
                crew_role,
                crew_nickname,
                trailerLanguages,
                trail
            } = req.body;

            const posters = req.files['posters'] ? req.files['posters'].map(f => f.filename) : [];
            const trailersFiles = req.files['trailers'] ? req.files['trailers'] : [];
            // console.log(trailersFiles)
            // Build cast array
            let cast = [];
            if (Array.isArray(cast_id)) {
                for (let i = 0; i < cast_id.length; i++) {
                    cast.push({
                        cast_id: cast_id[i],
                        cast_role: cast_role[i],
                        cast_nickname: cast_nickname[i] || ''
                    });
                }
            } else if (cast_id) {
                cast.push({
                    cast_id,
                    cast_role,
                    cast_nickname: cast_nickname || ''
                });
            }

            // Build crew array
            let crew = [];
            if (Array.isArray(crew_id)) {
                for (let i = 0; i < crew_id.length; i++) {
                    crew.push({
                        crew_id: crew_id[i],
                        crew_role: crew_role[i],
                        crew_nickname: crew_nickname[i] || ''
                    });
                }
            } else if (crew_id) {
                crew.push({
                    crew_id,
                    crew_role,
                    crew_nickname: crew_nickname || ''
                });
            }

            // Build trailers array
            let trailers = [];

            if (Array.isArray(trailerLanguages)) {
                for (let i = 0; i < trailerLanguages.length; i++) {
                    if (trailersFiles[i] && trailersFiles[i].filename) {
                        trailers.push({
                            language: trailerLanguages[i],
                            filename: trailersFiles[i].filename
                        });
                    }
                }
            } else if (trailerLanguages && trailersFiles[0] && trailersFiles[0].filename) {
                trailers.push({
                    language: trailerLanguages,
                    filename: trailersFiles[0].filename
                });
            }
            // Parse and validate release date
            const releaseDateObj = new Date(releaseDate);
            if (isNaN(releaseDateObj.getTime())) {
                req.flash('error', ['Invalid release date']);
                return res.redirect('/admin/movie-add');
            }

            let validationPayload;
            if (posters.length <= 0 && trailersFiles.length > 0) {

                // Prepare data for validation
                validationPayload = {
                    name,
                    // posters, // posters can be empty if optional in Joi
                    languages: Array.isArray(languages) ? languages : [languages],
                    genre: Array.isArray(genre) ? genre : [genre],
                    movieCertificate,
                    duration: Number(duration),
                    releaseDate: releaseDateObj,
                    description,
                    cast,
                    crew,
                    trailers,
                    isdelete: false
                };

            } else if (trailersFiles.length <= 0 && posters.length > 0) {
                // Prepare data for validation

                validationPayload = {
                    name,
                    posters, // posters can be empty if optional in Joi
                    languages: Array.isArray(languages) ? languages : [languages],
                    genre: Array.isArray(genre) ? genre : [genre],
                    movieCertificate,
                    duration: Number(duration),
                    releaseDate: releaseDateObj,
                    description,
                    cast,
                    crew,
                    // trailers,
                    isdelete: false
                };
            }
            else if (posters.length <= 0 && trailersFiles.length <= 0) {

                // Prepare data for validation
                validationPayload = {
                    name,
                    // posters, // posters can be empty if optional in Joi
                    languages: Array.isArray(languages) ? languages : [languages],
                    genre: Array.isArray(genre) ? genre : [genre],
                    movieCertificate,
                    duration: Number(duration),
                    releaseDate: releaseDateObj,
                    description,
                    cast,
                    crew,
                    // trailers,
                    isdelete: false
                };
            } else {
                // console.log("hello")
                // Prepare data for validation
                validationPayload = {
                    name,
                    posters, // posters can be empty if optional in Joi
                    languages: Array.isArray(languages) ? languages : [languages],
                    genre: Array.isArray(genre) ? genre : [genre],
                    movieCertificate,
                    duration: Number(duration),
                    releaseDate: releaseDateObj,
                    description,
                    cast,
                    crew,
                    trailers,
                    isdelete: false
                };
            }


            // Validate input data using Joi schema
            try {
                const validatedData = await movieValidationSchema.validateAsync(validationPayload, { abortEarly: false });
                // console.log(validatedData);
                const data = await adminMovieRepo.findbyidandupdatedata(id, validationPayload)
                if (data) {
                    req.flash('success', 'Movie updated successfully!');
                    return res.redirect(`/admin/movie-list`);
                }
                //  console.log(data)

                // Save the movie data to DB (uncomment to use)
                // const result = await adminMovieRepo.editdata(id, validatedData);
                // req.flash('success', 'Movie updated successfully');
                // res.redirect('/admin/movies');
            } catch (validationError) {
                console.log(validationError.details);
                req.flash('error', validationError.details.map(err => err.message));
                return res.redirect(`/admin/movie-edit/${id}`);
            }

        } catch (err) {
            console.log(err);
            req.flash('error', 'An unexpected error occurred');
            res.redirect('/admin/movie-edit/' + req.params.id);
        }
    }
    async movie_edit(req, res) {
        try {

            const id = req.params.id
            const movie = await adminMovieRepo.siglemovie(id)
            const artists = await adminArtistRepo.artistdatadindwithid();
            console.log(movie)
            console.log(artists)
            return res.render('admin_page/admin_add_event/movie_edit', {
                title: 'Single Movie  - BookMyTicket', artists, movie
            })
        } catch (err) {
            console.log(err)
        }
    }
    // async artist_single_Edit(req, res) {
    //     try {
    //         const id = req.params.id
    //         const artist = await adminArtistRepo.sigleartist(id)
    //         const artists = await adminArtistRepo.artistdatadindwithid();
    //         return res.render('admin_page/artist/edit_artist', {
    //             title: 'Artist Profile  - BookMyTicket', artist, artists
    //         })
    //     } catch (err) {
    //         console.log(err)
    //     }
    // }
    async movie_delete(req, res) {
        try {
            const id = req.params.id
            const movie = await adminMovieRepo.deletemovie(id)
          if(movie){
            req.flash('success', 'Movie Delete successfully');
                return res.redirect('/admin/movie-list');
           }
           req.flash('error', 'Error');
                return res.redirect('/admin/movie-list');
        } catch (err) {
            console.log(err)
        }
    }
    async movie_undo(req, res) {
        try {
            const id = req.params.id
            const movie = await adminMovieRepo.undomovie(id)
          if(movie){
            req.flash('success', 'Movie Undo successfully');
                return res.json({ success: true, message: "Movie restored successfully!" });           }
           req.flash('error', 'Error');
                return res.redirect('/admin/delete-movie-list');
        } catch (err) {
            console.log(err)
        }
    }
     async movie_undo_bulck(req, res) {
            const { ids } = req.body;
        try {
            const movie = await adminMovieRepo.adminundomany(ids)
            if(movie){
                 req.flash('success', 'Movies Undo successfully');
                 return res.json({ success: true, message: "Movie restored successfully!" });          
            }
           req.flash('error', 'error in Movies undo');
                    return res.redirect('/admin/delete-movie-list');
        } catch (error) {
            console.error(error);
            res.status(500).send('Server error');
        }
        }
}
module.exports = new adminmovieController();