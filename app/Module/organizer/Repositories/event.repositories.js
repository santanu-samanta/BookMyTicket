const { default: mongoose } = require("mongoose");
const eventmodel = require("../Model/enent.model")

class eventrepo {
    async adddata(data) {
        try {
            const eventdata = eventmodel.create(data);
            return eventdata;
        } catch (err) {
            console.log(err)
        }
    }
    async editdata(id, data) {
        console.log(data)
        try {
            const eventdata = eventmodel.findByIdAndUpdate(id, data, { new: true });
            return eventdata;
        } catch (err) {
            console.log(err)
        }
    }
    async findbyiddata(id) {
        try {
            const eventdata = eventmodel.findById(id);
            return eventdata;
        } catch (err) {
            console.log(err)
        }
    }
    async findbyiddataforemail(id) {
        try {
            const eventdata = await eventmodel.findById(id).populate('company_id').populate('movie_id');
            // console.log(eventdata);

            return eventdata;
        } catch (err) {
            console.log(err)
        }
    }
    async findalldata() {
        try {
            const eventdata = await eventmodel.find();
            return eventdata;
        } catch (err) {
            console.log(err)
        }
    }
    async bookingapproved(id) {
        try {
            const eventdata = await eventmodel.findByIdAndUpdate(id, {
                 isadmindelete:false,
                isverify: true,
                status: 'Approved'
            });
            return eventdata;
        } catch (err) {
            console.log(err)
        }
    }
    async bookingreject(id, msg) {
        try {
            const eventdata = await eventmodel.findByIdAndUpdate(id, {
                isadmindelete:true,
                status: 'Reject',
                adminreject_msg: msg
            });
            return eventdata;
        } catch (err) {
            console.log(err)
        }
    }
    async schedules_data(id) {
        try {
            const mongoose = require('mongoose');
            console.log('ID is valid:', mongoose.Types.ObjectId.isValid(id));  // should be true
            // Optional: convert string to ObjectId
            const scheduleId = new mongoose.Types.ObjectId(id);
            const data = await eventmodel.findOne({
                "schedules._id": scheduleId
            },
                { schedules: { $elemMatch: { _id: scheduleId } } }
            )
            return data;
        } catch (err) {
            console.log(err)
        }
    }
    async updateseate(updateData, id) {
        try {
            const mongoose = require('mongoose');
            console.log('ID is valid:', mongoose.Types.ObjectId.isValid(id));

            const scheduleId = new mongoose.Types.ObjectId(id);



            // Ensure arrays
            const primeSeats = Array.isArray(updateData.prime_seats) ? updateData.prime_seats : [];
            const goldenSeats = Array.isArray(updateData.golden_seats) ? updateData.golden_seats : [];
            const classicSeats = Array.isArray(updateData.classic_seats) ? updateData.classic_seats : [];

            const data = await eventmodel.findOneAndUpdate(
                { "schedules._id": scheduleId },
                {
                    $push: {
                        "schedules.$.prime_seats_book": { $each: primeSeats },
                        "schedules.$.golden_seats_book": { $each: goldenSeats },
                        "schedules.$.classic_seats_book": { $each: classicSeats }
                    }
                },
                { new: true }
            );

            return data;
        } catch (err) {
            console.log("Update seat error:", err);
        }
    }

    async single_movie_data(id) {
        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                console.warn('Invalid movie ID:', id);
                return []; // or handle appropriately
            }

            const eventdata = await eventmodel.find({
                movie_id: id,
                status: { $in: ["Pending", "Approved"] }
            })
                .populate('company_id')
                .populate('movie_id');


