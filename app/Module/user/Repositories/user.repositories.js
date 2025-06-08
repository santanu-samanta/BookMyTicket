const { default: mongoose } = require('mongoose');
const userModel = require('../Model/user.model');
const testimonial = require('../Model/user.testimonial');


class userRepositories {
  // data add in mongodb
  async adddata(data) {
    try {

      const userdata = await userModel.create(data)

      return userdata;
    } catch (err) {
      console.log(err);
    }

  }
  async finddatabyiduser(id) {
    try {

      const userdata = await userModel.findById(id)

      return userdata;
    } catch (err) {
      console.log(err);
    }

  }
  async accountdeleteupdate(id, msg) {
    try {

      const userdata = await userModel.findByIdAndUpdate(id, {
        isadmindelete: true,
        admindelete_msg: msg
      })

      return userdata;
    } catch (err) {
      console.log(err);
    }

  }
  async accountundoupdate(id) {
    try {

      const userdata = await userModel.findByIdAndUpdate(id, {
        isadmindelete: false
      })

      return userdata;
    } catch (err) {
      console.log(err);
    }

  }
  async findalldatauser(id) {
    try {

      const userdata = await userModel.find({ isdelete: false, isadmindelete: false })


      return userdata;
    } catch (err) {
      console.log(err);
    }

  }
  async findalldatauseradmin(id) {
    try {

      const userdata = await userModel.find({ isdelete: false, isadmindelete: true })

      return userdata;
    } catch (err) {
      console.log(err);
    }

  }
  // exist user chack
  async existuser(email) {

    try {
      const userfind = await userModel.findOne({ email })
      if (userfind) {
        return userfind;
      }

    } catch (err) {
      console.log(err);
    }
  }
  // findby id and update
  async findbyid(data, id) {
    try {
      const { first_name, last_name, email, phone, dob, gender, password } = data
      const updata = await userModel.findByIdAndUpdate(id, {
        first_name, last_name, email, phone, dob, gender, password, isdelete: false
      })
      return updata
    } catch (err) {
      console.log(err)
    }
  }
  // findby id and update
  async findbyidor(data, id) {
    try {
      if (data.image) {
        const { first_name, last_name, email, phone, dob, gender, password, image } = data
        const updata = await userModel.findByIdAndUpdate(id, {
          first_name, last_name, email, phone, dob, gender, password, image, isdelete: false
        })
        return updata
      }
      const { first_name, last_name, email, phone, dob, gender, password } = data
      const updata = await userModel.findByIdAndUpdate(id, {
        first_name, last_name, email, phone, dob, gender, password, isdelete: false
      })
      return updata
    } catch (err) {
      console.log(err)
    }
  }
  // verify status chack
  async verifyemail(email) {
    try {
      const userdata = await userModel.findOneAndUpdate(
        { email }, // Search condition
        {
          $set: {
            isverify: true
          }
        },
        {
          new: true // Return the updated document
        }
      );
      return userdata;
    } catch (err) {
      console.log(err);
    }
  }
  // update password data
  async updatedata(email, hashedpassword) {
    try {
      console.log(email, hashedpassword)
      const userdata = await userModel.findOneAndUpdate(
        { email }, // Search condition
        {
          $set: {
            password: hashedpassword
          }
        },
        {
          new: true // Return the updated document
        }
      );

      return userdata;
    } catch (err) {
      console.log(err);
    }
  }
  // update password data
  async update_data(email, image, about_data) {
    try {
      if (about_data) {
        const userdata = await userModel.findOneAndUpdate(
          { email }, // Search condition
          {
            $set: {
              about_data: about_data
            }
          },
          {
            new: true // Return the updated document
          }
        )

        return userdata;
      } else if (about_data && image) {
        const userdata = await userModel.findOneAndUpdate(
          { email }, // Search condition
          {
            $set: {
              about_data: about_data,
              image: image
            }
          },
          {
            new: true // Return the updated document
          }
        )

        return userdata;
      }

    } catch (err) {
      console.log(err);
    }
  }
  // deleteaccount

  async deleteaccount(email) {
    try {

      const userdata = await userModel.findOneAndUpdate(
        { email }, // Search condition
        {
          $set: {
            isdelete: true
          }
        },
        {
          new: true // Return the updated document
        }
      );

      return userdata;
    } catch (err) {
      console.log(err);
    }
  }



