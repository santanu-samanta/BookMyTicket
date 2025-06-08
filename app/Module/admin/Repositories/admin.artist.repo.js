const { default: mongoose } = require('mongoose');
const artistmodel = require('../Model/artist.model');

class adminartistRepo {
  async adddata(data, image) {
    try {

      const { artist_name, occupation, about, Birthplace, Born, other, family } = data;

      let formattedFamily = [];

      // Check if family is provided and is an array or object
      if (family) {
        if (Array.isArray(family)) {
          // Array of objects (from multiple rows)
          formattedFamily = family.map(member => {
            if (mongoose.Types.ObjectId.isValid(member.f_id)) {
              return {
                f_id: new mongoose.Types.ObjectId(member.f_id),
                relationship: member.relationship
              };
            } else {
              throw new Error(`Invalid ObjectId for f_id: ${member.f_id}`);
            }
          });
        } else if (typeof family === 'object' && mongoose.Types.ObjectId.isValid(family.f_id)) {
          // Single family entry (only one row submitted)
          formattedFamily = [{
            f_id: new mongoose.Types.ObjectId(family.f_id),
            relationship: family.relationship
          }];
        }
      }

      const artistData = new artistmodel({
        artist_name,
        occupation,
        about,
        Birthplace: Birthplace,
        Born: Born,
        other,
        family: formattedFamily, // Always an array
        image: image || null
      });
      console.log(artistData)
      return await artistData.save();

    } catch (err) {
      console.error('Error in adddata:', err);
    }
  }
  async updatedata(id, data, image) {
    try {

      const { artist_name, occupation, about, Birthplace, Born, other, family } = data;

      let formattedFamily = [];

      // Check if family is provided and is an array or object
      if (family) {
        if (Array.isArray(family)) {
          // Array of objects (from multiple rows)
          formattedFamily = family.map(member => {
            if (mongoose.Types.ObjectId.isValid(member.f_id)) {
              return {
                f_id: new mongoose.Types.ObjectId(member.f_id),
                relationship: member.relationship
              };
            } else {
              throw new Error(`Invalid ObjectId for f_id: ${member.f_id}`);
            }
          });
        } else if (typeof family === 'object' && mongoose.Types.ObjectId.isValid(family.f_id)) {
          // Single family entry (only one row submitted)
          formattedFamily = [{
            f_id: new mongoose.Types.ObjectId(family.f_id),
            relationship: family.relationship
          }];
        }
      }
      if (image == null) {
        const artistData = artistmodel.findByIdAndUpdate(id, {
          artist_name,
          occupation,
          about,
          Birthplace: Birthplace,
          Born: Born,
          other,
          family: formattedFamily, // Always an array

        });
        return await artistData;
      } else {
        const artistData = artistmodel.findByIdAndUpdate(id, {
          artist_name,
          occupation,
          about,
          Birthplace: Birthplace,
          Born: Born,
          other,
          family: formattedFamily, // Always an array
          image: image || null
        });
        return await artistData;
      }
    } catch (err) {
      console.error('Error in adddata:', err);
    }
  }

  async shoalldata() {
    try {
      const artistdata = await artistmodel.find({ isdelete: false });
      return artistdata;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
  async artistdatadindwithid() {
    try {
      const artistdata = await artistmodel.find({ isdelete: false }).select('_id artist_name');
      return artistdata;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
  async showalldeletedata() {
    try {
      const artistdata = await artistmodel.find({ isdelete: true })
      return artistdata;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
  async artistdelete(id) {
    try {
      const artistdata = await artistmodel.findByIdAndUpdate(id,{ isdelete: true });
      return artistdata;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
  async artistundo(id) {
    try {
      const artistdata = await artistmodel.findByIdAndUpdate(id,{ isdelete: false });
      return artistdata;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
  async artistundomany( artistIds ) {
    try {
       
     const artist= await artistmodel.updateMany(
            { _id: { $in: artistIds } },
            { $set: { isdelete: false  } }
        );
        return artist
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
  async sigleartist(id) {
    try {
      const mongoose = require('mongoose');

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send('Invalid artist ID');
      }
      const artist = await artistmodel.findById(id)
        .populate('family.f_id') // populate the family member details
        .exec();
      return artist;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}

module.exports = new adminartistRepo();
