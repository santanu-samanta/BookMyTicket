const organizereventmodel = require("../../organizer/Model/event.organizer");
const testimonial = require("../../user/Model/user.testimonial");
const Ticket = require("../Model/ticket.model");
const mongoose = require("mongoose");

class TicketRepository {

    async datasave(data) {
        try {
            const ticket = await Ticket.create(data);
            return ticket;
        } catch (error) {
            console.log("Something went wrong in the repository layer");
            throw { error };
        }
    }



    async getTicketStatsformovie(companyId) {
        const companyObjectId = new mongoose.Types.ObjectId(companyId);

        // 1. Monthly Aggregated Stats
        const monthlyStats = await Ticket.aggregate([
            {
                $match: {
                    ismovie: true
                }
            },
            {
                $lookup: {
                    from: "events", // MongoDB collection name
                    localField: "event_id",
                    foreignField: "_id",
                    as: "event"
                }
            },
            { $unwind: "$event" },
            {
                $match: {
                    "event.company_id": companyObjectId
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    totalTickets: { $sum: "$noOfTicketsBought" },
                    totalRevenue: { $sum: "$totalPayment" }
                }
            },
            {
                $sort: {
                    "_id.year": 1,
                    "_id.month": 1
                }
            }
            
        ]);

        // Prepare monthly data arrays
        const monthlyTicketData = Array(12).fill(0);
        const monthlyRevenueData = Array(12).fill(0);

        monthlyStats.forEach(item => {
            const monthIndex = item._id.month - 1; // Jan = 0
            monthlyTicketData[monthIndex] = item.totalTickets;
            monthlyRevenueData[monthIndex] = item.totalRevenue;
        });

        // 2. Overall Totals
        const [ticketTotalData, revenueTotalData, activeUsers] = await Promise.all([
            Ticket.aggregate([
                {
                    $match: { ismovie: true }
                },
                {
                    $lookup: {
                        from: "events",
                        localField: "event_id",
                        foreignField: "_id",
                        as: "event"
                    }
                },
                { $unwind: "$event" },
                {
                    $match: {
                        "event.company_id": companyObjectId
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalTickets: { $sum: "$noOfTicketsBought" }
                    }
                }
            ]),
            Ticket.aggregate([
                {
                    $match: { ismovie: true }
                },
                {
                    $lookup: {
                        from: "events",
                        localField: "event_id",
                        foreignField: "_id",
                        as: "event"
                    }
                },
                { $unwind: "$event" },
                {
                    $match: {
                        "event.company_id": companyObjectId
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: "$totalPayment" }
                    }
                }
            ]),
            Ticket.aggregate([
                {
                    $match: { ismovie: true }
                },
                {
                    $lookup: {
                        from: "events",
                        localField: "event_id",
                        foreignField: "_id",
                        as: "event"
                    }
                },
                { $unwind: "$event" },
                {
                    $match: {
                        "event.company_id": companyObjectId
                    }
                },
                {
                    $group: {
                        _id: "$user_id"
                    }
                }
            ])
        ]);

