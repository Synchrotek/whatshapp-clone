const { User } = require("../models/user.models");

exports.getOtherMember = async (members, userId) => {
    const otherMember = members.find(member => {
        const memberId = member?._id ? member._id.toString() : member.toString();
        return memberId !== userId.toString()
    });

    if (otherMember?._id === undefined) {
        return otherMember
    } else {
        console.log("---------------------------------------------")
        const otherMemberDetails = await User.findById(otherMember.toString()).select("name avatar");
        console.log("otherMemberDetails:", otherMemberDetails);
        console.log("---------------------------------------------")
        return otherMemberDetails;
    }
}