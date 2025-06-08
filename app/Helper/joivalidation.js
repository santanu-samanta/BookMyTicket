const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const companyUpdateSchema = Joi.object({
  company_name: Joi.string().min(2).max(100).required().label('Company Name'),
  phone: Joi.string().pattern(/^[0-9]{10,15}$/).required().label('Phone'),
  email: Joi.string().email().required().label('Email'),
  address_city: Joi.string().allow('').max(100).label('City'),
  address_state: Joi.string().allow('').max(100).label('State'),
  address_pin: Joi.string().allow('').max(10).label('PIN'),
  address_landmark: Joi.string().allow('').max(150).label('Landmark'),

  // facilities: Joi.string().allow('').max(1000).valid('2D', '3D', 'IMAX 2D', 'IMAX 3D', '4DX', 'Dolby Atmos', 'Dolby Cinema', 'ScreenX', 'MX4D', 'D-BOX', 'Subtitled').required().label('Facilities'),
  facilities_avl: Joi.string().allow('').max(1000).label('Additional Facilities'),

  // screens: Joi.number().min(0).max(100).required().label('Screens')

});

const movieValidationSchema = Joi.object({
    name: Joi.string().min(2).max(100).required(),


   posters: Joi.array().items(Joi.string()).optional(),
    languages: Joi.array().items(Joi.string().valid('English', 'Hindi', 'Bengali', 'Telugu', 'Tamil', 'Malayalam', 'Kannada')).min(1).required(),

    genre: Joi.array().items(Joi.string().valid(
        'Action', 'Drama', 'Comedy', 'Horror', 'Thriller',
        'Romance', 'Adventure', 'Fantasy', 'Sci-Fi', 'Biography')).min(1).required(),

    movieCertificate: Joi.string().valid('U', 'UA', 'S', 'A', 'UA7+', 'UA13+', 'UA16+').required(),

    duration: Joi.number().integer().min(1).required(),

    releaseDate: Joi.date().required(),

    description: Joi.string().min(10).max(2000).required(),

    cast: Joi.array().items(
        Joi.object({
            cast_id: Joi.string().required(),
            cast_role: Joi.string().min(2).max(100).required(),
            cast_nickname: Joi.string().allow('', null)
        })
    ).min(1).required(),

    crew: Joi.array().items(
        Joi.object({
            crew_id: Joi.string().required(),
            crew_role: Joi.string().min(2).max(100).required(),
            crew_nickname: Joi.string().allow('', null)
        })
    ).min(1).required(),

trailers: Joi.array().items(
    Joi.object({
        language: Joi.string().required(),
        filename: Joi.string().allow('').optional() // allow empty string
    })
).optional(),



    isdelete: Joi.boolean()
});
const artistSchema = Joi.object({
  artist_name: Joi.string().min(2).max(100).required().label('Artist Name'),

  image: Joi.any().allow('').optional(), // Multer will handle this, no validation needed here

  occupation: Joi.alternatives().try(
    Joi.string().valid('Actor', 'Director', 'Writer', 'Producer', 'Musician'),
    Joi.array().items(Joi.string().valid('Actor', 'Director', 'Writer', 'Producer', 'Musician'))
  ).required().label('Occupation'),

  about: Joi.string().min(10).required().label('About'),

  Birthplace: Joi.string().allow('').label('Birthplace'),

  Born: Joi.date().allow(null, '').label('Born'),

  other: Joi.string().allow('').label('Other Info'),

  family: Joi.array().items(
    Joi.object({
      f_id: Joi.objectId().required().label('Family Member'),
      relationship: Joi.string()
        .valid('Father', 'Mother', 'Brother', 'Sister', 'Spouse', 'Child', 'Friend', 'Colleague')
        .required()
        .label('Relationship'),
    })
  ).optional().label('Family'),
});
// validations/eventValidation.js


const eventSchema = Joi.object({
  event_name: Joi.string().trim().required(),
  category: Joi.string().trim().required(),
  description: Joi.string().trim().required(),
  validAge: Joi.boolean().optional(),

  artistname: Joi.array().items(Joi.string().trim().required()).optional(),
  artistrole: Joi.array().items(Joi.string().trim().required()).optional(),

  // no need to validate files in Joi (done via multer)
  venue: Joi.array().items(Joi.string().trim().required()).required(),
  city: Joi.array().items(Joi.string().trim().required()).required(),
  date: Joi.array().items(Joi.date().required()).required(),
  start_time: Joi.array().items(Joi.string().required()).required(),
  end_time: Joi.array().items(Joi.string().required()).required(),
  screen: Joi.array().items(Joi.string().required()).required(),
  language: Joi.array().items(Joi.string().required()).required(),
  format: Joi.array().items(Joi.string().required()).required(),
  prime_seats:Joi.array().items(Joi.number().required()).required(),
  golden_seats:Joi.array().items(Joi.number().required()).required(),
  clasic_seats:Joi.array().items(Joi.number().required()).required(),
  prime_ticket_price: Joi.array().items(Joi.number().required()).required(),
  golden_ticket_price: Joi.array().items(Joi.number().required()).required(),
  clasic_ticket_price: Joi.array().items(Joi.number().required()).required(),
});





module.exports = { companyUpdateSchema,movieValidationSchema,artistSchema ,eventSchema};