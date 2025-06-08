const companymodel = require("../Model/company.model")

class organizerrepo {
    async register(data) {
        try {
            const companydata = companymodel.create(data);
            return companydata
        } catch (err) {
            console.log(err)
        }
    }
    async find(email) {
        try {
            const companydata = companymodel.findOne({
                email
            });
            return companydata
        } catch (err) {
            console.log(err)
        }
    }
    async findid(id) {
        try {
            const companydata = companymodel.findById(id);
            return companydata
        } catch (err) {
            console.log(err)
        }
    }
    async updatebyid(id, data) {
        try {
            const { company_name, phone, email } = data;
            const companydata = companymodel.findByIdAndUpdate(id, {
                company_name, phone, email
            });
            return companydata
        } catch (err) {
            console.log(err)
        }
    }
    async findallcompanydetailse() {
        try {
            const companydata = companymodel.find();
            return companydata
        } catch (err) {
            console.log(err)
        }
    }
    async findallcompanybyid(id) {
        try {
            const companydata = companymodel.findById(id);
            return companydata
        } catch (err) {
            console.log(err)
        }
    }
    async companyreject(id, adminreject_msg, password) {
        try {
            const companydata = companymodel.findByIdAndUpdate(id, {
                adminreject_msg: adminreject_msg,
                status: 'Reject',
                isverify: false,
                password: password
            });
            return companydata
        } catch (err) {
            console.log(err)
        }
    }
    async companyapproved(id) {
        try {
            const companydata = companymodel.findByIdAndUpdate(id, {
                status: 'Approved',
            });
            return companydata
        } catch (err) {
            console.log(err)
        }
    }
    async companypasswordchang(id, password) {
        try {
            const companydata = companymodel.findByIdAndUpdate(id, {
                password: password,
                isverify: true
            });
            return companydata
        } catch (err) {
            console.log(err)
        }
    }
    async finbyidandupdatedata(id, updatedData) {
        try {
            const companydata = companymodel.findByIdAndUpdate(id, updatedData);
            return companydata
        } catch (err) {
            console.log(err)
        }
    }
    async finbbookingdata() {
        try {
            const companydata = companymodel.aggregate([
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
                        status: 1,
                        createdAt: 1,
                        "movie_details.name": 1,
                        "movie_details.language": 1,
                        "movie_details.genre": 1,
                        "company_details.company_name": 1,
                        "company_details.email": 1
                    }
                }
            ]);
            return companydata
        } catch (err) {
            console.log(err)
        }
    }
    async existuser(email) {

        try {
            const userfind = await companymodel.findOne({ email })
            if (userfind) {
                return userfind;
            }

        } catch (err) {
            console.log(err);
        }
    }
    async deleteaccount(email) {
        try {

            const userdata = await companymodel.findOneAndUpdate(
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
    // update password data
    async updatedata(email, hashedpassword) {
        try {
            console.log(email, hashedpassword)
            const userdata = await companymodel.findOneAndUpdate(
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
}
module.exports = new organizerrepo()