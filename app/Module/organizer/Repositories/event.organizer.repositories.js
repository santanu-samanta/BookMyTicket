const { default: mongoose } = require("mongoose");
const eventmodel = require("../Model/enent.model");
const organizereventmodel = require("../Model/event.organizer");

class eventorganizerrepozitoris {
    async adddata(data) {
        try {
            const eventdata = organizereventmodel.create(data);
            return eventdata;
        } catch (err) {
            console.log(err)
        }
    }
    async findbyidandupdatedata(id, data) {
        try {
            const { event_name,
                images, videos,
                description,
                category,
                artist,
                validAge,
                schedules, } = data
            if (mongoose.Types.ObjectId.isValid(id)) {
                if (artist) {
                    const moviedata = await organizereventmodel.updateOne(
                        { _id: id },
                        {
                            $push: { artist: artist },
                            $set: {
                                event_name: event_name,
                                images: images, videos: videos,
                                description: description,
                                category: category,
                                validAge: validAge,
                                schedules: schedules
                            }
                        },
                    )
                    return moviedata;
                }
                const moviedata = await organizereventmodel.findByIdAndUpdate(id,
                    data, {
                    new: true, // return updated document
                    runValidators: true // optional, ensures validation
                })

                return moviedata;
            } else {
                console.log("Invalid ID:", id);
            }

        } catch (err) {
            console.error('Error in adddata:', err);
        }
    }
    async findbyiddata(id) {
        try {
            // Check if id is a valid ObjectId
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new Error("Invalid ObjectId passed to findById");
            }
            const eventdata = await organizereventmodel.findById(id);
            return eventdata;
        } catch (err) {
            console.log("findbyiddata error:", err.message);
            return null;
        }
    }
    async shoalldata(id) {
        try {
            const eventdata = organizereventmodel.find({ isdelete: false, company_id: id,status: { $in: ["Pending", "Approved"]} });
            return eventdata;
        } catch (err) {
            console.log(err)
        }
    }
    async shoalldatareject(id) {
        try {
            const eventdata = organizereventmodel.find({ isdelete: false, company_id: id, status: 'Reject' });
            return eventdata;
        } catch (err) {
            console.log(err)
        }
    }
    async shoallevents() {
        try {
            const eventdata = organizereventmodel.find({ isdelete: false });
            return eventdata;
        } catch (err) {
            console.log(err)
        }
    }
    async filteralldata(filterQuery) {
        try {
            return await organizereventmodel.find(filterQuery).lean();
        } catch (error) {
            console.error("Filter error:", error);
            return [];
        }
    }
    async single_movie_data(id) {
        try {
            return await organizereventmodel.find({ _id: new mongoose.Types.ObjectId(id) , status: { $in: ["Pending", "Approved"]}}).populate('company_id')
        } catch (error) {
            console.error("Filter error:", error);
            return [];
        }
    }
    async schedules_data(id) {
        try {
            const mongoose = require('mongoose');
            console.log('ID is valid:', mongoose.Types.ObjectId.isValid(id));  // should be true
            // Optional: convert string to ObjectId
            const scheduleId = new mongoose.Types.ObjectId(id);
            const data = await organizereventmodel.findOne({
                "schedules._id": scheduleId
            },
                { schedules: { $elemMatch: { _id: scheduleId } } }
            )
            return data;
        } catch (err) {
            console.log(err)
        }
    }
    async findallcompanybyid(id) {
        try {
            const mongoose = require('mongoose');
            console.log('ID is valid:', mongoose.Types.ObjectId.isValid(id));  // should be true
            // Optional: convert string to ObjectId
            // const scheduleId = new mongoose.Types.ObjectId(id);
            const data = await organizereventmodel.findById(id)
            return data;
        } catch (err) {
            console.log(err)
        }
    }
    async findallcompanybyidsingledashboard(id) {
        try {
            const mongoose = require('mongoose');
            console.log('ID is valid:', mongoose.Types.ObjectId.isValid(id));  // should be true
            // Optional: convert string to ObjectId
            const scheduleId = new mongoose.Types.ObjectId(id);
            const data = await organizereventmodel.findById(id).populate('company_id')
            return data;
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

            const eventdata = await organizereventmodel.findByIdAndUpdate(id, { isdelete: true })

            return eventdata;
        } catch (err) {
            console.log(err)
        }
    }
    async getupcamingevents(id) {
        try {
            const companyObjectId = new mongoose.Types.ObjectId(id);

            // Count total active events for this company
            const totalEventsCountOrg = await organizereventmodel.countDocuments({
                isdelete: false,
                isadmindelete: false,
                company_id: companyObjectId
            });

            // Get today's date at UTC 00:00:00 for consistent comparison
            const today = new Date();
            const utcToday = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

            const orgUpcomingEvents = await organizereventmodel.aggregate([
                {
                    $match: {
                        isdelete: false,
                        isadmindelete: false,
                        company_id: companyObjectId   // <-- filter by company_id here
                    }
                },
                { $unwind: "$schedules" },
                {
                    $match: {
                        "schedules.date": { $gte: utcToday }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        name: "$event_name",
                        date: "$schedules.date",
                        rating: { $literal: 0 }  // placeholder if no rating available
                    }
                },
                { $sort: { date: 1 } },
                { $limit: 10 }
            ]);

            return { orgUpcomingEvents, totalEventsCountOrg };
        } catch (err) {
            console.error("Error in getupcamingevents:", err);
            throw err;  // You can throw or return a friendly error response here
        }
    }



    async updateSeatsByCount(setData, scheduleId) {
        try {
            if (!mongoose.Types.ObjectId.isValid(scheduleId)) {
                console.warn("Invalid Schedule ID");
                return null;
            }

            const event = await organizereventmodel.findOne({
                "schedules._id": scheduleId
            });

            if (!event) {
                console.warn("No event found with given scheduleId");
                return null;
            }

            const schedule = event.schedules.find(sch => sch._id.toString() === scheduleId);
            if (!schedule) {
                console.warn("No matching schedule found inside event");
                return null;
            }
            console.log(schedule);

            const isPrimeEmpty = !setData.prime || setData.prime.length === 0;
            const isGoldenEmpty = !setData.golden || setData.golden.length === 0;
            const isClassicEmpty = !setData.classic || setData.classic.length === 0;

            if (isPrimeEmpty && isGoldenEmpty && isClassicEmpty) {
                console.warn("No seat data provided to update");
                return null;
            }

            const updateFields = {};

            if (!isPrimeEmpty) {
                const primeCount = setData.prime ? setData.prime : 0;
                const avlPrime = typeof schedule.avl_prime_seats === 'number' ? schedule.avl_prime_seats : 0;
                const primeset = (avlPrime - primeCount);
                updateFields["schedules.$.avl_prime_seats"] = primeset;
            }
            if (!isGoldenEmpty) {
                const goldenCount = setData.golden ? setData.golden : 0;
                // console.log("hhhh",goldenCount);
                const avlGolden = typeof schedule.avl_golden_seats === 'number' ? schedule.avl_golden_seats : 0;
                // console.log('ggg',avlGolden);
                const goldenset = (avlGolden - goldenCount);
                // console.log('mmmm',goldenset)
                updateFields["schedules.$.avl_golden_seats"] = goldenset;
            }
            if (!isClassicEmpty) {
                const classicCount = setData.classic ? setData.classic : 0;
                const avlClassic = typeof schedule.avl_classic_seats === 'number' ? schedule.avl_classic_seats : 0;
                const clasicset = (avlClassic - classicCount);
                updateFields["schedules.$.avl_classic_seats"] = clasicset;
            }


            // console.log(updateFields);

            const updatedEvent = await organizereventmodel.findOneAndUpdate(
                { "schedules._id": scheduleId },
                { $set: updateFields },
                { new: true }
            );

            return updatedEvent;
        } catch (err) {
            console.error("Error updating seats:", err);
            throw err;
        }
    }




}
module.exports = new eventorganizerrepozitoris()