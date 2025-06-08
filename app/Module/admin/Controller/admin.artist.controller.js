const { artistSchema } = require("../../../Helper/joivalidation");
const adminArtistRepo = require("../Repositories/admin.artist.repo")

class adminartistController {
    async artist_add(req, res) {
        try {
            const artists = await adminArtistRepo.artistdatadindwithid();
            return res.render('admin_page/artist/add_artist', {
                title: 'Artist Add - BookMyTicket', artists
            })
        } catch (err) {
            console.log(err)
        }
    }

    async artist_store_add(req, res) {
        try {
            if (!req.file) {
                req.flash('error', 'Artist image is required');
                return res.redirect('/admin/artists-add');
            }

            const image = req.file.path;
            const body = { ...req.body };

            // Normalize occupation as array
            body.occupation = Array.isArray(body.occupation) ? body.occupation : [body.occupation];

            // Normalize family as array
            if (req.body.family && typeof req.body.family === 'object') {
                body.family = Object.values(req.body.family);
            } else {
                body.family = [];
            }

            // Perform Joi validation (will throw error if invalid)
            const value = await artistSchema.validateAsync(body, { abortEarly: false });

            // Convert Born to Date if present
            if (value.Born) {
                value.Born = new Date(value.Born);
            }

            // Save to DB
            const datastore = await adminArtistRepo.adddata(value, image);

            if (datastore) {
                req.flash('success', 'Artist registered successfully');
                return res.redirect('/admin/artists-list');
            }

        } catch (err) {
            if (err.isJoi) {
                // Convert to user-friendly messages
                const formattedErrors = err.details.map(e => {
                    const field = e.context?.label || e.path.join('.');
                    let msg = '';

                    switch (e.type) {
                        case 'string.min':
                            msg = `${field} must be at least ${e.context.limit} characters.`;
                            break;
                        case 'string.max':
                            msg = `${field} must be less than ${e.context.limit} characters.`;
                            break;
                        case 'any.required':
                            msg = `${field} is required.`;
                            break;
                        case 'string.base':
                            msg = `${field} must be a string.`;
                            break;
                        case 'date.base':
                            msg = `${field} must be a valid date.`;
                            break;
                        case 'any.only':
                            msg = `${field} must be one of: ${e.context.valids.join(', ')}`;
                            break;
                        default:
                            msg = `${field}: ${e.message.replace(/["']/g, '')}`;
                    }

                    return msg;
                });

                req.flash('error', formattedErrors.join('<br/>'));
                return res.redirect('/admin/artists-add');
            }

            console.log('Unexpected error:', err);
            req.flash('error', 'Something went wrong');
            return res.redirect('/admin/artists-add');
        }
    }
    
    async artist_update(req, res) {
        try {
            const id = req.params.id
            const artist = await adminArtistRepo.sigleartist(id)
            const artists = await adminArtistRepo.artistdatadindwithid();
            return res.render('admin_page/artist/edit_artist', {
                title: 'Artist Add - BookMyTicket', artists, artist
            })
        } catch (err) {
            console.log(err)
        }
    }
    async artist_update_data(req, res) {
        try {
            const id = req.params.id;
            const body = { ...req.body };

            // Normalize occupation as array
            body.occupation = Array.isArray(body.occupation) ? body.occupation : [body.occupation];

            // Normalize family as array
            if (req.body.family && typeof req.body.family === 'object') {
                body.family = Object.values(req.body.family);
            } else {
                body.family = [];
            }

            // Joi validation
            const data = await artistSchema.validateAsync(body, { abortEarly: false });

            // Convert Born to Date
            if (data.Born) {
                data.Born = new Date(data.Born);
            }

            // Handle image
            const image = req.file ? req.file.path : null;

            // Update in DB
            const datastore = await adminArtistRepo.updatedata(id, data, image);

            if (datastore) {
                req.flash('success', 'Artist updated successfully');
                return res.redirect('/admin/artists-list');
            } else {
                req.flash('error', 'Failed to update artist');
                return res.redirect(`/admin/artists/profile_update/${id}`);
            }

        } catch (err) {
            if (err.isJoi) {
                const formattedErrors = err.details.map(e => {
                    const field = e.context?.label || e.path.join('.');
                    let msg = '';

                    switch (e.type) {
                        case 'string.min':
                            msg = `${field} must be at least ${e.context.limit} characters.`;
                            break;
                        case 'string.max':
                            msg = `${field} must be less than ${e.context.limit} characters.`;
                            break;
                        case 'any.required':
                            msg = `${field} is required.`;
                            break;
                        case 'string.base':
                            msg = `${field} must be a string.`;
                            break;
                        case 'date.base':
                            msg = `${field} must be a valid date.`;
                            break;
                        case 'any.only':
                            msg = `${field} must be one of: ${e.context.valids.join(', ')}`;
                            break;
                        default:
                            msg = `${field}: ${e.message.replace(/["']/g, '')}`;
                    }

                    return msg;
                });

                req.flash('error', formattedErrors.join('<br/>'));
                return res.redirect(`/admin/artists/profile_update/${req.params.id}`);
            }

            console.log('Unexpected error:', err);
            req.flash('error', 'Something went wrong');
            return res.redirect(`/admin/artists/profile_update/${req.params.id}`);
        }
    }
    async artist_data_show(req, res) {
        try {
            const artistdata = await adminArtistRepo.shoalldata()
            return res.render('admin_page/artist/artist_list', {
                title: 'Artist List - BookMyTicket', artistdata
            })
        } catch (err) {
            console.log(err)
        }
    }
    async delete_artist_data_show(req, res) {
        try {
            const artistdata = await adminArtistRepo.showalldeletedata()
            return res.render('admin_page/artist/delete_artist_list', {
                title: 'Artist List - BookMyTicket', artistdata
            })
        } catch (err) {
            console.log(err)
        }
    }
    async artist_single(req, res) {
        try {
            const id = req.params.id
            const artist = await adminArtistRepo.sigleartist(id)
            console.log(artist);
            
            // const artists = await adminArtistRepo.artistdatadindwithid();
            return res.render('admin_page/artist/single_artist_detailse', {
                title: 'Artist Profile  - BookMyTicket', artist
            })
        } catch (err) {
            console.log(err)
        }
    }
    async artist_delete(req, res) {
        try {
            const id = req.params.id
            const artist = await adminArtistRepo.artistdelete(id)
            // const artists = await adminArtistRepo.artistdatadindwithid();
           if(artist){
            req.flash('success', 'Artist Delete successfully');
                return res.redirect('/admin/artists-list');
           }
           req.flash('error', 'Error');
                return res.redirect('/admin/artists-list');
        } catch (err) {
            console.log(err)
        }
    }
    async artist_undo(req, res) {
        try {
            const id = req.params.id
            const artist = await adminArtistRepo.artistundo(id)
            // const artists = await adminArtistRepo.artistdatadindwithid();
            if(artist){
                req.flash('success', 'Artist Undo successfully');
                return res.redirect('/admin/delete_artists-list');
            }
              req.flash('error', 'error in artist undo');
                return res.redirect('/admin/artists-list');
        } catch (err) {
            console.log(err)
        }
    }
    async artist_undo_bulck(req, res) {
       const { artistIds } = req.body;
    try {
        const artist = await adminArtistRepo.artistundomany(artistIds)
        if(artist){
             req.flash('success', 'Artists Undo successfully');
            return  res.redirect('/admin/delete_artists-list');
        }
       req.flash('error', 'error in artists undo');
                return res.redirect('/admin/delete_artists-list');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
    }
}
module.exports = new adminartistController();