  async testimonialdatafind_populer_movie() {
    try {
      // Check if testimonial exists
      const popularmovie = await testimonial.aggregate([
        {
          $match: {
            ismovie: true,
            isdelete: false,
            movie_id: { $ne: null }
          }
        },
        {
          $group: {
            _id: "$movie_id",
            avgRating: { $avg: "$rating" },
            reviewCount: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: "movies",              // MongoDB collection name for movies
            localField: "_id",
            foreignField: "_id",
            as: "movieDetails"
          }
        },
        {
          $unwind: "$movieDetails"
        },
        {
          $project: {
            movieId: "$_id",
            avgRating: 1,
            reviewCount: 1,
            title: "$movieDetails.name",
            genre: "$movieDetails.genre",
            poster: "$movieDetails.posters",
            time: "$movieDetails.duration",
            poster: "$movieDetails.posters",
            // Add any other movie fields you want
          }
        }
      ]);
      const popularevent = await testimonial.aggregate([
        {
          $match: {
            eventorganization_id: { $ne: null },
            ismovie: false,
            isdelete: false,
          }
        },
        {
          $group: {
            _id: "$eventorganization_id",
            avgRating: { $avg: "$rating" },
            reviewCount: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: "organizerevents", // make sure this matches your collection name
            localField: "_id",
            foreignField: "_id",
            as: "eventDetails"
          }
        },
        {
          $unwind: "$eventDetails"
        },
        {
          $project: {
            eventId: "$_id",
            avgRating: 1,
            reviewCount: 1,
            name: "$eventDetails.event_name",         // replace with actual field names
            category: "$eventDetails.category", // replace with actual field names
            image: "$eventDetails.images",       // replace with actual field names
            videos: "$eventDetails.videos",       // replace with actual field names
          }
        },
        {
          $sort: { reviewCount: -1, avgRating: -1 } // sort by popularity
        }
      ]);

      return { popularmovie, popularevent };

    } catch (err) {
      console.error("Error in testimonialdtasave:", err);
      return null;
    }
  }
  async testimonialdtasave(data) {
    try {
      const { review, rating, movie, userid, eventorganization_id, ismovie } = data;


      // Check if testimonial exists
      const existuser = await testimonial.findOne({
        isdelete: false,
        userid: new mongoose.Types.ObjectId(userid),
        eventorganization_id: new mongoose.Types.ObjectId(eventorganization_id)
      });

      if (existuser && !existuser.isadmindelete) {
        // Update existing testimonial
        const updatedata = await testimonial.findByIdAndUpdate(
          existuser._id,
          { review, rating },
          { new: true }
        );
        return updatedata;
      } else {
        // Create new testimonial
        const datatestmonial = await testimonial.create(data);
        return datatestmonial;
      }
    } catch (err) {
      console.error("Error in testimonialdtasave:", err);
      return null;
    }
  }
  async testimonialdtasaveformovie(data) {
    try {
      const { review, rating, movie, userid, movie_id, ismovie } = data;

      // Check if testimonial exists
      const existuser = await testimonial.findOne({
        isdelete: false,
        userid: new mongoose.Types.ObjectId(userid),
        movie_id: new mongoose.Types.ObjectId(movie_id)
      });

      if (existuser && !existuser.isadmindelete) {
        // Update existing testimonial
        const updatedata = await testimonial.findByIdAndUpdate(
          existuser._id,
          { review, rating },
          { new: true }
        );
        return updatedata;
      } else {
        // Create new testimonial
        const datatestmonial = await testimonial.create(data);
        return datatestmonial;
      }
    } catch (err) {
      console.error("Error in testimonialdtasave:", err);
      return null;
    }
  }
  async finddatabyidtestimon(id) {
    try {

      // const datatestmonial = await testimonial.findById(id)
      // if (datatestmonial.ismovie) {
      //   const data = await testimonial.findById(id).populate('userid').populate('event_id')
      //   return data
      // }
      const data = await testimonial.findById(id).populate('userid')

      return data
    } catch (err) {
      console.log(err);
    }
  }
  async finddatabyidtestdelete(id, msg) {
    try {

      // const datatestmonial = await testimonial.findById(id)
      // if (datatestmonial.ismovie) {
      //   const data = await testimonial.findById(id).populate('userid').populate('event_id')
      //   return data
      // }
      const data = await testimonial.findByIdAndUpdate(id, {

        isadmindelete: true,
        admindelete_msg: msg
      })

      return data
    } catch (err) {
      console.log(err);
    }
  }

