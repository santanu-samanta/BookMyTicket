const { default: mongoose } = require('mongoose');
const artistmodel = require('../Model/artist.model');
const movieModel = require('../Model/movie.model');

class adminmovieRepo {
  async adddata(data) {
    try {
      const moviedata = await movieModel.create(data);
      return moviedata;
    } catch (err) {
      console.error('Error in adddata:', err);
    }
  }
  async findbyiddata(id) {
    try {
      if (mongoose.Types.ObjectId.isValid(id)) {
        const moviedata = await movieModel.findById(id).populate('cast.cast_id').populate('crew.crew_id');
        return moviedata;
      } else {
        console.log("Invalid ID:", id);
      }

    } catch (err) {
      console.error('Error in adddata:', err);
    }
  }
  async findbyidandupdatedata(id, data) {
    try {
      if (mongoose.Types.ObjectId.isValid(id)) {
        const moviedata = await movieModel.findByIdAndUpdate(id,
          data, {
          new: true, // return updated document
          runValidators: true // optional, ensures validation
        }
        )

        return moviedata;
      } else {
        console.log("Invalid ID:", id);
      }

    } catch (err) {
      console.error('Error in adddata:', err);
    }
  }

  async shoalldata() {
    try {
      const moviedata = await movieModel.find({ isdelete: false });
      // .populate('cast.cast_id').populate('crew.crew_id');
      return moviedata;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
  async shoallmoviedata() {
    try {
      const moviedata = await movieModel.find({ isdelete: true }).populate('cast.cast_id').populate('crew.crew_id');
      // ;
      return moviedata;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
  async filteralldata(filterQuery) {
    try {
      return await movieModel.find(filterQuery).lean();
    } catch (error) {
      console.error("Filter error:", error);
      return [];
    }
  }

  async moviedatadindwithid() {
    try {
      const moviedata = await movieModel.find({ isdelete: false }).select('_id name languages');
      return moviedata;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
  async siglemovie(id) {
    try {
      const movie = await movieModel.findById(id)
        .populate('cast.cast_id')
        .populate('crew.crew_id')
        .exec();
      return movie;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
  async deletemovie(id) {
    try {
      const movie = await movieModel.findByIdAndUpdate(id, { isdelete: true })

      return movie;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
  async undomovie(id) {
    try {
      const movie = await movieModel.findByIdAndUpdate(id, { isdelete: false })

      return movie;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
  async adminundomany(ids) {
    try {
      const movie = await movieModel.updateMany({ _id: { $in: ids } }, { isdelete: false });
      return movie;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }


  async getNewReleasedMovies() {
    try {
      const movies = await movieModel.find({
        isdelete: false,
        releaseDate: { $lte: new Date() } // Only movies released up to now
      })
        .sort({ releaseDate: -1 }) // Newest first
        .limit(10); // Optional: limit the number of results

      return movies;
    } catch (err) {
      console.error("Error fetching new release movies:", err);
      throw err;
    }
  };
  async upcomingReleasedMovies() {
    try {
      const movies = await movieModel.find({
        isdelete: false,
        releaseDate: { $gt: new Date() } 
      })
        .sort({ releaseDate: -1 }) // Newest first
        .limit(10); // Optional: limit the number of results

      return movies;
    } catch (err) {
      console.error("Error fetching new release movies:", err);
      throw err;
    }
  };


}

module.exports = new adminmovieRepo();