            return eventdata;
        } catch (err) {
            console.log(err)
        }
    }
    async bookingdataforsingledelete(id) {
        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                console.warn('Invalid movie ID:', id);
                return []; // or handle appropriately
            }

            const eventdata = await eventmodel.findByIdAndUpdate(id, { isdelete: true })

            return eventdata;
        } catch (err) {
            console.log(err)
        }
    }
    async finbbookingdata() {
        try {
            const companydata =await eventmodel.aggregate([
                {
                    $match: { isdelete: false }
                }, {
                    $lookup: {
                        from: "movies",
                        localField: "movie_id",
                        foreignField: "_id",
                        as: "movie_details"
                    }
                },
                { $unwind: "$movie_details" },
                {
                    $lookup: {
                        from: "companies",
                        localField: "company_id",
                        foreignField: "_id",
                        as: "company_details"
                    }
                },
                { $unwind: "$company_details" },
                {
                    $project: {
                        schedules: 1,
                        msg: 1,
                        adminreject_msg:1,
                        status: 1,
                        createdAt: 1,
                        "movie_details.name": 1,
                        "movie_details.language": 1,
                        "movie_details.genre": 1,
                        "company_details.company_name": 1,
                        "company_details.email": 1,
                       
                    }
                }

            ]);
            
            
            return companydata
        } catch (err) {
            console.log(err)
        }
    }
    async finbbookingdatafordashboard(id) {
        // console.log(id);

        try {
            const companydata = eventmodel.aggregate([
                {
                    $match: { isdelete: false, company_id: new mongoose.Types.ObjectId(id),status: { $in: ["Pending", "Approved"]} }
                }, {
                    $lookup: {
                        from: "movies",
                        localField: "movie_id",
                        foreignField: "_id",
                        as: "movie_details"
                    }
                },
                { $unwind: "$movie_details" },
                {
                    $lookup: {
                        from: "companies",
                        localField: "company_id",
                        foreignField: "_id",
                        as: "company_details"
                    }
                },
                { $unwind: "$company_details" },


            ]);
            return companydata
        } catch (err) {
            console.log(err)
        }
    }
    async rejectfinbbookingdatafordashboard(id) {
        // console.log(id);

        try {
            const companydata = eventmodel.aggregate([
                {
                    $match: { isdelete: false, company_id: new mongoose.Types.ObjectId(id),status: 'Reject' }
                }, {
                    $lookup: {
                        from: "movies",
                        localField: "movie_id",
                        foreignField: "_id",
                        as: "movie_details"
                    }
                },
                { $unwind: "$movie_details" },
                {
                    $lookup: {
                        from: "companies",
                        localField: "company_id",
                        foreignField: "_id",
                        as: "company_details"
                    }
                },
                { $unwind: "$company_details" },


            ]);
            return companydata
        } catch (err) {
            console.log(err)
        }
    }
    async finbbookingdataforsingle(id) {
        try {
            const companydata = await eventmodel.aggregate([
                {
                    $match: {
                        isdelete: false,
                        _id: new mongoose.Types.ObjectId(id)
                    }
                }, {
                    $lookup: {
                        from: "movies",
                        localField: "movie_id",
                        foreignField: "_id",
                        as: "movie_details"
                    }
                },
                { $unwind: "$movie_details" },
                {
                    $lookup: {
                        from: "companies",
                        localField: "company_id",
                        foreignField: "_id",
                        as: "company_details"
                    }
                },
                { $unwind: "$company_details" },


            ]);
            return companydata
        } catch (err) {
            console.log(err)
        }
    }
    async finbbookingdatabyid(id) {
        try {
            const companydata = await eventmodel.aggregate([
                {
                    $match: { isdelete: false, _id: new mongoose.Types.ObjectId(id) }
                }, {
                    $lookup: {
                        from: "movies",
                        localField: "movie_id",
                        foreignField: "_id",
                        as: "movie_details"
                    }
                },
                { $unwind: "$movie_details" },
                {
                    $lookup: {
                        from: "companies",
                        localField: "company_id",
                        foreignField: "_id",
                        as: "company_details"
                    }
                },
                { $unwind: "$company_details" },


            ]);
            // console.log(JSON.stringify(companydata,null,2));

            return companydata
        } catch (err) {
            console.log(err)
        }
    }
    async upcomingMovieEvents(companyId) {
        try {
            const companyObjectId = new mongoose.Types.ObjectId(companyId);
            const currentDate = new Date();

            const movieUpcomingEvents = await eventmodel.aggregate([
                {
                    $match: {
                        isdelete: false,
                        isadmindelete: false,
                        company_id: companyObjectId
                    }
                },
                { $unwind: "$schedules" },
                {
                    $match: {
                        "schedules.date": { $gte: currentDate }
                    }
                },
                {
                    $lookup: {
                        from: "movies",
                        localField: "movie_id",
                        foreignField: "_id",
                        as: "movie"
                    }
                },
                { $unwind: "$movie" },
                {
                    $lookup: {
                        from: "testimonials",
                        localField: "movie_id",
                        foreignField: "movie_id",
                        pipeline: [
                            { $match: { ismovie: true, isdelete: false, isadmindelete: false } },
                            {
                                $group: {
                                    _id: "$movie_id",
                                    avgRating: { $avg: "$rating" }
                                }
                            }
                        ],
                        as: "ratingData"
                    }
                },
                {
                    $project: {
                        name: "$movie.name",
                        date: {
                            $dateToString: {
                                format: "%Y-%m-%d",
                                date: "$schedules.date"
                            }
                        },
                        rating: {
                            $round: [
                                { $multiply: [{ $ifNull: [{ $arrayElemAt: ["$ratingData.avgRating", 0] }, 0] }, 20] },
                                0
                            ]
                        }
                    }
                }
            ]);

            const totalEventsCountMovies = await eventmodel.countDocuments({
                isdelete: false,
                isadmindelete: false,
                company_id: companyObjectId // also scoped to the same company
            });

            return { movieUpcomingEvents, totalEventsCountMovies };
        } catch (err) {
            console.error("Error in upcomingMovieEvents:", err);
            throw err;
        }
    }

}
module.exports = new eventrepo()