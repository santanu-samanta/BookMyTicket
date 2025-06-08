const { default: mongoose } = require('mongoose');
const artistmodel = require('../Model/artist.model');
const movieModel = require('../Model/movie.model');
const organizereventmodel = require('../../organizer/Model/event.organizer');

class admineventRepo {
  async findalldata() {
    try {
     const data= await organizereventmodel.find({isadmindelete:false}).populate('company_id') ;
     return data;
    } catch (error) {
      console.log(error)
    }
  }
  async deletefindalldata() {
    try {
     const data= await organizereventmodel.find({isadmindelete:true}).populate('company_id') ;
     return data;
    } catch (error) {
      console.log(error)
    }
  }
  async finddatabyid(id) {
    try {
     const data= await organizereventmodel.findById(id).populate('company_id') ;
     return data;
    } catch (error) {
      console.log(error)
    }
  }
  async finddatabyidupdate(id,msg) {
    try {
     const data= await organizereventmodel.findByIdAndUpdate(id,{
      isadmindelete:true,
      status:'Reject',
      adminreject_msg:msg
     })
     return data;
    } catch (error) {
      console.log(error)
    }
  }
  async finddatabyidupdateapproved(id,msg) {
    try {
     const data= await organizereventmodel.findByIdAndUpdate(id,{
      isadmindelete:false,
       status:'Approved',
      admindelete_msg:msg
     })
     return data;
    } catch (error) {
      console.log(error)
    }
  }

}

module.exports = new admineventRepo();