  async findalldatatestimonial() {
    try {

      const datatestmonial = await testimonial.find({ isdelete: false, isadmindelete: false }).populate(`userid`)
      return datatestmonial;
    } catch (err) {
      console.log(err);
    }
  }
  async findalldeletedatatestimonial() {
    try {

      const datatestmonial = await testimonial.find({ isdelete: false, isadmindelete: true }).populate(`userid`)
      return datatestmonial;
    } catch (err) {
      console.log(err);
    }
  }
  async testimonial1dataforevent(id) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid event ID");
      }
      const datatestmonial = await testimonial.aggregate([
        {
          $match: {
            isdelete: false,
            isadmindelete: false,
            eventorganization_id: new mongoose.Types.ObjectId(id)
          }
        }, {
          $lookup: {
            from: 'users',
            localField: 'userid',
            foreignField: '_id',
            as: 'data_test'
          }
        }
      ])
      return datatestmonial;
    } catch (err) {
      console.log(err);
    }
  }
  async testimonialdataforevent(id) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid event ID");
      }
      const datatestmonial = await testimonial.aggregate([
        {
          $match: {
            isdelete: false,
            isadmindelete: false,
            movie_id: new mongoose.Types.ObjectId(id)
          }
        }, {
          $lookup: {
            from: 'users',
            localField: 'userid',
            foreignField: '_id',
            as: 'data_test'
          }
        }
      ])
      return datatestmonial;
    } catch (err) {
      console.log(err);
    }
  }
  async showtestimonialdata(id, userid) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(userid)) {
        throw new Error("Invalid event ID or user ID");
      }

      const datatestmonial = await testimonial.aggregate([
        {
          $match: {
            isdelete: false,
            isadmindelete: false,
            eventorganization_id: new mongoose.Types.ObjectId(id), // or eventorganization_id if needed
            userid: new mongoose.Types.ObjectId(userid)
          }
        }
      ]);

      return datatestmonial;
    } catch (err) {
      console.log("Error in showtestimonialdata:", err.message);
      return null;
    }
  }
  async showtestimonialdataformovie(id, userid) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(userid)) {
        throw new Error("Invalid event ID or user ID");
      }

      const datatestmonial = await testimonial.aggregate([
        {
          $match: {
            isdelete: false,
            isadmindelete: false,
            movie_id: new mongoose.Types.ObjectId(id), // or eventorganization_id if needed
            userid: new mongoose.Types.ObjectId(userid)
          }
        }
      ]);

      return datatestmonial;
    } catch (err) {
      console.log("Error in showtestimonialdata:", err.message);
      return null;
    }
  }
  async getTopmovieEvents() {
    const topMovie = await testimonial.aggregate([
      {
        $match: {
          ismovie: true,
          isdelete: false,
          isadmindelete: false
        }
      },
      {
        $group: {
          _id: "$movie_id",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 }
        }
      },
      { $sort: { averageRating: -1, totalReviews: -1 } },
      { $limit: 10 },

      // Lookup movie details
      {
        $lookup: {
          from: "movies",
          localField: "_id",
          foreignField: "_id",
          as: "movie"
        }
      },
      { $unwind: "$movie" },

      // Lookup related events
      {
        $lookup: {
          from: "events",
          localField: "_id",
          foreignField: "movie_id",
          as: "eventDetails"
        }
      },

      // Flatten and collect all schedule dates
      {
        $addFields: {
          allDates: {
            $reduce: {
              input: "$eventDetails.schedules",
              initialValue: [],
              in: { $concatArrays: ["$$value", "$$this"] }
            }
          }
        }
      },

      // Filter out movies with no schedules
      {
        $match: {
          "allDates.0": { $exists: true }
        }
      },

      // Add earliest available date
      {
        $addFields: {
          earliestScheduleDate: {
            $min: "$allDates.date"
          }
        }
      },

      // Final projection
      {
        $project: {
          type: { $literal: "movie" },
          name: "$movie.name",
          date: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$earliestScheduleDate"
            }
          },
          rating: {
            $round: [{ $multiply: ["$averageRating", 20] }, 0]
          }
        }
      }
    ]);




    const topOrganizations = await testimonial.aggregate([
      {
        $match: {
          ismovie: false,
          isdelete: false,
          isadmindelete: false
        }
      },
      {
        $group: {
          _id: "$eventorganization_id",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 }
        }
      },
      {
        $sort: { averageRating: -1, totalReviews: -1 }
      },
      {
        $limit: 10
      },
      {
        $lookup: {
          from: "organizerevents",  // collection name in MongoDB
          localField: "_id",
          foreignField: "_id",
          as: "event"
        }
      },
      { $unwind: "$event" },
      {
        $project: {
          _id: 0,
          name: "$event.event_name",
          date: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: { $arrayElemAt: ["$event.schedules.date", 0] } // first schedule's date
            }
          },
          rating: {
            $round: [{ $multiply: ["$averageRating", 20] }, 0]
          }
        }
      }
    ]);

    return {topMovie,topOrganizations}
  };
  async artistundomany(artistIds) {
    try {

      const artist = await userModel.updateMany(
        { _id: { $in: artistIds } },
        { $set: { isadmindelete: false } }
      );
      return artist
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
  async testimonialdelete(id) {
    try {

      const artist = await testimonial.findByIdAndUpdate(id, {
        isdelete: true
      })
      return artist
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}

module.exports = new userRepositories()