        return {
            ticketChart: {
                labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                data: monthlyTicketData
            },
            priceChart: {
                labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                data: monthlyRevenueData
            },
            totals: {
                totalTicketsSold: ticketTotalData[0]?.totalTickets || 0,
                totalRevenue: revenueTotalData[0]?.totalRevenue || 0,
                totalActiveUsers: activeUsers.length
            }
        };
    }
    async getTicketStatsforevent(companyId) {
        const companyObjectId = new mongoose.Types.ObjectId(companyId);

        // 1. Monthly Aggregated Stats
        const monthlyStats = await Ticket.aggregate([
            {
                $match: {
                    ismovie: false
                }
            },
            {
                $lookup: {
                    from: "organizerevents", // MongoDB collection name (must match actual collection name)
                    localField: "organizerevent_id",
                    foreignField: "_id",
                    as: "organizerEvent"
                }
            },
            { $unwind: "$organizerEvent" },
            {
                $match: {
                    "organizerEvent.company_id": companyObjectId
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    totalTickets: { $sum: "$noOfTicketsBought" },
                    totalRevenue: { $sum: "$totalPayment" }
                }
            },
            {
                $sort: {
                    "_id.year": 1,
                    "_id.month": 1
                }
            }
        ]);

        // 2. Fill monthly arrays
        const monthlyTicketData = Array(12).fill(0);
        const monthlyRevenueData = Array(12).fill(0);

        monthlyStats.forEach(item => {
            const monthIndex = item._id.month - 1;
            monthlyTicketData[monthIndex] = item.totalTickets;
            monthlyRevenueData[monthIndex] = item.totalRevenue;
        });

        // 3. Overall Stats
        const [ticketTotalData, revenueTotalData, activeUsers] = await Promise.all([
            Ticket.aggregate([
                { $match: { ismovie: false } },
                {
                    $lookup: {
                        from: "organizerevents",
                        localField: "organizerevent_id",
                        foreignField: "_id",
                        as: "organizerEvent"
                    }
                },
                { $unwind: "$organizerEvent" },
                {
                    $match: {
                        "organizerEvent.company_id": companyObjectId
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalTickets: { $sum: "$noOfTicketsBought" }
                    }
                }
            ]),
            Ticket.aggregate([
                { $match: { ismovie: false } },
                {
                    $lookup: {
                        from: "organizerevents",
                        localField: "organizerevent_id",
                        foreignField: "_id",
                        as: "organizerEvent"
                    }
                },
                { $unwind: "$organizerEvent" },
                {
                    $match: {
                        "organizerEvent.company_id": companyObjectId
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: "$totalPayment" }
                    }
                }
            ]),
            Ticket.aggregate([
                { $match: { ismovie: false } },
                {
                    $lookup: {
                        from: "organizerevents",
                        localField: "organizerevent_id",
                        foreignField: "_id",
                        as: "organizerEvent"
                    }
                },
                { $unwind: "$organizerEvent" },
                {
                    $match: {
                        "organizerEvent.company_id": companyObjectId
                    }
                },
                {
                    $group: {
                        _id: "$user_id"
                    }
                }
            ])
        ]);

        return {
            ticketChart: {
                labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                data: monthlyTicketData
            },
            priceChart: {
                labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                data: monthlyRevenueData
            },
            totals: {
                totalTicketsSold: ticketTotalData[0]?.totalTickets || 0,
                totalRevenue: revenueTotalData[0]?.totalRevenue || 0,
                totalActiveUsers: activeUsers.length
            }
        };
    }





    async getTicketStatsformovieadmin() {
        // Get monthly aggregated stats
        const monthlyStats = await Ticket.aggregate([
            {
                $match: {
                    ismovie: true
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    totalTickets: { $sum: "$noOfTicketsBought" },
                    totalRevenue: { $sum: "$totalPayment" }
                }
            },
            {
                $sort: {
                    "_id.year": 1,
                    "_id.month": 1
                }
            }
        ]);

        // Initialize arrays for each month
        const monthlyTicketData = Array(12).fill(0);
        const monthlyRevenueData = Array(12).fill(0);

        monthlyStats.forEach(item => {
            const monthIndex = item._id.month - 1; // Convert month to index (0-11)
            monthlyTicketData[monthIndex] = item.totalTickets;
            monthlyRevenueData[monthIndex] = item.totalRevenue;
        });

        // Get overall stats
        const [ticketTotalData, revenueTotalData, activeUsers] = await Promise.all([
            Ticket.aggregate([{
                $match: {
                    ismovie: true
                }
            },
            { $group: { _id: null, totalTickets: { $sum: "$noOfTicketsBought" } } }
            ]),
            Ticket.aggregate([{
                $match: {
                    ismovie: true
                }
            },
            { $group: { _id: null, totalRevenue: { $sum: "$totalPayment" } } }
            ]),
            Ticket.distinct("user_id")
        ]);

        return {
            ticketChart: {
                labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                data: monthlyTicketData
            },
            priceChart: {
                labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                data: monthlyRevenueData
            },
            totals: {
                totalTicketsSold: ticketTotalData[0]?.totalTickets || 0,
                totalRevenue: revenueTotalData[0]?.totalRevenue || 0,
                totalActiveUsers: activeUsers.length
            }
        };
        return this.getTicketStats;
    };
    async getTicketStatsforeventadmin() {
        // Get monthly aggregated stats
        const monthlyStats = await Ticket.aggregate([
            {
                $match: {
                    ismovie: false
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    totalTickets: { $sum: "$noOfTicketsBought" },
                    totalRevenue: { $sum: "$totalPayment" }
                }
            },
            {
                $sort: {
                    "_id.year": 1,
                    "_id.month": 1
                }
            }
        ]);

        // Initialize arrays for each month
        const monthlyTicketData = Array(12).fill(0);
        const monthlyRevenueData = Array(12).fill(0);

        monthlyStats.forEach(item => {
            const monthIndex = item._id.month - 1; // Convert month to index (0-11)
            monthlyTicketData[monthIndex] = item.totalTickets;
            monthlyRevenueData[monthIndex] = item.totalRevenue;
        });

        // Get overall stats
        const [ticketTotalData, revenueTotalData, activeUsers] = await Promise.all([
            Ticket.aggregate([{
                $match: {
                    ismovie: false
                }
            },
            { $group: { _id: null, totalTickets: { $sum: "$noOfTicketsBought" } } }
            ]),
            Ticket.aggregate([
                {
                    $match: {
                        ismovie: false
                    }
                },
                { $group: { _id: null, totalRevenue: { $sum: "$totalPayment" } } }
            ]),
            Ticket.distinct("user_id")
        ]);

        return {
            ticketChart: {
                labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                data: monthlyTicketData
            },
            priceChart: {
                labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                data: monthlyRevenueData
            },
            totals: {
                lTicketsSoltotad: ticketTotalData[0]?.totalTickets || 0,
                totalRevenue: revenueTotalData[0]?.totalRevenue || 0,
                totalActiveUsers: activeUsers.length
            }
        };
        return this.getTicketStats;
    };
    async getpriceforeventadmin() {
        // Get monthly aggregated stats
        const monthlyStats = await Ticket.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    totalTickets: { $sum: "$noOfTicketsBought" },
                    totalRevenue: { $sum: "$totalPayment" }
                }
            },
            {
                $sort: {
                    "_id.year": 1,
                    "_id.month": 1
                }
            }
        ]);

        // Initialize arrays for each month
        const monthlyTicketData = Array(12).fill(0);
        const monthlyRevenueData = Array(12).fill(0);

        monthlyStats.forEach(item => {
            const monthIndex = item._id.month - 1; // Convert month to index (0-11)
            monthlyTicketData[monthIndex] = item.totalTickets;
            monthlyRevenueData[monthIndex] = item.totalRevenue;
        });

        // Get overall stats
        const [ticketTotalData, revenueTotalData, activeUsers] = await Promise.all([
            Ticket.aggregate([
                { $group: { _id: null, totalTickets: { $sum: "$noOfTicketsBought" } } }
            ]),
            Ticket.aggregate([

                { $group: { _id: null, totalRevenue: { $sum: "$totalPayment" } } }
            ]),
            Ticket.distinct("user_id")
        ]);

        return {
            ticketChart: {
                labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                data: monthlyTicketData
            },
            priceChart: {
                labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                data: monthlyRevenueData
            },
            totals: {
                TicketsSoltotad: ticketTotalData[0]?.totalTickets || 0,
                totalRevenue: revenueTotalData[0]?.totalRevenue || 0,
                totalActiveUsers: activeUsers.length
            }
        };
        return this.getTicketStats;
    };



    async getTicketStatsforuserdashboard(id) {
        try {
            const now = new Date();

            // Fetch tickets with movie flag and populate event details
            const tickets = await Ticket.find({ user_id: new mongoose.Types.ObjectId(id) })
            const upcomingevents = await Ticket.aggregate([
                {
                    $match: {
                        moviedate: { $gte: new Date() },
                        user_id: new mongoose.Types.ObjectId(id)
                    }
                },
                {
                    $sort: {
                        moviedate: 1
                    }
                }
            ])
            const pastevents = await Ticket.aggregate([
                {
                    $match: {
                        moviedate: { $lt: new Date() },
                        user_id: new mongoose.Types.ObjectId(id)
                    }
                }, {
                    $sort: {
                        moviedate: -1
                    }
                }
            ])
            const startOfToday = new Date();
            startOfToday.setHours(0, 0, 0, 0);

            const endOfToday = new Date();
            endOfToday.setHours(23, 59, 59, 999);

            const todaysEvents = await Ticket.aggregate([
                {
                    $match: {
                        ismovie: true, // Optional: only movie-related tickets
                        moviedate: {
                            $gte: startOfToday,
                            $lte: endOfToday
                        }
                    }
                },
                {
                    $lookup: {
                        from: "events", // or "organizerevents" if you use that
                        localField: "event_id",
                        foreignField: "_id",
                        as: "eventDetails"
                    }
                },
                {
                    $unwind: "$eventDetails"
                },
                {
                    $project: {
                        _id: 1,
                        moviename: 1,
                        moviedate: 1,
                        movietime: 1,
                        seat: 1,
                        eventTitle: "$eventDetails.event_name",
                        description: { $substr: ["$eventDetails.description", 0, 80] },
                        image: { $arrayElemAt: ["$eventDetails.images", 0] }
                    }
                }
            ]);

            let ticketsBooked = 0;
            let amountSpent = 0;
            let upcomingEvents = upcomingevents.length;

            for (const ticket of tickets) {
                amountSpent += ticket.totalPayment || 0;
                ticketsBooked += ticket.noOfTicketsBought || 0
            }

            return {
                stats: {
                    ticketsBooked,
                    upcomingEvents,
                    amountSpent: parseFloat(amountSpent.toFixed(2)),
                },
                upcomingevents,
                pastevents,
                todaysEvents

            };

        } catch (err) {
            console.error("Error in getTicketStatsforuserdashboard:", err);
            return {
                stats: {
                    ticketsBooked: 0,
                    upcomingEvents: 0,
                    amountSpent: 0,
                },
                upcomingEvents: [],
                pastEvents: [],
            };
        }
    }
    async findticketdetailsbyid(id) {
        try {
            const data = await Ticket.findById(id)
            return data;
        } catch (err) {
            console.log("Error in getTicketStatsforuserdashboard:", err);

        }
    }




}

module.exports = new TicketRepository();